import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import {
  cleanSocialCaseAttachmentName,
  getSocialCaseAttachmentSectionTitle,
  groupSocialCaseAttachmentsBySection,
} from "@/utils/social-case-attachment-export";

// ── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  black: "#09090b",
  gray900: "#18181b",
  gray700: "#3f3f46",
  gray500: "#71717a",
  gray300: "#d4d4d8",
  gray100: "#f4f4f5",
  gray50: "#fafafa",
  white: "#ffffff",
  blue: "#2563eb",
  navy: "#0f3a73",
  paleBlue: "#eff6ff",
  green: "#16a34a",
  border: "#e4e4e7",
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Página
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: C.black, backgroundColor: C.white },

  divider: { borderBottom: `1px solid ${C.border}`, marginVertical: 16 },

  // ── TABLA PRINCIPAL ──
  tableTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.gray900, marginBottom: 2 },
  tableSub: { fontSize: 8, color: C.gray500, marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.gray900,
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${C.border}`,
    paddingVertical: 6,
    paddingHorizontal: 5,
    backgroundColor: C.white,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `1px solid ${C.border}`,
    paddingVertical: 6,
    paddingHorizontal: 5,
    backgroundColor: C.gray50,
  },
  cellHeader: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.white },
  cell: { fontSize: 7, color: C.gray700 },
  cellBold: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray900 },

  // Anchos de columna
  cId: { width: 38 },
  cNombre: { flex: 2 },
  cCedula: { width: 58 },
  cMunicipio: { width: 62 },
  cComponente: { width: 68 },
  cResponsable: { width: 80 },
  cTelefono: { width: 72 },
  cReferencia: { flex: 2 },
  cDescripcion: { flex: 2 },
  cAccion: { flex: 1.5 },
  cResultado: { flex: 1.5 },
  cEstado: { width: 60 },

  // Pill de estado
  pill: { borderRadius: 10, paddingVertical: 2, paddingHorizontal: 5, alignSelf: "flex-start" },
  pillText: { fontSize: 6, fontFamily: "Helvetica-Bold" },

  // ── DETALLE ──
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
  detailNameWrap: { flex: 1 },
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
  metaCol: {
    flex: 1,
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 6,
    minHeight: 132,
  },
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

  // Sección de texto en detalle
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

  // Timeline de estado (vertical)
  timelineWrap: { marginTop: 12, padding: 12, backgroundColor: C.gray100, borderRadius: 6 },
  timelineTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray700, marginBottom: 10 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 0 },
  timelineDotCol: { width: 18, alignItems: "center" },
  timelineDot: { width: 9, height: 9, borderRadius: 999 },
  timelineLine: { width: 1, flex: 1, minHeight: 14 },
  timelineLabel: { flex: 1, paddingLeft: 6, paddingBottom: 10, paddingTop: 0 },
  timelineLabelText: { fontSize: 8, color: C.gray700 },
  timelineLabelActive: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.blue },

  // Adjuntos
  attachPageTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.gray900, marginBottom: 2 },
  attachPageSub: { fontSize: 8, color: C.gray500, marginBottom: 8 },
  attachSectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.gray900,
    textTransform: "uppercase",
    paddingBottom: 5,
    marginBottom: 5,
    borderBottom: `1px solid ${C.gray900}`,
  },
  attachName: { fontSize: 8, color: C.gray700, marginBottom: 8 },
  attachFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: C.gray100,
    borderRadius: 4,
  },
  attachFileName: { fontSize: 9, color: C.gray700, flex: 1 },
  attachFileNote: { fontSize: 8, color: C.gray500 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${C.border}`,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.gray500 },
});

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type AttachmentInfo = {
  name: string;
  isImage: boolean;
  base64?: string;
  sourceName?: string;
  pageNumber?: number;
  pageCount?: number;
  isPdfPage?: boolean;
};

export type ParsedIssueRow = {
  id: string;
  sequenceId: number;
  numeroCaso: string;
  stateId: string | null;
  stateName: string;
  photoUrl: string | null;
  responsable: string;
  nombre: string;
  cedula: string;
  telefono: string;
  municipio: string;
  entidad: string;
  componente: string;
  esMilitar: boolean;
  condicionMilitar: string;
  gradoMilitar: string;
  unidadDependencia: string;
  referencia: string;
  descripcionCaso: string;
  accionTomada: string;
  resultado: string;
  institucionContactada: string;
  fechaCierre: string;
  observacionCierre: string;
  beneficiado: boolean;
  attachments?: AttachmentInfo[];
};

