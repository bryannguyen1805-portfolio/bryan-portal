// -------------------------------------------------------------
// 1. DATA STATE (MERCHANTS + SUB-PROJECTS + LOCAL FOLDERS + STAKEHOLDERS + TASKS)
// -------------------------------------------------------------
const DEFAULT_API_ENDPOINT = "https://script.google.com/macros/s/AKfycbzMPVdAPbLAXb39_JtY-ko_puNSIE3CTeb4fQVaiqQaa8-ZkXV6sjJFrysfkxQr_SchWQ/exec";
let API_ENDPOINT = localStorage.getItem("bryan_portal_api") || DEFAULT_API_ENDPOINT;

let state = {
  merchants: [
    { 
      id: "m-highlands", 
      name: "Highlands Coffee", 
      alias: "@highlands", 
      industry: "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)", 
      expected_gmv: "~1.5 Tỷ VNĐ/tháng",
      avatar_letter: "H", 
      color: "bg-red-700",
      contract_status: "Đã Ký Hợp Đồng Kinh Tế • Đang Triển Khai Delivery"
    },
    { 
      id: "m-jdv", 
      name: "JDV Chuỗi Bán Lẻ", 
      alias: "@jdv", 
      industry: "Hệ thống Siêu Thị Bán Lẻ Tiêu Dùng", 
      expected_gmv: "~750M VNĐ/tháng",
      avatar_letter: "J", 
      color: "bg-blue-700",
      contract_status: "Đã Ký Phụ Lục 3 Bên • Đang Thử Nghiệm POS"
    },
    { 
      id: "m-vietthanh", 
      name: "Xe Điện Việt Thanh", 
      alias: "@vietthanh", 
      industry: "Chuỗi 35 Showroom Xe Điện Toàn Quốc", 
      expected_gmv: "~1.2 Tỷ VNĐ/tháng",
      avatar_letter: "V", 
      color: "bg-emerald-700",
      contract_status: "Đã Ký Hợp Đồng Trả Góp 0% • Chuẩn Bị Go-Live"
    }
  ],
  // Hồ sơ & Tài liệu số (Cloud Document Vault)
  folders: [
    { id: "f-hl-1", merchant_id: "m-highlands", title: "Hợp đồng nguyên tắc & Phụ lục biểu phí", file_name: "Hop_Dong_Nguyen_Tac_Highlands_2026.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-highlands-contract", action_label: "Mở tài liệu", badge: "Đã ký duyệt" },
    { id: "f-hl-2", merchant_id: "m-highlands", title: "Bộ biểu mẫu khai báo đối tác", file_name: "BM01_BM01.01_Highlands_POS.xlsx", path: "https://drive.google.com/drive/folders/payoo-dms-highlands-bm01", action_label: "Tải file", badge: "Biểu mẫu" },
    { id: "f-hl-3", merchant_id: "m-highlands", title: "Tài liệu đặc tả kết nối & Sandbox", file_name: "API_Sandbox_PaymentLink_v2.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-highlands-api", action_label: "Xem chi tiết", badge: "Kỹ thuật" },

    { id: "f-jdv-1", merchant_id: "m-jdv", title: "Hồ sơ triển khai 3 bên SmartPOS JDV", file_name: "Hop_Dong_3Ben_JDV_Pvcombank_2026.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-jdv-contract", action_label: "Mở tài liệu", badge: "Đã ký duyệt" },
    { id: "f-vt-1", merchant_id: "m-vietthanh", title: "Hợp đồng trả góp 0% & Danh sách 35 Showroom", file_name: "Bo_Ho_So_TraGop_VietThanh_2026.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-vietthanh", action_label: "Mở tài liệu", badge: "Đã ký duyệt" }
  ],
  stakeholders: [
    // Highlands
    { id: "s-hl-1", merchant_id: "m-highlands", name: "Anh Tuấn", role: "Head of IT & Digital", phone: "0908123456", email: "tuan.it@highlandscoffee.com.vn", group: "Tech Chuỗi" },
    { id: "s-hl-2", merchant_id: "m-highlands", name: "Chị Mai", role: "Acquiring Lead - VietinBank", phone: "0912334455", email: "mai.bank@vietinbank.vn", group: "Ngân Hàng" },
    { id: "s-hl-3", merchant_id: "m-highlands", name: "Bryan Nguyen", role: "Lead B2B PM Delivery", phone: "0934000111", email: "bryan.nguyen@hub.internal", group: "Nội Bộ Bryan" },
    
    // JDV
    { id: "s-jdv-1", merchant_id: "m-jdv", name: "Anh Khoa", role: "Lead Solution Arch JDV", phone: "0988776655", email: "khoa.arch@jdv.vn", group: "Tech Chuỗi" },
    { id: "s-jdv-2", merchant_id: "m-jdv", name: "Anh Tuấn Dũng", role: "Core Banking Lead - Pvcombank", phone: "0977221100", email: "dung.pvcom@pvcombank.com.vn", group: "Ngân Hàng" },
    { id: "s-jdv-3", merchant_id: "m-jdv", name: "Bryan Nguyen", role: "Lead B2B PM Delivery", phone: "0934000111", email: "bryan.nguyen@hub.internal", group: "Nội Bộ Bryan" },

    // Việt Thanh
    { id: "s-vt-1", merchant_id: "m-vietthanh", name: "Anh Thanh", role: "CEO & Founder Việt Thanh", phone: "0966554433", email: "thanh.ceo@xedienvietthanh.com", group: "Đại Diện Chuỗi" },
    { id: "s-vt-2", merchant_id: "m-vietthanh", name: "Chị Hạnh", role: "Phụ trách Trả góp 0% Đối tác", phone: "0944112233", email: "hanh.bank@partner.vn", group: "Ngân Hàng" },
    { id: "s-vt-3", merchant_id: "m-vietthanh", name: "Bryan Nguyen", role: "Lead B2B PM Delivery", phone: "0934000111", email: "bryan.nguyen@hub.internal", group: "Nội Bộ Bryan" }
  ],
  projects: [
    // Highlands (2 dự án)
    { 
      id: "p-hl-1", 
      merchant_id: "m-highlands", 
      title: "Recurring Tokenization & Trừ Tiền Tự Động App", 
      stage: "UAT SIGN-OFF", 
      due_date: "2026-11-28", 
      progress: 75, 
      milestone_name: "3. UAT Nghiệm Thu Lỗi Thẻ & Đối Soát T+1", 
      gate_step: 3,
      is_blocked: true, 
      blocker_reason: "Chưa mở Whitelist IP Callback Webhook dẫn tới chưa thể ký nghiệm thu UAT", 
      blocker_owner: "Anh Tuấn (IT Chuỗi)" 
    },
    { 
      id: "p-hl-2", 
      merchant_id: "m-highlands", 
      title: "Smart POS Tích Hợp VietQR Động Quầy Thu Ngân", 
      stage: "STORE PILOT", 
      due_date: "2026-12-15", 
      progress: 40, 
      milestone_name: "4. Thử nghiệm quầy mẫu & đào tạo thu ngân", 
      gate_step: 4,
      is_blocked: false, 
      blocker_reason: "", 
      blocker_owner: "" 
    },

    // JDV
    { 
      id: "p-jdv-1", 
      merchant_id: "m-jdv", 
      title: "Smart POS 3 Bên (Pvcombank - JDV - Payoo) Đồng Bộ ERP", 
      stage: "INTEGRATION", 
      due_date: "2026-12-10", 
      progress: 45, 
      milestone_name: "2. Khảo sát luồng hóa đơn ERP & Kế toán", 
      gate_step: 2,
      is_blocked: false, 
      blocker_reason: "", 
      blocker_owner: "" 
    },

    // Việt Thanh
    { 
      id: "p-vt-1", 
      merchant_id: "m-vietthanh", 
      title: "Cổng Thanh Toán & Trả Góp 0% 25 Ngân Hàng Tại 35 Showroom", 
      stage: "STORE PILOT", 
      due_date: "2026-12-05", 
      progress: 85, 
      milestone_name: "4. Pilot 5 Showroom Hà Nội & Nghiệm thu", 
      gate_step: 4,
      is_blocked: false, 
      blocker_reason: "", 
      blocker_owner: "" 
    }
  ],
  tasks: [
    { id: "t-1", type: "COMMERCIAL", project_id: "p-hl-1", title: "Rà soát biểu phí MDR & Phụ lục đối soát tự động T+1 với VietinBank", pic: "Bryan", stage: "STAGE_DOING", priority: "CAO", due_date: "2026-11-25", is_overdue: false },
    { id: "t-2", type: "TECH_DELIVERY", project_id: "p-hl-1", title: "Đôn đốc IT Highlands mở Whitelist IP Webhook để nghiệm thu UAT", pic: "Anh Tuấn", stage: "STAGE_TODO", priority: "KHẨN CẤP", due_date: "2026-11-20", is_overdue: true },
    { id: "t-3", type: "TECH_DELIVERY", project_id: "p-hl-2", title: "Kiểm tra 20 máy SmartPOS demo trước khi bàn giao cho cửa hàng mẫu", pic: "Bryan", stage: "STAGE_DOING", priority: "TRUNG BÌNH", due_date: "2026-11-30", is_overdue: false },
    { id: "t-4", type: "COMMERCIAL", project_id: "p-jdv-1", title: "Thống nhất quy trình đối soát hoàn tiền (Refund) giữa JDV và Pvcombank", pic: "Bryan", stage: "STAGE_TODO", priority: "CAO", due_date: "2026-12-02", is_overdue: false },
    { id: "t-5", type: "COMMERCIAL", project_id: "p-vt-1", title: "Ký biên bản nghiệm thu pilot đợt 1 tại 5 showroom với anh Thanh CEO", pic: "Bryan", stage: "STAGE_DONE", priority: "TRUNG BÌNH", due_date: "2026-11-18", is_overdue: false },
    { id: "t-6", type: "PERSONAL", project_id: "", title: "Cafe trưa trao đổi kế hoạch mở rộng chuỗi miền Nam với anh Khoa JDV", pic: "Bryan", stage: "STAGE_DONE", priority: "TRUNG BÌNH", due_date: "2026-11-20", is_overdue: false }
  ],
  meetings: [
    { id: "mt-1", time: "14:30 - 15:30", title: "Họp 3 bên: Nghiệm thu lỗi thẻ Ứng dụng", partner: "Highlands Coffee", attendees: "Bryan, Anh Tuấn (IT), Chị Mai (Ngân hàng)" },
    { id: "mt-2", time: "16:00 - 17:00", title: "Chốt điều khoản hợp đồng & Biểu phí máy quẹt thẻ", partner: "JDV Chuỗi Bán Lẻ", attendees: "Bryan, Anh Khoa, Pvcombank" }
  ]
};

