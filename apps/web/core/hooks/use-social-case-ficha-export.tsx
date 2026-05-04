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
import { SocialCaseFichaPDF, type FichaAttachment } from "@/components/issues/social-case-ficha-pdf";
import { fetchBase64WithAuth, resolveSocialCaseExportAttachment } from "@/utils/social-case-attachment-export";

const attachmentService = new IssueAttachmentService();

// URLs propias de Django (estáticos, cedula-photo, etc.) — con sesión
async function urlToBase64Authed(url: string): Promise<string> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject(new Error("FileReader error")));
    reader.readAsDataURL(blob);
  });
}

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
  const { getProjectById } = useProject();
  const { getStateById } = useProjectState();
  const memberRoot = useMember();

  const exportFicha = async () => {
    const issue = getIssueById(issueId);
    if (!issue) return;

    setIsExporting(true);
    try {
      const projectDetails = getProjectById(projectId);
      const projectName = projectDetails?.name ?? "Proyecto";
      const projectIdentifier = "MPPDGCS";
      const generatedAtLabel = new Date().toLocaleDateString("es-VE");
      const stateName = issue.state_id ? (getStateById(issue.state_id)?.name ?? "Sin estado") : "Sin estado";
      const assignees = (issue.assignee_ids ?? [])
        .map((id: string) => memberRoot.getUserDetails(id)?.display_name || memberRoot.getUserDetails(id)?.first_name)
        .filter(Boolean) as string[];
      const responsable = assignees.length > 0 ? assignees.join(", ") : "Sin asignar";

      // Logo institucional
      let logoUrl: string | null = null;
      try {
        logoUrl = await urlToBase64Authed(`${window.location.origin}/venezuela-logo.png`);
      } catch {
        try {
          logoUrl = await urlToBase64Authed(`${window.location.origin}/logo-mppd.png`);
        } catch {
          logoUrl = null;
        }
      }

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
          logoUrl={logoUrl}
          startDate={issue.start_date ?? issue.created_at?.slice(0, 10) ?? null}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportFicha, isExporting };
}
