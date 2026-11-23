// -------------------------------------------------------------
// BỘ MẪU THƯ ĐIỀU PHỐI TỰ ĐỘNG 1 CHẠM (CHẶNG 3: B9, B10, B12)
// -------------------------------------------------------------

function generatePartnerCodeUpper(brandOrMerchantName) {
  const norm = (brandOrMerchantName || "PARTNER")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
  const compact = norm.replace(/\s+/g, "");
  return (compact || "PARTNER").toUpperCase();
}

function getOnboardingEmailMeta(obRecord) {
  const legalFallback = obRecord?.merchant_name || "Đối Tác Mới";
  const brand = (obRecord?.brand_name || "").trim() || legalFallback;
  const saved = obRecord?.email_meta || {};
  const partnerCode = saved.partnerCode || generatePartnerCodeUpper(brand);
  const defaultLegal = /^công\s*ty/i.test(legalFallback) ? legalFallback : `Công ty Cổ phần ${legalFallback}`;
  return {
    brand,
    legalName: saved.legalName || defaultLegal,
    partnerCode,
    acqBank: saved.acqBank || "Pvcombank / VietinBank",
    posCount: saved.posCount || "10",
    posModel: saved.posModel || "SmartPOS N910",
    solutionName: saved.solutionName || (obRecord?.channel === "POS_PGW" ? "POS & Cổng Thanh Toán (PGW)" : "Paylink & Cổng Thanh Toán"),
    shopIdCount: saved.shopIdCount || "1",
    shopIdList: saved.shopIdList || `${partnerCode}_ONLINE_01`,
    paymentChannel: saved.paymentChannel || "Website / App / Paylink",
    paymentMethods: saved.paymentMethods || "Thẻ Quốc Tế (Visa/Master/JCB), Thẻ Nội Địa (ATM), Ví Payoo, VietQR"
  };
}

function buildStepEmailDraft(obRecord, stepNo) {
  const m = getOnboardingEmailMeta(obRecord);
  const tkpyOffline = `PY7_${m.partnerCode}_POS`;
  const tkpyOnline = `PY7_${m.partnerCode}_PGW`;
  const channelCode = (obRecord?.channel || "POS").trim();

  if (stepNo === 9) {
    return {
      stepNo: 9,
      stepLabel: "Bước B9: Yêu cầu cấp thiết bị SmartPOS (BM_03)",
      to: "ASM Dept <asm.div@vietunion.com.vn>; OP PosHCM <op.poshcm@vietunion.com.vn>; OP PosHN <op.poshn@vietunion.com.vn>",
      cc: "Omni Dept <omni.div@vietunion.com.vn>; Control Fee Group <_ic.fee@vietunion.com.vn>; Technical Terminal Operation <tech.tops@vietunion.com.vn>",
      subject: `[${m.brand}] Yêu cầu cài đặt TK và Lắp đặt TBTT cho PY7_${m.partnerCode}_${channelCode} _ Đợt 1 (MN&MB)`,
      tkpyLabel: `TKPY Offline: ${tkpyOffline}`,
      body: `Dear ASM và T.OP HCM/HN,

KD gửi BM_03 triển khai SmartPOS cho Đối Tác mới ${m.brand}
- TKPY Offline: ${tkpyOffline}
- ACQ Bank: ${m.acqBank}
- Smart POS: ${m.posCount} máy
- Hình ảnh cửa hàng: Tệp Đính kèm
- Ghi chú: có thông số ngân hàng nào thỏa ưu tiên thì cài đặt và giao trước.

Nhờ xin thông số và hỗ trợ cấp máy cho Đối Tác.
Note: ASM xem chi tiết mail [${m.brand}] Request cấu hình đối tác mới

Em cảm ơn.`
    };
  }

  if (stepNo === 10) {
    return {
      stepNo: 10,
      stepLabel: "Bước B10: Request Cấu Hình Mới xin thông số (BM01 & BM01.01)",
      to: "Đội ngũ Kỹ thuật ASM (ASM Team)",
      cc: "Trưởng Bộ Phận (TBP)",
      subject: `[${m.brand}] Request cấu hình đối tác mới`,
      tkpyLabel: `TKPY Offline: ${tkpyOffline}`,
      body: `Dear ASM,

Em gửi BM 01 và BM 01.01 (PDF+Excel) đã được các bộ phận ký nháy, nhờ team xác nhận vào file và xin thông số.

- Đối tác: ${m.legalName}
- TKPY Offline: ${tkpyOffline}
- Giấy phép, chứng từ: đính kèm

Nhờ Team hỗ trợ cấu hình cho Đối Tác.`
    };
  }

  if (stepNo === 12) {
    return {
      stepNo: 12,
      stepLabel: "Bước B12: Yêu cầu Go-live ShopID (Core Team)",
      to: "Đội ngũ Vận hành Core Payments (Core Team)",
      cc: "Trưởng Bộ Phận (TBP); Vận hành Ecom",
      subject: `[Payoo Core] Yêu cầu Go-live ${m.shopIdCount} ShopID ${m.solutionName} - ${m.legalName}`,
      tkpyLabel: `TKPY Online: ${tkpyOnline}`,
      body: `Dear Core Team,

Đối tác mới ${m.legalName} cần golive ${m.shopIdCount} shopID cho ${m.solutionName}:

- TKPY Online: ${tkpyOnline}
- Kênh: ${m.paymentChannel}
- ShopID: ${m.shopIdList}
- Phương thức thanh toán: ${m.paymentMethods}
- Thời gian mong muốn: càng sớm càng tốt

**File đính kèm là logo

- Nhờ kỹ thuật hỗ trợ golive giúp em nhé

Em cảm ơn ạ`
    };
  }

  return null;
}

