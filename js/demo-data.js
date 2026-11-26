// -------------------------------------------------------------
// COMPREHENSIVE DEMO USER SANDBOX (demo@bryanportal.io.vn / PIN: 123456)
// -------------------------------------------------------------
const DEMO_USER_EMAIL = "demo@bryanportal.io.vn";

function isDemoUser(email) {
  const target = (email || (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "") || "").trim().toLowerCase();
  return target === DEMO_USER_EMAIL;
}

function getDemoRelativeIsoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDemoStateSnapshot() {
  const today = getDemoRelativeIsoDate(0);
  const yesterday = getDemoRelativeIsoDate(-1);
  const tomorrow = getDemoRelativeIsoDate(1);
  const nextWeek = getDemoRelativeIsoDate(5);
  const expiry15Days = getDemoRelativeIsoDate(15);

  return {
    merchants: [
      {
        id: "demo-m-highlands",
        name: "Highlands Coffee (Demo)",
        brand_name: "HIGHLANDS",
        tax_code: "0303475933",
        alias: "@highlands",
        industry: "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)",
        expected_gmv: "~1.5 Tỷ VNĐ/tháng",
        avatar_letter: "H",
        color: "bg-red-700",
        contract_status: "Đã Ký Hợp Đồng Kinh Tế • Đang Triển Khai Delivery"
      },
      {
        id: "demo-m-katinat",
        name: "Katinat Saigon Kafe (Demo)",
        brand_name: "KATINAT",
        tax_code: "0316182934",
        alias: "@katinat",
        industry: "Chuỗi Trà & Cà Phê (80+ Cửa Hàng)",
        expected_gmv: "~850M VNĐ/tháng",
        avatar_letter: "K",
        color: "bg-teal-700",
        contract_expiry_date: expiry15Days,
        contract_status: "Đang Vận Hành • Sắp Hết Hạn HĐ"
      },
      {
        id: "demo-m-jtrue",
        name: "Trung Tâm Anh Ngữ JTRUE (Demo)",
        brand_name: "JTRUE",
        tax_code: "0317889900",
        alias: "@jtrue",
        industry: "Lĩnh vực giáo dục (Trung tâm Anh ngữ)",
        expected_gmv: "~420M VNĐ/tháng",
        avatar_letter: "J",
        color: "bg-indigo-700",
        contract_status: "Đã Hoàn Tất POS & Paylink • Đang Vận Hành"
      },
      {
        id: "demo-m-bepviet",
        name: "Nhà Hàng Bếp Việt (Demo)",
        brand_name: "BEPVIET",
        tax_code: "0315223344",
        alias: "@bepviet",
        industry: "Dịch vụ nhà hàng / Ăn uống (F&B)",
        expected_gmv: "~500M VNĐ/tháng",
        avatar_letter: "B",
        color: "bg-amber-700",
        contract_status: "Đang Triển Khai SmartPOS 12 Chi Nhánh"
      }
    ],
    folders: [
      { id: "demo-f-1", merchant_id: "demo-m-highlands", title: "Hợp đồng nguyên tắc & Phụ lục biểu phí", file_name: "HD_Highlands_2026.pdf", path: "https://drive.google.com/drive/folders/demo-highlands", action_label: "Mở tài liệu", badge: "Đã ký duyệt" },
      { id: "demo-f-2", merchant_id: "demo-m-katinat", title: "Hồ sơ gia hạn hợp đồng Katinat", file_name: "Phu_Luc_Gia_Han_Katinat.pdf", path: "https://drive.google.com/drive/folders/demo-katinat", action_label: "Mở tài liệu", badge: "Sắp gia hạn" },
      { id: "demo-f-3", merchant_id: "demo-m-jtrue", title: "Bộ hồ sơ pháp lý & GP Giáo dục JTRUE", file_name: "Ho_So_Phap_Ly_JTRUE.pdf", path: "https://drive.google.com/drive/folders/demo-jtrue", action_label: "Mở tài liệu", badge: "Đủ hồ sơ" }
    ],
    stakeholders: [
      { id: "demo-s-1", merchant_id: "demo-m-highlands", name: "Anh Tuấn", role: "Head of IT & Digital", phone: "0908123456", email: "tuan.it@highlands.demo", group: "Tech Chuỗi" },
      { id: "demo-s-2", merchant_id: "demo-m-katinat", name: "Chị Thảo", role: "Trưởng phòng Kế toán", phone: "0918223344", email: "thao.kt@katinat.demo", group: "Đại Diện Chuỗi" },
      { id: "demo-s-3", merchant_id: "demo-m-jtrue", name: "Chị Thương", role: "Giám đốc Vận hành", phone: "0909887766", email: "thuong@jtrue.demo", group: "Đại Diện Chuỗi" },
      { id: "demo-s-4", merchant_id: "demo-m-bepviet", name: "Anh Minh", role: "Quản lý Chuỗi", phone: "0933445566", email: "minh@bepviet.demo", group: "Đại Diện Chuỗi" }
    ],
    projects: [
      {
        id: "demo-p-1",
        merchant_id: "demo-m-highlands",
        title: "Recurring Tokenization & Trừ Tiền Tự Động App",
        stage: "UAT SIGN-OFF",
        due_date: tomorrow,
        progress: 75,
        milestone_name: "3. UAT Nghiệm Thu & Đối Soát T+1",
        gate_step: 3,
        is_blocked: true,
        blocker_reason: "Chưa mở Whitelist IP Callback Webhook dẫn tới chưa thể ký nghiệm thu UAT",
        blocker_owner: "Anh Tuấn (IT Chuỗi)"
      },
      {
        id: "demo-p-2",
        merchant_id: "demo-m-highlands",
        title: "Smart POS Tích Hợp VietQR Động Quầy Thu Ngân",
        stage: "STORE PILOT",
        due_date: nextWeek,
        progress: 60,
        milestone_name: "4. Thử nghiệm quầy mẫu & đào tạo thu ngân",
        gate_step: 4,
        is_blocked: false,
        blocker_reason: "",
        blocker_owner: ""
      },
      {
        id: "demo-p-3",
        merchant_id: "demo-m-katinat",
        title: "Vận Hành POS & Paylink Toàn Chuỗi (80+ Cửa Hàng)",
        stage: "GO-LIVE",
        due_date: today,
        progress: 100,
        milestone_name: "5. Go-Live Chuỗi & Khai Thác GMV",
        gate_step: 5,
        is_blocked: false,
        blocker_reason: "",
        blocker_owner: ""
      },
      {
        id: "demo-p-4",
        merchant_id: "demo-m-jtrue",
        title: "Triển Khai POS & Cổng Thanh Toán Học Phí Online",
        stage: "GO-LIVE",
        due_date: today,
        progress: 100,
        milestone_name: "5. Go-Live & Đối Soát Tự Động",
        gate_step: 5,
        is_blocked: false,
        blocker_reason: "",
        blocker_owner: ""
      },
      {
        id: "demo-p-5",
        merchant_id: "demo-m-bepviet",
        title: "Lắp Đặt 12 Máy SmartPOS & Trả Góp 0%",
        stage: "INTEGRATION",
        due_date: nextWeek,
        progress: 40,
        milestone_name: "2. Khảo sát quầy & Cấu hình thiết bị",
        gate_step: 2,
        is_blocked: false,
        blocker_reason: "",
        blocker_owner: ""
      }
    ],
    tasks: [
      {
        id: "demo-t-1",
        type: "TECHNICAL",
        project_id: "demo-p-1",
        title: "Nhắc IT Highlands mở Whitelist IP Callback UAT",
        pic: "Anh Tuấn (IT Chuỗi)",
        stage: "STAGE_TODO",
        priority: "KHẨN CẤP",
        due_date: yesterday,
        is_overdue: true,
        completed_at: ""
      },
      {
        id: "demo-t-2",
        type: "COMMERCIAL",
        project_id: "demo-p-3",
        title: "Gửi Phụ lục gia hạn hợp đồng cho Katinat trước 30 ngày",
        pic: "Chị Thảo (Katinat)",
        stage: "STAGE_DOING",
        priority: "CAO",
        due_date: today,
        is_overdue: false,
        completed_at: ""
      },
      {
        id: "demo-t-3",
        type: "COMMERCIAL",
        project_id: "demo-p-5",
        title: "Xin mã MCC chuẩn STB & gửi BM03 cấp máy cho Bếp Việt",
        pic: "Omni Demo",
        stage: "STAGE_TODO",
        priority: "CAO",
        due_date: tomorrow,
        is_overdue: false,
        completed_at: ""
      },
      {
        id: "demo-t-4",
        type: "COMMERCIAL",
        project_id: "demo-p-2",
        title: "Xác nhận lịch training thu ngân 5 cửa hàng Pilot Highlands",
        pic: "Omni Demo",
        stage: "STAGE_WAITING",
        priority: "TRUNG BÌNH",
        due_date: nextWeek,
        is_overdue: false,
        completed_at: ""
      },
      {
        id: "demo-t-5",
        type: "COMMERCIAL",
        project_id: "demo-p-4",
        title: "Bàn giao tài khoản Portal & hướng dẫn đổi PIN cho JTRUE",
        pic: "Chị Thương (JTRUE)",
        stage: "STAGE_DONE",
        priority: "TRUNG BÌNH",
        due_date: yesterday,
        is_overdue: false,
        completed_at: yesterday + "T10:00:00.000Z"
      }
    ],
    meetings: [
      {
        id: "demo-mt-1",
        date: today,
        time: "23:30 - 23:55",
        title: "Review UAT & Gỡ Blocker Whitelist IP Highlands",
        partner: "Highlands Coffee",
        attendees: "Omni Demo, Anh Tuấn (IT)"
      },
      {
        id: "demo-mt-2",
        date: tomorrow,
        time: "10:00 - 11:00",
        title: "Thẩm định hồ sơ & Chốt phí Paylink Apollo",
        partner: "Trung tâm Anh ngữ Apollo",
        attendees: "Omni Demo, Ms Linh (Apollo)"
      },
      {
        id: "demo-mt-3",
        date: nextWeek,
        time: "14:30 - 15:30",
        title: "Nghiệm thu Pilot 5 Showroom & Chuẩn bị Go-Live",
        partner: "Nhà hàng Bếp Việt",
        attendees: "Omni Demo, Anh Minh"
      }
    ]
  };
}

