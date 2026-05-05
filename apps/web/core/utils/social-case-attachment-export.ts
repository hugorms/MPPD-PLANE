import { getFileURL } from "@plane/utils";
// oxlint-disable-next-line import/default
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export type SocialCaseExportAttachment = {
  name: string;
  isImage: boolean;
  base64?: string;
  sourceName?: string;
  pageNumber?: number;
  pageCount?: number;
  isPdfPage?: boolean;
};

type RawAttachment = {
  attributes?: { name?: string };
  asset_url?: string;
};

export const SOCIAL_CASE_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp"]);
const PDF_EXTS = new Set(["pdf"]);

const getAttachmentExt = (attachment: RawAttachment) => {
  const nameExt = (attachment.attributes?.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  const urlExt = (attachment.asset_url ?? "").split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return nameExt || urlExt;
};

export const isSocialCasePdfAttachment = (attachment: { name?: string; sourceName?: string; isPdfPage?: boolean }) =>
  Boolean(attachment.isPdfPage) ||
  (attachment.name ?? "").split("?")[0].toLowerCase().endsWith(".pdf") ||
  (attachment.sourceName ?? "").split("?")[0].toLowerCase().endsWith(".pdf");

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject(new Error("FileReader error")));
    reader.readAsDataURL(blob);
  });

async function fetchBlob(url: string, credentials: RequestCredentials): Promise<Blob> {
  const res = await fetch(url, { credentials });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = await res.json();
    if (typeof payload?.url === "string") return fetchBlob(payload.url, "omit");
    throw new Error("JSON response without signed URL");
  }

  return res.blob();
}

async function isPdfBlob(blob: Blob): Promise<boolean> {
  const header = await blob.slice(0, 5).text();
  return header === "%PDF-";
}

async function fetchPublicBlob(url: string): Promise<Blob> {
  return fetchBlob(url, "omit");
}

async function fetchAuthedBlob(url: string): Promise<Blob> {
  return fetchBlob(url, "include");
}

async function fetchBlobWithAuth(apiUrl: string): Promise<Blob> {
  if (apiUrl.includes("/api/cedula-photo/")) return fetchAuthedBlob(apiUrl);

  const sep = apiUrl.includes("?") ? "&" : "?";
  try {
    return await fetchBlob(`${apiUrl}${sep}proxy=1`, "include");
  } catch {
    // Continuar con URL firmada si la ruta no soporta proxy.
  }

  try {
    const jsonRes = await fetch(`${apiUrl}${sep}as_url=1`, { credentials: "include" });
    if (!jsonRes.ok) throw new Error(`HTTP ${jsonRes.status} al obtener URL`);
    const { url } = await jsonRes.json();
    return fetchPublicBlob(url);
  } catch {
    return fetchAuthedBlob(apiUrl);
  }
}

async function fetchPdfBlobWithAuth(apiUrl: string): Promise<Blob> {
  const sep = apiUrl.includes("?") ? "&" : "?";
  try {
    const proxyBlob = await fetchBlob(`${apiUrl}${sep}proxy=1`, "include");
    if (await isPdfBlob(proxyBlob)) return proxyBlob;
  } catch {
    // Continuar con URL firmada.
  }

  const signedBlob = await fetchBlob(`${apiUrl}${sep}as_url=1`, "include");
  if (await isPdfBlob(signedBlob)) return signedBlob;
  throw new Error("El adjunto descargado no es un PDF valido");
}

export async function fetchBase64WithAuth(apiUrl: string): Promise<string> {
  const blob = await fetchBlobWithAuth(apiUrl);
  return blobToBase64(blob);
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs;
}

async function pdfBlobToPageImages(blob: Blob, name: string): Promise<SocialCaseExportAttachment[]> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await blob.arrayBuffer());
  const pdfDoc = await pdfjs.getDocument({ data }).promise;
  const pages: SocialCaseExportAttachment[] = [];

  // Renderizar secuencialmente evita crear muchos canvas grandes al exportar PDFs pesados.
  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    // oxlint-disable-next-line no-await-in-loop
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.7 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) continue;

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    // oxlint-disable-next-line no-await-in-loop
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    pages.push({
      name: `${name} - pagina ${pageNumber}`,
      sourceName: name,
      isImage: true,
      base64: canvas.toDataURL("image/jpeg", 0.9),
      isPdfPage: true,
      pageNumber,
      pageCount: pdfDoc.numPages,
    });
  }

  await pdfDoc.destroy();
  return pages;
}

export async function resolveSocialCaseExportAttachment(
  attachment: RawAttachment
): Promise<SocialCaseExportAttachment[]> {
  const name = attachment.attributes?.name ?? "archivo";
  const ext = getAttachmentExt(attachment);
  const assetUrl = attachment.asset_url ?? "";
  const url = getFileURL(assetUrl) ?? assetUrl;
  if (!url) return [{ name, isImage: false }];

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  if (SOCIAL_CASE_IMAGE_EXTS.has(ext)) {
    try {
      const base64 = await fetchBase64WithAuth(fullUrl);
      return [{ name, isImage: true, base64 }];
    } catch {
      return [{ name, isImage: false }];
    }
  }

  if (PDF_EXTS.has(ext)) {
    try {
      const blob = await fetchPdfBlobWithAuth(fullUrl);
      const pages = await pdfBlobToPageImages(blob, name);
      return pages.length > 0 ? pages : [{ name, isImage: false }];
    } catch {
      return [{ name, isImage: false }];
    }
  }

  return [{ name, isImage: false }];
}