function getUserStateStorageKey() {
  const email = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "tri.nguyen2@vietunion.com.vn";
  return `bryan_portal_state_v2_${email}`;
}

function isBryanLegacyUser() {
  const email = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "tri.nguyen2@vietunion.com.vn";
  return email === "tri.nguyen2@vietunion.com.vn" || email === "quantritc1805@gmail.com";
}

// Nạp state cô lập theo email người dùng
const userStateKey = getUserStateStorageKey();
const savedStateRaw = localStorage.getItem(userStateKey) || (isBryanLegacyUser() ? localStorage.getItem("bryan_portal_state_v2") : null);
if (!savedStateRaw && !isBryanLegacyUser()) {
  // Nhân sự mới phòng Omni khởi đầu với workspace trống sạch sẽ
  state.merchants = [];
  state.folders = [];
  state.stakeholders = [];
  state.projects = [];
  state.tasks = [];
  state.meetings = [];
} else if (savedStateRaw) {
  try {
    const parsed = JSON.parse(savedStateRaw);
    if (parsed && Array.isArray(parsed.merchants)) {
      state = parsed;
      if (!Array.isArray(state.meetings)) {
        state.meetings = [
          { id: "mt-1", time: "14:30 - 15:30", title: "Họp 3 bên: Nghiệm thu lỗi thẻ Ứng dụng", partner: "Highlands Coffee", attendees: "Bryan, Anh Tuấn (IT), Chị Mai (Ngân hàng)" },
          { id: "mt-2", time: "16:00 - 17:00", title: "Chốt điều khoản hợp đồng & Biểu phí máy quẹt thẻ", partner: "JDV Chuỗi Bán Lẻ", attendees: "Bryan, Anh Khoa, Pvcombank" }
        ];
      }
      // Tự động chuyển đổi dữ liệu thư mục máy tính cũ (/Users/...) sang Hồ sơ tài liệu số
      if (Array.isArray(state.folders)) {
        let migrated = false;
        state.folders = state.folders.map((f, idx) => {
          if (f.path && f.path.startsWith("/Users/")) {
            migrated = true;
            const slug = (f.merchant_id || "partner").replace("m-", "");
            return {
              ...f,
              file_name: f.file_name || `Ho_So_${slug.toUpperCase()}_${idx + 1}.pdf`,
              path: `https://drive.google.com/drive/folders/payoo-dms-${slug}`,
              action_label: f.action_label || "Mở tài liệu",
              badge: f.badge || "Tài liệu số"
            };
          }
          return f;
        });
        if (migrated) localStorage.setItem("bryan_portal_state_v2", JSON.stringify(state));
      }
    }
  } catch (e) { console.warn("Lỗi đọc state localStorage:", e); }
}