export type StateFlowStep = { id: string; name: string };

const PDF_FANB_COMPONENTES = [
  "Ejército Nacional Bolivariano",
  "Armada Bolivariana de Venezuela",
  "Aviación Militar Bolivariana",
  "Guardia Nacional Bolivariana",
  "Milicia Nacional Bolivariana",
] as const;

const PDF_FANB_COLOR_MAP: Record<string, string> = {
  "Ejército Nacional Bolivariano": "#15803d",
  "Armada Bolivariana de Venezuela": "#1d4ed8",
  "Aviación Militar Bolivariana": "#0369a1",
  "Guardia Nacional Bolivariana": "#4d7c0f",
  "Milicia Nacional Bolivariana": "#b91c1c",
};

type Props = {
  rows: ParsedIssueRow[];
  projectName: string;
  dateRange: string;
  byState: Record<string, number>;
  byComponente: Record<string, number>;
  byCondicion?: Record<string, number>;
  byEntidad?: [string, number][];
  byMonth?: [string, number][];
  byLabel?: [string, number][];
  stateColorMap?: Record<string, string>;
  conResultado: number;
  generatedAtLabel: string;
  stateFlow: StateFlowStep[];
  includeCover?: boolean;
  includePhotos?: boolean;
  includeDetails?: boolean;
  includeAttachments?: boolean;
  logoUrl?: string | null;
};

// ── Helpers gráfica ───────────────────────────────────────────────────────────

function pdfMonthLabel(yyyyMM: string): string {
  const parts = yyyyMM.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
    .toLocaleDateString("es-VE", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

function PdfHBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.max(2, Math.round((count / total) * 100)) : 2;
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 5 }} />
        <Text style={{ fontSize: 7.5, color: C.gray700, flex: 1 }} numberOfLines={1}>
          {label}
        </Text>
        <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.gray900, marginLeft: 4 }}>{count}</Text>
        <Text style={{ fontSize: 6.5, color: C.gray500, marginLeft: 3 }}>{pct}%</Text>
      </View>
      <View style={{ width: "100%", height: 5, backgroundColor: C.gray100 }}>
        <View style={{ width: `${pct}%`, height: 5, backgroundColor: color, opacity: 0.85 }} />
      </View>
    </View>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
      <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray900 }}>{title}</Text>
      {sub ? <Text style={{ fontSize: 6.5, color: C.gray500, marginTop: 1 }}>{sub}</Text> : null}
    </View>
  );
}

