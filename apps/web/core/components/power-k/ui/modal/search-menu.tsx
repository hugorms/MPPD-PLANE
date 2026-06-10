/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
// plane imports
import { WORKSPACE_DEFAULT_SEARCH_RESULT } from "@plane/constants";
import type { IWorkspaceIssueSearchResult, IWorkspaceSearchResults } from "@plane/types";
import { cn } from "@plane/utils";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { usePowerK } from "@/hooks/store/use-power-k";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
import useDebounce from "@/hooks/use-debounce";
// plane web imports
import { PowerKModalNoSearchResultsCommand } from "@/plane-web/components/command-palette/power-k/search/no-results-command";
import { WorkspaceService } from "@/services/workspace.service";
// local imports
import type { TPowerKContext, TPowerKPageType } from "../../core/types";
import { PowerKModalSearchResults } from "./search-results";
// services init
const workspaceService = new WorkspaceService();

const getDigits = (value?: string | null) => value?.replace(/\D/g, "") ?? "";

type TWorkspaceIssueSearchResultWithSocial = IWorkspaceIssueSearchResult;

type Props = {
  activePage: TPowerKPageType | null;
  context: TPowerKContext;
  isWorkspaceLevel: boolean;
  searchTerm: string;
  updateSearchTerm: (value: string) => void;
  handleSearchMenuClose?: () => void;
};

export function PowerKModalSearchMenu(props: Props) {
  const { activePage, context, isWorkspaceLevel, searchTerm, updateSearchTerm, handleSearchMenuClose } = props;
  // states
  const [resultsCount, setResultsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<IWorkspaceSearchResults>(WORKSPACE_DEFAULT_SEARCH_RESULT);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // navigation
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { togglePowerKModal } = usePowerK();
  const { issueMap } = useIssues();
  const { getProjectIdentifierById } = useProject();
  const { getStateById } = useProjectState();

  useEffect(() => {
    if (activePage || !workspaceSlug) return;
    setIsSearching(true);

    if (debouncedSearchTerm) {
      const params = {
        ...(projectId ? { project_id: projectId.toString() } : {}),
        search: debouncedSearchTerm,
        workspace_search: !projectId ? true : isWorkspaceLevel,
      };
      const searchedDigits = getDigits(debouncedSearchTerm);
      const isCedulaSearch = searchedDigits.length >= 6;
      const localCedulaMatches: TWorkspaceIssueSearchResultWithSocial[] = isCedulaSearch
        ? Object.values(issueMap)
            .filter((issue) => {
              const cedulaDigits = getDigits(issue.social_case_cedula);
              if (!cedulaDigits.includes(searchedDigits)) return false;
              if (projectId && !isWorkspaceLevel && issue.project_id !== projectId.toString()) return false;
              return true;
            })
            .map((issue) => {
              const state = getStateById(issue.state_id ?? "");
              return {
                id: issue.id,
                name: issue.name,
                project__identifier: getProjectIdentifierById(issue.project_id) ?? "",
                project_id: issue.project_id ?? "",
                sequence_id: issue.sequence_id,
                social_case_cedula: issue.social_case_cedula,
                social_case_nombre: issue.social_case_nombre,
                state__group: state?.group ?? null,
                state__name: state?.name ?? null,
                workspace__slug: workspaceSlug.toString(),
                type_id: issue.type_id ?? "",
              };
            })
        : [];
      workspaceService
        .searchWorkspace(workspaceSlug.toString(), params)
        .then((searchResults) => {
          const apiIssueIds = new Set(searchResults.results.issue.map((issue) => issue.id));
          const flatIssues: TWorkspaceIssueSearchResultWithSocial[] = [
            ...searchResults.results.issue,
            ...localCedulaMatches.filter((issue) => !apiIssueIds.has(issue.id)),
          ];

          // Deduplicar por cédula: agrupar casos de la misma persona,
          // mostrar solo el más reciente (mayor sequence_id) con un contador de extras.
          const cedulaGroups = new Map<string, TWorkspaceIssueSearchResultWithSocial[]>();
          const nonSocial: TWorkspaceIssueSearchResultWithSocial[] = [];
          for (const issue of flatIssues) {
            const digits = getDigits(issue.social_case_cedula);
            if (digits.length >= 6) {
              const group = cedulaGroups.get(digits) ?? [];
              group.push(issue);
              cedulaGroups.set(digits, group);
            } else {
              nonSocial.push(issue);
            }
          }
          type IssueWithLinked = TWorkspaceIssueSearchResultWithSocial & { _linkedCount?: number };
          const deduplicatedIssues: IssueWithLinked[] = [
            ...nonSocial,
            ...Array.from(cedulaGroups.values()).map((group) => {
              const sorted = [...group].sort((a, b) => b.sequence_id - a.sequence_id);
              const primary = sorted[0] as IssueWithLinked;
              if (sorted.length > 1) primary._linkedCount = sorted.length - 1;
              return primary;
            }),
          ];

          const mergedResults: IWorkspaceSearchResults = {
            results: {
              ...searchResults.results,
              issue: deduplicatedIssues as typeof searchResults.results.issue,
            },
          };
          setResults(mergedResults);
          const count = Object.keys(mergedResults.results).reduce(
            (accumulator, key) =>
              mergedResults.results[key as keyof typeof mergedResults.results]?.length + accumulator,
            0
          );
          setResultsCount(count);
          return mergedResults;
        })
        .catch(() => {
          setResults(WORKSPACE_DEFAULT_SEARCH_RESULT);
          setResultsCount(0);
        })
        .finally(() => setIsSearching(false));
    } else {
      setResults(WORKSPACE_DEFAULT_SEARCH_RESULT);
      setIsSearching(false);
    }
  }, [
    activePage,
    debouncedSearchTerm,
    getProjectIdentifierById,
    getStateById,
    isWorkspaceLevel,
    issueMap,
    projectId,
    workspaceSlug,
  ]);

  if (activePage) return null;

  const handleClosePalette = () => {
    handleSearchMenuClose?.();
    togglePowerKModal(false);
  };

  return (
    <>
      {searchTerm.trim() !== "" && (
        <div className="mt-4 flex items-center justify-between gap-2 px-4">
          <h5
            className={cn("text-11 text-primary", {
              "animate-pulse": isSearching,
            })}
          >
            Search results for{" "}
            <span className="font-medium">
              {'"'}
              {searchTerm}
              {'"'}
            </span>{" "}
            in {isWorkspaceLevel ? "workspace" : "project"}:
          </h5>
        </div>
      )}

      {/* Show empty state only when not loading and no results */}
      {!isSearching && resultsCount === 0 && searchTerm.trim() !== "" && debouncedSearchTerm.trim() !== "" && (
        <PowerKModalNoSearchResultsCommand
          context={context}
          searchTerm={searchTerm}
          updateSearchTerm={updateSearchTerm}
        />
      )}

      {searchTerm.trim() !== "" && <PowerKModalSearchResults closePalette={handleClosePalette} results={results} />}
    </>
  );
}
