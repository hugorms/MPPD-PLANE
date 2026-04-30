import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TIssue } from "@plane/types";
import { renderFormattedPayloadDate } from "@plane/utils";
import { extractFromHtml, injectSocialCaseIntoHtml } from "@/components/issues/social-case-form";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";
import type { TIssueOperations } from "@/components/issues/issue-detail/root";

// ── Campos requeridos por nivel de avance ────────────────────────────────────
// Deben coincidir con RECIBIDO_REQUIRED y PROCESO_REQUIRED en social-case-form.tsx

// Para pasar a "En Proceso" (= RECIBIDO_REQUIRED del formulario)
const FIELDS_PROCESO: { key: string; label: string }[] = [
  { key: "cedula", label: "Cédula" },
  { key: "nombre", label: "Nombre del ciudadano" },
  { key: "telefono", label: "Teléfono" },
  { key: "direccion", label: "Dirección" },
  { key: "jornada", label: "Actividad" },
  { key: "referencia", label: "Solicitud" },
];

// Para pasar a "Articulación" (incluye los de proceso + resultado + acción)
const FIELDS_ARTICULACION: { key: string; label: string }[] = [
  ...FIELDS_PROCESO,
  { key: "resultado", label: "Solicitud / Beneficio otorgado" },
  { key: "accionTomada", label: "Acción tomada" },
];

// Para resolver/cerrar el caso (mismos campos que articulación)
const FIELDS_CIERRE: { key: string; label: string }[] = [...FIELDS_ARTICULACION];

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
 *   - → En Proceso:    cédula, nombre, teléfono, dirección, actividad, solicitud/beneficio
 *   - → Articulación:  los anteriores + resultado + acciónTomada
 *   - → Resuelto:      mismos campos que articulación + fechaCierre auto-inyectada
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

    // Determinar nivel de validación según estado destino
    let fieldsRequired: { key: string; label: string }[] | null = null;
    let actionLabel = "";

    if (stateGroup === "completed") {
      fieldsRequired = FIELDS_CIERRE;
      actionLabel = "resolver el caso";
    } else if (stateName.includes("articulaci")) {
      fieldsRequired = FIELDS_ARTICULACION;
      actionLabel = "articular el caso";
    } else if (stateName.includes("proceso")) {
      fieldsRequired = FIELDS_PROCESO;
      actionLabel = "iniciar el proceso";
    }

    // Si el estado destino no requiere validación (ej. Recibido, genérico) → cambio libre
    if (!fieldsRequired) {
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

    // Validar campos requeridos
    const fields = fieldsRequired;

    const missing = fields
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
