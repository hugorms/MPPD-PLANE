/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import type { TIssueServiceType, TWorkItemWidgets } from "@plane/types";
// plane web imports
import { WorkItemAdditionalWidgetActionButtons } from "@/plane-web/components/issues/issue-detail-widgets/action-buttons";
// local imports
import { IssueAttachmentActionButton } from "./attachments";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const bypassModalRef = useRef(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (bypassModalRef.current) {
      bypassModalRef.current = false;
      return;
    }
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    const btn = containerRef.current?.querySelector("button");
    if (!btn) return;
    bypassModalRef.current = true;
    btn.click();
    // Reset bypass in case click was silently swallowed
    setTimeout(() => {
      bypassModalRef.current = false;
    }, 500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!hideWidgets?.includes("attachments") && (
        <>
          {showConfirm && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setShowConfirm(false)}
              onKeyDown={(e) => e.key === "Escape" && setShowConfirm(false)}
            >
              <div
                role="document"
                className="border-custom-border-200 bg-custom-background-100 shadow-2xl relative w-80 rounded-xl border p-5"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-custom-text-400 hover:text-custom-text-200 absolute top-3 right-3"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-1 flex items-center gap-2">
                  <Paperclip className="text-custom-text-300 h-4 w-4 shrink-0" strokeWidth={2} />
                  <p className="text-sm text-custom-text-100 font-semibold">Adjuntar solicitud</p>
                </div>
                <p className="text-xs text-custom-text-300 mb-4 leading-relaxed">
                  El papel que trajo el ciudadano. Carta, formulario o constancia — lo que justifique su caso. Si no
                  tiene nada, omite este paso.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="neutral-primary" size="sm" onClick={() => setShowConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleConfirm}>
                    Adjuntar archivo
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div ref={containerRef} onClickCapture={handleClickCapture}>
            <IssueAttachmentActionButton
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              issueId={issueId}
              customButton={
                <IssueDetailWidgetButton
                  title="Adjuntar solicitud"
                  icon={<Paperclip className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />}
                  disabled={disabled}
                />
              }
              disabled={disabled}
              issueServiceType={issueServiceType}
            />
          </div>
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
