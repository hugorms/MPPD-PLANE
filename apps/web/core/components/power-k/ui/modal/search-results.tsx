/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Command } from "cmdk";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import type { IWorkspaceSearchResults } from "@plane/types";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";
// helpers
import { PowerKModalCommandItem } from "./command-item";
import { POWER_K_SEARCH_RESULTS_GROUPS_MAP } from "./search-results-map";

type Props = {
  closePalette: () => void;
  results: IWorkspaceSearchResults;
};

const formatCedulaWithDots = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const shouldLogCedulaSearchResult = (value: string) => value.replace(/\D/g, "").length >= 6;

const buildCedulaSearchVariants = (cedula?: string | null) => {
  const raw = cedula?.trim();
  if (!raw) return [];

  const digits = raw.replace(/\D/g, "");
  const formattedDigits = digits ? formatCedulaWithDots(digits) : "";
  const variants = [
    raw,
    digits,
    formattedDigits,
    `V-${digits}`,
    `V-${formattedDigits}`,
    `CI V-${digits}`,
    `CI V-${formattedDigits}`,
    `C.I. V-${digits}`,
    `C.I. V-${formattedDigits}`,
  ];

  return Array.from(new Set(variants.filter(Boolean)));
};

export const PowerKModalSearchResults = observer(function PowerKModalSearchResults(props: Props) {
  const { closePalette, results } = props;
  // router
  const router = useAppRouter();
  const { projectId: routerProjectId } = useParams();
  // derived values
  const projectId = routerProjectId?.toString();

  return (
    <>
      {Object.keys(results.results).map((key) => {
        const section = results.results[key as keyof typeof results.results];
        const currentSection = POWER_K_SEARCH_RESULTS_GROUPS_MAP[key as keyof typeof POWER_K_SEARCH_RESULTS_GROUPS_MAP];

        if (!currentSection) return null;
        if (section.length <= 0) return null;

        return (
          <Command.Group key={key} heading={currentSection.title}>
            {section.map((item) => {
              let value = `${key}-${item?.id}-${item.name}`;

              if ("project__identifier" in item) {
                value = `${value}-${item.project__identifier}`;
              }

              if ("sequence_id" in item) {
                value = `${value}-${item.sequence_id}`;
              }

              if ("social_case_cedula" in item && typeof item.social_case_cedula === "string") {
                value = `${value}-${buildCedulaSearchVariants(item.social_case_cedula).join("-")}`;
              }

              if ("social_case_nombre" in item && item.social_case_nombre) {
                value = `${value}-${item.social_case_nombre}`;
              }

              if (key === "issue" && shouldLogCedulaSearchResult(value)) {
                console.info("[PowerK cedula search] command item", {
                  id: item.id,
                  name: item.name,
                  value,
                  social_case_cedula: "social_case_cedula" in item ? item.social_case_cedula : undefined,
                  social_case_nombre: "social_case_nombre" in item ? item.social_case_nombre : undefined,
                });
              }

              return (
                <PowerKModalCommandItem
                  key={item.id}
                  label={currentSection.itemName(item)}
                  icon={currentSection.icon}
                  onSelect={() => {
                    closePalette();
                    router.push(currentSection.path(item, projectId));
                    // const itemProjectId =
                    //   item?.project_id ||
                    //   (Array.isArray(item?.project_ids) && item?.project_ids?.length > 0
                    //     ? item?.project_ids[0]
                    //     : undefined);
                    // if (itemProjectId) openProjectAndScrollToSidebar(itemProjectId);
                  }}
                  value={value}
                />
              );
            })}
          </Command.Group>
        );
      })}
    </>
  );
});