function buildDemoOnboardingList() {
  const gen = typeof generateSopTasks === "function" ? generateSopTasks : (() => []);
  return [
    {
      id: "demo-ob-apollo",
      merchant_name: "Công ty TNHH Giáo Dục Apollo (Demo)",
      brand_name: "APOLLO",
      tax_code: "0309887766",
      industry: "Lĩnh vực giáo dục (Trung tâm Anh ngữ, trường học, đào tạo)",
      contact_name: "chị Linh",
      channel: "POS_PAYLINK",
      vetting_status: "PENDING",
      vetting_done_ids: ["vet-invoice", "vet-dkkd", "vet-bank-pic", "vet-vneid-org"],
      total_steps: 18,
      tasks: gen("POS_PAYLINK", 0)
    },
    {
      id: "demo-ob-gs25",
      merchant_name: "GS25 Vietnam (Demo)",
      brand_name: "GS25",
      tax_code: "0314998877",
      industry: "Cửa hàng tiện lợi / Siêu thị mini",
      contact_name: "anh Hùng",
      channel: "POS_PAYLINK",
      vetting_status: "APPROVED",
      vetting_done_ids: [],
      total_steps: 18,
      tasks: gen("POS_PAYLINK", 6)
    },
    {
      id: "demo-ob-phuclong",
      merchant_name: "Phúc Long Heritage (Demo)",
      brand_name: "PHUCLONG",
      tax_code: "0316554433",
      industry: "Dịch vụ nhà hàng / Ăn uống (F&B)",
      contact_name: "chị Ngọc",
      channel: "POS",
      vetting_status: "APPROVED",
      vetting_done_ids: [],
      total_steps: 15,
      tasks: gen("POS", 15)
    }
  ];
}

function applyDemoModeUiBadges() {
  const btn = document.getElementById("btn-reset-demo");
  if (btn) btn.classList.toggle("hidden", !isDemoUser());
}

function resetDemoWorkspaceData() {
  if (!isDemoUser()) return;
  const demoState = buildDemoStateSnapshot();
  const demoOb = buildDemoOnboardingList();
  const stateKey = typeof getUserStateStorageKey === "function" ? getUserStateStorageKey() : `bryan_portal_state_v2_${DEMO_USER_EMAIL}`;
  const obKey = typeof getOnboardingStorageKey === "function" ? getOnboardingStorageKey() : `bryan_onboarding_list_${DEMO_USER_EMAIL}`;
  localStorage.setItem(stateKey, JSON.stringify(demoState));
  localStorage.setItem(obKey, JSON.stringify(demoOb));
  if (typeof showToast === "function") showToast("✓ Đã khôi phục dữ liệu Demo về trạng thái ban đầu!");
  setTimeout(() => window.location.reload(), 400);
}
