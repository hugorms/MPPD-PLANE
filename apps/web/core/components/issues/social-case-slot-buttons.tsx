import { useRef, useState } from "react";
import { Paperclip, Check, Loader2 } from "lucide-react";
import { Button } from "@plane/propel/button";
import { EModalWidth, ModalCore } from "@plane/ui";
import { extractFromHtml, EVIDENCE_SLOTS } from "./social-case-form";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  onSlotUpload: (slotPrefix: string, file: File) => Promise<void>;
};

const SLOT_PREFIXES_LIST = EVIDENCE_SLOTS.map((s) => s.prefix);

function SlotConfirmModal({
  label,
  description,
  onConfirm,
  onClose,
}: {
  label: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalCore isOpen handleClose={onClose} width={EModalWidth.XL}>
      <div className="flex items-start gap-4 p-5">
        <span className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
          <Paperclip className="size-5" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-16 font-medium">{label}</h3>
          <p className="mt-1 text-13 text-secondary">{description}</p>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-2 border-t-[0.5px] border-subtle px-5 py-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Adjuntar archivo
        </Button>
      </div>
    </ModalCore>
  );
}

function SlotButton({
  label,
  description,
  isDone,
  uploading,
  disabled,
  accept,
  onFile,
}: {
  label: string;
  description: string;
  isDone: boolean;
  uploading: boolean;
  disabled: boolean;
  accept: string;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading || disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFile(file);
          e.target.value = "";
        }}
      />
      {showConfirm && (
        <SlotConfirmModal
          label={label}
          description={description}
          onConfirm={() => {
            setShowConfirm(false);
            inputRef.current?.click();
          }}
          onClose={() => setShowConfirm(false)}
        />
      )}
      <Button
        variant="secondary"
        size="lg"
        disabled={uploading || disabled}
        onClick={() => setShowConfirm(true)}
        className={isDone ? "border-green-500 text-green-600 dark:text-green-400" : ""}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />
        ) : isDone ? (
          <Check className="text-green-500 h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <Paperclip className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
        )}
        <span className="text-body-xs-medium">{uploading ? "Subiendo..." : label}</span>
      </Button>
    </>
  );
}

export function SocialCaseSlotButtons({ workspaceSlug: _workspaceSlug, projectId, issueId, onSlotUpload }: Props) {
  const {
    issue: { getIssueById },
    attachment: { getAttachmentsByIssueId, getAttachmentById },
  } = useIssueDetail();
  const { getProjectStates } = useProjectState();

  const [sessionUploads, setSessionUploads] = useState<Record<string, string>>({});
  const [slotUploading, setSlotUploading] = useState<Record<string, boolean>>({});

  const issue = getIssueById(issueId);
  const projectStates = getProjectStates(projectId);

  // Calcular qué slots ya tienen archivo subido leyendo directamente los adjuntos del store
  const storeSlotFiles = (getAttachmentsByIssueId(issueId) ?? []).reduce<Record<string, string>>((acc, attId) => {
    const att = getAttachmentById(attId);
    if (!att) return acc;
    const name = att.attributes?.name ?? "";
    const prefix = SLOT_PREFIXES_LIST.find((p) => name.startsWith(p));
    if (!prefix) return acc;
    if (SLOT_PREFIXES_LIST.includes(prefix)) {
      const count = Object.keys(acc).filter((k) => k.startsWith(prefix)).length;
      acc[`${prefix}_${count + 1}`] = name;
    } else {
      acc[prefix] = name;
    }
    return acc;
  }, {});

  // Unir estado del store con uploads de la sesión actual
  const slotFiles = { ...storeSlotFiles, ...sessionUploads };

  const hasSocialCaseWorkflow = Boolean(
    projectStates?.some((s) => s.name?.toLowerCase().includes("proceso")) &&
    projectStates?.some((s) => s.name?.toLowerCase().includes("articulaci")) &&
    projectStates?.some((s) => s.name?.toLowerCase().includes("recib"))
  );

  const currentStateName = issue?.state_id
    ? (projectStates?.find((s) => s.id === issue.state_id)?.name?.toLowerCase() ?? "")
    : "";
  const isArticulacion = currentStateName.includes("articulaci");

  const data = extractFromHtml(issue?.description_html ?? "");

  if (!hasSocialCaseWorkflow || !data) return null;

  const handleSlotUpload = async (prefix: string, file: File) => {
    setSlotUploading((prev) => ({ ...prev, [prefix]: true }));
    try {
      await onSlotUpload(prefix, file);
      setSessionUploads((prev) => ({ ...prev, [prefix]: file.name }));
    } finally {
      setSlotUploading((prev) => ({ ...prev, [prefix]: false }));
    }
  };

  return (
    <>
      {EVIDENCE_SLOTS.filter((slot) => slot.prefix !== "[ENTREGA]" || isArticulacion).map((slot) => {
        const isRegistro = slot.prefix === "[ENTREGA]";
        const isCedula = slot.prefix === "[CI_BEN]";
        const countable = isRegistro || isCedula;
        const slotCount = countable ? Object.keys(slotFiles).filter((k) => k.startsWith(slot.prefix)).length : 0;
        const maxFiles = slot.maxFiles;
        const reachedMax = maxFiles !== undefined && slotCount >= maxFiles;
        const isDone = countable ? slotCount > 0 : !!slotFiles[slot.prefix];
        const displayLabel =
          countable && slotCount > 0 ? `${slot.label} (${slotCount}${maxFiles ? `/${maxFiles}` : ""})` : slot.label;

        return (
          <SlotButton
            key={slot.prefix}
            label={displayLabel}
            description={slot.description}
            isDone={isDone}
            uploading={Object.entries(slotUploading).some(([k, v]) => k.startsWith(slot.prefix) && v)}
            disabled={reachedMax}
            accept="image/*,.pdf"
            onFile={(file) => {
              if (reachedMax) return;
              if (countable) {
                const nextCount = Object.keys(slotFiles).filter((k) => k.startsWith(slot.prefix)).length;
                handleSlotUpload(`${slot.prefix}_${nextCount + 1}`, file);
              } else {
                handleSlotUpload(slot.prefix, file);
              }
            }}
          />
        );
      })}
    </>
  );
}
