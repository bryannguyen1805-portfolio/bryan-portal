// -------------------------------------------------------------
// 14. TIỆN ÍCH FILE & LOGO (100% CLIENT-SIDE: NÉN PDF • NÉN ẢNH • VECTOR LOGO .AI/.SVG)
// -------------------------------------------------------------
let activeFileToolTab = "PDF"; // PDF | IMAGE | VECTOR
let pdfCompressionPreset = "BALANCED"; // MAX | BALANCED | HIGH
let compressedPdfResults = [];
let compressedImageResults = [];
let currentVectorSourceImg = null;
let currentVectorFileName = "logo";
let currentVectorSvgString = "";

const FILE_TOOLS_CDN = {
  pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  pdfjsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  pdflib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  imagetracer: "https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js"
};

function loadExternalScriptOnce(src, globalCheck) {
  return new Promise((resolve, reject) => {
    if (globalCheck()) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[data-ft-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Không thể tải thư viện: " + src)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.setAttribute("data-ft-src", src);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Không thể tải thư viện: " + src));
    document.head.appendChild(s);
  });
}

async function ensurePdfLibsLoaded() {
  await Promise.all([
    loadExternalScriptOnce(FILE_TOOLS_CDN.pdfjs, () => typeof window.pdfjsLib !== "undefined"),
    loadExternalScriptOnce(FILE_TOOLS_CDN.pdflib, () => typeof window.PDFLib !== "undefined")
  ]);
  if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = FILE_TOOLS_CDN.pdfjsWorker;
  }
}

async function ensureVectorLibsLoaded() {
  await Promise.all([
    loadExternalScriptOnce(FILE_TOOLS_CDN.imagetracer, () => typeof window.ImageTracer !== "undefined"),
    loadExternalScriptOnce(FILE_TOOLS_CDN.pdflib, () => typeof window.PDFLib !== "undefined")
  ]);
}

function formatFileBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function calcSavedPercent(orig, next) {
  if (!orig || orig <= 0) return 0;
  return Math.max(0, Math.round(((orig - next) / orig) * 100));
}

function switchFileToolTab(tab) {
  activeFileToolTab = tab;
  ["PDF", "IMAGE", "VECTOR"].forEach(t => {
    const btn = document.getElementById(`ft-tab-${t}`);
    const panel = document.getElementById(`ft-panel-${t}`);
    if (btn) {
      btn.className = t === tab
        ? "px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white shadow-xs transition"
        : "px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
    }
    if (panel) panel.classList.toggle("hidden", t !== tab);
  });
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function setPdfCompressionPreset(preset) {
  pdfCompressionPreset = preset;
  ["MAX", "BALANCED", "HIGH"].forEach(p => {
    const btn = document.getElementById(`ft-pdf-preset-${p}`);
    if (!btn) return;
    btn.className = p === preset
      ? "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs transition"
      : "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
  });
}

// ---------------- 1. NÉN FILE PDF ----------------
async function handlePdfFilesSelected(fileList) {
  const files = Array.from(fileList || []).filter(f => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
  if (files.length === 0) {
    showToast("Vui lòng chọn file định dạng .pdf", true);
    return;
  }

  const statusEl = document.getElementById("ft-pdf-status");
  const listEl = document.getElementById("ft-pdf-results");
  if (statusEl) {
    statusEl.classList.remove("hidden");
    statusEl.textContent = "Đang tải bộ xử lý PDF...";
  }

  try {
    await ensurePdfLibsLoaded();
  } catch (err) {
    if (statusEl) statusEl.textContent = "Lỗi tải thư viện PDF. Kiểm tra kết nối mạng và thử lại.";
    showToast(err.message, true);
    return;
  }

  const presetMap = {
    MAX: { scale: 100 / 72, quality: 0.60, label: "Tối đa" },
    BALANCED: { scale: 140 / 72, quality: 0.75, label: "Cân bằng" },
    HIGH: { scale: 180 / 72, quality: 0.85, label: "Rõ nét" }
  };
  const cfg = presetMap[pdfCompressionPreset] || presetMap.BALANCED;

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    try {
      const arrayBuf = await file.arrayBuffer();
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const outPdf = await window.PDFLib.PDFDocument.create();
      const numPages = pdfDoc.numPages;

      for (let p = 1; p <= numPages; p++) {
        if (statusEl) statusEl.textContent = `Đang nén "${file.name}" — Trang ${p}/${numPages}...`;
        const page = await pdfDoc.getPage(p);
        const origViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: cfg.scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        const jpgDataUrl = canvas.toDataURL("image/jpeg", cfg.quality);
        const jpgBytes = await fetch(jpgDataUrl).then(r => r.arrayBuffer());
        const jpgEmbed = await outPdf.embedJpg(jpgBytes);

        const outPage = outPdf.addPage([origViewport.width, origViewport.height]);
        outPage.drawImage(jpgEmbed, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height
        });
      }

      const outBytes = await outPdf.save({ useObjectStreams: true });
      const compressedBlob = new Blob([outBytes], { type: "application/pdf" });
      const isAlreadyOptimal = compressedBlob.size >= file.size;
      const finalBlob = isAlreadyOptimal ? file : compressedBlob;
      const url = URL.createObjectURL(finalBlob);
      const outName = isAlreadyOptimal ? file.name : file.name.replace(/\.pdf$/i, "") + "_compressed.pdf";

      compressedPdfResults.unshift({
        id: "pdf-" + Date.now() + "-" + idx,
        origName: file.name,
        outName,
        origSize: file.size,
        newSize: finalBlob.size,
        pages: numPages,
        presetLabel: cfg.label,
        alreadyOptimal: isAlreadyOptimal,
        url
      });
    } catch (err) {
      showToast(`Không thể nén "${file.name}": ${err.message}`, true);
    }
  }

  if (statusEl) statusEl.classList.add("hidden");
  renderCompressedPdfResults();
  if (listEl) showToast("✓ Đã nén xong file PDF!");
}

