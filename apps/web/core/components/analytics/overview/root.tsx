/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { FileDown, FileSpreadsheet, ChevronDown, X } from "lucide-react";
import { Button } from "@plane/propel/button";
import { Checkbox } from "@plane/ui";
import { API_BASE_URL } from "@plane/constants";
import { getFileURL, cn } from "@plane/utils";
import { extractFromHtml, extractProfilePhotoFromHtml } from "@/components/issues/social-case-form";
import {
  SocialCaseReportPDF,
  type ParsedIssueRow,
  type AttachmentInfo,
  type StateFlowStep,
} from "@/components/issues/social-case-report-pdf";
import { VENEZUELA_ESTADOS } from "@/components/issues/social-case-estados";
import { APIService } from "@/services/api.service";
import { IssueAttachmentService } from "@/services/issue/issue_attachment.service";
import { useMember } from "@/hooks/store/use-member";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
import AnalyticsWrapper from "../analytics-wrapper";
import TotalInsights from "../total-insights";
import ActiveProjects from "./active-projects";
import ProjectInsights from "./project-insights";

// ── Servicios ─────────────────────────────────────────────────────────────────

class SocialCaseService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }
  async getSocialCases(workspaceSlug: string, projectId: string): Promise<any[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/social-cases/`)
      .then((res) => res?.data ?? [])
      .catch(() => []);
  }
}

const socialCaseService = new SocialCaseService();
const attachmentService = new IssueAttachmentService();

// ── Utilidades módulo ─────────────────────────────────────────────────────────

type Preset = "today" | "week" | "month" | "3months" | "all" | "custom";

const CONDICION_OPTIONS = ["Civil", "Militar"] as const;

const toUpperOrDash = (v: string | undefined | null) => (v ?? "-").toUpperCase();

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject(new Error("FileReader error")));
    reader.readAsDataURL(blob);
  });
}

async function fetchBase64WithAuth(apiUrl: string): Promise<string> {
  const sep = apiUrl.includes("?") ? "&" : "?";
  const jsonRes = await fetch(`${apiUrl}${sep}as_url=1`, { credentials: "include" });
  if (!jsonRes.ok) throw new Error(`HTTP ${jsonRes.status}`);
  const { url } = await jsonRes.json();
  return urlToBase64(url);
}

function presetRange(preset: Preset): { from: Date | null; to: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "today") return { from: today, to: now };
  if (preset === "week") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from, to: now };
  }
  if (preset === "month") {
    const from = new Date(today);
    from.setDate(1);
    return { from, to: now };
  }
  if (preset === "3months") {
    const from = new Date(today);
    from.setMonth(today.getMonth() - 3);
    return { from, to: now };
  }
  return { from: null, to: null };
}

function formatDateLabel(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMonthLabel(yyyyMM: string): string {
  const parts = yyyyMM.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
    .toLocaleDateString("es-VE", { month: "short", year: "2-digit" })
    .replace(".", "");
}

// ── FilterDropdown ────────────────────────────────────────────────────────────

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
};

function FilterDropdown({ label, options, selected, onChange, onClear, disabled }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 text-12 font-medium transition-colors",
          selected.length > 0
            ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
            : "border-subtle bg-surface-2 text-secondary hover:bg-layer-1",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-primary px-1 text-10 font-semibold text-white">
            {selected.length}
          </span>
        )}
        {selected.length > 0 ? (
          <X
            className="h-3 w-3 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          />
        ) : (
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && (
        <div className="shadow-lg absolute top-full left-0 z-50 mt-1.5 w-56 rounded-lg border border-subtle bg-surface-1">
          <div className="border-b border-subtle px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-transparent text-12 text-secondary outline-none placeholder:text-tertiary"
            />
          </div>
          <div className="vertical-scrollbar scrollbar-sm max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-12 text-tertiary">Sin resultados</p>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-12 text-secondary transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        isSelected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                      )}
                    >
                      {isSelected && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-subtle px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-11 text-accent-primary hover:underline"
              >
                Limpiar ({selected.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Barra horizontal CSS ──────────────────────────────────────────────────────

function HBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-11 text-secondary">{label}</span>
          <span className="shrink-0 text-11 font-semibold text-secondary">{count}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-1">
          <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

const Overview = observer(function Overview() {
  const { workspaceSlug } = useParams();
  const { workspaceProjectIds, getProjectById } = useProject();
  const { getProjectStates } = useProjectState();
  const memberRoot = useMember();

  // ── Estado GCS ───────────────────────────────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [componenteFilter, setComponenteFilter] = useState<string[]>([]);
  const [condicionFilter, setCondicionFilter] = useState<string[]>([]);
  const [estadosFilter, setEstadosFilter] = useState<string[]>([]);

  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  const [generatingType, setGeneratingType] = useState<"pdf" | "excel" | null>(null);
  const generating = generatingType !== null;
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [includeCover, setIncludeCover] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [openAfter, setOpenAfter] = useState(true);

  // ── Carga de datos ───────────────────────────────────────────────────────────
  useEffect(() => {
    const ws = workspaceSlug?.toString();
    const pid = selectedProjectId;
    if (!ws || !pid) {
      setAllIssues([]);
      return;
    }
    setLoadingIssues(true);
    socialCaseService
      .getSocialCases(ws, pid)
      .then((list) => setAllIssues(list))
      .finally(() => setLoadingIssues(false));
  }, [workspaceSlug, selectedProjectId]);

  // ── Estados del proyecto ─────────────────────────────────────────────────────
  const states = useMemo(
    () => (selectedProjectId ? getProjectStates(selectedProjectId) : []),
    [getProjectStates, selectedProjectId]
  );

  const stateFlow = useMemo<StateFlowStep[]>(() => (states ?? []).map((s) => ({ id: s.id, name: s.name })), [states]);

  const stateNames = useMemo(() => {
    const map: Record<string, string> = {};
    (states ?? []).forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [states]);

  // ── Rango de fechas ──────────────────────────────────────────────────────────
  const { fromDate, toDate } = useMemo(() => {
    if (preset !== "all" && preset !== "custom") {
      const range = presetRange(preset);
      return { fromDate: range.from, toDate: range.to };
    }
    if (preset === "custom") {
      return {
        fromDate: customFrom ? new Date(customFrom) : null,
        toDate: customTo ? new Date(customTo + "T23:59:59") : null,
      };
    }
    return { fromDate: null, toDate: null };
  }, [preset, customFrom, customTo]);

  // ── Componentes únicos para el filtro ────────────────────────────────────────
  const componentesUnicos = useMemo(() => {
    const set = new Set<string>();
    for (const issue of allIssues) {
      const d = extractFromHtml(issue?.description_html ?? "");
      const jornada = d?.jornada?.trim();
      if (jornada) set.add(jornada);
    }
    // oxlint-disable-next-line unicorn/no-array-sort
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [allIssues]);

  // ── Filas + estadísticas ─────────────────────────────────────────────────────
  const { rows, byState, byComponente, byCondicion, byEntidad, byMonth, conResultado } = useMemo(() => {
    const parsedRows: ParsedIssueRow[] = [];
    const parsedByState: Record<string, number> = {};
    const parsedByComponente: Record<string, number> = {};
    const parsedByEntidad: Record<string, number> = {};
    const parsedByMonth: Record<string, number> = {};
    let parsedCiviles = 0;
    let parsedMilitares = 0;
    let parsedConResultado = 0;

    for (const issue of allIssues) {
      if (!issue) continue;

      // Filtro de fechas
      if (fromDate || toDate) {
        const created = issue.created_at ? new Date(issue.created_at) : null;
        if (!created) continue;
        if (fromDate && created < fromDate) continue;
        if (toDate && created > toDate) continue;
      }

      const d = extractFromHtml(issue.description_html ?? "");

      // Filtro por estado de Venezuela
      if (estadosFilter.length > 0) {
        const entidad = d?.entidad?.trim().toLowerCase() ?? "";
        if (!estadosFilter.some((e) => e.toLowerCase() === entidad)) continue;
      }

      // Filtro por componente FANB
      if (componenteFilter.length > 0) {
        const jornada = d?.jornada?.trim() ?? "";
        if (!componenteFilter.includes(jornada)) continue;
      }

      // Filtro Civil / Militar
      if (condicionFilter.length > 0) {
        const isMil = d?.esMilitar === "true";
        const matchesMilitar = condicionFilter.includes("Militar") && isMil;
        const matchesCivil = condicionFilter.includes("Civil") && !isMil;
        if (!matchesMilitar && !matchesCivil) continue;
      }

      const photoUrl = extractProfilePhotoFromHtml(issue.description_html ?? "");
      const stateName = stateNames[issue.state_id ?? ""] ?? "Sin estado";
      const isMilitar = d?.esMilitar === "true";
      const componente = d?.jornada || (isMilitar ? "Militar / Sin componente" : "Civil");
      const entidad = d?.entidad?.trim() || "Sin estado";
      const assignees = (issue.assignee_ids ?? [])
        .map((id: string) => memberRoot.getUserDetails(id)?.display_name || memberRoot.getUserDetails(id)?.first_name)
        .filter(Boolean) as string[];
      const responsable = assignees.length > 0 ? assignees.join(", ") : "Sin asignar";
      const beneficiado = !!(d?.resultado && d.resultado.trim());

      parsedRows.push({
        id: issue.id,
        sequenceId: issue.sequence_id,
        stateId: issue.state_id ?? null,
        stateName,
        photoUrl,
        responsable,
        nombre: d?.nombre || "-",
        cedula: d?.cedula || "-",
        municipio: d?.municipio || "-",
        componente,
        esMilitar: isMilitar,
        referencia: d?.referencia || "-",
        accionTomada: d?.accionTomada || "-",
        resultado: d?.resultado || "-",
        beneficiado,
      });

      parsedByState[stateName] = (parsedByState[stateName] ?? 0) + 1;
      parsedByComponente[componente] = (parsedByComponente[componente] ?? 0) + 1;
      parsedByEntidad[entidad] = (parsedByEntidad[entidad] ?? 0) + 1;

      if (issue.created_at) {
        const dt = new Date(issue.created_at);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        parsedByMonth[key] = (parsedByMonth[key] ?? 0) + 1;
      }

      if (isMilitar) parsedMilitares++;
      else parsedCiviles++;
      if (d?.resultado?.trim()) parsedConResultado++;
    }

    const parsedByCondicion: Record<string, number> = {};
    if (parsedCiviles > 0) parsedByCondicion["Civil"] = parsedCiviles;
    if (parsedMilitares > 0) parsedByCondicion["Militar"] = parsedMilitares;

    // Top 8 estados de Venezuela y meses ordenados
    const topEntidad = Object.entries(parsedByEntidad)
      // oxlint-disable-next-line unicorn/no-array-sort
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    // oxlint-disable-next-line unicorn/no-array-sort
    const monthEntries = Object.entries(parsedByMonth).sort(([a], [b]) => a.localeCompare(b));

    return {
      rows: parsedRows,
      byState: parsedByState,
      byComponente: parsedByComponente,
      byCondicion: parsedByCondicion,
      byEntidad: topEntidad,
      byMonth: monthEntries,
      conResultado: parsedConResultado,
    };
  }, [allIssues, stateNames, fromDate, toDate, memberRoot, estadosFilter, componenteFilter, condicionFilter]);

  const cantCiviles = byCondicion["Civil"] ?? 0;
  const cantMilitares = byCondicion["Militar"] ?? 0;
  const maxMonth = byMonth.length > 0 ? Math.max(...byMonth.map(([, c]) => c)) : 1;

  const dateRangeLabel = useMemo(() => {
    if (!fromDate && !toDate) return "Todos los registros";
    const f = fromDate ? formatDateLabel(fromDate) : "...";
    const t2 = toDate ? formatDateLabel(toDate) : "hoy";
    return `${f} – ${t2}`;
  }, [fromDate, toDate]);

  const projectName = selectedProjectId ? (getProjectById(selectedProjectId)?.name ?? "Proyecto") : "Proyecto";

  // ── PDF export ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (rows.length === 0) return;
    setGeneratingType("pdf");
    setProgress({ current: 0, total: rows.length });
    try {
      const generatedAtLabel = new Date().toLocaleDateString("es-VE");
      const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp"]);
      const ws = workspaceSlug?.toString() ?? "";
      const pid = selectedProjectId;

      let logoUrl: string | null = null;
      try {
        logoUrl = await urlToBase64(`${window.location.origin}/venezuela-logo.png`);
      } catch {
        logoUrl = null;
      }

      let done = 0;
      const resolvedRows: ParsedIssueRow[] = await Promise.all(
        rows.map(async (row) => {
          let resolvedPhotoUrl = row.photoUrl;
          if (includePhotos && row.photoUrl) {
            try {
              const raw = getFileURL(row.photoUrl) ?? row.photoUrl;
              const apiUrl = raw.startsWith("http") ? raw : `${window.location.origin}${raw}`;
              resolvedPhotoUrl = await fetchBase64WithAuth(apiUrl);
            } catch {
              resolvedPhotoUrl = null;
            }
          }

          let attachments: AttachmentInfo[] = [];
          if (includeAttachments && includeDetails) {
            try {
              const rawList = await attachmentService.getIssueAttachments(ws, pid, row.id);
              attachments = await Promise.all(
                (rawList ?? []).map(async (a) => {
                  const nameExt = (a.attributes?.name ?? "").split(".").pop()?.toLowerCase() ?? "";
                  const urlExt = (a.asset_url ?? "").split("?")[0].split(".").pop()?.toLowerCase() ?? "";
                  const ext = nameExt || urlExt;
                  const isImage = IMAGE_EXTS.has(ext);
                  if (isImage) {
                    try {
                      const url = getFileURL(a.asset_url) ?? a.asset_url;
                      const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
                      const base64 = await fetchBase64WithAuth(fullUrl);
                      return { name: a.attributes?.name ?? "archivo", isImage: true, base64 };
                    } catch {
                      return { name: a.attributes?.name ?? "archivo", isImage: false };
                    }
                  }
                  return { name: a.attributes?.name ?? "archivo", isImage: false };
                })
              );
            } catch {
              attachments = [];
            }
          }

          done += 1;
          setProgress({ current: done, total: rows.length });
          return { ...row, photoUrl: resolvedPhotoUrl, attachments };
        })
      );

      const blob = await pdf(
        <SocialCaseReportPDF
          rows={resolvedRows}
          projectName={projectName}
          dateRange={dateRangeLabel}
          byState={byState}
          byComponente={byComponente}
          byCondicion={byCondicion}
          conResultado={conResultado}
          generatedAtLabel={generatedAtLabel}
          stateFlow={stateFlow}
          includeCover={includeCover}
          includePhotos={includePhotos}
          includeDetails={includeDetails}
          includeAttachments={includeAttachments}
          logoUrl={logoUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      if (openAfter) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        const a = document.createElement("a");
        a.href = url;
        const safeName = projectName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        a.download = `reporte-${safeName}-${new Date().toISOString().split("T")[0]}.pdf`;
        a.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setGeneratingType(null);
      setProgress(null);
    }
  };

  // ── Excel export ─────────────────────────────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (rows.length === 0) return;
    setGeneratingType("excel");
    setProgress({ current: 0, total: rows.length });
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Reporte");
      const ws = workspaceSlug?.toString() ?? "";
      const pid = selectedProjectId;

      const PHOTO_W_PX = 189;
      const PHOTO_H_PX = 113;
      const PHOTO_COL_W = 38;
      const RESENA_IMG_W = 94;
      const RESENA_IMG_H = 113;
      const RESENA_COL_IDX = 8;
      const RESENA_COL_W = 40;
      const RESENA_COL_W_PX = RESENA_COL_W * 7 + 5;
      const RESENA_GAP = 4;
      const IMAGE_EXTS_XLS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp"]);
      const SLOT_PREFIXES_XLS = ["[CI_SOL]", "[CI_BEN]", "[ENTREGA]"];

      sheet.columns = [
        { key: "num" },
        { key: "nombre" },
        { key: "cedula" },
        { key: "telefono" },
        { key: "direccion" },
        { key: "tipo" },
        { key: "descripcion" },
        { key: "foto", width: PHOTO_COL_W },
        { key: "resena", width: RESENA_COL_W },
        { key: "organismo" },
        { key: "observacion" },
      ];
      const colMaxLen = [2, 38, 20, 14, 26, 14, 28, 0, 0, 22, 24];

      let logoId: number | null = null;
      try {
        const logoFull = await urlToBase64(`${window.location.origin}/venezuela-logo.png`);
        const mimeMatch = logoFull.match(/^data:image\/(\w+);base64,/);
        const ext = (mimeMatch?.[1] ?? "png") as "png" | "jpeg" | "gif";
        logoId = workbook.addImage({ base64: logoFull.split(",")[1], extension: ext });
      } catch {
        logoId = null;
      }

      const HEADER_BG = "FF1e3a5f";
      const WHITE = "FFFFFFFF";

      sheet.addRow([]);
      sheet.addRow([]);
      sheet.addRow([]);
      sheet.getRow(1).height = 70;
      sheet.getRow(2).height = 40;
      sheet.getRow(3).height = 28;

      sheet.mergeCells("A1:K1");
      sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
      if (logoId !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sheet.addImage(logoId, { tl: { col: 0, row: 0 } as any, br: { col: 6.5, row: 1 } as any });
      }

      sheet.mergeCells("A2:K2");
      const componenteUnique =
        rows.length > 0 && rows[0].componente !== "-" && rows.every((r) => r.componente === rows[0].componente)
          ? rows[0].componente.toUpperCase()
          : projectName.toUpperCase();
      sheet.getCell("A2").value = componenteUnique;
      sheet.getCell("A2").font = { bold: true, size: 18, name: "Arial", color: { argb: "FF000000" } };
      sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center", wrapText: true };

      sheet.mergeCells("A3:K3");
      const firstCaseStartDate = rows
        .map(
          (r) =>
            allIssues.find((is) => is.id === r.id)?.start_date ??
            allIssues.find((is) => is.id === r.id)?.created_at?.slice(0, 10)
        )
        .filter(Boolean)
        // oxlint-disable-next-line unicorn/no-array-sort
        .sort()[0];
      const firstCaseDateLabel = firstCaseStartDate
        ? new Date(firstCaseStartDate + "T00:00:00")
            .toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" })
            .toUpperCase()
        : "-";
      sheet.getCell("A3").value = `FECHA DE INICIO: ${firstCaseDateLabel}`;
      sheet.getCell("A3").font = { bold: true, size: 16, name: "Arial", color: { argb: "FF000000" } };
      sheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };

      const BORDER_THIN = { style: "thin" as const, color: { argb: "FF9ca3af" } };
      const tableHeaderRow = sheet.addRow([
        "N°",
        "NOMBRES Y APELLIDOS DEL SOLICITANTE",
        "CÉDULA DE IDENTIDAD",
        "TELÉFONO",
        "DIRECCIÓN DE HABITACIÓN",
        "TIPO DE CASO",
        "DESCRIPCIÓN DE LA SOLICITUD",
        "CÉDULA DE IDENTIDAD",
        "RESEÑA FOTOGRÁFICA",
        "ORGANISMO COMPETENTE",
        "OBSERVACIÓN",
      ]);
      tableHeaderRow.height = 44;
      tableHeaderRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
        cell.font = { bold: true, color: { argb: WHITE }, size: 12, name: "Arial" };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
      });

      const PHOTO_ROW_H_PT = Math.ceil((PHOTO_H_PX / 96) * 2.54 * 28.35);

      // oxlint-disable-next-line unicorn/no-array-sort
      const sortedRows = [...rows].sort((a, b) => {
        const ia = allIssues.find((is) => is.id === a.id);
        const ib = allIssues.find((is) => is.id === b.id);
        return (ia?.created_at ?? "").localeCompare(ib?.created_at ?? "");
      });
      let done = 0;

      for (let i = 0; i < sortedRows.length; i++) {
        const row = sortedRows[i];
        const issue = allIssues.find((is) => is.id === row.id);
        const d = issue ? extractFromHtml(issue.description_html ?? "") : null;
        const isEven = i % 2 === 0;
        const ROW_BG = isEven ? "FFF3F4F6" : "FFFFFFFF";
        const BORDER_DATA = { style: "thin" as const, color: { argb: "FFd1d5db" } };
        const cellValues = [
          toUpperOrDash(d?.numeroCaso),
          toUpperOrDash(row.nombre),
          toUpperOrDash(row.cedula),
          toUpperOrDash(d?.telefono),
          toUpperOrDash(d?.direccion),
          toUpperOrDash(issue?.name),
          toUpperOrDash(row.referencia),
          "",
          "",
          toUpperOrDash(row.responsable),
          toUpperOrDash(d?.observacionCierre),
        ];
        cellValues.forEach((val, idx) => {
          if (idx !== 7 && idx !== 8) colMaxLen[idx] = Math.max(colMaxLen[idx], val.length);
        });
        const dataRow = sheet.addRow(cellValues);
        if (includePhotos) {
          const PT_PER_LINE = 15;
          const CHARS_EST = 18;
          let maxLines = 1;
          cellValues.forEach((val, idx) => {
            if (idx === 7 || idx === 8) return;
            maxLines = Math.max(maxLines, Math.ceil(val.length / CHARS_EST));
          });
          dataRow.height = Math.max(PHOTO_ROW_H_PT, maxLines * PT_PER_LINE);
        }
        dataRow.eachCell((cell, colNum) => {
          if (colNum !== 8 && colNum !== 9) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ROW_BG } };
          }
          cell.font = { size: 12, name: "Arial" };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = { top: BORDER_DATA, bottom: BORDER_DATA, left: BORDER_DATA, right: BORDER_DATA };
        });

        if (includePhotos) {
          try {
            // oxlint-disable-next-line no-await-in-loop
            const attList = await attachmentService.getIssueAttachments(ws, pid, row.id);
            const rowZero = sheet.rowCount - 1;

            const cedulaAtt =
              attList?.find((a) => a.attributes?.name?.startsWith("[CI_BEN]")) ??
              attList?.find((a) => a.attributes?.name?.startsWith("[CI_SOL]"));
            if (cedulaAtt) {
              const rawUrl = getFileURL(cedulaAtt.asset_url) ?? cedulaAtt.asset_url;
              const fullUrl = rawUrl.startsWith("http") ? rawUrl : `${window.location.origin}${rawUrl}`;
              // oxlint-disable-next-line no-await-in-loop
              const base64Full = await fetchBase64WithAuth(fullUrl);
              const mimeM = base64Full.match(/^data:image\/(\w+);base64,/);
              const ext = (mimeM?.[1] ?? "jpeg") as "png" | "jpeg" | "gif";
              const imgId = workbook.addImage({ base64: base64Full.split(",")[1], extension: ext });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sheet.addImage(imgId, {
                tl: { col: 7, row: rowZero } as any,
                ext: { width: PHOTO_W_PX, height: PHOTO_H_PX },
              });
            }

            const nativeImgs = (attList ?? []).filter((a) => {
              const name = a.attributes?.name ?? "";
              const noPrefix = !SLOT_PREFIXES_XLS.some((p) => name.startsWith(p));
              const nameExt = name.split(".").pop()?.toLowerCase() ?? "";
              const urlExt = (a.asset_url ?? "").split("?")[0].split(".").pop()?.toLowerCase() ?? "";
              return noPrefix && IMAGE_EXTS_XLS.has(nameExt || urlExt);
            });
            if (nativeImgs.length > 0) {
              const gridRows = Math.ceil(nativeImgs.length / 2);
              const reseñaHPx = gridRows * RESENA_IMG_H + (gridRows + 1) * RESENA_GAP;
              const reseñaHPt = Math.ceil(reseñaHPx * 0.75);
              dataRow.height = Math.max(dataRow.height ?? PHOTO_ROW_H_PT, reseñaHPt);
              const rowHPx = (dataRow.height ?? PHOTO_ROW_H_PT) * (96 / 72);

              for (let imgIdx = 0; imgIdx < nativeImgs.length; imgIdx++) {
                const att = nativeImgs[imgIdx];
                try {
                  const rawUrl = getFileURL(att.asset_url) ?? att.asset_url;
                  const fullUrl = rawUrl.startsWith("http") ? rawUrl : `${window.location.origin}${rawUrl}`;
                  // oxlint-disable-next-line no-await-in-loop
                  const b64 = await fetchBase64WithAuth(fullUrl);
                  const mimeM = b64.match(/^data:image\/(\w+);base64,/);
                  const ext = (mimeM?.[1] ?? "jpeg") as "png" | "jpeg" | "gif";
                  const imgId = workbook.addImage({ base64: b64.split(",")[1], extension: ext });
                  const gCol = imgIdx % 2;
                  const gRow = Math.floor(imgIdx / 2);
                  const xPx = RESENA_GAP + gCol * (RESENA_IMG_W + RESENA_GAP);
                  const yPx = RESENA_GAP + gRow * (RESENA_IMG_H + RESENA_GAP);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  sheet.addImage(imgId, {
                    tl: { col: RESENA_COL_IDX + xPx / RESENA_COL_W_PX, row: rowZero + yPx / rowHPx } as any,
                    ext: { width: RESENA_IMG_W, height: RESENA_IMG_H },
                  });
                } catch {
                  /* imagen no disponible */
                }
              }
            }
          } catch {
            /* adjuntos no disponibles */
          }
        }

        done++;
        setProgress({ current: done, total: rows.length });
      }

      sheet.columns.forEach((col, idx) => {
        if (idx === 7) return;
        if (idx === 8) {
          col.width = Math.max(Math.ceil((colMaxLen[idx] ?? 0) * 0.85) + 1, RESENA_COL_W);
          return;
        }
        if (idx === 3) {
          col.width = 18;
          return;
        }
        const len = colMaxLen[idx] ?? 10;
        col.width = Math.min(Math.max(Math.ceil(len * 0.85) + 1, 6), 36);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = projectName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      a.download = `reporte-${safeName}-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setGeneratingType(null);
      setProgress(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const presets: { value: Preset; label: string }[] = [
    { value: "today", label: "Hoy" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "3months", label: "3 meses" },
    { value: "all", label: "Todo" },
  ];

  return (
    <AnalyticsWrapper i18nTitle="common.overview">
      <div className="flex flex-col gap-14">
        {/* ── Contenido existente de Plane ── */}
        <TotalInsights analyticsType="overview" />
        <div className="grid grid-cols-1 gap-14 md:grid-cols-5">
          <ProjectInsights />
          <ActiveProjects />
        </div>

        {/* ── Separador ── */}
        <div className="border-t border-subtle" />

        {/* ══ SECCIÓN CASOS SOCIALES ══════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* Encabezado + selector de proyecto */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-18 font-semibold text-secondary">Casos Sociales</h2>
              <p className="text-12 text-tertiary">Estadísticas y exportación por proyecto</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="gcs-project-select" className="text-12 text-tertiary">
                Proyecto:
              </label>
              <select
                id="gcs-project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="focus:border-accent-primary rounded-md border border-subtle bg-surface-2 px-3 py-1.5 text-12 text-secondary outline-none"
              >
                <option value="">Selecciona un proyecto</option>
                {(workspaceProjectIds ?? []).map((pid) => (
                  <option key={pid} value={pid}>
                    {getProjectById(pid)?.name ?? pid}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedProjectId ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-subtle">
              <p className="text-13 text-tertiary">Selecciona un proyecto para ver los datos</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Filtros ── */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Presets de fecha */}
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      disabled={generating}
                      onClick={() => setPreset(p.value)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-11 font-medium transition-colors",
                        preset === p.value
                          ? "border-accent-primary bg-accent-primary text-white"
                          : "border-subtle bg-surface-2 text-secondary hover:bg-layer-1",
                        generating && "cursor-not-allowed opacity-60"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => setPreset("custom")}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-11 font-medium transition-colors",
                      preset === "custom"
                        ? "border-accent-primary bg-accent-primary text-white"
                        : "border-subtle bg-surface-2 text-secondary hover:bg-layer-1",
                      generating && "cursor-not-allowed opacity-60"
                    )}
                  >
                    Personalizado
                  </button>
                </div>
                {/* Dropdowns de filtro */}
                <FilterDropdown
                  label="Componente"
                  options={componentesUnicos}
                  selected={componenteFilter}
                  onChange={(v) => setComponenteFilter((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  onClear={() => setComponenteFilter([])}
                  disabled={generating}
                />
                <FilterDropdown
                  label="Civil / Militar"
                  options={CONDICION_OPTIONS}
                  selected={condicionFilter}
                  onChange={(v) => setCondicionFilter((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  onClear={() => setCondicionFilter([])}
                  disabled={generating}
                />
                <FilterDropdown
                  label="Estado del país"
                  options={VENEZUELA_ESTADOS}
                  selected={estadosFilter}
                  onChange={(v) => setEstadosFilter((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                  onClear={() => setEstadosFilter([])}
                  disabled={generating}
                />
              </div>

              {preset === "custom" && (
                <div className="grid max-w-sm grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="gcs-from" className="block text-11 text-tertiary">
                      Desde
                    </label>
                    <input
                      id="gcs-from"
                      type="date"
                      value={customFrom}
                      disabled={generating}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="focus:border-accent-primary h-8 w-full rounded-md border border-subtle bg-transparent px-2 text-12 text-secondary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gcs-to" className="block text-11 text-tertiary">
                      Hasta
                    </label>
                    <input
                      id="gcs-to"
                      type="date"
                      value={customTo}
                      disabled={generating}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="focus:border-accent-primary h-8 w-full rounded-md border border-subtle bg-transparent px-2 text-12 text-secondary outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── KPIs ── */}
              {loadingIssues ? (
                <div className="grid grid-cols-4 gap-3">
                  {(["kpi-0", "kpi-1", "kpi-2", "kpi-3"] as const).map((k) => (
                    <div key={k} className="h-20 animate-pulse rounded-lg border border-subtle bg-surface-2" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="text-26 font-bold text-secondary">{rows.length}</p>
                    <p className="text-11 text-tertiary">Total de fichas</p>
                  </div>
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="text-26 text-green-600 font-bold">{conResultado}</p>
                    <p className="text-11 text-tertiary">Con resultado</p>
                  </div>
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="text-26 font-bold text-secondary">{cantCiviles}</p>
                    <p className="text-11 text-tertiary">Civiles</p>
                  </div>
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="text-26 text-blue-600 font-bold">{cantMilitares}</p>
                    <p className="text-11 text-tertiary">Militares</p>
                  </div>
                </div>
              )}

              {/* ── Gráficas ── */}
              {!loadingIssues && rows.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Por componente FANB */}
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="mb-4 text-13 font-semibold text-secondary">Por componente FANB</p>
                    <div className="space-y-2.5">
                      {Object.entries(byComponente)
                        // oxlint-disable-next-line unicorn/no-array-sort
                        .sort(([, a], [, b]) => b - a)
                        .map(([name, count]) => (
                          <HBar
                            key={name}
                            label={name}
                            count={count}
                            total={rows.length}
                            color="bg-accent-primary/70"
                          />
                        ))}
                    </div>
                  </div>

                  {/* Por estado del caso */}
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="mb-4 text-13 font-semibold text-secondary">Por estado del caso</p>
                    <div className="space-y-2.5">
                      {Object.entries(byState)
                        // oxlint-disable-next-line unicorn/no-array-sort
                        .sort(([, a], [, b]) => b - a)
                        .map(([name, count]) => (
                          <HBar key={name} label={name} count={count} total={rows.length} color="bg-green-500/70" />
                        ))}
                    </div>
                  </div>

                  {/* Por estado de Venezuela (top 8) */}
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="mb-4 text-13 font-semibold text-secondary">Por estado de Venezuela</p>
                    <div className="space-y-2.5">
                      {byEntidad.map(([name, count]) => (
                        <HBar key={name} label={name} count={count} total={rows.length} color="bg-purple-500/70" />
                      ))}
                    </div>
                  </div>

                  {/* Evolución mensual */}
                  <div className="rounded-lg border border-subtle bg-surface-2 p-4">
                    <p className="mb-4 text-13 font-semibold text-secondary">Evolución mensual</p>
                    {byMonth.length === 0 ? (
                      <p className="text-12 text-tertiary">Sin datos en el período</p>
                    ) : (
                      <div className="flex h-32 items-end gap-1.5">
                        {byMonth.map(([month, count]) => (
                          <div key={month} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                            <span className="text-10 font-medium text-secondary">{count}</span>
                            <div
                              className="w-full rounded-t bg-accent-primary/60"
                              style={{ height: `${Math.max(4, Math.round((count / maxMonth) * 96))}px` }}
                            />
                            <span className="truncate text-9 text-tertiary">{formatMonthLabel(month)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Opciones de exportación ── */}
              {!loadingIssues && (
                <div className="space-y-4 rounded-lg border border-subtle bg-surface-2 p-5">
                  <p className="text-13 font-semibold text-secondary">Exportación · {dateRangeLabel}</p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-13 text-secondary">Incluir portada / resumen</p>
                        <p className="text-11 text-tertiary">Totales por estado, componente y condición.</p>
                      </div>
                      <Checkbox
                        checked={includeCover}
                        onChange={() => setIncludeCover((v) => !v)}
                        disabled={generating}
                      />
                    </div>
                    <div className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-13 text-secondary">Incluir fotos</p>
                        <p className="text-11 text-tertiary">Puede tardar más según la cantidad de imágenes.</p>
                      </div>
                      <Checkbox
                        checked={includePhotos}
                        onChange={() => setIncludePhotos((v) => !v)}
                        disabled={generating}
                      />
                    </div>
                    <div className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-13 text-secondary">Reporte completo</p>
                        <p className="text-11 text-tertiary">Detalle por caso + diagrama de estados.</p>
                      </div>
                      <Checkbox
                        checked={includeDetails}
                        onChange={() => setIncludeDetails((v) => !v)}
                        disabled={generating}
                      />
                    </div>
                    <div
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3",
                        !includeDetails && "opacity-40"
                      )}
                    >
                      <div>
                        <p className="text-13 text-secondary">Incluir adjuntos</p>
                        <p className="text-11 text-tertiary">Requiere reporte completo activado.</p>
                      </div>
                      <Checkbox
                        checked={includeAttachments}
                        onChange={() => setIncludeAttachments((v) => !v)}
                        disabled={generating || !includeDetails}
                      />
                    </div>
                    <div className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-13 text-secondary">Abrir PDF al finalizar</p>
                        <p className="text-11 text-tertiary">Previsualiza antes de guardar.</p>
                      </div>
                      <Checkbox checked={openAfter} onChange={() => setOpenAfter((v) => !v)} disabled={generating} />
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  {progress && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-12 text-tertiary">
                          {generatingType === "excel" ? "Exportando Excel" : "Procesando PDF"} — {progress.current} /{" "}
                          {progress.total}
                        </p>
                        <p className="text-12 font-medium text-tertiary">
                          {Math.round((progress.current / progress.total) * 100)}%
                        </p>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-1">
                        <div
                          className="h-full rounded-full bg-accent-primary transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleDownloadExcel}
                      disabled={rows.length === 0 || generating || loadingIssues}
                      loading={generatingType === "excel"}
                    >
                      {generatingType !== "excel" && <FileSpreadsheet className="mr-2 size-4" />}
                      Exportar Excel ({rows.length})
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleDownload}
                      disabled={rows.length === 0 || generating || loadingIssues}
                      loading={generatingType === "pdf"}
                    >
                      {generatingType !== "pdf" && <FileDown className="mr-2 size-4" />}
                      {openAfter ? "Generar y abrir PDF" : `Descargar PDF (${rows.length})`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AnalyticsWrapper>
  );
});

export { Overview };
