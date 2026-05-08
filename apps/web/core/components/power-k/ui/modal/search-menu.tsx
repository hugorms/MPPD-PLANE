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
import useDebounce from "@/hooks/use-debounce";
// plane web imports
import { PowerKModalNoSearchResultsCommand } from "@/plane-web/components/command-palette/power-k/search/no-results-command";
import { WorkspaceService } from "@/services/workspace.service";
// local imports
import type { TPowerKContext, TPowerKPageType } from "../../core/types";
import { PowerKModalSearchResults } from "./search-results";
// services init
const workspaceService = new WorkspaceService();

const shouldLogCedulaSearch = (value: string | false) =>
  typeof value === "string" && value.replace(/\D/g, "").length >= 6;

const getDigits = (value?: string | null) => value?.replace(/\D/g, "") ?? "";

type TWorkspaceIssueSearchResultWithSocial = IWorkspaceIssueSearchResult & {
  social_case_cedula?: string | null;
  social_case_nombre?: string | null;
};

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

  useEffect(() => {
    if (activePage || !workspaceSlug) return;
    setIsSearching(true);

    if (debouncedSearchTerm) {
      const params = {
        ...(projectId ? { project_id: projectId.toString() } : {}),
        search: debouncedSearchTerm,
        workspace_search: !projectId ? true : isWorkspaceLevel,
      };
      const logCedulaSearch = shouldLogCedulaSearch(debouncedSearchTerm);
      const searchedDigits = getDigits(debouncedSearchTerm);
      const localCedulaMatches: TWorkspaceIssueSearchResultWithSocial[] = logCedulaSearch
        ? Object.values(issueMap)
            .filter((issue) => {
              const cedulaDigits = getDigits(issue.social_case_cedula);
              if (!cedulaDigits.includes(searchedDigits)) return false;
              if (projectId && !isWorkspaceLevel && issue.project_id !== projectId.toString()) return false;
              return true;
            })
            .map((issue) => ({
              id: issue.id,
              name: issue.name,
              project__identifier: getProjectIdentifierById(issue.project_id) ?? "",
              project_id: issue.project_id ?? "",
              sequence_id: issue.sequence_id,
              social_case_cedula: issue.social_case_cedula,
              social_case_nombre: issue.social_case_nombre,
              workspace__slug: workspaceSlug.toString(),
              type_id: issue.type_id ?? "",
            }))
        : [];
      if (logCedulaSearch) {
        console.info("[PowerK cedula search] request", {
          digits: searchedDigits,
          localCedulaMatches: localCedulaMatches.map((issue) => ({
            id: issue.id,
            key: `${issue.project__identifier}-${issue.sequence_id}`,
            name: issue.name,
            social_case_cedula: issue.social_case_cedula,
          })),
          params,
          projectId: projectId?.toString(),
          workspaceSlug: workspaceSlug.toString(),
        });
      }

      workspaceService
        .searchWorkspace(workspaceSlug.toString(), params)
        .then((searchResults) => {
          const apiIssueIds = new Set(searchResults.results.issue.map((issue) => issue.id));
          const mergedResults: IWorkspaceSearchResults = {
            results: {
              ...searchResults.results,
              issue: [
                ...searchResults.results.issue,
                ...localCedulaMatches.filter((issue) => !apiIssueIds.has(issue.id)),
              ],
            },
          };
          setResults(mergedResults);
          const count = Object.keys(mergedResults.results).reduce(
            (accumulator, key) =>
              mergedResults.results[key as keyof typeof mergedResults.results]?.length + accumulator,
            0
          );
          if (logCedulaSearch) {
            console.info("[PowerK cedula search] response", {
              issueCount: searchResults.results.issue?.length ?? 0,
              mergedIssueCount: mergedResults.results.issue?.length ?? 0,
              totalCount: count,
              issues: mergedResults.results.issue?.map((issue) => ({
                id: issue.id,
                key: `${issue.project__identifier}-${issue.sequence_id}`,
                name: issue.name,
                social_case_cedula: "social_case_cedula" in issue ? issue.social_case_cedula : undefined,
                social_case_nombre: "social_case_nombre" in issue ? issue.social_case_nombre : undefined,
              })),
            });
          }
          setResultsCount(count);
          return mergedResults;
        })
        .catch((error) => {
          if (logCedulaSearch) {
            console.error("[PowerK cedula search] error", error);
          }
          setResults(WORKSPACE_DEFAULT_SEARCH_RESULT);
          setResultsCount(0);
        })
        .finally(() => setIsSearching(false));
    } else {
      setResults(WORKSPACE_DEFAULT_SEARCH_RESULT);
      setIsSearching(false);
    }
  }, [activePage, debouncedSearchTerm, getProjectIdentifierById, isWorkspaceLevel, issueMap, projectId, workspaceSlug]);

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
