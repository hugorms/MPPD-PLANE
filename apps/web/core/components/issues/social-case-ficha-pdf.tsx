import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { SocialCaseData } from "./social-case-form";
import { isSocialCasePdfAttachment } from "@/utils/social-case-attachment-export";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  black: "#000000",
  gray700: "#374151",
  gray500: "#6b7280",
  gray100: "#f3f4f6",
  white: "#ffffff",
  border: "#9ca3af",
  borderLight: "#d1d5db",
  headerBg: "#1e3a5f",
  headerText: "#ffffff",
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.black,
    backgroundColor: C.white,
  },

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
  attachName: {
    fontSize: 7,
    color: C.gray500,
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
  logoUrl?: string | null;
  startDate?: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte YYYY-MM-DD → DD-MM-YYYY. Devuelve el original si no coincide el patrón. */
function formatDate(date: string): string {
  if (!date) return "";
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : date;
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? S.tableRowLast : S.tableRow}>
      <View style={S.cellLabel}>
        <Text style={S.cellLabelText}>{label}</Text>
      </View>
      <View style={S.cellValue}>
        <Text style={S.cellValueText}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function SocialCaseFichaPDF({
  data,
  projectName,
  projectIdentifier,
  stateName,
  sequenceId,
  responsable: _responsable,
  photoUrl,
  attachments = [],
  generatedAtLabel,
  logoUrl,
  startDate,
}: SocialCaseFichaProps) {
  const KNOWN_PREFIXES = ["[CI_BEN]", "[ENTREGA]"];
  const cleanAttachmentName = (name: string) => {
    let cleanName = name;
    let changed = true;
    while (changed) {
      changed = false;
      for (const prefix of KNOWN_PREFIXES) {
        if (cleanName.startsWith(`${prefix}_`)) {
          cleanName = cleanName.slice(prefix.length + 1);
          changed = true;
          break;
        }
      }
    }
    return cleanName.replace(/^\d+_/, "");
  };
  const attachmentLabel = (name: string) => cleanAttachmentName(name).split(".").pop()?.toUpperCase() || "ARCHIVO";

  const summaryAttachments = attachments.filter((a) => !isSocialCasePdfAttachment(a));
  const solicitudFiles = summaryAttachments.filter((a) => !KNOWN_PREFIXES.some((p) => a.name.startsWith(`${p}_`)));
  const ciFiles = summaryAttachments.filter((a) => a.name.startsWith("[CI_BEN]_"));
  const registroFiles = summaryAttachments.filter((a) => a.name.startsWith("[ENTREGA]_"));

  type FotoSlot = { label: string; imgs: (typeof attachments)[number][] };
  const fotoSlots: FotoSlot[] = [
    { label: "SOLICITUD", imgs: solicitudFiles },
    { label: "CÉDULA / CREDENCIAL", imgs: ciFiles },
    { label: "REGISTRO FOTOGRÁFICO", imgs: registroFiles },
  ];

  const numeroCaso = projectIdentifier
    ? `${projectIdentifier}-${sequenceId}`
    : data.numeroCaso
      ? `#${data.numeroCaso}`
      : `#${sequenceId}`;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* ── ENCABEZADO ── */}
        <View style={S.header}>
          {/* Logo izquierdo */}
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 150, height: 50, objectFit: "contain" }} />
          ) : (
            <View style={S.headerLogoBox}>
              <Text style={{ fontSize: 6, color: C.gray500, textAlign: "center" }}>LOGO</Text>
            </View>
          )}

          {/* Centro: nombre organización + título */}
          <View style={S.headerCenter}>
            <Text style={S.headerOrgName}>{projectName}</Text>
            <Text style={S.headerTitle}>Ficha Resumen</Text>
          </View>

          {/* Logo derecho (foto perfil ciudadano) */}
          {photoUrl ? (
            <Image src={photoUrl} style={{ width: 60, height: 40, objectFit: "contain" }} />
          ) : (
            <View style={S.headerLogoBox}>
              <Text style={{ fontSize: 6, color: C.gray500, textAlign: "center" }}>SIN{"\n"}FOTO</Text>
            </View>
          )}
        </View>

        {/* ── TABLA DE CAMPOS ── */}
        <View style={S.table}>
          <Row label="N° de caso" value={numeroCaso} />
          <Row label="Cédula" value={data.cedula} />
          <Row label="Nombre" value={data.nombre} />
          <Row label="Teléfono" value={data.telefono} />
          {data.telefono2 ? <Row label="Teléfono 2" value={data.telefono2} /> : null}
          <Row label="Dirección de habitación" value={data.direccion} />
          <Row label="Parroquia" value={data.parroquia} />
          <Row label="Municipio" value={data.municipio} />
          <Row label="Estado" value={data.entidad} />
          {data.esMilitar === "true" && data.condicionMilitar ? (
            <Row label="Condición militar" value={data.condicionMilitar} />
          ) : null}
          {data.esMilitar === "true" && data.gradoMilitar ? (
            <Row label="Grado militar" value={data.gradoMilitar} />
          ) : null}
          {data.esMilitar === "true" && data.jornada ? <Row label="Componente" value={data.jornada} /> : null}
          {data.unidadDependencia ? <Row label="Unidad / Dependencia" value={data.unidadDependencia} /> : null}
          <Row label="Solicitud" value={data.referencia} />
          {data.descripcionCaso ? <Row label="Descripción del caso" value={data.descripcionCaso} /> : null}
          {data.institucionContactada ? (
            <Row label="Órgano / Institución contactada" value={data.institucionContactada} />
          ) : null}
          <Row label="Acción tomada" value={data.accionTomada} />
          <Row label="Resultado / Beneficio otorgado" value={data.resultado} />
          {data.observacionCierre ? <Row label="Observación de cierre" value={data.observacionCierre} /> : null}
          <Row label="Fecha de inicio" value={formatDate(startDate ?? "")} />
          <Row
            label="Estado del caso"
            value={data.fechaCierre ? `${stateName} (${formatDate(data.fechaCierre)})` : stateName}
            last
          />
        </View>

        {/* ── TABLA DE 4 FOTOS ── */}
        <View style={S.photoTable}>
          {/* Encabezado de columnas */}
          <View style={S.photoTableHeader}>
            {fotoSlots.map((slot, i) => (
              <View
                key={slot.label}
                style={i < fotoSlots.length - 1 ? S.photoTableHeaderCell : S.photoTableHeaderCellLast}
              >
                <Text style={S.photoTableHeaderText}>{slot.label}</Text>
              </View>
            ))}
          </View>

          {/* Celdas de imagen */}
          <View style={S.photoTableBody}>
            {fotoSlots.map((slot, i) => {
              const cellStyle = i < fotoSlots.length - 1 ? S.photoCell : S.photoCellLast;
              if (slot.imgs.length === 0) {
                return (
                  <View key={slot.label} style={cellStyle}>
                    <Text style={S.photoCellPlaceholderText}>Sin{"\n"}imagen</Text>
                  </View>
                );
              }
              if (slot.imgs.length === 1) {
                const file = slot.imgs[0];
                return (
                  <View key={slot.label} style={cellStyle}>
                    {file.isImage && file.base64 ? (
                      <Image src={file.base64} style={S.photoCellImg} />
                    ) : (
                      <View style={S.fileCellBox}>
                        <Text style={S.fileCellIcon}>{attachmentLabel(file.name)}</Text>
                        <Text style={S.fileCellName}>{cleanAttachmentName(file.name)}</Text>
                      </View>
                    )}
                  </View>
                );
              }
              // Collage: grilla de 2 columnas, todas del mismo tamaño
              const rows = Math.ceil(slot.imgs.length / 2);
              const imgHeight = Math.floor(160 / rows);
              return (
                <View key={slot.label} style={{ ...cellStyle, flexDirection: "row", flexWrap: "wrap", height: 160 }}>
                  {slot.imgs.map((img) => (
                    <View
                      key={img.name}
                      style={{
                        width: "50%",
                        height: imgHeight,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {img.isImage && img.base64 ? (
                        <Image src={img.base64} style={{ width: "100%", height: imgHeight, objectFit: "contain" }} />
                      ) : (
                        <View style={S.fileCellBox}>
                          <Text style={S.fileCellIcon}>{attachmentLabel(img.name)}</Text>
                          <Text style={S.fileCellName}>{cleanAttachmentName(img.name)}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{projectName} · Ficha Técnica Individual</Text>
          <Text style={S.footerText}>Generado el {generatedAtLabel}</Text>
        </View>
      </Page>

      {attachments.map((att, attIdx) => (
        <Page key={`ficha-att-${att.sourceName ?? att.name}-${att.pageNumber ?? att.name}`} size="A4" style={S.page}>
          <View style={S.attachHeader}>
            <Text style={S.attachHeaderText}>
              {numeroCaso} - {data.nombre}
            </Text>
            <Text style={S.attachHeaderText}>
              Adjunto {attIdx + 1} / {attachments.length}
              {att.isPdfPage && att.pageNumber && att.pageCount ? ` - Pagina ${att.pageNumber}/${att.pageCount}` : ""}
            </Text>
          </View>
          <Text style={S.attachName}>{att.sourceName ?? att.name}</Text>

          {att.isImage && att.base64 ? (
            <View style={S.attachImageWrap}>
              <Image src={att.base64} style={S.attachImage} />
            </View>
          ) : (
            <View style={S.attachFileRow}>
              <Text style={S.attachFileName}>{cleanAttachmentName(att.name)}</Text>
              <Text style={S.attachFileNote}>Ver archivo adjunto por separado</Text>
            </View>
          )}

          <View style={S.footer} fixed>
            <Text style={S.footerText}>{projectName} - Ficha Tecnica Individual</Text>
            <Text style={S.footerText}>Generado el {generatedAtLabel}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
