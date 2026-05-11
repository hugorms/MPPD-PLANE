/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TIssueServiceType, TWorkItemWidgets } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";
// plane web imports
import { WorkItemAdditionalWidgetActionButtons } from "@/plane-web/components/issues/issue-detail-widgets/action-buttons";
// local imports
import { extractFromHtml } from "@/components/issues/social-case-form";
import { IssueDetailWidgetButton } from "./widget-button";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
  issueServiceType: TIssueServiceType;
  hideWidgets?: TWorkItemWidgets[];
  extraButtons?: React.ReactNode;
};

export function IssueDetailWidgetActionButtons(props: Props) {
  const { workspaceSlug, projectId, issueId, disabled, issueServiceType, hideWidgets, extraButtons } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    issue: { getIssueById },
    attachment: { createAttachment },
  } = useIssueDetail(EIssueServiceType.ISSUES);
  const { getProjectStates } = useProjectState();
  const issue = getIssueById(issueId);
  const projectStates = getProjectStates(projectId);
  const hasSocialCaseWorkflow = Boolean(
    projectStates?.some((s) => s.name?.toLowerCase().includes("proceso")) &&
    projectStates?.some((s) => s.name?.toLowerCase().includes("articulaci")) &&
    projectStates?.some((s) => s.name?.toLowerCase().includes("recib"))
  );
  const isSocialCase = hasSocialCaseWorkflow && Boolean(extractFromHtml(issue?.description_html ?? ""));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsUploading(true);
    try {
      await createAttachment(workspaceSlug, projectId, issueId, file);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "No se pudo adjuntar el archivo." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isSocialCase && !hideWidgets?.includes("attachments") && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
          {showConfirm && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Adjuntar solicitud"
              className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4 sm:p-0"
              onKeyDown={(e) => e.key === "Escape" && setShowConfirm(false)}
            >
              <div
                role="presentation"
                className="fixed inset-0 bg-backdrop transition-opacity"
                onClick={() => setShowConfirm(false)}
                onKeyDown={() => setShowConfirm(false)}
              />
              <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md transform rounded-lg bg-surface-1 text-left shadow-raised-200 transition-all duration-200">
                <div className="flex items-start gap-4 p-5">
                  <span className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
                    <Paperclip className="size-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-16 font-medium">Adjuntar solicitud</h3>
                    <p className="mt-1 text-13 text-secondary">
                      El papel que trajo el ciudadano. Carta, formulario o constancia — lo que justifique su caso. Si no
                      tiene nada, omite este paso.
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-end gap-2 border-t-[0.5px] border-subtle px-5 py-4">
                  <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    loading={isUploading}
                    onClick={() => {
                      setShowConfirm(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    Adjuntar archivo
                  </Button>
                </div>
              </div>
            </div>
          )}
          <IssueDetailWidgetButton
            title="Adjuntar solicitud"
            icon={<Paperclip className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />}
            disabled={disabled}
            onClick={() => setShowConfirm(true)}
          />
        </>
      )}
      <WorkItemAdditionalWidgetActionButtons
        disabled={disabled}
        hideWidgets={hideWidgets ?? []}
        issueServiceType={issueServiceType}
        projectId={projectId}
        workItemId={issueId}
        workspaceSlug={workspaceSlug}
      />
      {extraButtons}
    </div>
  );
}
