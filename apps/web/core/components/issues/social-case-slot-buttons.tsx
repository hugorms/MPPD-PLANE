import { useRef, useState } from "react";
import { Paperclip, Check, Loader2, X } from "lucide-react";
import { Button } from "@plane/propel/button";
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="document"
        className="border-custom-border-200 bg-custom-background-100 shadow-2xl relative w-80 rounded-xl border p-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="text-custom-text-400 hover:text-custom-text-200 absolute top-3 right-3">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-1 flex items-center gap-2">
          <Paperclip className="text-custom-text-300 h-4 w-4 shrink-0" strokeWidth={2} />
          <p className="text-sm text-custom-text-100 font-semibold">{label}</p>
        </div>
        <p className="text-xs text-custom-text-300 mb-4 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="neutral-primary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            Adjuntar archivo
          </Button>
        </div>
      </div>
    </div>
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
    if (prefix === "[ENTREGA]" || prefix === "[CI_BEN]") {
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
      {EVIDENCE_SLOTS.map((slot) => {
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