function renderCompressedPdfResults() {
  const listEl = document.getElementById("ft-pdf-results");
  if (!listEl) return;
  if (compressedPdfResults.length === 0) {
    listEl.innerHTML = "";
    return;
  }
  listEl.innerHTML = compressedPdfResults.map(r => {
    const saved = calcSavedPercent(r.origSize, r.newSize);
    const badgeHtml = r.alreadyOptimal
      ? `<span class="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Đã tối ưu sẵn • Giữ bản gốc</span>`
      : `<span class="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">-${saved}%</span>`;
    return `
      <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="min-w-0 space-y-0.5">
          <div class="text-xs font-bold text-slate-900 truncate">${r.outName}</div>
          <div class="text-[11px] text-slate-500">
            ${r.pages} trang • Mức ${r.presetLabel} •
            ${r.alreadyOptimal
              ? `<strong class="text-slate-700">${formatFileBytes(r.origSize)}</strong>`
              : `<span class="line-through text-slate-400">${formatFileBytes(r.origSize)}</span> → <strong class="text-teal-700">${formatFileBytes(r.newSize)}</strong>`
            }
            ${badgeHtml}
          </div>
        </div>
        <a href="${r.url}" download="${r.outName}" class="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 text-center transition">Tải xuống PDF</a>
      </div>
    `;
  }).join("");
}

// ---------------- 2. NÉN ẢNH HÀNG LOẠT ----------------
async function handleImageCompressSelected(fileList) {
  const files = Array.from(fileList || []).filter(f => /^image\/(jpeg|jpg|png|webp)$/i.test(f.type));
  if (files.length === 0) {
    showToast("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP.", true);
    return;
  }

  const quality = parseFloat(document.getElementById("ft-img-quality")?.value || "0.75");
  const maxWidth = parseInt(document.getElementById("ft-img-maxw")?.value || "1600", 10);
  const outFormat = document.getElementById("ft-img-format")?.value || "KEEP";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const img = await loadImageFromFile(file);
      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;
      if (maxWidth > 0 && targetW > maxWidth) {
        const ratio = maxWidth / targetW;
        targetW = maxWidth;
        targetH = Math.round(targetH * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      let mime = outFormat === "KEEP" ? file.type : outFormat;
      if (mime === "image/png" && outFormat === "KEEP") {
        // Nếu người dùng giữ PNG và muốn nén dung lượng, dùng WebP/JPEG hoặc scale kích thước
        mime = "image/jpeg";
      }
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, quality));
      if (!blob) continue;

      const isAlreadyOptimal = outFormat === "KEEP" && blob.size >= file.size;
      const finalBlob = isAlreadyOptimal ? file : blob;
      const ext = mime === "image/webp" ? "webp" : (mime === "image/png" ? "png" : "jpg");
      const outName = isAlreadyOptimal ? file.name : file.name.replace(/\.[^.]+$/, "") + `_compressed.${ext}`;
      const url = URL.createObjectURL(finalBlob);

      compressedImageResults.unshift({
        id: "img-" + Date.now() + "-" + i,
        origName: file.name,
        outName,
        origSize: file.size,
        newSize: finalBlob.size,
        dims: `${targetW}×${targetH}`,
        alreadyOptimal: isAlreadyOptimal,
        url
      });
    } catch (err) {
      showToast(`Lỗi nén ảnh "${file.name}": ${err.message}`, true);
    }
  }

  renderCompressedImageResults();
  showToast(`✓ Đã nén xong ${files.length} ảnh!`);
}

