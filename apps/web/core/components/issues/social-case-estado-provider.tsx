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
    condiciones: SocialCaseCondicionFilter[]
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (estados.length > 0) params.set("estados", estados.join(","));
    if (condiciones.length === 1) params.set("condiciones", condiciones[0]);

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
  toggleEstado: (estado: string) => void;
  toggleCondicion: (condicion: SocialCaseCondicionFilter) => void;
  clearEstados: () => void;
  clearCondiciones: () => void;
  /** null = sin filtro (mostrar todos), Set<string> = solo estos IDs */
  filteredIssueIds: Set<string> | null;
  loadingFilter: boolean;
};

const SocialCaseEstadoFilterContext = createContext<ContextValue>({
  estadosFilter: [],
  condicionFilter: DEFAULT_CONDICIONES_FILTER,
  toggleEstado: () => {},
  toggleCondicion: () => {},
  clearEstados: () => {},
  clearCondiciones: () => {},
  filteredIssueIds: null,
  loadingFilter: false,
});

export const useSocialCaseEstadoFilter = () => useContext(SocialCaseEstadoFilterContext);

// ── Provider ──────────────────────────────────────────────────────────────────

export function SocialCaseEstadoProvider({ children }: { children: ReactNode }) {
  const { workspaceSlug, projectId } = useParams();
  const [estadosFilter, setEstadosFilter] = useState<string[]>([]);
  const [condicionFilter, setCondicionFilter] = useState<SocialCaseCondicionFilter[]>(DEFAULT_CONDICIONES_FILTER);
  const [filteredIssueIds, setFilteredIssueIds] = useState<Set<string> | null>(null);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleEstado = (estado: string) => {
    setEstadosFilter((prev) => (prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]));
  };

  const toggleCondicion = (condicion: SocialCaseCondicionFilter) => {
    setCondicionFilter((prev) =>
      prev.includes(condicion) ? prev.filter((c) => c !== condicion) : [...prev, condicion]
    );
  };

  const clearEstados = () => setEstadosFilter([]);
  const clearCondiciones = () => setCondicionFilter(DEFAULT_CONDICIONES_FILTER);

  useEffect(() => {
    const activeCondicionFilter = condicionFilter.length === 1 ? condicionFilter : [];

    if (estadosFilter.length === 0 && activeCondicionFilter.length === 0) {
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
      .getIdsByFilters(ws, pid, estadosFilter, activeCondicionFilter)
      .then((ids) => setFilteredIssueIds(new Set(ids)))
      .finally(() => setLoadingFilter(false));
  }, [estadosFilter, condicionFilter, workspaceSlug, projectId]);

  const contextValue = useMemo(
    () => ({
      estadosFilter,
      condicionFilter,
      toggleEstado,
      toggleCondicion,
      clearEstados,
      clearCondiciones,
      filteredIssueIds,
      loadingFilter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estadosFilter, condicionFilter, filteredIssueIds, loadingFilter]
  );

  return (
    <SocialCaseEstadoFilterContext.Provider value={contextValue}>{children}</SocialCaseEstadoFilterContext.Provider>
  );
}
