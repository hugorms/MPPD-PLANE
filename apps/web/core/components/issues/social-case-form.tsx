import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@plane/propel/button";
import { cn, getFileURL } from "@plane/utils";
import { VENEZUELA_ESTADOS } from "./social-case-estados";
import { OnfaloService } from "@/services/onfalo.service";

const onfaloService = new OnfaloService();

// ── Types ────────────────────────────────────────────────────────────────────

export type SocialCaseData = {
  numeroCaso: string;
  cedula: string;
  nombre: string;
  telefono: string;
  direccion: string;
  parroquia: string;
  municipio: string;
  entidad: string;
  esMilitar: string; // "true" | ""
  condicionMilitar: string;
  gradoMilitar: string;
  unidadDependencia: string;
  jornada: string;
  telefono2: string;
  referencia: string;
  descripcionCaso: string;
  accionTomada: string;
  resultado: string;
  institucionContactada: string;
  observacionCierre: string;
  fechaCierre: string;
};

type Props = {
  issueId?: string;
  // "create-no-save"  → editable, guarda en localStorage, sin botón Guardar (el modal lo hace al crear)
  // "view"            → solo lectura con botón Editar → Guardar ficha (va a la DB)
  mode: "create-no-save" | "view";
  descriptionHtml?: string;
  onSave?: (newDescriptionHtml: string) => Promise<void>;
  /** Callback llamado en tiempo real con los datos del formulario (modo create-no-save) */
  onDataChange?: (data: SocialCaseData) => void;
  /** Si true, el caso ya está resuelto — sección cierre en solo lectura */
  isClosed?: boolean;
  /** Si true, el caso está marcado como sin resolución (grupo cancelled) */
  isSinResolucion?: boolean;
  /** Si true, el caso está en proceso — muestra sección de seguimiento y acceso rápido a institución */
  isEnProceso?: boolean;
  /** Si true, el caso está en articulación — muestra sección cierre editable y botón "Resolver caso" */
  isArticulacion?: boolean;
  /** Llamado al guardar la ficha completa desde articulación para transicionar a Resuelto */
  onComplete?: () => Promise<void>;
  /** Si true, el caso está en "Casos recibidos" — sección básica editable con botón "Iniciar proceso" */
  isRecibido?: boolean;
  /** Avanza al siguiente estado (recibido→proceso o proceso→articulación) */
  onAdvance?: () => Promise<void>;
  /** Retrocede al estado anterior (proceso→recibido o articulación→proceso) */
  onRetreat?: () => Promise<void>;
  /** Marca el caso como "Sin resolución" */
  onSinResolucion?: () => Promise<void>;
  /** Reabre un caso cerrado (vuelve a proceso) */
  onReabrir?: () => Promise<void>;
  /** Sube una nueva foto de perfil y devuelve la URL del asset */
  onPhotoUpload?: (file: File) => Promise<string>;
  /** Llamado cuando Onfalo devuelve una foto — para que el padre la muestre en su propio componente */
  onPhotoFound?: (url: string) => void;
  /** Sincroniza el estado de guardado con el indicador global del issue ("submitting" | "submitted" | "saved") */
  onSavingChange?: (status: "submitting" | "submitted" | "saved") => void;
};

// ── Constants ────────────────────────────────────────────────────────────────

const EMPTY: SocialCaseData = {
  numeroCaso: "",
  cedula: "",
  nombre: "",
  telefono: "",
  direccion: "",
  parroquia: "",
  municipio: "",
  entidad: "",
  esMilitar: "",
  condicionMilitar: "",
  gradoMilitar: "",
  unidadDependencia: "",
  jornada: "",
  telefono2: "",
  referencia: "",
  descripcionCaso: "",
  accionTomada: "",
  resultado: "",
  institucionContactada: "",
  observacionCierre: "",
  fechaCierre: "",
};

export const PENDING_KEY = "social_case_pending";
export const PROFILE_PHOTO_KEY = "profile_photo_pending";

// Regex para identificar la etiqueta de foto de perfil en el description_html
const PHOTO_RE = /<img[^>]*data-profile-photo="1"[^>]*\/?>/;

// Marcador de inicio y fin de la tabla de la ficha dentro del description_html
const TABLE_START = '<table data-social-case="1">';
const TABLE_END = "</table>";
const TABLE_RE = /<table data-social-case="1">[\s\S]*?<\/table>/;

