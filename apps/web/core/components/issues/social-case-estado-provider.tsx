import { useState, useEffect, useRef, useMemo, createContext, useContext, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { APIService } from "@/services/api.service";
import { API_BASE_URL } from "@plane/constants";

// ── Servicio ──────────────────────────────────────────────────────────────────

class SocialCaseFilterService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }
  async getIdsByFilters(
    workspaceSlug: string,
    projectId: string,
    estados: string[],
    condiciones: SocialCaseCondicionFilter[],
    componentes: string[],
    grados: string[]
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (estados.length > 0) params.set("estados", estados.join(","));
    if (condiciones.length === 1) params.set("condiciones", condiciones[0]);
    if (componentes.length > 0) params.set("componentes", componentes.join(","));
    if (grados.length > 0) params.set("grados", grados.join(","));

    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/social-cases/?${params.toString()}`)
      .then((res) => (res?.data ?? []).map((i: { id: string }) => i.id))
      .catch(() => []);
  }
}
const filterService = new SocialCaseFilterService();

// ── Context ───────────────────────────────────────────────────────────────────

export type SocialCaseCondicionFilter = "Militar" | "Civil";

const DEFAULT_CONDICIONES_FILTER: SocialCaseCondicionFilter[] = ["Militar", "Civil"];

type ContextValue = {
  estadosFilter: string[];
  condicionFilter: SocialCaseCondicionFilter[];
  componenteFilter: string[];
  gradoFilter: string[];
  toggleEstado: (estado: string) => void;
  toggleCondicion: (condicion: SocialCaseCondicionFilter) => void;
  toggleComponente: (componente: string) => void;
  toggleGrado: (grado: string) => void;
  clearEstados: () => void;
  clearCondiciones: () => void;
  clearComponentes: () => void;
  clearGrados: () => void;
  /** null = sin filtro (mostrar todos), Set<string> = solo estos IDs */
  filteredIssueIds: Set<string> | null;
  loadingFilter: boolean;
};

const SocialCaseEstadoFilterContext = createContext<ContextValue>({
  estadosFilter: [],
  condicionFilter: DEFAULT_CONDICIONES_FILTER,
  componenteFilter: [],
  gradoFilter: [],
  toggleEstado: () => {},
  toggleCondicion: () => {},
  toggleComponente: () => {},
  toggleGrado: () => {},
  clearEstados: () => {},
  clearCondiciones: () => {},
  clearComponentes: () => {},
  clearGrados: () => {},
  filteredIssueIds: null,
  loadingFilter: false,
});

export const useSocialCaseEstadoFilter = () => useContext(SocialCaseEstadoFilterContext);

// ── Provider ──────────────────────────────────────────────────────────────────

export function SocialCaseEstadoProvider({ children }: { children: ReactNode }) {
  const { workspaceSlug, projectId } = useParams();
  const [estadosFilter, setEstadosFilter] = useState<string[]>([]);
  const [condicionFilter, setCondicionFilter] = useState<SocialCaseCondicionFilter[]>(DEFAULT_CONDICIONES_FILTER);
  const [componenteFilter, setComponenteFilter] = useState<string[]>([]);
  const [gradoFilter, setGradoFilter] = useState<string[]>([]);
  const [filteredIssueIds, setFilteredIssueIds] = useState<Set<string> | null>(null);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleEstado = (estado: string) =>
    setEstadosFilter((prev) => (prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]));

  const toggleCondicion = (condicion: SocialCaseCondicionFilter) => {
    setCondicionFilter((prev) =>
      prev.includes(condicion) ? prev.filter((c) => c !== condicion) : [...prev, condicion]
    );
    // Al cambiar a solo Civil, limpiar filtros que solo aplican a militares
    if (condicion === "Militar") {
      setComponenteFilter([]);
      setGradoFilter([]);
    }
  };

  const toggleComponente = (componente: string) =>
    setComponenteFilter((prev) =>
      prev.includes(componente) ? prev.filter((c) => c !== componente) : [...prev, componente]
    );

  const toggleGrado = (grado: string) =>
    setGradoFilter((prev) => (prev.includes(grado) ? prev.filter((g) => g !== grado) : [...prev, grado]));

  const clearEstados = () => setEstadosFilter([]);
  const clearCondiciones = () => {
    setCondicionFilter(DEFAULT_CONDICIONES_FILTER);
    setComponenteFilter([]);
    setGradoFilter([]);
  };
  const clearComponentes = () => setComponenteFilter([]);
  const clearGrados = () => setGradoFilter([]);

  useEffect(() => {
    const activeCondicionFilter = condicionFilter.length === 1 ? condicionFilter : [];
    const hasFilter =
      estadosFilter.length > 0 ||
      activeCondicionFilter.length > 0 ||
      componenteFilter.length > 0 ||
      gradoFilter.length > 0;

    if (!hasFilter) {
      setFilteredIssueIds(null);
      return;
    }

    const ws = workspaceSlug?.toString();
    const pid = projectId?.toString();
    if (!ws || !pid) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoadingFilter(true);
    filterService
      .getIdsByFilters(ws, pid, estadosFilter, activeCondicionFilter, componenteFilter, gradoFilter)
      .then((ids) => setFilteredIssueIds(new Set(ids)))
      .finally(() => setLoadingFilter(false));
  }, [estadosFilter, condicionFilter, componenteFilter, gradoFilter, workspaceSlug, projectId]);

  const contextValue = useMemo(
    () => ({
      estadosFilter,
      condicionFilter,
      componenteFilter,
      gradoFilter,
      toggleEstado,
      toggleCondicion,
      toggleComponente,
      toggleGrado,
      clearEstados,
      clearCondiciones,
      clearComponentes,
      clearGrados,
      filteredIssueIds,
      loadingFilter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estadosFilter, condicionFilter, componenteFilter, gradoFilter, filteredIssueIds, loadingFilter]
  );

  return (
    <SocialCaseEstadoFilterContext.Provider value={contextValue}>{children}</SocialCaseEstadoFilterContext.Provider>
  );
}