let cloudSyncTimer = null;

async function flushFullCloudSyncNow() {
  if (!API_ENDPOINT) return;
  const userEmail = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
  const userPin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
  if (!userEmail || !userPin) return;
  clearTimeout(cloudSyncTimer);
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        action: "SYNC_FULL_STATE",
        owner_email: userEmail,
        owner_pin: userPin,
        merchants: state.merchants,
        stakeholders: state.stakeholders,
        projects: state.projects,
        tasks: state.tasks,
        meetings: state.meetings,
        folders: state.folders,
        onboarding: typeof onboardingList !== "undefined" ? onboardingList : []
      })
    });
    const data = await res.json().catch(() => null);
    if (data && data.status === 403 && typeof showToast === "function") {
      showToast("Chưa lưu được lên Google Sheets (403 - hãy kiểm tra Code.gs đã Deploy bản mới chưa).", true);
    }
  } catch (e) {
    console.warn("Lỗi flushFullCloudSyncNow:", e);
  }
}

function scheduleFullCloudSync() {
  if (!API_ENDPOINT) return;
  const userEmail = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
  const userPin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
  if (!userEmail || !userPin) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    flushFullCloudSyncNow();
  }, 400);
}

function saveStateStorage() {
  localStorage.setItem(getUserStateStorageKey(), JSON.stringify(state));
  scheduleFullCloudSync();
}

