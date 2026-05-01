import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TIssue } from "@plane/types";
import { renderFormattedPayloadDate } from "@plane/utils";
import { extractFromHtml, injectSocialCaseIntoHtml } from "@/components/issues/social-case-form";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";
import type { TIssueOperations } from "@/components/issues/issue-detail/root";

// ── Campos requeridos por nivel de avance ────────────────────────────────────
// Deben coincidir con RECIBIDO_REQUIRED y PROCESO_REQUIRED en social-case-form.tsx

// Campos base requeridos para todos los casos (civil y militar)
const FIELDS_BASE: { key: string; label: string }[] = [
  { key: "cedula", label: "Cédula" },
  { key: "nombre", label: "Nombre del ciudadano" },
  { key: "telefono", label: "Teléfono" },
  { key: "direccion", label: "Dirección" },
  { key: "unidadDependencia", label: "Unidad / Dependencia" },
  { key: "referencia", label: "Solicitud" },
  { key: "descripcionCaso", label: "Descripción del caso" },
];

// Campos adicionales solo para militares
const FIELDS_MILITAR: { key: string; label: string }[] = [
  { key: "gradoMilitar", label: "Grado militar" },
  { key: "jornada", label: "Componente" },
];

// Campos adicionales para articulación y cierre
const FIELDS_EXTRA_ARTICULACION: { key: string; label: string }[] = [
  { key: "resultado", label: "Resultado / Beneficio otorgado" },
  { key: "accionTomada", label: "Acción tomada" },
];

// ── Tipos ────────────────────────────────────────────────────────────────────

type UseStateChangeParams = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issueOperations: Pick<TIssueOperations, "update">;
};

/**
 * Devuelve `handleStateChange(newStateId)`.
 *
 * Validación por capa según el estado destino:
 *   - → En Proceso:    campos base + componente y unidad (solo si es militar) + descripcionCaso
 *   - → Articulación:  los anteriores + resultado + acciónTomada
 *   - → Resuelto:      mismos que articulación + fechaCierre auto-inyectada
 *   - → Sin Resolución / Recibido / genérico: sin validación
 *
 * Si el issue no contiene tabla de caso social (data-social-case), el cambio
 * se permite siempre sin validación para no afectar issues ordinarios.
 *
 * Al resolver, auto-inyecta fechaCierre con la fecha de hoy.
 */
export function useSocialCaseStateChange({ workspaceSlug, projectId, issueId, issueOperations }: UseStateChangeParams) {
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { getStateById } = useProjectState();

  const handleStateChange = async (newStateId: string) => {
    const newState = getStateById(newStateId);
    const stateName = newState?.name?.toLowerCase() ?? "";
    const stateGroup = newState?.group;

    // Sin Resolución (cancelled) → siempre libre
    if (stateGroup === "cancelled") {
      await issueOperations.update(workspaceSlug, projectId, issueId, { state_id: newStateId });
      return;
    }

    // Si el estado destino no requiere validación (ej. Recibido, genérico) → cambio libre
    const needsValidation =
      stateGroup === "completed" || stateName.includes("articulaci") || stateName.includes("proceso");
    if (!needsValidation) {
      await issueOperations.update(workspaceSlug, projectId, issueId, { state_id: newStateId });
      return;
    }

    // Verificar si es un caso social (tiene tabla data-social-case en description_html)
    const issue = getIssueById(issueId);
    const data = extractFromHtml(issue?.description_html ?? "");

    // No es un caso social → cambio libre, sin validación
    if (!data) {
      await issueOperations.update(workspaceSlug, projectId, issueId, { state_id: newStateId });
      return;
    }

    // Construir campos requeridos dinámicamente: militares exigen componente y unidad
    const isMilitar = data.esMilitar === "true";
    const fieldsProceso = isMilitar ? [...FIELDS_BASE, ...FIELDS_MILITAR] : FIELDS_BASE;
    const fieldsArticulacion = [...fieldsProceso, ...FIELDS_EXTRA_ARTICULACION];

    let fieldsRequired: { key: string; label: string }[];
    let actionLabel: string;

    if (stateGroup === "completed") {
      fieldsRequired = fieldsArticulacion;
      actionLabel = "resolver el caso";
    } else if (stateName.includes("articulaci")) {
      fieldsRequired = fieldsArticulacion;
      actionLabel = "articular el caso";
    } else {
      fieldsRequired = fieldsProceso;
      actionLabel = "iniciar el proceso";
    }

    const missing = fieldsRequired
      .filter(({ key }) => !(data as Record<string, string>)[key]?.trim())
      .map(({ label }) => label);

    if (missing.length > 0) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Ficha incompleta",
        message: `Completa estos campos para ${actionLabel}: ${missing.join(", ")}`,
      });
      return;
    }

    // Al resolver: inyectar fechaCierre automática
    if (stateGroup === "completed") {
      const today = renderFormattedPayloadDate(new Date()) ?? new Date().toISOString().split("T")[0];
      const updatedData = { ...data, fechaCierre: today };
      const newHtml = injectSocialCaseIntoHtml(issue?.description_html ?? "<p></p>", updatedData);
      await issueOperations.update(workspaceSlug, projectId, issueId, {
        description_html: newHtml,
        state_id: newStateId,
      });
    } else {
      await issueOperations.update(workspaceSlug, projectId, issueId, { state_id: newStateId });
    }
  };

  return { handleStateChange };
}

// ── Helper: construir issueOperations mínimas desde la firma updateIssue ─────
// Usado en componentes que tienen (projectId, issueId, data) en vez de TIssueOperations.
export function buildIssueOpsFromUpdate(
  updateIssue: ((projectId: string | null, issueId: string, data: Partial<TIssue>) => Promise<void>) | undefined
): Pick<TIssueOperations, "update"> {
  return {
    update: async (_ws: string, pid: string, iid: string, data: Partial<TIssue>) => {
      if (updateIssue) await updateIssue(pid, iid, data);
    },
  } as Pick<TIssueOperations, "update">;
}
