import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { getFileURL } from "@plane/utils";
import { extractFromHtml, extractProfilePhotoFromHtml } from "@/components/issues/social-case-form";
import type { SocialCaseData } from "@/components/issues/social-case-form";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
import { useMember } from "@/hooks/store/use-member";
import { IssueAttachmentService } from "@/services/issue/issue_attachment.service";
import { IssueActivityService } from "@/services/issue/issue_activity.service";
import { SocialCaseFichaPDF, type FichaAttachment, type StateTimelineEntry } from "@/components/issues/social-case-ficha-pdf";
import { fetchBase64WithAuth, resolveSocialCaseExportAttachment } from "@/utils/social-case-attachment-export";

const attachmentService = new IssueAttachmentService();
const activityService = new IssueActivityService();

type Params = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
};

/**
 * Genera y abre en nueva pestaña la ficha PDF de un caso social.
 * Resuelve foto de perfil y adjuntos de imagen a base64 antes de renderizar.
 */
export function useSocialCaseFichaExport({ workspaceSlug, projectId, issueId }: Params) {
  const [isExporting, setIsExporting] = useState(false);

  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { getProjectById: _getProjectById } = useProject();
  const { getStateById } = useProjectState();
  const memberRoot = useMember();

  const exportFicha = async () => {
    const issue = getIssueById(issueId);
    if (!issue) return;

    setIsExporting(true);
    try {
      // Nombre e identificador institucionales fijos — independientes del proyecto Plane
      const projectName = "MPPD-GCS";
      const projectIdentifier = "MPPDGCS";
      const generatedAtLabel = new Date().toLocaleDateString("es-VE");
      const stateName = issue.state_id ? (getStateById(issue.state_id)?.name ?? "Sin estado") : "Sin estado";
      const creator = issue.created_by ? memberRoot.getUserDetails(issue.created_by) : null;
      const responsable = creator?.display_name || creator?.first_name || "Sin creador registrado";

      const d = extractFromHtml(issue.description_html ?? "");
      const photoUrlRaw = extractProfilePhotoFromHtml(issue.description_html ?? "");

      // Resolver foto de perfil a base64
      let resolvedPhotoUrl: string | null = null;
      if (photoUrlRaw) {
        try {
          const raw = getFileURL(photoUrlRaw) ?? photoUrlRaw;
          const apiUrl = raw.startsWith("http") ? raw : `${window.location.origin}${raw}`;
          resolvedPhotoUrl = await fetchBase64WithAuth(apiUrl);
        } catch {
          resolvedPhotoUrl = null;
        }
      }

      // Resolver adjuntos de imagen como evidencia de entrega
      let fichaAttachments: FichaAttachment[] = [];
      try {
        const rawList = await attachmentService.getIssueAttachments(workspaceSlug, projectId, issueId);
        fichaAttachments = (await Promise.all((rawList ?? []).map(resolveSocialCaseExportAttachment))).flat();
      } catch {
        fichaAttachments = [];
      }

      // Historial de cambios de estado
      let stateTimeline: StateTimelineEntry[] = [];
      try {
        const activities = await activityService.getIssueActivities(workspaceSlug, projectId, issueId);
        stateTimeline = (activities ?? [])
          .filter((a) => a.field === "state")
          .toSorted((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((a) => ({
            date: new Date(a.created_at).toLocaleString("es-VE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            from: a.old_value ?? null,
            to: a.new_value ?? "",
            actor:
              (a.actor_detail as any)?.display_name ||
              (a.actor_detail as any)?.first_name ||
              "Sistema",
          }));
      } catch {
        stateTimeline = [];
      }

      const emptyData: SocialCaseData = {
        numeroCaso: "",
        cedula: "",
        nombre: "",
        telefono: "",
        telefono2: "",
        direccion: "",
        parroquia: "",
        municipio: "",
        entidad: "",
        esMilitar: "",
        condicionMilitar: "",
        gradoMilitar: "",
        unidadDependencia: "",
        jornada: "",
        referencia: "",
        descripcionCaso: "",
        accionTomada: "",
        resultado: "",
        institucionContactada: "",
        observacionCierre: "",
        fechaCierre: "",
      };

      const blob = await pdf(
        <SocialCaseFichaPDF
          data={d ?? emptyData}
          projectName={projectName}
          projectIdentifier={projectIdentifier}
          stateName={stateName}
          sequenceId={issue.sequence_id}
          responsable={responsable}
          photoUrl={resolvedPhotoUrl}
          attachments={fichaAttachments}
          generatedAtLabel={generatedAtLabel}
          stateTimeline={stateTimeline}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportFicha, isExporting };
}
