/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ETabIndices, EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
// types
import type { ISearchIssueResponse, TIssue } from "@plane/types";
import { getDate, renderFormattedPayloadDate, getTabIndex } from "@plane/utils";
// components
import { DateDropdown } from "@/components/dropdowns/date";
import { EstimateDropdown } from "@/components/dropdowns/estimate";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { PriorityDropdown } from "@/components/dropdowns/priority";
import { StateDropdown } from "@/components/dropdowns/state/dropdown";
import { IssueLabelSelect } from "@/components/issues/select";
// helpers
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";

type TIssueDefaultPropertiesProps = {
  control: Control<TIssue>;
  id: string | undefined;
  projectId: string | null;
  workspaceSlug: string;
  selectedParentIssue: ISearchIssueResponse | null;
  startDate: string | null;
  targetDate: string | null;
  parentId: string | null;
  isDraft: boolean;
  handleFormChange: () => void;
  setSelectedParentIssue: (issue: ISearchIssueResponse) => void;
};

export const IssueDefaultProperties = observer(function IssueDefaultProperties(props: TIssueDefaultPropertiesProps) {
  const { control, id, projectId, workspaceSlug, startDate, targetDate, handleFormChange } = props;
  // store hooks
  const { t } = useTranslation();
  const { areEstimateEnabledByProjectId } = useProjectEstimates();
  const { isMobile } = usePlatformOS();
  const { allowPermissions } = useUserPermissions();

  const { getIndex } = getTabIndex(ETabIndices.ISSUE_FORM, isMobile);

  const canCreateLabel =
    projectId && allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT, workspaceSlug, projectId);

  const minDate = getDate(startDate);
  minDate?.setDate(minDate.getDate());

  const maxDate = getDate(targetDate);
  maxDate?.setDate(maxDate.getDate());

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Controller
        control={control}
        name="state_id"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <StateDropdown
              value={value}
              onChange={(stateId) => {
                onChange(stateId);
                handleFormChange();
              }}
              projectId={projectId ?? undefined}
              buttonVariant="border-with-text"
              tabIndex={getIndex("state_id")}
              isForWorkItemCreation={!id}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <PriorityDropdown
              value={value}
              onChange={(priority) => {
                onChange(priority);
                handleFormChange();
              }}
              buttonVariant="border-with-text"
              tabIndex={getIndex("priority")}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="assignee_ids"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <MemberDropdown
              projectId={projectId ?? undefined}
              value={value}
              onChange={(assigneeIds) => {
                onChange(assigneeIds);
                handleFormChange();
              }}
              buttonVariant={value?.length > 0 ? "transparent-without-text" : "border-with-text"}
              buttonClassName={value?.length > 0 ? "hover:bg-transparent" : ""}
              placeholder={t("assignees")}
              multiple
              tabIndex={getIndex("assignee_ids")}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="label_ids"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <IssueLabelSelect
              value={value}
              onChange={(labelIds) => {
                onChange(labelIds);
                handleFormChange();
              }}
              projectId={projectId ?? undefined}
              tabIndex={getIndex("label_ids")}
              createLabelEnabled={!!canCreateLabel}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="start_date"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <DateDropdown
              value={value}
              onChange={(date) => {
                onChange(date ? renderFormattedPayloadDate(date) : null);
                handleFormChange();
              }}
              buttonVariant="border-with-text"
              maxDate={maxDate ?? undefined}
              placeholder={t("start_date")}
              tabIndex={getIndex("start_date")}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="target_date"
        render={({ field: { value, onChange } }) => (
          <div className="h-7">
            <DateDropdown
              value={value}
              onChange={(date) => {
                onChange(date ? renderFormattedPayloadDate(date) : null);
                handleFormChange();
              }}
              buttonVariant="border-with-text"
              minDate={minDate ?? undefined}
              placeholder={t("due_date")}
              tabIndex={getIndex("target_date")}
            />
          </div>
        )}
      />
      {projectId && areEstimateEnabledByProjectId(projectId) && (
        <Controller
          control={control}
          name="estimate_point"
          render={({ field: { value, onChange } }) => (
            <div className="h-7">
              <EstimateDropdown
                value={value || undefined}
                onChange={(estimatePoint) => {
                  onChange(estimatePoint);
                  handleFormChange();
                }}
                projectId={projectId}
                buttonVariant="border-with-text"
                tabIndex={getIndex("estimate_point")}
                placeholder={t("estimate")}
              />
            </div>
          )}
        />
      )}
    </div>
  );
});