function renderCompressedImageResults() {
  const listEl = document.getElementById("ft-img-results");
  if (!listEl) return;
  if (compressedImageResults.length === 0) {
    listEl.innerHTML = "";
    return;
  }
  listEl.innerHTML = compressedImageResults.map(r => {
    const saved = calcSavedPercent(r.origSize, r.newSize);
    return `
      <div class="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${r.url}" alt="${r.outName}" class="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white shrink-0" />
          <div class="min-w-0 space-y-0.5">
            <div class="text-xs font-bold text-slate-900 truncate">${r.outName}</div>
            <div class="text-[11px] text-slate-500">
              ${r.dims} • <span class="line-through text-slate-400">${formatFileBytes(r.origSize)}</span> →
              <strong class="text-teal-700">${formatFileBytes(r.newSize)}</strong>
              <span class="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">-${saved}%</span>
            </div>
          </div>
        </div>
        <a href="${r.url}" download="${r.outName}" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 transition">Tải ảnh</a>
      </div>
    `;
  }).join("");
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được file ảnh."));
    };
    img.src = url;
  });
}

// ---------------- 3. VECTOR HÓA LOGO (PNG/JPG -> .SVG & .AI) ----------------
async function handleLogoVectorSelected(fileList) {
  const file = Array.from(fileList || [])[0];
  if (!file || !/^image\//i.test(file.type)) {
    showToast("Vui lòng chọn file ảnh Logo (PNG, JPG, WebP).", true);
    return;
  }

  const statusEl = document.getElementById("ft-vec-status");
  if (statusEl) {
    statusEl.classList.remove("hidden");
    statusEl.textContent = "Đang tải bộ Vector hóa Logo...";
  }

  try {
    await ensureVectorLibsLoaded();
    currentVectorSourceImg = await loadImageFromFile(file);
    currentVectorFileName = file.name.replace(/\.[^.]+$/, "") || "logo";
    document.getElementById("ft-vec-workspace")?.classList.remove("hidden");
    retraceLogoVector();
  } catch (err) {
    showToast("Lỗi xử lý Logo: " + err.message, true);
  } finally {
    if (statusEl) statusEl.classList.add("hidden");
  }
}

function toggleVectorPreviewBg() {
  const isDark = !!document.getElementById("ft-vec-dark-bg")?.checked;
  ["ft-vec-orig-box", "ft-vec-svg-preview"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("bg-slate-900", isDark);
    el.classList.toggle("bg-white", !isDark);
  });
}