function GraphicPage({
  projectName,
  dateRange,
  generatedAtLabel,
  logoUrl,
  total,
  conResultado,
  cantCiviles,
  cantMilitares,
  byComponente,
  byState,
  byEntidad,
  byMonth,
  byLabel = [],
  stateColorMap = {},
}: {
  projectName: string;
  dateRange: string;
  generatedAtLabel: string;
  logoUrl?: string | null;
  total: number;
  conResultado: number;
  cantCiviles: number;
  cantMilitares: number;
  byComponente: Record<string, number>;
  byState: Record<string, number>;
  byEntidad: [string, number][];
  byMonth: [string, number][];
  byLabel?: [string, number][];
  stateColorMap?: Record<string, string>;
}) {
  const maxMonth = byMonth.length > 0 ? Math.max(1, ...byMonth.map(([, c]) => c)) : 1;
  const CHART_H = 60;

  // Solo los 5 FANB canónicos con count > 0
  // oxlint-disable-next-line unicorn/no-array-sort
  const fanbEntries = PDF_FANB_COMPONENTES.map((c) => [c, byComponente[c] ?? 0] as [string, number])
    .filter(([, count]) => count > 0)
    .toSorted(([, a], [, b]) => b - a);

  // oxlint-disable-next-line unicorn/no-array-sort
  const stateEntries = Object.entries(byState).sort(([, a], [, b]) => b - a);

  const civPct = total > 0 ? Math.round((cantCiviles / total) * 100) : 0;
  const milPct = total > 0 ? Math.round((cantMilitares / total) * 100) : 0;

  return (
    <Page size="A4" style={S.page}>
      {/* Encabezado */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `2px solid ${C.blue}`,
        }}
      >
        {logoUrl && <Image src={logoUrl} style={{ width: 100, height: 34, objectFit: "contain", marginRight: 10 }} />}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: C.gray900 }}>{projectName}</Text>
          <Text style={{ fontSize: 8, color: C.gray500, marginTop: 2 }}>Análisis de Casos Sociales · {dateRange}</Text>
        </View>
      </View>

      {/* KPIs */}
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
        {(
          [
            { label: "Total de fichas", value: total, color: C.blue, pct: "" },
            {
              label: "Resueltos",
              value: conResultado,
              color: "#16a34a",
              pct: total > 0 ? ` ${Math.round((conResultado / total) * 100)}%` : "",
            },
            { label: "Civiles", value: cantCiviles, color: C.gray700, pct: ` ${civPct}%` },
            { label: "Militares", value: cantMilitares, color: "#1d4ed8", pct: ` ${milPct}%` },
          ] as const
        ).map((k) => (
          <View
            key={k.label}
            style={{ flex: 1, backgroundColor: C.gray100, padding: 8, borderLeft: `3px solid ${k.color}` }}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: C.gray900 }}>{k.value}</Text>
              {k.pct ? <Text style={{ fontSize: 7, color: C.gray500, marginLeft: 3 }}>{k.pct}</Text> : null}
            </View>
            <Text style={{ fontSize: 7, color: C.gray500, marginTop: 1 }}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* 2 columnas */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* Columna izquierda */}
        <View style={{ flex: 1, gap: 10 }}>
          {/* Componentes FANB */}
          <View style={{ backgroundColor: C.gray50, padding: 9 }}>
            <SectionHeader title="COMPONENTES FANB" sub="Distribución por rama militar" />
            {fanbEntries.map(([name, count]) => (
              <PdfHBar
                key={name}
                label={name}
                count={count}
                total={total}
                color={PDF_FANB_COLOR_MAP[name] ?? C.gray500}
              />
            ))}
          </View>

          {/* Estado de Venezuela */}
          <View style={{ backgroundColor: C.gray50, padding: 9 }}>
            <SectionHeader title="ESTADO DE VENEZUELA" sub={`Top ${byEntidad.length}`} />
            {byEntidad.length === 0 ? (
              <Text style={{ fontSize: 7, color: C.gray500 }}>Sin datos registrados</Text>
            ) : (
              byEntidad
                .slice(0, 6)
                .map(([name, count]) => <PdfHBar key={name} label={name} count={count} total={total} color="#7c3aed" />)
            )}
          </View>
        </View>

        {/* Columna derecha */}
        <View style={{ flex: 1, gap: 10 }}>
          {/* Estado del caso — colores reales */}
          <View style={{ backgroundColor: C.gray50, padding: 9 }}>
            <SectionHeader
              title="ESTADO DEL CASO"
              sub={`${stateEntries.length} estado${stateEntries.length !== 1 ? "s" : ""}`}
            />
            {stateEntries.map(([name, count]) => (
              <PdfHBar key={name} label={name} count={count} total={total} color={stateColorMap[name] ?? C.gray500} />
            ))}
          </View>

          {/* Etiquetas */}
          <View style={{ backgroundColor: C.gray50, padding: 9 }}>
            <SectionHeader title="ETIQUETAS" sub={`${byLabel.length} etiqueta${byLabel.length !== 1 ? "s" : ""}`} />
            {byLabel.length === 0 ? (
              <Text style={{ fontSize: 7, color: C.gray500 }}>Sin etiquetas asignadas</Text>
            ) : (
              byLabel
                .slice(0, 6)
                .map(([name, count]) => <PdfHBar key={name} label={name} count={count} total={total} color={C.blue} />)
            )}
          </View>

          {/* Evolución mensual */}
          <View style={{ backgroundColor: C.gray50, padding: 9 }}>
            <SectionHeader title="EVOLUCIÓN MENSUAL" sub={`Últimos ${byMonth.length} meses`} />
            {byMonth.length === 0 ? (
              <Text style={{ fontSize: 7, color: C.gray500 }}>Sin datos en el período</Text>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "flex-end", height: CHART_H, gap: 2, marginTop: 4 }}>
                {byMonth.map(([month, count], idx) => {
                  const barH = Math.max(4, Math.round((count / maxMonth) * (CHART_H - 16)));
                  const opacity = 0.4 + (idx / Math.max(byMonth.length - 1, 1)) * 0.6;
                  return (
                    <View key={month} style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ fontSize: 5.5, color: C.gray700, marginBottom: 1 }}>{count}</Text>
                      <View style={{ width: "100%", height: barH, backgroundColor: C.blue, opacity }} />
                      <Text style={{ fontSize: 5, color: C.gray500, marginTop: 1 }} numberOfLines={1}>
                        {pdfMonthLabel(month)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>{projectName} · Análisis de Casos Sociales</Text>
        <Text style={S.footerText}>Generado el {generatedAtLabel}</Text>
      </View>
    </Page>
  );
}

// ── Timeline vertical de estados ─────────────────────────────────────────────

// ── Footer ────────────────────────────────────────────────────────────────────

const Footer = ({ projectName, generatedAtLabel }: { projectName: string; generatedAtLabel: string }) => (
  <View style={S.footer} fixed>
    <Text style={S.footerText}>
      {projectName} · Generado el {generatedAtLabel}
    </Text>
    <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
  </View>
);

// ── Componente principal ──────────────────────────────────────────────────────

export const SocialCaseReportPDF = ({
  rows,
  projectName,
  dateRange,
  byState,
  byComponente,
  byCondicion,
  byEntidad = [],
  byMonth = [],
  byLabel = [],
  stateColorMap = {},
  conResultado,
  generatedAtLabel,
  includeCover = true,
  includePhotos = true,
  includeDetails = false,
  includeAttachments = false,
  logoUrl,
}: Props) => {
  const total = rows.length;
  const cantCiviles = byCondicion?.["Civil"] ?? rows.filter((r) => !r.esMilitar).length;
  const cantMilitares = byCondicion?.["Militar"] ?? rows.filter((r) => r.esMilitar).length;

  return (
    <Document>
      {/* ══ PORTADA ══════════════════════════════════════════════════════════ */}
      {/* ══ HOJA GRÁFICA ════════════════════════════════════════════════════ */}
      {includeCover && total > 0 && (
        <GraphicPage
          projectName={projectName}
          dateRange={dateRange}
          generatedAtLabel={generatedAtLabel}
          logoUrl={logoUrl}
          total={total}
          conResultado={conResultado}
          cantCiviles={cantCiviles}
          cantMilitares={cantMilitares}
          byComponente={byComponente}
          byState={byState}
          byEntidad={byEntidad}
          byMonth={byMonth}
          byLabel={byLabel ?? []}
          stateColorMap={stateColorMap ?? {}}
        />
      )}

      {/* ══ TABLA DE CASOS ═══════════════════════════════════════════════════ */}
      <Page size="A4" orientation="landscape" style={S.page}>
        <Text fixed style={S.tableTitle}>
          {projectName} — Listado de Casos Sociales
        </Text>
        <Text fixed style={S.tableSub}>
          {dateRange} · {total} registros
        </Text>

        {/* Cabecera */}
        <View fixed style={S.tableHeader}>
          <View style={S.cId}>
            <Text style={S.cellHeader}>ID</Text>
          </View>
          <View style={S.cNombre}>
            <Text style={S.cellHeader}>Nombre completo</Text>
          </View>
          <View style={S.cCedula}>
            <Text style={S.cellHeader}>Cédula</Text>
          </View>
          <View style={S.cMunicipio}>
            <Text style={S.cellHeader}>Municipio</Text>
          </View>
          <View style={S.cComponente}>
            <Text style={S.cellHeader}>Componente</Text>
          </View>
          <View style={S.cResponsable}>
            <Text style={S.cellHeader}>Responsable</Text>
          </View>
          <View style={S.cTelefono}>
            <Text style={S.cellHeader}>Teléfono</Text>
          </View>
          <View style={S.cReferencia}>
            <Text style={S.cellHeader}>Referencia</Text>
          </View>
          <View style={S.cDescripcion}>
            <Text style={S.cellHeader}>Descripción</Text>
          </View>
          <View style={S.cAccion}>
            <Text style={S.cellHeader}>Acción tomada</Text>
          </View>
          <View style={S.cResultado}>
            <Text style={S.cellHeader}>Resultado</Text>
          </View>
          <View style={S.cEstado}>
            <Text style={S.cellHeader}>Estado</Text>
          </View>
        </View>

        {/* Filas */}
        {rows.map((row, idx) => (
          <View key={row.id} style={idx % 2 === 0 ? S.tableRow : S.tableRowAlt} wrap={false}>
            <View style={S.cId}>
              <Text style={S.cellBold}>{row.numeroCaso}</Text>
            </View>
            <View style={S.cNombre}>
              <Text style={S.cell}>{row.nombre}</Text>
            </View>
            <View style={S.cCedula}>
              <Text style={S.cell}>{row.cedula}</Text>
            </View>
            <View style={S.cMunicipio}>
              <Text style={S.cell}>{row.municipio}</Text>
            </View>
            <View style={S.cComponente}>
              <Text style={S.cell}>{row.componente}</Text>
            </View>
            <View style={S.cResponsable}>
              <Text style={S.cell}>{row.responsable}</Text>
            </View>
            <View style={S.cTelefono}>
              <Text style={S.cell}>{row.telefono || "—"}</Text>
            </View>
            <View style={S.cReferencia}>
              <Text style={S.cell}>{row.referencia.slice(0, 100)}</Text>
            </View>
            <View style={S.cDescripcion}>
              <Text style={S.cell}>{row.descripcionCaso.slice(0, 100)}</Text>
            </View>
            <View style={S.cAccion}>
              <Text style={S.cell}>{row.accionTomada.slice(0, 100)}</Text>
            </View>
            <View style={S.cResultado}>
              <Text style={S.cell}>{row.resultado.slice(0, 100)}</Text>
            </View>
            <View style={S.cEstado}>
              <Text style={S.cell}>{row.stateName}</Text>
            </View>
          </View>
        ))}

        <Footer projectName={projectName} generatedAtLabel={generatedAtLabel} />
      </Page>

      {/* ══ DETALLE POR CASO ═════════════════════════════════════════════════ */}
      {includeDetails &&
        rows.map((row) => {
          const resolvedPhoto = includePhotos && row.photoUrl ? row.photoUrl : null;
          const rowAttachments = includeAttachments ? (row.attachments ?? []) : [];
          const rowAttachmentSections = groupSocialCaseAttachmentsBySection(rowAttachments);

          return (
            <React.Fragment key={`case-${row.id}`}>
              <Page size="A4" style={S.page}>
                <View style={S.detailPageHeader} fixed>
                  <Text style={S.detailPageProject}>{projectName}</Text>
                  <Text style={S.detailPageTag}>Reporte de Casos Sociales · {dateRange}</Text>
                </View>

                <View style={S.detailHeader}>
                  <View style={S.detailPhotoFrame}>
                    {resolvedPhoto ? (
                      <Image src={resolvedPhoto} style={S.detailPhoto} />
                    ) : (
                      <View style={S.detailPhotoPlaceholder}>
                        <Text style={S.detailPhotoText}>Sin foto</Text>
                      </View>
                    )}
                  </View>
                  <View style={S.detailMeta}>
                    <View style={S.detailTitleRow}>
                      <View style={S.detailNameWrap}>
                        <Text style={S.detailName}>{row.nombre}</Text>
                        <Text style={S.detailId}>{row.numeroCaso}</Text>
                      </View>
                      <View style={S.detailStatusBadge}>
                        <Text style={S.detailStatusLabel}>Estado del caso</Text>
                        <Text style={S.detailStatusText}>{row.stateName}</Text>
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
                        <Text style={S.metaValue}>{row.cedula}</Text>
                      </View>
                      <View style={S.metaItem}>
                        <Text style={S.metaLabel}>Teléfono</Text>
                        <Text style={S.metaValue}>{row.telefono || "—"}</Text>
                      </View>
                      <View style={S.metaItem}>
                        <Text style={S.metaLabel}>Municipio</Text>
                        <Text style={S.metaValue}>{row.municipio}</Text>
                      </View>
                      <View style={S.metaItem}>
                        <Text style={S.metaLabel}>Estado (Vzla.)</Text>
                        <Text style={S.metaValue}>{row.entidad || "—"}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={S.metaColMilitary}>
                    <Text style={S.metaGroupTitle}>DATOS MILITARES</Text>
                    <View style={S.metaCardBody}>
                      <View style={S.metaItem}>
                        <Text style={S.metaLabel}>Componente</Text>
                        <Text style={S.metaValue}>{row.componente}</Text>
                      </View>
                      {row.esMilitar && row.condicionMilitar && row.condicionMilitar !== "-" ? (
                        <View style={S.metaItem}>
                          <Text style={S.metaLabel}>Condición militar</Text>
                          <Text style={S.metaValue}>{row.condicionMilitar}</Text>
                        </View>
                      ) : null}
                      {row.esMilitar && row.gradoMilitar && row.gradoMilitar !== "-" ? (
                        <View style={S.metaItem}>
                          <Text style={S.metaLabel}>Grado militar</Text>
                          <Text style={S.metaValue}>{row.gradoMilitar}</Text>
                        </View>
                      ) : null}
                      {row.unidadDependencia && row.unidadDependencia !== "-" ? (
                        <View style={S.metaItem}>
                          <Text style={S.metaLabel}>Unidad / Dependencia</Text>
                          <Text style={S.metaValue}>{row.unidadDependencia}</Text>
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
                      <Text style={S.metaValue}>{row.responsable}</Text>
                    </View>
                    <View style={S.metaManagementItem}>
                      <Text style={S.metaLabel}>Fecha de cierre</Text>
                      <Text style={S.metaValue}>{row.fechaCierre || "-"}</Text>
                    </View>
                    <View style={S.metaManagementItemLast}>
                      <Text style={S.metaLabel}>Caso resuelto</Text>
                      <Text style={[S.metaValue, { color: row.beneficiado ? C.green : C.gray700 }]}>
                        {row.beneficiado ? "Sí" : "No"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={S.detailSection}>
                  <Text style={S.detailSectionTitle}>SOLICITUD</Text>
                  <Text style={S.detailText}>{row.referencia || "—"}</Text>
                </View>
                {row.descripcionCaso && row.descripcionCaso !== "-" && (
                  <View style={S.detailSection}>
                    <Text style={S.detailSectionTitle}>DESCRIPCIÓN DEL CASO</Text>
                    <Text style={S.detailText}>{row.descripcionCaso}</Text>
                  </View>
                )}
                {row.institucionContactada && row.institucionContactada !== "-" && (
                  <View style={S.detailSection}>
                    <Text style={S.detailSectionTitle}>ÓRGANO / INSTITUCIÓN CONTACTADA</Text>
                    <Text style={S.detailText}>{row.institucionContactada}</Text>
                  </View>
                )}
                <View style={S.detailSection}>
                  <Text style={S.detailSectionTitle}>ACCIÓN TOMADA</Text>
                  <Text style={S.detailText}>{row.accionTomada || "—"}</Text>
                </View>
                <View style={S.detailSection}>
                  <Text style={S.detailSectionTitle}>RESULTADO</Text>
                  <Text style={S.detailText}>{row.resultado || "—"}</Text>
                </View>
                {row.observacionCierre && row.observacionCierre !== "-" && (
                  <View style={S.detailSection}>
                    <Text style={S.detailSectionTitle}>OBSERVACIÓN DE CIERRE</Text>
                    <Text style={S.detailText}>{row.observacionCierre}</Text>
                  </View>
                )}

                <Footer projectName={projectName} generatedAtLabel={generatedAtLabel} />
              </Page>

              {/* ── PÁGINAS DE ADJUNTOS ── */}
              {rowAttachmentSections.flatMap((section) =>
                section.attachments.map((att, attIdx) => (
                  <Page
                    key={`att-${row.id}-${section.key}-${att.sourceName ?? att.name}-${att.pageNumber ?? att.name}`}
                    size="A4"
                    style={S.page}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 8, color: C.gray500 }}>
                        {row.numeroCaso} · {row.nombre}
                      </Text>
                      <Text style={{ fontSize: 8, color: C.gray500 }}>
                        {attIdx + 1} / {section.attachments.length}
                        {att.isPdfPage && att.pageNumber && att.pageCount
                          ? ` · Página ${att.pageNumber}/${att.pageCount}`
                          : ""}
                      </Text>
                    </View>
                    <Text style={S.attachSectionTitle}>{getSocialCaseAttachmentSectionTitle(att)}</Text>
                    <Text style={S.attachName}>{cleanSocialCaseAttachmentName(att.sourceName ?? att.name)}</Text>

                    {att.isImage && att.base64 ? (
                      <View style={{ alignItems: "center", marginTop: 8, marginBottom: 36 }}>
                        <Image src={att.base64} style={{ width: 400, height: 520, objectFit: "contain" }} />
                      </View>
                    ) : att.isImage && !att.base64 ? (
                      <View style={[S.attachFileRow, { backgroundColor: "#fee2e2" }]}>
                        <Text style={[S.attachFileName, { color: "#ef4444" }]}>
                          {cleanSocialCaseAttachmentName(att.name)} - imagen detectada pero no se pudo convertir a
                          base64
                        </Text>
                      </View>
                    ) : (
                      <View style={S.attachFileRow}>
                        <Text style={S.attachFileName}>{cleanSocialCaseAttachmentName(att.name)}</Text>
                        <Text style={S.attachFileNote}>Archivo adjunto</Text>
                      </View>
                    )}

                    <Footer projectName={projectName} generatedAtLabel={generatedAtLabel} />
                  </Page>
                ))
              )}
            </React.Fragment>
          );
        })}
    </Document>
  );
};