function ensureOnboardingEmailModal() {
  if (document.getElementById("modal-onboarding-email")) return;
  const div = document.createElement("div");
  div.id = "modal-onboarding-email";
  div.className = "hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
        <div>
          <h3 id="email-modal-title" class="text-sm font-black">Soạn Thư Điều Phối Tự Động</h3>
          <p id="email-modal-tkpy" class="text-[11px] text-teal-300 font-mono mt-0.5"></p>
        </div>
        <button onclick="closeOnboardingEmailModal()" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition">✕</button>
      </div>

      <div class="p-5 space-y-3 overflow-y-auto text-xs">
        <div id="email-var-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Mã đối tác (In hoa)</label>
            <input id="email-var-code" oninput="refreshOnboardingEmailPreview()" type="text" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase outline-none focus:border-teal-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Tên pháp nhân đầy đủ</label>
            <input id="email-var-legal" oninput="refreshOnboardingEmailPreview()" type="text" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-teal-500" />
          </div>
          <div>
            <label id="email-var-extra-label" class="block text-[10px] font-bold text-slate-500 mb-1">Số lượng máy POS / ShopID</label>
            <input id="email-var-extra" oninput="refreshOnboardingEmailPreview()" type="text" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-teal-500" />
          </div>
          <div id="email-var-acq-wrap">
            <label class="block text-[10px] font-bold text-slate-500 mb-1">ACQ Bank</label>
            <input id="email-var-acq" oninput="refreshOnboardingEmailPreview()" type="text" placeholder="VD: Pvcombank / VietinBank" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-teal-500" />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-slate-500 w-16 shrink-0">Người nhận:</span>
            <input id="email-field-to" type="text" class="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none" />
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-slate-500 w-16 shrink-0">Đồng gửi:</span>
            <input id="email-field-cc" type="text" class="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none" />
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-slate-500 w-16 shrink-0">Tiêu đề:</span>
            <input id="email-field-subject" type="text" class="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-teal-500" />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-500 mb-1">Nội dung thư (đã điền sẵn dữ liệu đối tác)</label>
          <textarea id="email-field-body" rows="11" class="w-full p-3 bg-white border border-slate-300 rounded-xl font-sans text-xs leading-relaxed text-slate-800 outline-none focus:border-teal-500"></textarea>
        </div>
      </div>

      <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <button onclick="openEmailInMailApp()" class="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-bold transition">Mở ứng dụng Email</button>
        <div class="flex items-center gap-2">
          <button onclick="copyOnboardingEmailSubject()" class="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition">Sao chép Tiêu đề</button>
          <button onclick="copyOnboardingEmailBody()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition">Sao chép Nội dung thư</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

let activeEmailCtx = { obId: null, stepNo: 9 };

function openOnboardingEmailModal(obId, stepNo) {
  ensureOnboardingEmailModal();
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;
  activeEmailCtx = { obId, stepNo };

  const meta = getOnboardingEmailMeta(ob);
  document.getElementById("email-var-code").value = meta.partnerCode;
  document.getElementById("email-var-legal").value = meta.legalName;
  document.getElementById("email-var-extra-label").textContent = stepNo === 12 ? "Danh sách mã ShopID" : "Số lượng máy POS";
  document.getElementById("email-var-extra").value = stepNo === 12 ? meta.shopIdList : meta.posCount;
  const acqInput = document.getElementById("email-var-acq");
  const acqWrap = document.getElementById("email-var-acq-wrap");
  const varGrid = document.getElementById("email-var-grid");
  if (acqInput) acqInput.value = meta.acqBank;
  if (acqWrap) acqWrap.classList.toggle("hidden", stepNo !== 9);
  if (varGrid) {
    varGrid.className = stepNo === 9
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200"
      : "grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200";
  }

  refreshOnboardingEmailPreview();
  document.getElementById("modal-onboarding-email").classList.remove("hidden");
}

function refreshOnboardingEmailPreview() {
  const ob = onboardingList.find(o => o.id === activeEmailCtx.obId);
  if (!ob) return;
  ob.email_meta = ob.email_meta || {};
  ob.email_meta.partnerCode = (document.getElementById("email-var-code").value || "").toUpperCase().trim() || generatePartnerCodeUpper(ob.brand_name || ob.merchant_name);
  ob.email_meta.legalName = document.getElementById("email-var-legal").value.trim() || ob.merchant_name;
  if (activeEmailCtx.stepNo === 12) {
    ob.email_meta.shopIdList = document.getElementById("email-var-extra").value.trim() || `${ob.email_meta.partnerCode}_ONLINE_01`;
  } else {
    ob.email_meta.posCount = document.getElementById("email-var-extra").value.trim() || "10";
  }
  const acqEl = document.getElementById("email-var-acq");
  if (acqEl && activeEmailCtx.stepNo === 9) {
    ob.email_meta.acqBank = acqEl.value.trim() || "Pvcombank / VietinBank";
  }
  saveOnboardingStorage();

  const draft = buildStepEmailDraft(ob, activeEmailCtx.stepNo);
  if (!draft) return;

  document.getElementById("email-modal-title").textContent = draft.stepLabel;
  document.getElementById("email-modal-tkpy").textContent = draft.tkpyLabel;
  document.getElementById("email-field-to").value = draft.to;
  document.getElementById("email-field-cc").value = draft.cc;
  document.getElementById("email-field-subject").value = draft.subject;
  document.getElementById("email-field-body").value = draft.body;
}

function closeOnboardingEmailModal() {
  document.getElementById("modal-onboarding-email")?.classList.add("hidden");
}

function copyOnboardingEmailSubject() {
  const subj = document.getElementById("email-field-subject")?.value || "";
  if (navigator.clipboard) navigator.clipboard.writeText(subj);
  if (typeof addNotificationLog === "function") addNotificationLog(`Đã sao chép tiêu đề thư B${activeEmailCtx.stepNo}: "${subj}"`);
  showToast("✓ Đã sao chép tiêu đề thư!");
}

function copyOnboardingEmailBody() {
  const body = document.getElementById("email-field-body")?.value || "";
  if (navigator.clipboard) navigator.clipboard.writeText(body);
  if (typeof addNotificationLog === "function") addNotificationLog(`Đã sao chép nội dung thư điều phối Bước B${activeEmailCtx.stepNo}`);
  showToast("✓ Đã sao chép nội dung thư điều phối!");
}

function openEmailInMailApp() {
  const subj = encodeURIComponent(document.getElementById("email-field-subject")?.value || "");
  const body = encodeURIComponent(document.getElementById("email-field-body")?.value || "");
  window.location.href = `mailto:?subject=${subj}&body=${body}`;
}
