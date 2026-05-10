/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import type { TIssueServiceType, TWorkItemWidgets } from "@plane/types";
import { EModalWidth, ModalCore } from "@plane/ui";
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
          <ModalCore isOpen={showConfirm} handleClose={() => setShowConfirm(false)} width={EModalWidth.XL}>
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
              <Button variant="primary" onClick={handleConfirm}>
                Adjuntar archivo
              </Button>
            </div>
          </ModalCore>
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
