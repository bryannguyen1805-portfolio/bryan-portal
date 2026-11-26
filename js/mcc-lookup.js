// -------------------------------------------------------------
// TRA CỨU MCC ONLINE STB (GOM NHÓM THEO MÃ MCC + TÌM ĐA TỪ KHÓA)
// -------------------------------------------------------------
const BPORTAL_CUSTOM_MCC_KEY = "bportal_custom_mcc_v1";
const expandedMccCodes = new Set();

function normMccText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function getCustomMccRecords() {
  try {
    const raw = localStorage.getItem(BPORTAL_CUSTOM_MCC_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function getAllMccRecords() {
  const base = (typeof STB_MCC_RECORDS !== "undefined" && Array.isArray(STB_MCC_RECORDS)) ? STB_MCC_RECORDS : [];
  return [...getCustomMccRecords(), ...base];
}

function searchStbMccGroups(query, sectorFilter = "ALL") {
  const qNorm = normMccText(query);
  const tokens = qNorm ? qNorm.split(/\s+/).filter(Boolean) : [];
  const records = getAllMccRecords();
  const groupMap = new Map();

  for (const r of records) {
    if (sectorFilter && sectorFilter !== "ALL" && r.s !== sectorFilter) continue;

    const dNorm = normMccText(r.d);
    const sNorm = normMccText(r.s);
    const cNorm = normMccText(r.c);
    const mNorm = normMccText(r.m);
    const coNorm = normMccText(r.co);
    const combined = `${cNorm} ${mNorm} ${sNorm} ${dNorm} ${coNorm}`;

    if (tokens.length > 0 && !tokens.every(t => combined.includes(t))) {
      continue;
    }

    let score = 1;
    if (tokens.length > 0) {
      if (dNorm.includes(qNorm)) score += 60;
      else if (tokens.every(t => dNorm.includes(t))) score += 35;
      if (cNorm === qNorm || cNorm.includes(qNorm)) score += 50;
      if (mNorm.includes(qNorm) || tokens.every(t => mNorm.includes(t))) score += 25;
      if (sNorm.includes(qNorm)) score += 12;
      if (coNorm.includes(qNorm)) score += 8;
    }

    let grp = groupMap.get(r.c);
    if (!grp) {
      grp = {
        code: r.c,
        mccName: r.m || "",
        maxScore: score,
        items: []
      };
      groupMap.set(r.c, grp);
    }
    if ((r.m || "").length > grp.mccName.length) {
      grp.mccName = r.m;
    }
    if (score > grp.maxScore) grp.maxScore = score;
    grp.items.push({ ...r, _score: score });
  }

  const groups = Array.from(groupMap.values());
  groups.forEach(g => {
    g.items.sort((a, b) => b._score - a._score);
  });
  groups.sort((a, b) => {
    if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
    return b.items.length - a.items.length;
  });
  return groups;
}

function populateMccSectorFilter() {
  const sel = document.getElementById("mcc-sector-filter");
  if (!sel || sel.options.length > 1) return;
  const sectors = Array.from(new Set(getAllMccRecords().map(r => r.s).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
  sectors.forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = sec;
    sel.appendChild(opt);
  });
}

function copyMccValue(text) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  if (typeof showToast === "function") {
    showToast(`✓ Đã sao chép: ${text}`);
  }
}

function quickSearchMccKeyword(kw) {
  const inp = document.getElementById("mcc-search-input");
  if (inp) {
    inp.value = kw;
    inp.focus();
  }
  renderMccLookupView();
}

function toggleMccGroupExpand(code) {
  if (expandedMccCodes.has(code)) expandedMccCodes.delete(code);
  else expandedMccCodes.add(code);
  renderMccLookupView();
}

function toggleAddMccForm() {
  const form = document.getElementById("mcc-add-form");
  if (!form) return;
  form.classList.toggle("hidden");
  if (!form.classList.contains("hidden")) {
    document.getElementById("mcc-new-code")?.focus();
  }
}

function handleSaveCustomMcc(e) {
  e.preventDefault();
  const code = (document.getElementById("mcc-new-code")?.value || "").replace(/\D/g, "").slice(0, 4);
  const mccName = (document.getElementById("mcc-new-name")?.value || "").trim();
  const company = (document.getElementById("mcc-new-company")?.value || "").trim();
  const sector = (document.getElementById("mcc-new-sector")?.value || "").trim() || "Khác";
  const desc = (document.getElementById("mcc-new-desc")?.value || "").trim();
  if (!code || code.length !== 4 || !desc) {
    if (typeof showToast === "function") showToast("Vui lòng nhập đủ mã MCC 4 số và mô tả dịch vụ.");
    return;
  }

  const list = getCustomMccRecords();
  list.unshift({ c: code, m: mccName || "MCC Bổ Sung", co: company || "Đối tác nội bộ", s: sector, d: desc, custom: true });
  localStorage.setItem(BPORTAL_CUSTOM_MCC_KEY, JSON.stringify(list));

  ["mcc-new-code", "mcc-new-name", "mcc-new-company", "mcc-new-desc"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("mcc-add-form")?.classList.add("hidden");
  renderMccLookupView();
  if (typeof showToast === "function") showToast(`✓ Đã thêm MCC ${code} vào bộ tra cứu!`);
}

function escapeMccHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderMccLookupView() {
  populateMccSectorFilter();
  const container = document.getElementById("mcc-results-container");
  const statsEl = document.getElementById("mcc-stats-label");
  if (!container) return;

  const query = document.getElementById("mcc-search-input")?.value || "";
  const sector = document.getElementById("mcc-sector-filter")?.value || "ALL";
  const groups = searchStbMccGroups(query, sector);
  const totalMatches = groups.reduce((acc, g) => acc + g.items.length, 0);

  if (statsEl) {
    statsEl.textContent = `${groups.length} mã MCC • ${totalMatches} hồ sơ đối tác khớp`;
  }

  if (groups.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
        <div class="text-sm font-bold text-slate-800">Không tìm thấy mã MCC phù hợp</div>
        <div class="text-xs text-slate-500">Thử gõ từ khóa ngắn hơn (ví dụ: <strong>dụng cụ</strong>, <strong>mỹ phẩm</strong>, <strong>du lịch</strong>, hoặc mã 4 số).</div>
      </div>
    `;
    return;
  }

  const showLimit = query.trim() ? 30 : 18;
  const visibleGroups = groups.slice(0, showLimit);

  container.innerHTML = visibleGroups.map(grp => {
    const fullMcc = grp.mccName ? `${grp.code}-${grp.mccName}` : grp.code;
    const isExpanded = expandedMccCodes.has(grp.code);
    const previewLimit = isExpanded ? grp.items.length : 3;
    const shownItems = grp.items.slice(0, previewLimit);
    const hiddenCount = grp.items.length - shownItems.length;

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-mono font-black text-xs tracking-wide shrink-0">${escapeMccHtml(grp.code)}</span>
              <span class="text-sm font-black text-slate-900 truncate">${escapeMccHtml(grp.mccName || "Mã MCC STB")}</span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">${grp.items.length} đối tác</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" onclick="copyMccValue('${escapeMccHtml(grp.code)}')" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition whitespace-nowrap">Copy mã</button>
            <button type="button" onclick="copyMccValue('${escapeMccHtml(fullMcc.replace(/'/g, "\\'"))}')" class="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold transition whitespace-nowrap">Copy đầy đủ</button>
          </div>
        </div>

        <div class="space-y-1.5">
          ${shownItems.map(it => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <div class="min-w-0">
                <div class="font-bold text-slate-800 truncate">${escapeMccHtml(it.co)}</div>
                <div class="text-[11px] text-slate-500 mt-0.5">${escapeMccHtml(it.d || "Chưa có mô tả chi tiết")}</div>
              </div>
              <span class="self-start sm:self-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shrink-0">${escapeMccHtml(it.s)}</span>
            </div>
          `).join("")}
        </div>

        ${hiddenCount > 0 || (isExpanded && grp.items.length > 3) ? `
          <div class="pt-0.5">
            <button type="button" onclick="toggleMccGroupExpand('${escapeMccHtml(grp.code)}')" class="text-[11px] font-bold text-teal-700 hover:underline">
              ${isExpanded ? "Thu gọn danh sách đối tác ↑" : `Xem thêm ${hiddenCount} đối tác cùng mã ${grp.code} ↓`}
            </button>
          </div>
        ` : ""}
      </div>
    `;
  }).join("") + (groups.length > showLimit ? `<div class="text-center text-xs text-slate-400 py-2">Đang hiện ${showLimit}/${groups.length} mã MCC phù hợp nhất — gõ thêm từ khóa mô tả để lọc hẹp hơn.</div>` : "");
}