// Campos con sus etiquetas legibles para construir la tabla
const FIELDS: { key: keyof SocialCaseData; label: string }[] = [
  { key: "numeroCaso", label: "N\u00famero de caso" },
  { key: "cedula", label: "Cedula" },
  { key: "nombre", label: "Nombre" },
  { key: "telefono", label: "Telefono" },
  { key: "direccion", label: "Direccion" },
  { key: "parroquia", label: "Parroquia" },
  { key: "municipio", label: "Municipio" },
  { key: "entidad", label: "Estado" },
  { key: "esMilitar", label: "Es militar" },
  { key: "condicionMilitar", label: "Condición militar" },
  { key: "gradoMilitar", label: "Grado militar" },
  { key: "unidadDependencia", label: "Unidad / Dependencia" },
  { key: "jornada", label: "Jornada" },
  { key: "telefono2", label: "Telefono 2" },
  { key: "referencia", label: "Solicitud" },
  { key: "descripcionCaso", label: "Descripción del caso" },
  { key: "accionTomada", label: "Accion tomada" },
  { key: "resultado", label: "Resultado" },
  { key: "institucionContactada", label: "Órgano / Institución contactada" },
  { key: "observacionCierre", label: "Observacion de cierre" },
  { key: "fechaCierre", label: "Fecha de cierre" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escapa caracteres HTML especiales para evitar XSS al inyectar valores en la tabla */
const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Lee la tabla del description_html y reconstruye el objeto SocialCaseData.
 *  Estrategia dual:
 *  1. Primero intenta leer el JSON del <caption> (robusto, ProseMirror lo conserva como texto)
 *  2. Si no, reconstruye campo a campo leyendo data-key de cada <td>
 */
// Componentes FANB canonicos: usados para retrocompatibilidad y exportaciones.
const FANB_COMPONENTS_SET = new Set([
  "Ejército Nacional Bolivariano",
  "Armada Bolivariana de Venezuela",
  "Aviación Militar Bolivariana",
  "Guardia Nacional Bolivariana",
  "Milicia Nacional Bolivariana",
]);

export const isMilitarySocialCaseData = (
  data?: Pick<
    SocialCaseData,
    "esMilitar" | "condicionMilitar" | "gradoMilitar" | "jornada" | "unidadDependencia"
  > | null
): boolean => {
  const jornada = data?.jornada?.trim() ?? "";
  return Boolean(
    data?.esMilitar === "true" ||
    data?.condicionMilitar?.trim() ||
    data?.gradoMilitar?.trim() ||
    FANB_COMPONENTS_SET.has(jornada)
  );
};

const normalizeExtractedSocialCase = (data: SocialCaseData): SocialCaseData =>
  isMilitarySocialCaseData(data) ? { ...data, esMilitar: "true" } : data;

export const extractFromHtml = (html: string): SocialCaseData | null => {
  if (!html?.match(TABLE_RE)) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector('table[data-social-case="1"]');
    if (!table) return null;

    // Estrategia 1: leer JSON del caption
    const caption = table.querySelector("caption");
    if (caption?.textContent) {
      try {
        const parsed = JSON.parse(caption.textContent);
        if (parsed && typeof parsed === "object" && "cedula" in parsed)
          return normalizeExtractedSocialCase({ ...EMPTY, ...parsed } as SocialCaseData);
      } catch (_) {}
    }

    // Estrategia 2: reconstruir desde data-key de cada td
    const rows = table.querySelectorAll("tr");
    if (rows.length === 0) return null;
    const result = { ...EMPTY };
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) return;
      const key = cells[0].getAttribute("data-key") as keyof SocialCaseData | null;
      if (key && key in result) result[key] = cells[1].textContent ?? "";
    });
    return normalizeExtractedSocialCase(result);
  } catch {
    return null;
  }
};

/** Construye la tabla HTML con los datos y la inyecta al inicio del description_html.
 *  Incluye un <caption> con el JSON completo como respaldo de lectura
 *  por si ProseMirror reescribe los atributos data-key de las celdas.
 */
/** Elimina la tabla de la ficha del description_html para pasarle al editor solo el texto limpio */
export const stripSocialCaseFromHtml = (html: string): string =>
  (html ?? "").replace(TABLE_RE, "").replace(PHOTO_RE, "");

/** Inyecta la foto de perfil como img oculta al inicio del description_html */
export const injectProfilePhotoIntoHtml = (html: string, src: string): string => {
  const tag = `<img data-profile-photo="1" src="${src}" style="display:none" alt="profile-photo" />`;
  return tag + (html ?? "").replace(PHOTO_RE, "");
};

/** Extrae la URL de la foto de perfil del description_html, o null si no existe */
export const extractProfilePhotoFromHtml = (html: string): string | null => {
  if (!html) return null;
  const match = html.match(PHOTO_RE);
  if (!match) return null;
  const srcMatch = match[0].match(/src="([^"]+)"/);
  if (!srcMatch) return null;
  // Normaliza: si la URL fue guardada como absoluta, devuelve sólo el pathname relativo
  const url = srcMatch[1];
  const relMatch = url.match(/https?:\/\/[^/]+(\/api\/.+)/);
  return relMatch ? relMatch[1] : url;
};

export const injectSocialCaseIntoHtml = (html: string, data: SocialCaseData): string => {
  const rows = FIELDS.map(
    ({ key, label }) =>
      `<tr><td data-key="${key}" style="font-weight:600;padding:3px 10px 3px 0;white-space:nowrap;color:#6b7280;font-size:12px;">${label}</td>` +
      `<td style="padding:3px 0;font-size:13px;">${escapeHtml(data[key] ?? "")}</td></tr>`
  ).join("");

  // caption oculto con JSON completo — respaldo si ProseMirror reescribe data-key
  const caption = `<caption style="display:none">${JSON.stringify(data)}</caption>`;

  const table = `${TABLE_START}${caption}<tbody>${rows}</tbody>${TABLE_END}`;

  const cleaned = (html ?? "").replace(TABLE_RE, "");
  return table + cleaned;
};

// ── Styles ───────────────────────────────────────────────────────────────────

const toUpper = (v: string) => v.toUpperCase();

const capitalizeFirstLetter = (value: string) =>
  value.replace(/^(\s*)(\p{L})/u, (_, spaces, letter) => `${spaces}${letter.toUpperCase()}`);

