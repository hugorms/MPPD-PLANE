/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// icons
import { Award, Building2, Circle, MapPin, Shield } from "lucide-react";
// plane imports
import {
  EUserPermissions,
  EUserPermissionsLevel,
  SPACE_BASE_PATH,
  SPACE_BASE_URL,
  WORK_ITEM_TRACKER_ELEMENTS,
} from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { NewTabIcon, WorkItemsIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { EIssuesStoreType } from "@plane/types";
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { CountChip } from "@/components/common/count-chip";
import { VENEZUELA_ESTADOS } from "@/components/issues/social-case-estados";
import { useSocialCaseEstadoFilter } from "@/components/issues/social-case-estado-provider";
import { FiltersDropdown } from "@/components/issues/issue-layouts/filters";
// constants
import { HeaderFilters } from "@/components/issues/filters";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/plane-web/components/breadcrumbs/common";

const FANB_COMPONENTES = [
  "Ejército Nacional Bolivariano",
  "Armada Bolivariana de Venezuela",
  "Aviación Militar Bolivariana",
  "Guardia Nacional Bolivariana",
  "Milicia Nacional Bolivariana",
];

const FANB_GRADOS_OFICIALES = [
  "General en Jefe",
  "Almirante en Jefe",
  "Mayor General",
  "Almirante",
  "General de División",
  "Vicealmirante",
  "General de Brigada",
  "Contralmirante",
  "Coronel",
  "Capitán de Navío",
  "Teniente Coronel",
  "Capitán de Fragata",
  "Mayor",
  "Capitán de Corbeta",
  "Capitán",
  "Teniente de Navío",
  "Primer Teniente",
  "Teniente de Fragata",
  "Teniente",
  "Teniente de Corbeta",
];

const FANB_GRADOS_SUBOFICIALES = [
  "Sargento Supervisor",
  "Sargento Ayudante",
  "Sargento Mayor de Primera",
  "Sargento Mayor de Segunda",
  "Sargento Mayor de Tercera",
  "Sargento Primero",
  "Sargento Segundo",
];

export const IssuesHeader = observer(function IssuesHeader() {
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const {
    issues: { getGroupIssueCount },
  } = useIssues(EIssuesStoreType.PROJECT);
  // i18n
  const { t } = useTranslation();

  const { currentProjectDetails, loader } = useProject();

  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { isMobile } = usePlatformOS();

  const SPACE_APP_URL = (SPACE_BASE_URL.trim() === "" ? window.location.origin : SPACE_BASE_URL) + SPACE_BASE_PATH;
  const publishedURL = `${SPACE_APP_URL}/issues/${currentProjectDetails?.anchor}`;

  const {
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
  } = useSocialCaseEstadoFilter();

  // Componente y Grado solo son relevantes cuando hay casos militares
  const showMilitaryFilters = condicionFilter.length !== 1 || condicionFilter[0] !== "Civil";

  const issuesCount = filteredIssueIds ? filteredIssueIds.size : getGroupIssueCount(undefined, undefined, false);
  const canUserCreateIssue = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  return (
    <Header>
      <Header.LeftItem>
        <div className="flex items-center gap-2.5">
          <Breadcrumbs onBack={() => router.back()} isLoading={loader === "init-loader"} className="flex-grow-0">
            <CommonProjectBreadcrumbs workspaceSlug={workspaceSlug?.toString()} projectId={projectId?.toString()} />
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label="Work Items"
                  href={`/${workspaceSlug}/projects/${projectId}/issues/`}
                  icon={<WorkItemsIcon className="h-4 w-4 text-tertiary" />}
                  isLast
                />
              }
              isLast
            />
          </Breadcrumbs>
          {issuesCount && issuesCount > 0 ? (
            <Tooltip
              isMobile={isMobile}
              tooltipContent={`There are ${issuesCount} ${issuesCount > 1 ? "work items" : "work item"} in this project`}
              position="bottom"
            >
              <CountChip count={issuesCount} />
            </Tooltip>
          ) : null}
        </div>
        {currentProjectDetails?.anchor ? (
          <a
            href={publishedURL}
            className="group flex items-center gap-1.5 rounded-sm bg-accent-primary/10 px-2.5 py-1 text-11 font-medium text-accent-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Circle className="h-1.5 w-1.5 fill-accent-primary" strokeWidth={2} />
            {t("workspace_projects.network.public.title")}
            <NewTabIcon className="hidden h-3 w-3 group-hover:block" strokeWidth={2} />
          </a>
        ) : (
          <></>
        )}
      </Header.LeftItem>
      <Header.RightItem>
        <div className="hidden items-center gap-2 md:flex">
          {/* Filtro por estado de Venezuela */}
          <FiltersDropdown
            miniIcon={<MapPin className="size-3.5" />}
            title={
              estadosFilter.length === 0
                ? "Estado"
                : estadosFilter.length === 1
                  ? estadosFilter[0]
                  : `${estadosFilter.length} estados`
            }
            placement="bottom-end"
            isFiltersApplied={estadosFilter.length > 0}
          >
            <div className="flex w-52 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
                <span className="text-xs font-medium text-tertiary">Estado de Venezuela</span>
                {estadosFilter.length > 0 && (
                  <button type="button" onClick={clearEstados} className="text-xs text-accent-primary hover:underline">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="vertical-scrollbar scrollbar-sm max-h-64 overflow-y-auto py-1">
                {VENEZUELA_ESTADOS.map((estado) => {
                  const selected = estadosFilter.includes(estado);
                  return (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => toggleEstado(estado)}
                      className={`text-sm flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-surface-2 ${
                        selected ? "text-accent-primary" : "text-secondary"
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                          selected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                        }`}
                      >
                        {selected && (
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
                      <span>{estado}</span>
                    </button>
                  );
                })}
              </div>
              {loadingFilter && (
                <div className="text-xs animate-pulse border-t border-subtle px-3 py-2 text-tertiary">Filtrando...</div>
              )}
            </div>
          </FiltersDropdown>
          <FiltersDropdown
            miniIcon={<Shield className="size-3.5" />}
            title={
              condicionFilter.length === 1
                ? condicionFilter[0]
                : condicionFilter.length === 0 || condicionFilter.length === 2
                  ? "Condición"
                  : `${condicionFilter.length} condiciones`
            }
            placement="bottom-end"
            isFiltersApplied={condicionFilter.length === 1}
          >
            <div className="flex w-52 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
                <span className="text-xs font-medium text-tertiary">Condición del caso</span>
                {condicionFilter.length !== 2 && (
                  <button
                    type="button"
                    onClick={clearCondiciones}
                    className="text-xs text-accent-primary hover:underline"
                  >
                    Mostrar todo
                  </button>
                )}
              </div>
              <div className="py-1">
                {(["Militar", "Civil"] as const).map((condicion) => {
                  const selected = condicionFilter.includes(condicion);
                  return (
                    <button
                      key={condicion}
                      type="button"
                      onClick={() => toggleCondicion(condicion)}
                      className={`text-sm flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-surface-2 ${
                        selected ? "text-accent-primary" : "text-secondary"
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                          selected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                        }`}
                      >
                        {selected && (
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
                      <span>{condicion}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs border-t border-subtle px-3 py-2 text-tertiary">
                Ambos o ninguno muestran todos los casos.
              </div>
              {loadingFilter && (
                <div className="text-xs animate-pulse border-t border-subtle px-3 py-2 text-tertiary">Filtrando...</div>
              )}
            </div>
          </FiltersDropdown>
          {/* Filtro por Componente FANB — solo visible si hay militares */}
          {showMilitaryFilters && (
            <FiltersDropdown
              miniIcon={<Building2 className="size-3.5" />}
              title={
                componenteFilter.length === 0
                  ? "Componente"
                  : componenteFilter.length === 1
                    ? componenteFilter[0].split(" ")[0]
                    : `${componenteFilter.length} componentes`
              }
              placement="bottom-end"
              isFiltersApplied={componenteFilter.length > 0}
            >
              <div className="flex w-60 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
                  <span className="text-xs font-medium text-tertiary">Componente FANB</span>
                  {componenteFilter.length > 0 && (
                    <button
                      type="button"
                      onClick={clearComponentes}
                      className="text-xs text-accent-primary hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="py-1">
                  {FANB_COMPONENTES.map((comp) => {
                    const selected = componenteFilter.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => toggleComponente(comp)}
                        className={`text-sm flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-surface-2 ${
                          selected ? "text-accent-primary" : "text-secondary"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            selected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                          }`}
                        >
                          {selected && (
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
                        <span>{comp}</span>
                      </button>
                    );
                  })}
                </div>
                {loadingFilter && (
                  <div className="text-xs animate-pulse border-t border-subtle px-3 py-2 text-tertiary">
                    Filtrando...
                  </div>
                )}
              </div>
            </FiltersDropdown>
          )}
          {/* Filtro por Grado militar — solo visible si hay militares */}
          {showMilitaryFilters && (
            <FiltersDropdown
              miniIcon={<Award className="size-3.5" />}
              title={
                gradoFilter.length === 0
                  ? "Grado"
                  : gradoFilter.length === 1
                    ? gradoFilter[0]
                    : `${gradoFilter.length} grados`
              }
              placement="bottom-end"
              isFiltersApplied={gradoFilter.length > 0}
            >
              <div className="flex w-56 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
                  <span className="text-xs font-medium text-tertiary">Grado militar</span>
                  {gradoFilter.length > 0 && (
                    <button type="button" onClick={clearGrados} className="text-xs text-accent-primary hover:underline">
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="vertical-scrollbar scrollbar-sm max-h-72 overflow-y-auto py-1">
                  <div className="tracking-wider px-3 py-1 text-[10px] font-semibold text-tertiary uppercase">
                    Oficiales
                  </div>
                  {FANB_GRADOS_OFICIALES.map((grado) => {
                    const selected = gradoFilter.includes(grado);
                    return (
                      <button
                        key={grado}
                        type="button"
                        onClick={() => toggleGrado(grado)}
                        className={`text-sm flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-surface-2 ${
                          selected ? "text-accent-primary" : "text-secondary"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            selected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                          }`}
                        >
                          {selected && (
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
                        <span>{grado}</span>
                      </button>
                    );
                  })}
                  <div className="tracking-wider mt-1 px-3 py-1 text-[10px] font-semibold text-tertiary uppercase">
                    Suboficiales
                  </div>
                  {FANB_GRADOS_SUBOFICIALES.map((grado) => {
                    const selected = gradoFilter.includes(grado);
                    return (
                      <button
                        key={grado}
                        type="button"
                        onClick={() => toggleGrado(grado)}
                        className={`text-sm flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-surface-2 ${
                          selected ? "text-accent-primary" : "text-secondary"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            selected ? "border-accent-primary bg-accent-primary" : "border-custom-border-300"
                          }`}
                        >
                          {selected && (
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
                        <span>{grado}</span>
                      </button>
                    );
                  })}
                </div>
                {loadingFilter && (
                  <div className="text-xs animate-pulse border-t border-subtle px-3 py-2 text-tertiary">
                    Filtrando...
                  </div>
                )}
              </div>
            </FiltersDropdown>
          )}
          <HeaderFilters
            projectId={projectId}
            currentProjectDetails={currentProjectDetails}
            workspaceSlug={workspaceSlug}
            canUserCreateIssue={canUserCreateIssue}
          />
        </div>
        {canUserCreateIssue && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              toggleCreateIssueModal(true, EIssuesStoreType.PROJECT);
            }}
            data-ph-element={WORK_ITEM_TRACKER_ELEMENTS.HEADER_ADD_BUTTON.WORK_ITEMS}
          >
            <div className="block sm:hidden">{t("issue.label", { count: 1 })}</div>
            <div className="hidden sm:block">{t("issue.add.label")}</div>
          </Button>
        )}
      </Header.RightItem>
    </Header>
  );
});
