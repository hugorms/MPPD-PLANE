import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { SocialCaseData } from "./social-case-form";

const capitalizeWords = (str: string): string =>
  str.toLowerCase().replace(/(^|[\s\-'.])(\S)/g, (_, sep, char) => sep + char.toUpperCase());
import {
  cleanSocialCaseAttachmentName,
  getSocialCaseAttachmentSectionTitle,
  groupSocialCaseAttachmentsBySection,
} from "@/utils/social-case-attachment-export";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  black: "#09090b",
  gray900: "#18181b",
  gray700: "#3f3f46",
  gray500: "#71717a",
  gray100: "#f4f4f5",
  gray50: "#fafafa",
  white: "#ffffff",
  blue: "#2563eb",
  navy: "#0f3a73",
  paleBlue: "#eff6ff",
  green: "#16a34a",
  border: "#e4e4e7",
  borderLight: "#d1d5db",
  headerBg: "#0f3a73",
  headerText: "#ffffff",
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.black,
    backgroundColor: C.white,
  },

  detailPageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `2px solid ${C.navy}`,
  },
  detailPageProject: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.navy },
  detailPageTag: { fontSize: 7.5, color: C.navy, fontFamily: "Helvetica-Bold" },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 18,
  },
  detailPhotoFrame: {
    width: 112,
    padding: 4,
    borderRadius: 6,
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    alignItems: "center",
  },
  detailPhoto: { width: 102, height: 128, borderRadius: 4, objectFit: "cover" },
  detailPhotoPlaceholder: {
    width: 102,
    height: 128,
    borderRadius: 4,
    backgroundColor: C.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  detailPhotoText: { fontSize: 7, color: C.gray500 },
  detailMeta: { flex: 1 },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 0,
    gap: 10,
  },
  detailNameWrap: { flex: 1, paddingBottom: 6 },
  detailName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 6, lineHeight: 1.08 },
  detailId: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.blue },
  detailStatusBadge: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: C.paleBlue,
    border: `1px solid #bfdbfe`,
    alignItems: "center",
  },
  detailStatusLabel: { fontSize: 6.5, color: C.navy, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  detailStatusText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.navy, textAlign: "center" },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  metaColIdentity: {
    width: "39%",
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    minHeight: 145,
  },
  metaColMilitary: {
    width: "58%",
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    minHeight: 145,
  },
  metaColManagement: {
    width: "100%",
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    marginBottom: 10,
  },
  metaManagementGrid: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10 },
  metaManagementItem: { flex: 1, paddingHorizontal: 7, borderRight: `1px solid ${C.border}` },
  metaManagementItemLast: { flex: 1, paddingHorizontal: 7 },
  metaGroupTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "center",
    backgroundColor: C.navy,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  metaCardBody: { paddingVertical: 10, paddingHorizontal: 11 },
  metaItem: { marginBottom: 8 },
  metaLabel: { fontSize: 6.4, color: C.navy, marginBottom: 1.5, fontFamily: "Helvetica-Bold" },
  metaValue: { fontSize: 8.2, color: C.gray900, lineHeight: 1.22 },
  detailSection: {
    marginTop: 8,
    flexDirection: "row",
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    backgroundColor: C.white,
  },
  detailSectionTitle: {
    width: 96,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    paddingVertical: 10,
    paddingHorizontal: 9,
    backgroundColor: C.gray50,
  },
  detailText: { flex: 1, fontSize: 8.2, color: C.gray700, lineHeight: 1.45, paddingVertical: 9, paddingHorizontal: 10 },

  // ── ENCABEZADO ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottom: `2px solid ${C.headerBg}`,
    paddingBottom: 8,
  },
  headerLogoBox: {
    width: 60,
    height: 40,
    backgroundColor: C.gray100,
    border: `1px solid ${C.borderLight}`,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogoImg: {
    width: 60,
    height: 40,
    objectFit: "contain",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerOrgName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.headerBg,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.headerBg,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 4,
  },

  // ── TABLA DE CAMPOS ──
  table: {
    border: `1px solid ${C.border}`,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${C.border}`,
  },
  tableRowLast: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "35%",
    backgroundColor: C.headerBg,
    padding: 5,
    justifyContent: "center",
  },
  cellLabelText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.headerText,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cellValue: {
    flex: 1,
    padding: 5,
    justifyContent: "center",
    borderLeft: `1px solid ${C.border}`,
  },
  cellValueText: {
    fontSize: 9,
    color: C.black,
  },

  // ── TABLA DE 4 FOTOS ──
  photoTable: {
    border: `1px solid ${C.border}`,
    marginTop: 12,
  },
  photoTableHeader: {
    flexDirection: "row",
    backgroundColor: C.headerBg,
    borderBottom: `1px solid ${C.border}`,
  },
  photoTableHeaderCell: {
    flex: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRight: `1px solid ${C.borderLight}`,
  },
  photoTableHeaderCellLast: {
    flex: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  photoTableHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.headerText,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  photoTableBody: {
    flexDirection: "row",
  },
  photoCell: {
    flex: 1,
    height: 160,
    borderRight: `1px solid ${C.border}`,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.gray100,
  },
  photoCellLast: {
    flex: 1,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.gray100,
  },
  photoCellImg: {
    width: "100%",
    height: 160,
    objectFit: "contain",
  },
  photoCellPlaceholderText: {
    fontSize: 7,
    color: C.gray500,
    textAlign: "center",
  },
  fileCellBox: {
    margin: 6,
    padding: 8,
    border: `1px solid ${C.border}`,
    backgroundColor: C.white,
    width: "86%",
  },
  fileCellIcon: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 4,
  },
  fileCellName: {
    fontSize: 6,
    color: C.black,
    textAlign: "center",
  },
  attachHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  attachHeaderText: {
    fontSize: 8,
    color: C.gray500,
  },
  attachSectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.headerBg,
    textTransform: "uppercase",
    paddingBottom: 5,
    marginBottom: 5,
    borderBottom: `1px solid ${C.headerBg}`,
  },
  attachName: {
    fontSize: 8,
    color: C.gray700,
    marginBottom: 8,
  },
  attachImageWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 36,
  },
  attachImage: {
    width: 400,
    height: 610,
    objectFit: "contain",
  },
  attachFileRow: {
    border: `1px solid ${C.borderLight}`,
    backgroundColor: C.gray100,
    padding: 12,
    marginTop: 16,
  },
  attachFileName: {
    fontSize: 9,
    color: C.black,
    marginBottom: 4,
  },
  attachFileNote: {
    fontSize: 7,
    color: C.gray500,
  },

  // ── FOOTER ──
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${C.borderLight}`,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 7,
    color: C.gray500,
  },
});

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type FichaAttachment = {
  name: string;
  isImage: boolean;
  base64?: string;
  sourceName?: string;
  pageNumber?: number;
  pageCount?: number;
  isPdfPage?: boolean;
};