const capitalizeWords = (value: string) =>
  value
    .toLocaleLowerCase("es-VE")
    .replace(/(^|[\s.'-])(\p{L})/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("es-VE")}`);

const sectionHeadClass = "block text-xs text-custom-text-300 uppercase tracking-wider mb-2.5";

const labelClass = "block text-xs text-custom-text-300 mb-0.5";

const fieldBase = "w-full rounded-md border-[0.5px] text-13 px-3 py-1.5 transition-colors font-body";
const fieldEditable =
  "border-subtle bg-surface-2 text-primary placeholder:text-placeholder focus:border-strong focus:outline-none";
const fieldReadonly = "border-subtle bg-surface-1 text-primary cursor-default outline-none opacity-75";

// ── Component ────────────────────────────────────────────────────────────────

export const EVIDENCE_SLOTS: { prefix: string; label: string; maxFiles?: number }[] = [
  { prefix: "[CI_BEN]", label: "Adj. Cédula / Credencial", maxFiles: 2 },
  { prefix: "[ENTREGA]", label: "Adj. Registro Fotográfico" },
];

// Campos base requeridos para articulación/cierre (civiles y militares)
const ARTICULACION_BASE: (keyof SocialCaseData)[] = [
  "cedula",
  "nombre",
  "telefono",
  "direccion",
  "unidadDependencia",
  "referencia",
  "descripcionCaso",
  "resultado",
  "accionTomada",
];

// Campos adicionales solo para militares (deben coincidir con FIELDS_MILITAR en use-social-case-state-change.ts)
const ARTICULACION_MILITAR: (keyof SocialCaseData)[] = ["condicionMilitar", "gradoMilitar", "jornada"];

const FANB_INSTITUCIONES = [
  { short: "IPSFA", full: "IPSFA — Instituto de Previsión Social de las Fuerzas Armadas" },
  { short: "SEGUROS HORIZONTE", full: "SEGUROS HORIZONTE" },
  { short: "DIGESALUD", full: "DIGESALUD — Dirección General de Salud de la FANB" },
] as const;

const InstitucionSelect = ({
  id,
  value,
  disabled,
  className,
  onChange,
}: {
  id: string;
  value: string;
  disabled: boolean;
  className: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      Órgano / Institución contactada
    </label>
    <select id={id} disabled={disabled} className={className} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Seleccionar institución --</option>
      {FANB_INSTITUCIONES.map((inst) => (
        <option key={inst.short} value={inst.full}>
          {inst.full}
        </option>
      ))}
    </select>
  </div>
);

// Campos requeridos para iniciar el proceso (recibido → proceso)
const RECIBIDO_REQUIRED: { key: keyof SocialCaseData; label: string }[] = [
  { key: "cedula", label: "Cédula" },
  { key: "nombre", label: "Nombre" },
  { key: "telefono", label: "Teléfono" },
  { key: "direccion", label: "Dirección" },
  { key: "condicionMilitar", label: "Condición militar" },
  { key: "gradoMilitar", label: "Grado militar" },
  { key: "jornada", label: "Componente" },
  { key: "unidadDependencia", label: "Unidad / Dependencia" },
  { key: "referencia", label: "Solicitud" },
  { key: "descripcionCaso", label: "Descripción del caso" },
];

// Campos requeridos para enviar a articulación (proceso → articulación)
const PROCESO_REQUIRED: (keyof SocialCaseData)[] = ["resultado", "accionTomada"];

export const SocialCaseForm = ({
  issueId,
  mode,
  descriptionHtml = "",
  onSave,
  onDataChange,
  isClosed = false,
  isSinResolucion = false,
  isEnProceso = false,
  isArticulacion = false,
  isRecibido = false,
  onComplete,
  onAdvance,
  onRetreat,
  onSinResolucion,
  onReabrir,
  onSavingChange,
  onPhotoUpload,
  onPhotoFound,
}: Props) => {
  const [data, setData] = useState<SocialCaseData>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cedulaLooking, setCedulaLooking] = useState(false);
  const [cedulaNotFound, setCedulaNotFound] = useState(false);
  // URL de foto obtenida de Onfalo en la sesión actual (válida en cualquier modo)
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const lastCedulaQueried = useRef("");
  const savedData = useRef<SocialCaseData>(EMPTY);
  // Siempre apunta al descriptionHtml más reciente para evitar cierres obsoletos en save()
  const latestDescHtml = useRef(descriptionHtml);
  useEffect(() => {
    latestDescHtml.current = descriptionHtml;
  });
  // Timer para auto-guardado con debounce (solo en modo view)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Referencia mutable a los datos actuales para usarla dentro del timer sin capturar closure viejo
  const latestData = useRef<SocialCaseData>(EMPTY);
  useEffect(() => {
    latestData.current = data;
  });
  // Cancelar timer al desmontar
  useEffect(
    () => () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    },
    []
  );

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "create-no-save") {
      try {
        const stored = localStorage.getItem(PENDING_KEY);
        if (stored) setData(JSON.parse(stored));
      } catch (_) {}
      return;
    }

    // modo view: no recargar si el usuario está editando activamente
    if (editing) return;

    // modo view: leer desde description_html
    const extracted = extractFromHtml(descriptionHtml);
    if (extracted) {
      // Retrocompat: casos creados antes del campo esMilitar — auto-detectar por grado o
      // por componente FANB canónico. No usar jornada como texto libre porque casos civiles
      // viejos podían tener cualquier valor allí (ej. "Jornada de salud").
      if (
        !extracted.esMilitar &&
        (extracted.condicionMilitar || extracted.gradoMilitar || FANB_COMPONENTS_SET.has(extracted.jornada))
      ) {
        extracted.esMilitar = "true";
      }
      setData(extracted);
      return;
    }

    // si no hay datos en DB pero hay pendientes en localStorage → migrar a DB
    // Usamos sessionStorage por issueId para que el guard sobreviva re-mounts
    const migratedKey = issueId ? `social_case_migrated_${issueId}` : null;
    const alreadyMigrated = migratedKey ? sessionStorage.getItem(migratedKey) === "1" : false;

    if (!alreadyMigrated && issueId && onSave) {
      try {
        const pending = localStorage.getItem(PENDING_KEY);
        if (pending) {
          if (migratedKey) sessionStorage.setItem(migratedKey, "1");
          const parsed: SocialCaseData = JSON.parse(pending);
          setData(parsed);
          const baseHtml = injectSocialCaseIntoHtml(latestDescHtml.current, parsed);
          const photoUrl = localStorage.getItem(PROFILE_PHOTO_KEY);
          const newHtml = photoUrl ? injectProfilePhotoIntoHtml(baseHtml, photoUrl) : baseHtml;
          onSave(newHtml)
            .then(() => {
              localStorage.removeItem(PENDING_KEY);
              // PROFILE_PHOTO_KEY lo limpia el useEffect cuando descriptionHtml
              // ya contiene la foto — no limpiar aquí para evitar que el componente
              // quede sin fuente de foto durante el ciclo async de actualización del prop
              // Limpiar el guard de sesión una vez confirmado — ya está en DB
              if (migratedKey) sessionStorage.removeItem(migratedKey);
              return undefined;
            })
            .catch(() => {
              if (migratedKey) sessionStorage.removeItem(migratedKey);
            });
        }
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId, mode, descriptionHtml, editing]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const UNCHANGED_FIELDS = new Set<keyof SocialCaseData>([
    "cedula",
    "jornada",
    "entidad",
    "esMilitar",
    "condicionMilitar",
    "fechaCierre",
    "institucionContactada",
    "telefono",
    "telefono2",
  ]);

  const TITLE_CASE_FIELDS = new Set<keyof SocialCaseData>([
    "nombre",
    "gradoMilitar",
    "unidadDependencia",
    "direccion",
    "parroquia",
    "municipio",
  ]);

  const normalizeFieldValue = (f: keyof SocialCaseData, v: string) => {
    if (UNCHANGED_FIELDS.has(f)) return v;
    if (TITLE_CASE_FIELDS.has(f)) return capitalizeWords(v);
    return capitalizeFirstLetter(v);
  };

  const update = (field: keyof SocialCaseData, value: string) => {
    const val = normalizeFieldValue(field, value);
    setData((prev) => {
      const next = { ...prev, [field]: val };
      if (mode === "create-no-save") {
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify(next));
        } catch (_) {}
        onDataChange?.(next);
      }
      return next;
    });
    setSaved(false);

    // Auto-guardado con debounce en modo view
    scheduleAutoSave();
  };

  const scheduleAutoSave = () => {
    if (mode !== "view" || !onSave) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        onSavingChange?.("submitting");
        const newHtml = injectSocialCaseIntoHtml(latestDescHtml.current, latestData.current);
        await onSave(newHtml);
        setSaved(true);
        onSavingChange?.("submitted");
        setTimeout(() => {
          setSaved(false);
          onSavingChange?.("saved");
        }, 2000);
      } catch (_) {
        onSavingChange?.("saved");
      } finally {
        setSaving(false);
      }
    }, 1500);
  };

  const save = async () => {
    if (!onSave) return;
    setSaving(true);
    onSavingChange?.("submitting");
    try {
      const newHtml = injectSocialCaseIntoHtml(latestDescHtml.current, data);
      await onSave(newHtml);
      setSaved(true);
      setEditing(false);
      onSavingChange?.("submitted");
      setTimeout(() => {
        setSaved(false);
        onSavingChange?.("saved");
      }, 2000);
    } catch (_) {
      onSavingChange?.("saved");
    } finally {
      setSaving(false);
    }
  };

  const saveAndComplete = async () => {
    if (!onSave || !onComplete) return;
    setSaving(true);
    onSavingChange?.("submitting");
    try {
      const newHtml = injectSocialCaseIntoHtml(latestDescHtml.current, data);
      await onSave(newHtml);
      await onComplete();
      setEditing(false);
      onSavingChange?.("submitted");
      setTimeout(() => onSavingChange?.("saved"), 2000);
    } catch (_) {
      onSavingChange?.("saved");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!onPhotoUpload || !onSave) return;
    setPhotoUploading(true);
    try {
      const assetUrl = await onPhotoUpload(file);
      const newHtml = injectProfilePhotoIntoHtml(latestDescHtml.current, assetUrl);
      await onSave(newHtml);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCedulaSearch = async (force = false) => {
    const num = data.cedula.replace(/\D/g, "");
    if (!num || num.length < 6) return;
    if (!force && num === lastCedulaQueried.current) return;
    setCedulaLooking(true);
    setCedulaNotFound(false);
    try {
      const result = await onfaloService.lookupCedula(data.cedula);
      // Solo bloqueamos el ref si obtuvimos respuesta válida — si falla la red, blur puede reintentar
      if (!result) return;
      lastCedulaQueried.current = num;
      if (result.notFound) {
        setCedulaNotFound(true);
        return;
      }
      const esMilitarDetectado = Boolean(result.esMilitar || result.gradoMilitar || result.componente);
      const onfaloFields = {
        ...(result.nombre && { nombre: toUpper(result.nombre) }),
        ...(result.telefono && { telefono: result.telefono }),
        ...(result.direccion && { direccion: toUpper(result.direccion) }),
        ...(result.parroquia && { parroquia: toUpper(result.parroquia) }),
        ...(result.municipio && { municipio: toUpper(result.municipio) }),
        ...(result.entidad && { entidad: result.entidad }),
        ...(esMilitarDetectado && { esMilitar: "true" }),
        ...(result.condicionMilitar && { condicionMilitar: result.condicionMilitar }),
        ...(result.gradoMilitar && { gradoMilitar: toUpper(result.gradoMilitar) }),
        ...(result.componente && { jornada: result.componente }),
      };
      const next = { ...latestData.current, ...onfaloFields };
      setData(next);
      if (result.fotoUrl) {
        setLocalPhotoUrl(result.fotoUrl);
        onPhotoFound?.(result.fotoUrl);
      }
      if (mode === "create-no-save") {
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify(next));
        } catch (_) {}
        onDataChange?.(next);
        if (result.fotoUrl) {
          try {
            localStorage.setItem(PROFILE_PHOTO_KEY, result.fotoUrl);
          } catch (_) {}
        }
      } else if (onSave) {
        // Guardar en localStorage para que la foto se muestre inmediatamente
        // mientras el prop descriptionHtml se actualiza de forma asíncrona
        if (result.fotoUrl) {
          try {
            localStorage.setItem(PROFILE_PHOTO_KEY, result.fotoUrl);
          } catch (_) {}
        }
        // Guardar datos + foto juntos para que el useEffect no sobreescriba con el HTML viejo
        let newHtml = injectSocialCaseIntoHtml(latestDescHtml.current, next);
        if (result.fotoUrl) newHtml = injectProfilePhotoIntoHtml(newHtml, result.fotoUrl);
        await onSave(newHtml);
      }
    } catch (e) {
      console.error("[Onfalo] error:", e);
    } finally {
      setCedulaLooking(false);
    }
  };

  const effectiveArticulacionRequired: (keyof SocialCaseData)[] =
    data.esMilitar === "true" ? [...ARTICULACION_BASE, ...ARTICULACION_MILITAR] : ARTICULACION_BASE;
  const articulacionComplete = isArticulacion ? effectiveArticulacionRequired.every((k) => data[k]?.trim()) : false;

  // accionTomada y resultado solo se muestran en proceso, articulación o resuelto
  const showFullSeguimiento = mode !== "create-no-save" && !isRecibido;

  // Progreso recibido → proceso (Componente solo requerido si es Militar)
  const effectiveRecibidoRequired =
    data.esMilitar === "true"
      ? RECIBIDO_REQUIRED
      : RECIBIDO_REQUIRED.filter(
          ({ key }) => key !== "condicionMilitar" && key !== "gradoMilitar" && key !== "jornada"
        );
  const recibidoFilled = effectiveRecibidoRequired.filter(({ key }) => data[key]?.trim()).length;
  const recibidoComplete = recibidoFilled === effectiveRecibidoRequired.length;

  const procesoComplete = PROCESO_REQUIRED.every((k) => data[k]?.trim());

  const isEditable = mode === "create-no-save" || editing || isArticulacion || isEnProceso || isRecibido;

  // Guarda la ficha y luego llama a la función de avance de estado
  const saveAndAdvance = async (advanceFn: () => Promise<void>) => {
    if (!onSave) return;
    setSaving(true);
    onSavingChange?.("submitting");
    try {
      const newHtml = injectSocialCaseIntoHtml(latestDescHtml.current, data);
      await onSave(newHtml);
      await advanceFn();
      onSavingChange?.("submitted");
      setTimeout(() => onSavingChange?.("saved"), 2000);
    } catch (_) {
      onSavingChange?.("saved");
    } finally {
      setSaving(false);
    }
  };

  const fc = (editable: boolean) => cn(fieldBase, editable ? fieldEditable : fieldReadonly);

  // Foto de perfil actual extraída del HTML.
  // Fallback: si description_html aún no tiene la foto (store no cargado todavía),
  // usa el PROFILE_PHOTO_KEY guardado en localStorage durante la creación del caso.
  // Una vez que description_html tenga la foto, limpiamos el localStorage.
  const currentPhotoUrl =
    mode === "view"
      ? (extractProfilePhotoFromHtml(descriptionHtml) ??
        localPhotoUrl ??
        (() => {
          try {
            return localStorage.getItem(PROFILE_PHOTO_KEY) || null;
          } catch {
            return null;
          }
        })())
      : localPhotoUrl;
  const photoSrc = currentPhotoUrl ? getFileURL(currentPhotoUrl) : null;

  useEffect(() => {
    if (mode !== "view") return;
    if (extractProfilePhotoFromHtml(descriptionHtml)) {
      try {
        localStorage.removeItem(PROFILE_PHOTO_KEY);
      } catch {
        /* noop */
      }
    }
  }, [mode, descriptionHtml]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full font-body">
      {/* Foto de perfil — solo en modo view (en create la muestra ProfilePhotoUpload del modal) */}
      {mode === "view" && (
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="border-custom-border-200 shadow-sm h-32 w-24 overflow-hidden rounded-md border">
              {photoSrc ? (
                <img src={photoSrc} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="bg-custom-background-90 flex h-full w-full items-center justify-center">
                  <span className="text-xs text-custom-text-400 px-1 text-center">Sin foto</span>
                </div>
              )}
            </div>
            {onPhotoUpload && (
              <label className="border-custom-border-200 bg-custom-background-100 shadow-sm hover:bg-custom-background-80 absolute -right-1 -bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                    e.target.value = "";
                  }}
                />
                {photoUploading ? (
                  <span className="text-custom-text-300 text-[9px]">...</span>
                ) : (
                  <svg
                    className="text-custom-text-200 h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"
                    />
                  </svg>
                )}
              </label>
            )}
          </div>
        </div>
      )}
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 py-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group flex min-w-0 items-center gap-2 text-left"
        >
          <span className="text-sm font-normal text-custom-text-200 group-hover:text-custom-text-100 whitespace-nowrap transition-colors">
            Ficha del caso
          </span>
          <span className="text-xs text-custom-text-400 group-hover:text-custom-text-300 whitespace-nowrap transition-colors">
            {open ? "Ocultar" : "Mostrar"}
          </span>
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-5">
          {/* SECCION 1: RECIBIDO — Identificación */}
          <div className="space-y-3">
            <span className={sectionHeadClass}>Identificación</span>

            {/* Cédula — fila completa (N° de caso se genera automático del sequenceId) */}
            <div>
              <label htmlFor="sc-cedula" className={labelClass}>
                Cédula de identidad
                {cedulaLooking && (
                  <span className="ml-2 animate-pulse text-[10px] text-placeholder">consultando...</span>
                )}
                {cedulaNotFound && !cedulaLooking && (
                  <span className="text-red-500 ml-2 text-[10px]">No encontrado</span>
                )}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="sc-cedula"
                  disabled={!isEditable || cedulaLooking}
                  className={cn(fc(isEditable), "min-w-0 flex-1")}
                  placeholder="V-00.000.000"
                  value={data.cedula}
                  onChange={(e) => {
                    update("cedula", e.target.value);
                    if (cedulaNotFound) setCedulaNotFound(false);
                  }}
                  onBlur={() => handleCedulaSearch()}
                />
                {isEditable && (
                  <button
                    type="button"
                    disabled={cedulaLooking}
                    onClick={() => handleCedulaSearch(true)}
                    title="Buscar en SENIAT"
                    className="text-custom-text-300 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[0.5px] border-subtle bg-surface-2 transition-colors hover:border-strong hover:text-primary disabled:opacity-50"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Fila 2: Nombre | Tipo de caso */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label htmlFor="sc-nombre" className={labelClass}>
                  Nombre completo
                </label>
                <input
                  id="sc-nombre"
                  disabled={!isEditable}
                  autoCapitalize="words"
                  className={fc(isEditable)}
                  placeholder="Nombre y apellido"
                  value={data.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sc-tipo" className={labelClass}>
                  Tipo de caso
                </label>
                <select
                  id="sc-tipo"
                  disabled={!isEditable}
                  className={fc(isEditable)}
                  value={data.esMilitar === "true" ? "true" : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => {
                      const next = {
                        ...prev,
                        esMilitar: val,
                        ...(val !== "true" ? { condicionMilitar: "", gradoMilitar: "", jornada: "" } : {}),
                      };
                      if (mode === "create-no-save") {
                        try {
                          localStorage.setItem(PENDING_KEY, JSON.stringify(next));
                        } catch (_) {}
                        onDataChange?.(next);
                      }
                      return next;
                    });
                    setSaved(false);
                    scheduleAutoSave();
                  }}
                >
                  <option value="">Civil</option>
                  <option value="true">Militar</option>
                </select>
              </div>
            </div>

            {/* Fila 3: Condición | Grado | Componente — solo si es Militar */}
            {data.esMilitar === "true" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label htmlFor="sc-condicion-militar" className={labelClass}>
                    Condición militar
                  </label>
                  <select
                    id="sc-condicion-militar"
                    disabled={!isEditable}
                    className={fc(isEditable)}
                    value={data.condicionMilitar}
                    onChange={(e) => update("condicionMilitar", e.target.value)}
                  >
                    <option value="">-- Seleccionar condición --</option>
                    <option value="Militar Activo">Militar Activo</option>
                    <option value="Militar Retirado">Militar Retirado</option>
                    <option value="Familiar Militar">Familiar Militar</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sc-grado" className={labelClass}>
                    Grado militar
                  </label>
                  <input
                    id="sc-grado"
                    disabled={!isEditable}
                    autoCapitalize="words"
                    className={fc(isEditable)}
                    placeholder="Ej: Teniente, Sargento..."
                    value={data.gradoMilitar}
                    onChange={(e) => update("gradoMilitar", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="sc-jornada" className={labelClass}>
                    Componente
                  </label>
                  <select
                    id="sc-jornada"
                    disabled={!isEditable}
                    className={fc(isEditable)}
                    value={data.jornada}
                    onChange={(e) => update("jornada", e.target.value)}
                  >
                    <option value="">-- Seleccionar componente --</option>
                    <option value="Ejército Nacional Bolivariano">Ejército Nacional Bolivariano</option>
                    <option value="Armada Bolivariana de Venezuela">Armada Bolivariana de Venezuela</option>
                    <option value="Aviación Militar Bolivariana">Aviación Militar Bolivariana</option>
                    <option value="Guardia Nacional Bolivariana">Guardia Nacional Bolivariana</option>
                    <option value="Milicia Nacional Bolivariana">Milicia Nacional Bolivariana</option>
                  </select>
                </div>
              </div>
            )}

            {/* Unidad / Dependencia */}
            <div>
              <label htmlFor="sc-unidad" className={labelClass}>
                Unidad / Dependencia
              </label>
              <input
                id="sc-unidad"
                disabled={!isEditable}
                autoCapitalize="sentences"
                className={fc(isEditable)}
                placeholder="Nombre de la unidad o dependencia"
                value={data.unidadDependencia}
                onChange={(e) => update("unidadDependencia", e.target.value)}
              />
            </div>

            {/* Teléfono 1 | Teléfono 2 */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label htmlFor="sc-telefono" className={labelClass}>
                  Teléfono
                </label>
                <input
                  id="sc-telefono"
                  disabled={!isEditable}
                  className={fc(isEditable)}
                  placeholder="0424-000.00.00"
                  value={data.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sc-telefono2" className={labelClass}>
                  Teléfono 2 <span className="text-custom-text-400">(opcional)</span>
                </label>
                <input
                  id="sc-telefono2"
                  disabled={!isEditable}
                  className={fc(isEditable)}
                  placeholder="0414-000.00.00"
                  value={data.telefono2}
                  onChange={(e) => update("telefono2", e.target.value)}
                />
              </div>
            </div>

            {/* Fila 5: Dirección (fila completa) */}
            <div>
              <label htmlFor="sc-direccion" className={labelClass}>
                Dirección de habitación
              </label>
              <input
                id="sc-direccion"
                disabled={!isEditable}
                autoCapitalize="sentences"
                className={fc(isEditable)}
                placeholder="Barrio, sector, calle..."
                value={data.direccion}
                onChange={(e) => update("direccion", e.target.value)}
              />
            </div>

            {/* Fila 6: Parroquia | Municipio | Estado */}
            <div className="grid grid-cols-3 gap-x-6">
              <div>
                <label htmlFor="sc-parroquia" className={labelClass}>
                  Parroquia
                </label>
                <input
                  id="sc-parroquia"
                  disabled={!isEditable}
                  autoCapitalize="sentences"
                  className={fc(isEditable)}
                  placeholder="Parroquia"
                  value={data.parroquia}
                  onChange={(e) => update("parroquia", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sc-municipio" className={labelClass}>
                  Municipio
                </label>
                <input
                  id="sc-municipio"
                  disabled={!isEditable}
                  autoCapitalize="sentences"
                  className={fc(isEditable)}
                  placeholder="Municipio"
                  value={data.municipio}
                  onChange={(e) => update("municipio", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sc-entidad" className={labelClass}>
                  Estado
                </label>
                <select
                  id="sc-entidad"
                  disabled={!isEditable}
                  className={fc(isEditable)}
                  value={data.entidad}
                  onChange={(e) => update("entidad", e.target.value)}
                >
                  <option value="">-- Seleccionar estado --</option>
                  {VENEZUELA_ESTADOS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Solicitud (fila completa, auto-resize) */}
            <div>
              <label htmlFor="sc-referencia" className={labelClass}>
                Solicitud
              </label>
              <textarea
                id="sc-referencia"
                disabled={!isEditable}
                autoCapitalize="sentences"
                rows={3}
                className={cn(fc(isEditable), "min-h-[64px] resize-none overflow-hidden leading-relaxed")}
                placeholder="Describe por qué llegó el caso y qué solicitó el ciudadano..."
                value={data.referencia}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                onChange={(e) => {
                  update("referencia", e.target.value);
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
            </div>

            {/* Descripcion del caso (fila completa, auto-resize) */}
            <div>
              <label htmlFor="sc-descripcion-caso" className={labelClass}>
                Descripción del caso
              </label>
              <textarea
                id="sc-descripcion-caso"
                disabled={!isEditable}
                autoCapitalize="sentences"
                rows={3}
                className={cn(fc(isEditable), "min-h-[64px] resize-none overflow-hidden leading-relaxed")}
                placeholder="Describe el contexto y los detalles principales del caso..."
                value={data.descripcionCaso}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                onChange={(e) => {
                  update("descripcionCaso", e.target.value);
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
            </div>
          </div>

          {/* SECCION 2: EN PROCESO */}
          {showFullSeguimiento && (
            <div className="space-y-3">
              <span className={sectionHeadClass}>En proceso</span>
              {!isArticulacion && !isClosed && (
                <InstitucionSelect
                  id="sc-institucion-proceso"
                  disabled={!isEditable}
                  className={fc(isEditable)}
                  value={data.institucionContactada}
                  onChange={(value) => update("institucionContactada", value)}
                />
              )}
              <div>
                <label htmlFor="sc-accion" className={labelClass}>
                  Acción tomada
                </label>
                <textarea
                  id="sc-accion"
                  disabled={!isEditable}
                  autoCapitalize="sentences"
                  className={cn(fc(isEditable), "min-h-[64px] resize-y leading-relaxed")}
                  placeholder="Describe qué se hizo para atender el caso..."
                  value={data.accionTomada}
                  onChange={(e) => update("accionTomada", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sc-resultado" className={labelClass}>
                  Resultado / Beneficio otorgado
                </label>
                <textarea
                  id="sc-resultado"
                  disabled={!isEditable}
                  autoCapitalize="sentences"
                  className={cn(fc(isEditable), "min-h-[52px] resize-y leading-relaxed")}
                  placeholder="Qué se otorgó o por qué no se pudo resolver..."
                  value={data.resultado}
                  onChange={(e) => update("resultado", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SECCION 4: CIERRE DEL CASO — visible en articulación (editable) o resuelto (lectura) */}
          {(isClosed || isArticulacion) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={sectionHeadClass}>
                  {isArticulacion && !isClosed ? "Articulación del caso" : "Cierre del caso"}
                </span>
                {isArticulacion && !isClosed && (
                  <span className="text-xs text-custom-text-400">
                    {effectiveArticulacionRequired.filter((k: keyof SocialCaseData) => data[k]?.trim()).length}/
                    {effectiveArticulacionRequired.length} campos
                  </span>
                )}
              </div>
              <InstitucionSelect
                id="sc-institucion"
                disabled={!isEditable}
                className={fc(isEditable)}
                value={data.institucionContactada}
                onChange={(value) => update("institucionContactada", value)}
              />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {!isArticulacion && (
                  <div>
                    <label htmlFor="sc-fecha-cierre" className={labelClass}>
                      Fecha de cierre
                    </label>
                    <input
                      id="sc-fecha-cierre"
                      type="date"
                      disabled={!isEditable}
                      className={fc(isEditable)}
                      value={data.fechaCierre}
                      onChange={(e) => update("fechaCierre", e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="sc-obs-cierre" className={labelClass}>
                  Observación de cierre
                </label>
                <textarea
                  id="sc-obs-cierre"
                  disabled={!isEditable}
                  autoCapitalize="sentences"
                  className={cn(fc(isEditable), "min-h-[56px] resize-y leading-relaxed")}
                  placeholder="Notas adicionales sobre el cierre del caso..."
                  value={data.observacionCierre}
                  onChange={(e) => update("observacionCierre", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* BARRA DE NAVEGACIÓN — unificada al final del formulario */}
          {mode === "view" && (
            <div className="border-custom-border-100 space-y-3 border-t pt-3">
              <div className="flex items-center justify-between gap-2">
                {/* Izquierda: retroceder / reabrir */}
                <div className="flex items-center gap-2">
                  {isEnProceso && !isArticulacion && !isClosed && onRetreat && (
                    <Button type="button" variant="tertiary" size="sm" onClick={() => onRetreat()}>
                      ← Recibidos
                    </Button>
                  )}
                  {isArticulacion && !isClosed && onRetreat && (
                    <Button type="button" variant="tertiary" size="sm" onClick={() => onRetreat()}>
                      ← Proceso
                    </Button>
                  )}
                  {(isClosed || isSinResolucion) && onReabrir && (
                    <Button type="button" variant="tertiary" size="sm" onClick={() => onReabrir()}>
                      Reabrir caso
                    </Button>
                  )}
                  {!isRecibido && !isEnProceso && !isArticulacion && !isClosed && !isSinResolucion && editing && (
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      onClick={() => {
                        setData(savedData.current);
                        setEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                {/* Derecha: guardar / avanzar */}
                <div className="flex items-center gap-2">
                  {/* Estado: Recibido */}
                  {isRecibido && (
                    <>
                      {!recibidoComplete && (
                        <span className="text-xs text-custom-text-400">
                          Falta:{" "}
                          {effectiveRecibidoRequired
                            .filter(({ key }) => !data[key]?.trim())
                            .map(({ label }) => label)
                            .join(", ")}
                        </span>
                      )}
                      {onSinResolucion && (
                        <Button type="button" variant="error-outline" size="sm" onClick={() => onSinResolucion()}>
                          Sin resolución
                        </Button>
                      )}
                      {onAdvance && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          loading={saving}
                          disabled={!recibidoComplete}
                          onClick={() => saveAndAdvance(onAdvance)}
                        >
                          Iniciar proceso →
                        </Button>
                      )}
                    </>
                  )}

                  {/* Estado: En proceso */}
                  {isEnProceso && !isArticulacion && !isClosed && (
                    <>
                      {onSinResolucion && (
                        <Button type="button" variant="error-outline" size="sm" onClick={() => onSinResolucion()}>
                          Sin resolución
                        </Button>
                      )}
                      <Button type="button" variant="secondary" size="sm" loading={saving} onClick={save}>
                        {saved ? "Guardado" : "Guardar"}
                      </Button>
                      {onAdvance && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          loading={saving}
                          disabled={!procesoComplete}
                          onClick={() => saveAndAdvance(onAdvance)}
                        >
                          Articulación →
                        </Button>
                      )}
                    </>
                  )}

                  {/* Estado: Articulación */}
                  {isArticulacion && !isClosed && (
                    <>
                      {!articulacionComplete && (
                        <span className="text-xs text-custom-text-400">Completa los campos requeridos</span>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={saving}
                        disabled={!articulacionComplete}
                        onClick={saveAndComplete}
                      >
                        Resolver caso
                      </Button>
                    </>
                  )}

                  {/* Fallback: estado no reconocido — botones de edición manual */}
                  {!isRecibido && !isEnProceso && !isArticulacion && !isClosed && !isSinResolucion && (
                    <>
                      {!editing && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            savedData.current = data;
                            setEditing(true);
                          }}
                        >
                          Editar ficha
                        </Button>
                      )}
                      {editing && (
                        <Button type="button" variant="primary" size="sm" loading={saving} onClick={save}>
                          {saved ? "Guardado" : "Guardar ficha"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialCaseForm;