function retraceLogoVector() {
  if (!currentVectorSourceImg || typeof window.ImageTracer === "undefined") return;

  const mode = document.getElementById("ft-vec-mode")?.value || "TRACE";
  const colorsCount = parseInt(document.getElementById("ft-vec-colors")?.value || "32", 10);
  const smoothLevel = parseFloat(document.getElementById("ft-vec-smooth")?.value || "0.8");
  const stripWhite = !!document.getElementById("ft-vec-strip-white")?.checked;

  toggleVectorPreviewBg();

  const maxDim = mode === "EXACT" ? 1600 : 1024;
  let w = currentVectorSourceImg.naturalWidth;
  let h = currentVectorSourceImg.naturalHeight;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(currentVectorSourceImg, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  if (stripWhite) {
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) {
        d[i + 3] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const origDataUrl = canvas.toDataURL("image/png");
  const origPreview = document.getElementById("ft-vec-orig-preview");
  if (origPreview) origPreview.src = origDataUrl;

  if (mode === "EXACT") {
    currentVectorSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><image href="${origDataUrl}" width="${w}" height="${h}" /></svg>`;
    const svgPreview = document.getElementById("ft-vec-svg-preview");
    if (svgPreview) {
      svgPreview.innerHTML = `<img src="${origDataUrl}" class="max-h-full max-w-full object-contain" alt="Logo giữ nguyên gradient" />`;
    }
    return;
  }

  const svgStr = window.ImageTracer.imagedataToSVG(imgData, {
    numberofcolors: colorsCount,
    ltres: smoothLevel,
    qtres: smoothLevel,
    pathomit: 20,
    blurradius: 1.5,
    blurdelta: 20,
    strokewidth: 0,
    roundcoords: 1,
    viewbox: true,
    colorquantcycles: 4
  });
  currentVectorSvgString = svgStr;

  const svgPreview = document.getElementById("ft-vec-svg-preview");
  if (svgPreview) {
    svgPreview.innerHTML = svgStr;
    const svgEl = svgPreview.querySelector("svg");
    if (svgEl) {
      svgEl.style.width = "100%";
      svgEl.style.height = "100%";
      svgEl.style.maxHeight = "200px";
    }
  }
}

function downloadVectorSvg() {
  if (!currentVectorSvgString) return;
  const blob = new Blob([currentVectorSvgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentVectorFileName}_vector.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("✓ Đã tải file Vector .SVG!");
}

async function downloadVectorAi() {
  if (!currentVectorSvgString) return;
  try {
    await ensureVectorLibsLoaded();
    const mode = document.getElementById("ft-vec-mode")?.value || "TRACE";

    if (mode === "EXACT" && currentVectorSourceImg) {
      const pdfDoc = await window.PDFLib.PDFDocument.create();
      pdfDoc.setTitle(`${currentVectorFileName} (AI High-Res)`);
      pdfDoc.setCreator("Bryan Portal");
      const w = currentVectorSourceImg.naturalWidth || 800;
      const h = currentVectorSourceImg.naturalHeight || 800;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(currentVectorSourceImg, 0, 0, w, h);
      const pngBytes = await fetch(c.toDataURL("image/png")).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([w, h]);
      page.drawImage(imgEmbed, { x: 0, y: 0, width: w, height: h });
      const aiBytes = await pdfDoc.save();
      const blob = new Blob([aiBytes], { type: "application/postscript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentVectorFileName}.ai`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("✓ Đã xuất file .AI giữ nguyên 100% Gradient gốc!");
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(currentVectorSvgString, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) throw new Error("Không đọc được dữ liệu Vector.");

    const vb = (svgEl.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
    const width = (vb.length === 4 && vb[2] > 0) ? vb[2] : (parseFloat(svgEl.getAttribute("width")) || 500);
    const height = (vb.length === 4 && vb[3] > 0) ? vb[3] : (parseFloat(svgEl.getAttribute("height")) || 500);

    const pdfDoc = await window.PDFLib.PDFDocument.create();
    pdfDoc.setTitle(`${currentVectorFileName} (Vector AI)`);
    pdfDoc.setCreator("Bryan Portal Vectorizer");
    const page = pdfDoc.addPage([width, height]);

    const paths = Array.from(svgEl.querySelectorAll("path"));
    paths.forEach(pEl => {
      const d = pEl.getAttribute("d");
      if (!d) return;
      const fill = (pEl.getAttribute("fill") || "#000000").trim();
      if (fill === "none" || fill === "transparent") return;
      const opacity = parseFloat(pEl.getAttribute("opacity") || "1");
      if (opacity <= 0.01) return;

      const rgbMatch = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
      let color = window.PDFLib.rgb(0, 0, 0);
      if (rgbMatch) {
        color = window.PDFLib.rgb(
          parseInt(rgbMatch[1], 10) / 255,
          parseInt(rgbMatch[2], 10) / 255,
          parseInt(rgbMatch[3], 10) / 255
        );
      } else if (/^#[0-9a-f]{6}$/i.test(fill)) {
        color = window.PDFLib.rgb(
          parseInt(fill.slice(1, 3), 16) / 255,
          parseInt(fill.slice(3, 5), 16) / 255,
          parseInt(fill.slice(5, 7), 16) / 255
        );
      }

      page.drawSvgPath(d, {
        x: 0,
        y: height,
        color,
        opacity
      });
    });

    const aiBytes = await pdfDoc.save();
    const blob = new Blob([aiBytes], { type: "application/postscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentVectorFileName}_vector.ai`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("✓ Đã xuất file Vector .AI (mở trực tiếp bằng Adobe Illustrator)!");
  } catch (err) {
    showToast("Lỗi xuất file .AI: " + err.message, true);
  }
}