let activeMerchantId = state.merchants[0]?.id || "m-highlands";
let activeSubTab = "OVERVIEW"; // OVERVIEW hoặc Project ID (ví dụ: 'p-hl-1')
let activeTaskView = "CARDS";
let activeTaskTypeFilter = "ALL";
let velocityChartInstance = null;
let statusChartInstance = null;


// -------------------------------------------------------------
// 9. CHARTS & KPIS
// -------------------------------------------------------------
function updateAllKpis() {
  const totalTasks = state.tasks.length;
  const doneTasks = state.tasks.filter(t => t.stage === 'STAGE_DONE').length;
  const pendingTasks = totalTasks - doneTasks;
  const overdueTasks = state.tasks.filter(t => t.is_overdue && t.stage !== 'STAGE_DONE').length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const activeProjs = state.projects.filter(p => !p.is_archived && p.progress < 100).length;
  const blockerCount = state.projects.filter(p => p.is_blocked).length;

  const obActive = onboardingList.filter(o => !o.graduated).length;
  const obGraduated = onboardingList.filter(o => o.graduated).length;

  // Update Radial Progress Ring
  const radialPctEl = document.getElementById("radial-percent");
  const radialSubEl = document.getElementById("radial-subtext");
  const radialCircle = document.getElementById("radial-progress-circle");
  if (radialPctEl) radialPctEl.textContent = taskPct + "%";
  if (radialSubEl) radialSubEl.textContent = `${doneTasks}/${totalTasks} việc hoàn tất`;
  if (radialCircle) {
    const circumference = 106.8;
    radialCircle.setAttribute("stroke-dashoffset", circumference - (taskPct / 100) * circumference);
  }

  // Clickable Summary Badges (Morning Focus style)
  const summaryEl = document.getElementById("banner-summary-text");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <button onclick="switchDashboardMode('OPERATIONS'); navigateTo('PROJECTS')" class="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold transition cursor-pointer backdrop-blur-xs">
        🏪 ${state.merchants.length} chuỗi đối tác
      </button>
      <button onclick="switchDashboardMode('OPERATIONS'); navigateTo('ONBOARDING')" class="px-3 py-1 rounded-full bg-teal-400/20 hover:bg-teal-400/30 text-teal-100 font-semibold transition cursor-pointer backdrop-blur-xs">
        🚀 ${obActive} triển khai mới
      </button>
      <button onclick="switchDashboardMode('FOCUS'); document.getElementById('dash-blocker-section')?.scrollIntoView({behavior: 'smooth'})" class="px-3 py-1 rounded-full ${blockerCount > 0 ? 'bg-rose-500/35 text-rose-100 hover:bg-rose-500/45' : 'bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30'} font-semibold transition cursor-pointer backdrop-blur-xs">
        ${blockerCount > 0 ? `⚠️ ${blockerCount} vướng mắc cần gỡ` : '✨ Mọi dự án thông suốt'}
      </button>
    `;
  }

  // 4 Strategic KPIs
  const elMerchants = document.getElementById("kpi-merchants");
  const elProjSub = document.getElementById("kpi-projects-sub");
  const elObActive = document.getElementById("kpi-onboarding-active");
  const elObSub = document.getElementById("kpi-onboarding-sub");
  const elBlocker = document.getElementById("kpi-blocker");
  const elBlockerSub = document.getElementById("kpi-blocker-sub");
  const elBlockerCard = document.getElementById("kpi-blocker-card");
  const elBlockerIconWrap = document.getElementById("kpi-blocker-icon-wrap");
  const elBlockerIcon = document.getElementById("kpi-blocker-icon");
  const elTasksPending = document.getElementById("kpi-tasks-pending");
  const elOverdueSub = document.getElementById("kpi-overdue-sub");

  if (elMerchants) elMerchants.textContent = state.merchants.length;
  if (elProjSub) elProjSub.textContent = `${activeProjs} dự án đang chạy`;
  if (elObActive) elObActive.textContent = obActive;
  if (elObSub) elObSub.textContent = `${obGraduated} chuỗi đã bàn giao`;
  if (elBlocker) {
    elBlocker.textContent = blockerCount;
    elBlocker.className = blockerCount > 0
      ? "text-2xl font-black text-rose-600 mt-0.5"
      : "text-2xl font-black text-emerald-700 mt-0.5";
  }
  if (elBlockerSub) {
    elBlockerSub.textContent = blockerCount > 0 ? "Cần can thiệp gỡ nghẽn ngay" : "Mọi dự án thông suốt";
    elBlockerSub.className = blockerCount > 0 ? "text-[11px] font-semibold text-rose-600 mt-0.5" : "text-[11px] font-semibold text-emerald-600 mt-0.5";
  }
  if (elBlockerCard) {
    elBlockerCard.className = blockerCount > 0
      ? "bg-white p-4 rounded-2xl border border-rose-300 hover:border-rose-400 cursor-pointer transition shadow-xs flex items-center justify-between"
      : "bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition shadow-xs flex items-center justify-between";
  }
  if (elBlockerIconWrap) {
    elBlockerIconWrap.className = blockerCount > 0
      ? "w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"
      : "w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center";
  }
  if (elBlockerIcon) {
    elBlockerIcon.setAttribute("data-lucide", blockerCount > 0 ? "alert-triangle" : "shield-check");
    lucide.createIcons();
  }
  if (elTasksPending) elTasksPending.textContent = pendingTasks;
  if (elOverdueSub) elOverdueSub.textContent = overdueTasks > 0 ? `${overdueTasks} việc trễ hạn` : "Không có việc quá hạn";

  // Sidebar badges
  const bMerchant = document.getElementById("badge-merchant-count");
  const bTask = document.getElementById("badge-task-count");
  if (bMerchant) bMerchant.textContent = state.merchants.length;
  if (bTask) bTask.textContent = pendingTasks;
  if (typeof updateNotificationDot === "function") updateNotificationDot();
}

function renderCharts() {
  // Velocity
  const vCtx = document.getElementById('velocityChart')?.getContext('2d');
  if (vCtx) {
    if (velocityChartInstance) velocityChartInstance.destroy();
    velocityChartInstance = new Chart(vCtx, {
      type: 'line',
      data: {
        labels: ['T2 (16/11)', 'T3 (17/11)', 'T4 (18/11)', 'T5 (19/11)', 'T6 (20/11)', 'T7 (21/11)', 'CN (22/11)'],
        datasets: [
          {
            label: 'Mục Tiêu Đạt Được',
            data: [4, 6, 5, 8, 7, 9, 6],
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#0d9488'
          },
          {
            label: 'Blocker Phát Sinh',
            data: [1, 0, 1, 0, 1, 0, 1],
            borderColor: '#e11d48',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2,
            pointBackgroundColor: '#e11d48'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 9 } } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // Status
  const sCtx = document.getElementById('statusChart')?.getContext('2d');
  if (sCtx) {
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(sCtx, {
      type: 'doughnut',
      data: {
        labels: ['Thương mại', 'Kỹ thuật', 'Vận hành', 'Cá nhân'],
        datasets: [{
          data: [40, 35, 15, 10],
          backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } }
      }
    });
  }
}

// -------------------------------------------------------------
// 10. GOOGLE APPS SCRIPT API ENGINE & SYNC
// -------------------------------------------------------------
function openApiConfigModal() {
  const input = document.getElementById("cfg-api-endpoint");
  if (input) input.value = API_ENDPOINT;
  document.getElementById("modal-api-config").classList.remove("hidden");
}

function closeApiConfigModal() {
  document.getElementById("modal-api-config").classList.add("hidden");
}

function saveApiConfig() {
  const input = document.getElementById("cfg-api-endpoint");
  API_ENDPOINT = input.value.trim();
  localStorage.setItem("bryan_portal_api", API_ENDPOINT);
  closeApiConfigModal();
  updateSyncStatusUI();
  if (API_ENDPOINT) {
    syncDataFromGoogleSheets();
  } else {
    showToast("Đã chuyển về chế độ Mock Data Offline.");
  }
}

function updateSyncStatusUI() {
  const btn = document.getElementById("topbar-cloud-btn");
  const dot = document.getElementById("topbar-cloud-dot");
  const text = document.getElementById("topbar-cloud-text");
  if (!btn || !text) return;

  if (API_ENDPOINT) {
    btn.className = "flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80 text-xs font-medium transition";
    if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500";
    text.textContent = "Đã đồng bộ";
  } else {
    btn.className = "flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition";
    if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-amber-500";
    text.textContent = "Chưa gắn Sheet";
  }
}

async function syncDataFromGoogleSheets() {
  if (!API_ENDPOINT) {
    showToast("Chưa cấu hình URL Google Apps Script. Vui lòng bấm Cài Đặt!");
    openApiConfigModal();
    return;
  }

  const syncIcon = document.getElementById("sync-icon");
  if (syncIcon) syncIcon.classList.add("animate-spin");

  try {
    const userEmail = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
    const userPin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
    const sep = API_ENDPOINT.includes("?") ? "&" : "?";
    const res = await fetch(`${API_ENDPOINT}${sep}action=getData&user_email=${encodeURIComponent(userEmail)}&user_pin=${encodeURIComponent(userPin)}`);
    const data = await res.json();
    if (data && data.status === 403) {
      showToast(data.error || "Tài khoản không có quyền truy cập.", true);
      return;
    }

    if (Array.isArray(data.merchants)) state.merchants = data.merchants;
    if (Array.isArray(data.stakeholders)) state.stakeholders = data.stakeholders;
    if (Array.isArray(data.projects)) state.projects = data.projects;
    if (Array.isArray(data.tasks)) state.tasks = data.tasks;
    if (Array.isArray(data.meetings)) state.meetings = data.meetings;
    if (Array.isArray(data.folders)) state.folders = data.folders;
    if (Array.isArray(data.onboarding) && typeof onboardingList !== "undefined") {
      onboardingList = data.onboarding;
      if (typeof saveOnboardingStorage === "function") saveOnboardingStorage();
    }
    localStorage.setItem(getUserStateStorageKey(), JSON.stringify(state));

    updateAllKpis();
    renderDashboardQuickTasks();
    if (typeof renderDashboardMeetings === "function") renderDashboardMeetings();
    if (typeof renderCalendarView === "function") renderCalendarView();
    if (typeof renderOnboardingView === "function") renderOnboardingView();
    renderMerchantPillsBar();
    renderMerchantSubTabs();
    renderMerchantWorkspaceBody();
    renderTasksMainView();
    showToast("✓ Đã đồng bộ dữ liệu mới nhất từ Google Sheets!");
  } catch (err) {
    console.warn("Lỗi fetch API:", err);
    showToast("Không thể kết nối Google Sheets, duy trì Offline Data.");
  } finally {
    if (syncIcon) syncIcon.classList.remove("animate-spin");
  }
}

async function postDataToGoogleSheets(payload) {
  if (!API_ENDPOINT) return;
  const userEmail = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
  const userPin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ owner_email: userEmail, owner_pin: userPin, ...payload })
    });
    const data = await res.json().catch(() => null);
    if (data && data.status === 403 && typeof showToast === "function") {
      showToast(data.error || "Không có quyền ghi dữ liệu lên Google Sheets (403).", true);
      return;
    }
    setTimeout(syncDataFromGoogleSheets, 800);
  } catch (err) {
    console.error("Lỗi POST API:", err);
  }
}