export type SocialCaseFichaProps = {
  data: SocialCaseData;
  projectName: string;
  projectIdentifier?: string;
  stateName: string;
  sequenceId: number;
  responsable: string;
  photoUrl: string | null;
  attachments?: FichaAttachment[];
  generatedAtLabel: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte YYYY-MM-DD → DD-MM-YYYY. Devuelve el original si no coincide el patrón. */
function formatDate(date: string): string {
  if (!date) return "";
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : date;
}

// ── Componente principal ───────────────────────────────────────────────────────

export function SocialCaseFichaPDF({
  data,
  projectName,
  projectIdentifier,
  stateName,
  sequenceId,
  responsable,
  photoUrl,
  attachments = [],
  generatedAtLabel,
}: SocialCaseFichaProps) {
  const attachmentSections = groupSocialCaseAttachmentsBySection(attachments);

  const numeroCaso = projectIdentifier
    ? `${projectIdentifier}-${sequenceId}`
    : data.numeroCaso
      ? `#${data.numeroCaso}`
      : `#${sequenceId}`;
  const isMilitar = data.esMilitar === "true" || Boolean(data.condicionMilitar || data.gradoMilitar || data.jornada);
  const telefono = [data.telefono, data.telefono2].filter(Boolean).join(" / ") || "-";
  const fechaCierre = data.fechaCierre ? formatDate(data.fechaCierre) : "-";
  const casoResuelto = data.fechaCierre ? "Sí" : "No";

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.detailPageHeader} fixed>
          <Text style={S.detailPageProject}>{projectName}</Text>
          <Text style={S.detailPageTag}>Ficha Técnica Individual</Text>
        </View>

        <View style={S.detailHeader}>
          <View style={S.detailPhotoFrame}>
            {photoUrl ? (
              <Image src={photoUrl} style={S.detailPhoto} />
            ) : (
              <View style={S.detailPhotoPlaceholder}>
                <Text style={S.detailPhotoText}>Sin foto</Text>
              </View>
            )}
          </View>
          <View style={S.detailMeta}>
            <View style={S.detailTitleRow}>
              <View style={S.detailNameWrap}>
                <Text style={S.detailName}>{data.nombre ? capitalizeWords(data.nombre) : "-"}</Text>
                <Text style={S.detailId}>{numeroCaso}</Text>
              </View>
              <View style={S.detailStatusBadge}>
                <Text style={S.detailStatusLabel}>Estado del caso</Text>
                <Text style={S.detailStatusText}>{stateName}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={S.metaGrid}>
          <View style={S.metaColIdentity}>
            <Text style={S.metaGroupTitle}>IDENTIFICACIÓN</Text>
            <View style={S.metaCardBody}>
              <View style={S.metaItem}>
                <Text style={S.metaLabel}>Cédula</Text>
                <Text style={S.metaValue}>{data.cedula || "-"}</Text>
              </View>
              <View style={S.metaItem}>
                <Text style={S.metaLabel}>Teléfono</Text>
                <Text style={S.metaValue}>{telefono}</Text>
              </View>
              <View style={S.metaItem}>
                <Text style={S.metaLabel}>Municipio</Text>
                <Text style={S.metaValue}>{data.municipio || "-"}</Text>
              </View>
              <View style={S.metaItem}>
                <Text style={S.metaLabel}>Estado (Vzla.)</Text>
                <Text style={S.metaValue}>{data.entidad || "-"}</Text>
              </View>
            </View>
          </View>
          <View style={S.metaColMilitary}>
            <Text style={S.metaGroupTitle}>DATOS MILITARES</Text>
            <View style={S.metaCardBody}>
              <View style={S.metaItem}>
                <Text style={S.metaLabel}>Componente</Text>
                <Text style={S.metaValue}>{data.jornada || (isMilitar ? "Militar / Sin componente" : "Civil")}</Text>
              </View>
              {isMilitar && data.condicionMilitar ? (
                <View style={S.metaItem}>
                  <Text style={S.metaLabel}>Condición militar</Text>
                  <Text style={S.metaValue}>{data.condicionMilitar}</Text>
                </View>
              ) : null}
              {isMilitar && data.gradoMilitar ? (
                <View style={S.metaItem}>
                  <Text style={S.metaLabel}>Grado militar</Text>
                  <Text style={S.metaValue}>{data.gradoMilitar}</Text>
                </View>
              ) : null}
              {data.unidadDependencia ? (
                <View style={S.metaItem}>
                  <Text style={S.metaLabel}>Unidad / Dependencia</Text>
                  <Text style={S.metaValue}>{data.unidadDependencia}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        <View style={S.metaColManagement}>
          <Text style={S.metaGroupTitle}>GESTIÓN DEL CASO</Text>
          <View style={S.metaManagementGrid}>
            <View style={S.metaManagementItem}>
              <Text style={S.metaLabel}>Responsable</Text>
              <Text style={S.metaValue}>{capitalizeWords(responsable)}</Text>
            </View>
            <View style={S.metaManagementItem}>
              <Text style={S.metaLabel}>Fecha de cierre</Text>
              <Text style={S.metaValue}>{fechaCierre}</Text>
            </View>
            <View style={S.metaManagementItemLast}>
              <Text style={S.metaLabel}>Caso resuelto</Text>
              <Text style={[S.metaValue, { color: data.fechaCierre ? C.green : C.gray700 }]}>{casoResuelto}</Text>
            </View>
          </View>
        </View>

        <View style={S.detailSection}>
          <Text style={S.detailSectionTitle}>SOLICITUD</Text>
          <Text style={S.detailText}>{data.referencia || "-"}</Text>
        </View>
        {data.descripcionCaso ? (
          <View style={S.detailSection}>
            <Text style={S.detailSectionTitle}>DESCRIPCIÓN DEL CASO</Text>
            <Text style={S.detailText}>{data.descripcionCaso}</Text>
          </View>
        ) : null}
        {data.institucionContactada ? (
          <View style={S.detailSection}>
            <Text style={S.detailSectionTitle}>ÓRGANO / INSTITUCIÓN CONTACTADA</Text>
            <Text style={S.detailText}>{data.institucionContactada}</Text>
          </View>
        ) : null}
        <View style={S.detailSection}>
          <Text style={S.detailSectionTitle}>ACCIÓN TOMADA</Text>
          <Text style={S.detailText}>{data.accionTomada || "-"}</Text>
        </View>
        <View style={S.detailSection}>
          <Text style={S.detailSectionTitle}>RESULTADO</Text>
          <Text style={S.detailText}>{data.resultado || "-"}</Text>
        </View>
        {data.observacionCierre ? (
          <View style={S.detailSection}>
            <Text style={S.detailSectionTitle}>OBSERVACIÓN DE CIERRE</Text>
            <Text style={S.detailText}>{data.observacionCierre}</Text>
          </View>
        ) : null}

        {/* ── FOOTER ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{projectName} · Ficha Técnica Individual</Text>
          <Text style={S.footerText}>Generado el {generatedAtLabel}</Text>
        </View>
      </Page>

      {attachmentSections.flatMap((section) =>
        section.attachments.map((att, attIdx) => (
          <Page key={`ficha-att-${att.sourceName ?? att.name}-${att.pageNumber ?? att.name}`} size="A4" style={S.page}>
            <View style={S.attachHeader}>
              <Text style={S.attachHeaderText}>
                {numeroCaso} - {data.nombre ? capitalizeWords(data.nombre) : ""}
              </Text>
              <Text style={S.attachHeaderText}>
                {attIdx + 1} / {section.attachments.length}
                {att.isPdfPage && att.pageNumber && att.pageCount ? ` - Pagina ${att.pageNumber}/${att.pageCount}` : ""}
              </Text>
            </View>
            <Text style={S.attachSectionTitle}>{getSocialCaseAttachmentSectionTitle(att)}</Text>
            <Text style={S.attachName}>{cleanSocialCaseAttachmentName(att.sourceName ?? att.name)}</Text>

            {att.isImage && att.base64 ? (
              <View style={S.attachImageWrap}>
                <Image src={att.base64} style={S.attachImage} />
              </View>
            ) : (
              <View style={S.attachFileRow}>
                <Text style={S.attachFileName}>{cleanSocialCaseAttachmentName(att.name)}</Text>
                <Text style={S.attachFileNote}>Archivo adjunto</Text>
              </View>
            )}

            <View style={S.footer} fixed>
              <Text style={S.footerText}>{projectName} - Ficha Técnica Individual</Text>
              <Text style={S.footerText}>Generado el {generatedAtLabel}</Text>
            </View>
          </Page>
        ))
      )}
    </Document>
  );
}
