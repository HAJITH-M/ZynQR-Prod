/** @typedef {'png' | 'svg' | 'eps'} QrExportFormat */

/** @param {QrExportFormat | null} format @param {string} [imageSrc] */
export function canDownloadQrExport(format, imageSrc) {
  return Boolean(format && imageSrc?.trim());
}

/** @param {string} [name] */
export function safeDownloadBasename(name) {
  const s = String(name || "qr").replace(/[/\\?%*:|"<>]/g, "-").trim();
  return s.slice(0, 80) || "qr";
}

/** @param {Blob} blob @param {string} filename */
export function triggerDownloadBlob(blob, filename) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(u);
}

/** @param {Blob} blob */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(/** @type {string} */ (r.result));
    r.onerror = () => reject(new Error("Could not read image"));
    r.readAsDataURL(blob);
  });
}

/** @param {string} url */
export async function fetchImageBlob(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("Could not fetch QR image (check network or CORS).");
  return res.blob();
}

/** @param {string} url */
export async function buildSvgWrapperFromPngUrl(url) {
  const blob = await fetchImageBlob(url);
  const dataUrl = await blobToDataUrl(blob);
  const burl = URL.createObjectURL(blob);
  try {
    const { width, height } = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      img.onerror = () => reject(new Error("Could not decode image for SVG."));
      img.src = burl;
    });
    const w = width || 256;
    const h = height || 256;
    const safeHref = dataUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" href="${safeHref}"/>
</svg>`;
  } finally {
    URL.revokeObjectURL(burl);
  }
}

/** @param {string} url */
export async function buildEpsFromPngUrl(url) {
  const blob = await fetchImageBlob(url);
  const burl = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image for EPS."));
      el.src = burl;
    });
    /** @type {HTMLImageElement} */
    const image = img;
    const w = image.naturalWidth || image.width;
    const h = image.naturalHeight || image.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, w, h);
    let hex = "";
    for (let i = 0; i < data.length; i += 4) {
      hex += data[i].toString(16).padStart(2, "0");
      hex += data[i + 1].toString(16).padStart(2, "0");
      hex += data[i + 2].toString(16).padStart(2, "0");
    }
    const lines = [];
    for (let i = 0; i < hex.length; i += 128) lines.push(hex.slice(i, i + 128));
    const hexBlock = lines.join("\n");
    return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${w} ${h}
%%HiResBoundingBox: 0 0 ${w} ${h}
%%Creator: ZynQR (client export)
%%EndComments
save
${w} ${h} 8 [${w} 0 0 -${h} 0 ${h}]
{ currentfile 3 string readhexstring pop } bind false 3 colorimage
${hexBlock}
restore
%%EOF
`;
  } finally {
    URL.revokeObjectURL(burl);
  }
}
