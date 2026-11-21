// -------------------------------------------------------------
// 12. SOP ONBOARDING ENGINE & DRAG-AND-DROP KANBAN
// -------------------------------------------------------------
const SOP_CHANNELS = {
  POS: {
    label: "POS (15 bước)",
    steps: [
      { step_no: 1, title: "Làm Hợp Đồng, Phụ Lục, BM01 và BM01.01", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 2, title: "Trình CMS", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 3, title: "Nhờ Trưởng Bộ Phận (TBP) duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 4, title: "Đưa nội dung TBP duyệt vào BM01 và BM01.01, chuyển thành file PDF và up lên lại CMS 2 bản PDF", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 5, title: "FC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 6, title: "LC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 7, title: "Gửi Ban Giám Đốc (BGĐ) ký tên và đóng mộc", stage: "STAGE_SIGN_HANDOVER", dept: "BGĐ" },
      { step_no: 8, title: "Gửi đến Đối tác", stage: "STAGE_SIGN_HANDOVER", dept: "Đối tác" },
      { step_no: 9, title: "Làm BM03 gửi mail ASM", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 10, title: "Gửi mail Request Cấu Hình Mới xin thông số (BM03)", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 11, title: "Gửi mail Cài đặt TK và lắp đặt TBTT (BM01, BM01.01, file payoopos)", stage: "STAGE_CONFIG_DEVICE", dept: "Nội bộ" },
      { step_no: 12, title: "Mail team DevOps mapping Cấu hình trả góp", stage: "STAGE_CONFIG_DEVICE", dept: "DevOps" },
      { step_no: 13, title: "ASM trả lại BM01 và BM01.01 có ký nháy ASM", stage: "STAGE_GOLIVE", dept: "ASM" },
      { step_no: 14, title: "Request training", stage: "STAGE_GOLIVE", dept: "Nội bộ" },
      { step_no: 15, title: "Gửi bản Scan Bộ Hợp Đồng", stage: "STAGE_GOLIVE", dept: "Nội bộ" }
    ]
  },
  POS_PAYLINK: {
    label: "POS & Paylink (18 bước)",
    steps: [
      { step_no: 1, title: "Làm Hợp Đồng, Phụ Lục, BM01 và BM01.01", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 2, title: "Trình CMS", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 3, title: "Nhờ Trưởng Bộ Phận (TBP) duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 4, title: "Đưa nội dung TBP duyệt vào BM01 và BM01.01, chuyển thành file PDF và up lên lại CMS 2 bản PDF", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 5, title: "FC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 6, title: "LC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 7, title: "Gửi Ban Giám Đốc (BGĐ) ký tên và đóng mộc", stage: "STAGE_SIGN_HANDOVER", dept: "BGĐ" },
      { step_no: 8, title: "Gửi đến Đối tác", stage: "STAGE_SIGN_HANDOVER", dept: "Đối tác" },
      { step_no: 9, title: "Làm BM03 gửi mail ASM", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 10, title: "Gửi mail Request Cấu Hình Mới xin thông số (BM03)", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 11, title: "Gửi mail Cài đặt TK và lắp đặt TBTT (BM01, BM01.01, file payoopos)", stage: "STAGE_CONFIG_DEVICE", dept: "Nội bộ" },
      { step_no: 12, title: "Mail team core Go-live ShopID", stage: "STAGE_CONFIG_DEVICE", dept: "Core" },
      { step_no: 13, title: "Mail mở Phí dịch vụ số 5 nếu đối tác cần", stage: "STAGE_CONFIG_DEVICE", dept: "Core" },
      { step_no: 14, title: "Mail gửi ASM cấu hình Phí trả góp lên Cổng", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 15, title: "Mail team DevOps mapping Cấu hình trả góp", stage: "STAGE_CONFIG_DEVICE", dept: "DevOps" },
      { step_no: 16, title: "ASM trả lại BM01 và BM01.01 có ký nháy ASM", stage: "STAGE_GOLIVE", dept: "ASM" },
      { step_no: 17, title: "Request training", stage: "STAGE_GOLIVE", dept: "Nội bộ" },
      { step_no: 18, title: "Gửi bản Scan Bộ Hợp Đồng", stage: "STAGE_GOLIVE", dept: "Nội bộ" }
    ]
  },
  POS_PGW: {
    label: "POS & PGW (18 bước)",
    steps: [
      { step_no: 1, title: "Làm Hợp Đồng, Phụ Lục, BM01 và BM01.01", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 2, title: "Trình CMS", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 3, title: "Nhờ Trưởng Bộ Phận (TBP) duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 4, title: "Đưa nội dung TBP duyệt vào BM01 và BM01.01, chuyển thành file PDF và up lên lại CMS 2 bản PDF", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 5, title: "Mail team Core giới thiệu đối tác", stage: "STAGE_LEGAL_CMS", dept: "Core" },
      { step_no: 6, title: "FC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 7, title: "LC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 8, title: "Gửi Ban Giám Đốc (BGĐ) ký tên và đóng mộc", stage: "STAGE_SIGN_HANDOVER", dept: "BGĐ" },
      { step_no: 9, title: "Gửi đến Đối tác", stage: "STAGE_SIGN_HANDOVER", dept: "Đối tác" },
      { step_no: 10, title: "Nghiệm thu PGW", stage: "STAGE_SIGN_HANDOVER", dept: "Core" },
      { step_no: 11, title: "Làm BM03 gửi mail ASM", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 12, title: "Gửi mail Request Cấu Hình Mới xin thông số (BM03)", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 13, title: "Gửi mail Cài đặt TK và lắp đặt TBTT (BM01, BM01.01, file payoopos)", stage: "STAGE_CONFIG_DEVICE", dept: "Nội bộ" },
      { step_no: 14, title: "Mail team core Go-live ShopID", stage: "STAGE_CONFIG_DEVICE", dept: "Core" },
      { step_no: 15, title: "Mail team DevOps mapping Cấu hình trả góp", stage: "STAGE_CONFIG_DEVICE", dept: "DevOps" },
      { step_no: 16, title: "ASM trả lại BM01 và BM01.01 có ký nháy ASM", stage: "STAGE_GOLIVE", dept: "ASM" },
      { step_no: 17, title: "Request training", stage: "STAGE_GOLIVE", dept: "Nội bộ" },
      { step_no: 18, title: "Gửi bản Scan Bộ Hợp Đồng", stage: "STAGE_GOLIVE", dept: "Nội bộ" }
    ]
  },
  PGW: {
    label: "PGW (19 bước)",
    steps: [
      { step_no: 1, title: "Làm Hợp Đồng, Phụ Lục, BM01 và BM01.01", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 2, title: "Trình CMS", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 3, title: "Nhờ Trưởng Bộ Phận (TBP) duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 4, title: "Đưa nội dung TBP duyệt vào BM01 và BM01.01, chuyển thành file PDF và up lên lại CMS 2 bản PDF", stage: "STAGE_LEGAL_CMS", dept: "Nội bộ" },
      { step_no: 5, title: "Mail team Core giới thiệu đối tác", stage: "STAGE_LEGAL_CMS", dept: "Core" },
      { step_no: 6, title: "FC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 7, title: "LC duyệt", stage: "STAGE_LEGAL_CMS", dept: "Duyệt" },
      { step_no: 8, title: "Gửi Ban Giám Đốc (BGĐ) ký tên và đóng mộc", stage: "STAGE_SIGN_HANDOVER", dept: "BGĐ" },
      { step_no: 9, title: "Gửi đến Đối tác", stage: "STAGE_SIGN_HANDOVER", dept: "Đối tác" },
      { step_no: 10, title: "Nghiệm thu PGW", stage: "STAGE_SIGN_HANDOVER", dept: "Core" },
      { step_no: 11, title: "Làm BM03 gửi mail ASM", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 12, title: "Gửi mail Request Cấu Hình Mới xin thông số (BM03, BM01 và BM01.01)", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 13, title: "Mail team core Go-live ShopID", stage: "STAGE_CONFIG_DEVICE", dept: "Core" },
      { step_no: 14, title: "Mail mở Phí dịch vụ số 5 nếu đối tác cần", stage: "STAGE_CONFIG_DEVICE", dept: "Core" },
      { step_no: 15, title: "Mail gửi ASM cấu hình Phí trả góp lên Cổng", stage: "STAGE_CONFIG_DEVICE", dept: "ASM" },
      { step_no: 16, title: "Mail team DevOps mapping Cấu hình trả góp", stage: "STAGE_CONFIG_DEVICE", dept: "DevOps" },
      { step_no: 17, title: "ASM trả lại BM01 và BM01.01 có ký nháy ASM", stage: "STAGE_GOLIVE", dept: "ASM" },
      { step_no: 18, title: "Request training", stage: "STAGE_GOLIVE", dept: "Nội bộ" },
      { step_no: 19, title: "Gửi bản Scan Bộ Hợp Đồng", stage: "STAGE_GOLIVE", dept: "Nội bộ" }
    ]
  }
};

function generateSopTasks(channelKey, doneUntilStep = 0) {
  const tpl = SOP_CHANNELS[channelKey] || SOP_CHANNELS.POS;
  return tpl.steps.map(s => ({
    id: "ob-step-" + s.step_no + "-" + Math.random().toString(36).slice(2, 6),
    step_no: s.step_no,
    title: s.title,
    stage: s.stage,
    dept: s.dept,
    status: s.step_no <= doneUntilStep ? "DONE" : "IN_PROGRESS"
  }));
}

// Load từ localStorage hoặc khởi tạo 2 mẫu thực tế
let onboardingList = JSON.parse(localStorage.getItem("bryan_onboarding_list") || "null") || [
  {
    id: "ob-gs25",
    merchant_name: "GS25 Vietnam",
    channel: "POS_PGW",
    total_steps: 18,
    tasks: generateSopTasks("POS_PGW", 4)
  },
  {
    id: "ob-katinat",
    merchant_name: "Katinat Saigon Kafe",
    channel: "POS_PAYLINK",
    total_steps: 18,
    tasks: generateSopTasks("POS_PAYLINK", 2)
  }
];

let showGraduatedOnboarding = false;
let activeOnboardingId = (onboardingList.find(o => !o.graduated) || onboardingList[0])?.id || "";
let draggedOnboardingTaskId = null;
let onboardingStageOverrides = {};

function toggleOnboardingStageCollapse(obId, stageId) {
  const key = `${obId}_${stageId}`;
  onboardingStageOverrides[key] = !onboardingStageOverrides[key];
  renderOnboardingView();
}

function toggleShowGraduatedOnboarding() {
  showGraduatedOnboarding = !showGraduatedOnboarding;
  const visible = showGraduatedOnboarding ? onboardingList : onboardingList.filter(o => !o.graduated);
  if (!visible.some(o => o.id === activeOnboardingId)) {
    activeOnboardingId = visible[0]?.id || "";
  }
  renderOnboardingView();
}

function saveOnboardingStorage() {
  localStorage.setItem("bryan_onboarding_list", JSON.stringify(onboardingList));
  const badge = document.getElementById("badge-onboarding-count");
  if (badge) badge.textContent = onboardingList.filter(o => !o.graduated).length + " Chuỗi";
}

function openNewOnboardingModal() {
  document.getElementById("ob-merchant-name").value = "";
  document.getElementById("ob-channel-type").value = "POS";
  document.getElementById("modal-new-onboarding").classList.remove("hidden");
}

function closeNewOnboardingModal() {
  document.getElementById("modal-new-onboarding").classList.add("hidden");
}

function handleCreateOnboarding(e) {
  e.preventDefault();
  const name = document.getElementById("ob-merchant-name").value.trim();
  const channel = document.getElementById("ob-channel-type").value;
  if (!name) return;

  const tasks = generateSopTasks(channel, 0);
  const newOb = {
    id: "ob-" + Date.now().toString().slice(-5),
    merchant_name: name,
    channel: channel,
    total_steps: tasks.length,
    tasks: tasks
  };

  onboardingList.unshift(newOb);
  activeOnboardingId = newOb.id;
  saveOnboardingStorage();
  closeNewOnboardingModal();
  navigateTo("ONBOARDING");
  showToast(`✓ Đã khởi tạo quy trình ${tasks.length} bước cho ${name}!`);
}

function openGraduateModal(obId) {
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;

  document.getElementById("grad-ob-id").value = ob.id;
  document.getElementById("grad-merchant-display").textContent = ob.merchant_name;
  document.getElementById("grad-channel-display").textContent = "Kênh đã triển khai: " + (SOP_CHANNELS[ob.channel]?.label || ob.channel);
  document.getElementById("grad-alias").value = "@" + ob.merchant_name.toLowerCase().replace(/[^a-z0-9]/g, "");
  document.getElementById("grad-gmv").value = "~500M VNĐ/tháng";
  document.getElementById("grad-industry").value = "Chuỗi B2B Enterprise";
  document.getElementById("grad-folder").value = "/Users/quangtri/Documents/" + ob.merchant_name.replace(/\s+/g, "-") + "/";
  document.getElementById("grad-stk-name").value = "";
  document.getElementById("grad-stk-role").value = "";
  document.getElementById("grad-stk-phone").value = "";

  document.getElementById("modal-graduate-onboarding").classList.remove("hidden");
}

function closeGraduateModal() {
  document.getElementById("modal-graduate-onboarding").classList.add("hidden");
}

function handleGraduateOnboarding(e) {
  e.preventDefault();
  const obId = document.getElementById("grad-ob-id").value;
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;

  const alias = document.getElementById("grad-alias").value.trim();
  const gmv = document.getElementById("grad-gmv").value.trim() || "~500M VNĐ/tháng";
  const industry = document.getElementById("grad-industry").value.trim() || "Chuỗi B2B";
  const folderPath = document.getElementById("grad-folder").value.trim();
  const stkName = document.getElementById("grad-stk-name").value.trim();
  const stkRole = document.getElementById("grad-stk-role").value.trim() || "Đại Diện Chuỗi";
  const stkPhone = document.getElementById("grad-stk-phone").value.trim();

  const newMId = "m-" + Date.now().toString().slice(-5);
  const chLabel = SOP_CHANNELS[ob.channel]?.label || ob.channel;

  // 1. Tạo Merchant mới bên Dự Án Chuỗi Đối Tác
  state.merchants.push({
    id: newMId,
    name: ob.merchant_name,
    alias: alias.startsWith("@") ? alias : "@" + alias,
    industry: industry,
    expected_gmv: gmv,
    avatar_letter: ob.merchant_name.charAt(0).toUpperCase(),
    color: "bg-teal-700",
    contract_status: `Đã Hoàn Tất Onboarding (${chLabel}) • Đang Vận Hành`
  });

  // 2. Tạo Dự án đầu tiên tương ứng Kênh đã Onboarding
  state.projects.push({
    id: "p-" + Date.now().toString().slice(-5),
    merchant_id: newMId,
    title: `Triển Khai & Vận Hành Kênh ${ob.channel.replace("_", " & ")}`,
    stage: "GO-LIVE",
    due_date: new Date().toISOString().split("T")[0],
    progress: 100,
    milestone_name: "5. Go-Live Chuỗi & Khai Thác GMV",
    gate_step: 5,
    is_blocked: false,
    blocker_reason: "",
    blocker_owner: ""
  });

  // 3. Lưu Folder cục bộ nếu có
  if (folderPath) {
    state.folders.push({
      id: "f-" + Date.now().toString().slice(-5),
      merchant_id: newMId,
      title: `Thư Mục Dự Án ${ob.merchant_name}`,
      path: folderPath,
      note: `Bộ hồ sơ HĐ, BM01, BM03 & tài liệu kênh ${ob.channel}`
    });
  }

  // 4. Lưu Stakeholder nếu có
  if (stkName) {
    state.stakeholders.push({
      id: "s-" + Date.now().toString().slice(-5),
      merchant_id: newMId,
      name: stkName,
      role: stkRole,
      phone: stkPhone,
      email: "",
      group: "Đại Diện Chuỗi"
    });
  }

  // 5. Đánh dấu Onboarding đã bàn giao & Lưu State vĩnh viễn
  ob.graduated = true;
  ob.linked_merchant_id = newMId;
  saveOnboardingStorage();
  saveStateStorage();

  closeGraduateModal();
  updateAllKpis();
  selectMerchant(newMId);
  navigateTo("PROJECTS");
  addNotificationLog(`Đã bàn giao thành công đối tác ${ob.merchant_name} từ Onboarding SOP sang Dự Án Chuỗi!`);
  showToast(`🎉 Đã chuyển ${ob.merchant_name} sang Dự Án Chuỗi Đối Tác!`);
}

/**
 * Tự động đồng bộ các đối tác đã Graduated hoặc đạt 100% Onboarding vào Dự Án Chuỗi Đối Tác
 */
function syncGraduatedOnboardingToState() {
  let changed = false;
  onboardingList.forEach(ob => {
    const is100 = ob.tasks.length > 0 && ob.tasks.every(t => t.status === "DONE");
    if (ob.graduated || is100) {
      const exists = state.merchants.some(m =>
        (ob.linked_merchant_id && m.id === ob.linked_merchant_id) ||
        m.name.toLowerCase() === ob.merchant_name.toLowerCase()
      );
      if (!exists) {
        const newMId = ob.linked_merchant_id || ("m-" + Date.now().toString().slice(-5) + Math.floor(Math.random()*10));
        const chLabel = SOP_CHANNELS[ob.channel]?.label || ob.channel;
        state.merchants.push({
          id: newMId,
          name: ob.merchant_name,
          alias: "@" + ob.merchant_name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          industry: "Chuỗi B2B Enterprise",
          expected_gmv: "~500M VNĐ/tháng",
          avatar_letter: ob.merchant_name.charAt(0).toUpperCase(),
          color: "bg-teal-700",
          contract_status: `Đã Hoàn Tất Onboarding (${chLabel}) • Đang Vận Hành`
        });
        state.projects.push({
          id: "p-" + Date.now().toString().slice(-5) + Math.floor(Math.random()*10),
          merchant_id: newMId,
          title: `Triển Khai & Vận Hành Kênh ${ob.channel.replace("_", " & ")}`,
          stage: "GO-LIVE",
          due_date: new Date().toISOString().split("T")[0],
          progress: 100,
          milestone_name: "5. Go-Live Chuỗi & Khai Thác GMV",
          gate_step: 5,
          is_blocked: false,
          blocker_reason: "",
          blocker_owner: ""
        });
        ob.graduated = true;
        ob.linked_merchant_id = newMId;
        changed = true;
      }
    }
  });
  if (changed) {
    saveOnboardingStorage();
    saveStateStorage();
  }
}

function selectOnboardingMerchant(id) {
  activeOnboardingId = id;
  renderOnboardingView();
}

function deleteOnboardingMerchant(id) {
  if (confirm("Xóa quy trình Onboarding của đối tác này?")) {
    onboardingList = onboardingList.filter(item => item.id !== id);
    activeOnboardingId = onboardingList[0]?.id || "";
    saveOnboardingStorage();
    renderOnboardingView();
    showToast("✓ Đã xóa quy trình Onboarding.");
  }
}

function toggleOnboardingTaskDone(taskId) {
  const ob = onboardingList.find(o => o.id === activeOnboardingId);
  if (!ob) return;
  const t = ob.tasks.find(item => item.id === taskId);
  if (t) {
    t.status = t.status === "DONE" ? "IN_PROGRESS" : "DONE";
    t.completed_at = t.status === "DONE" ? new Date().toISOString() : null;
    t.completed_by = t.status === "DONE" ? "Manual" : null;
    if (typeof computeAttioProjectRollup === "function") computeAttioProjectRollup(ob);
    saveOnboardingStorage();
    renderOnboardingView();

    // Nếu vừa hoàn thành 100% và chưa bàn giao -> Tự động gợi ý mở Modal Bàn Giao
    const is100 = ob.tasks.length > 0 && ob.tasks.every(item => item.status === "DONE");
    if (is100 && !ob.graduated) {
      showToast(`🎉 Chúc mừng! ${ob.merchant_name} đã đạt 100%. Hãy hoàn tất bàn giao sang Dự Án Chuỗi!`);
      setTimeout(() => openGraduateModal(ob.id), 450);
    }
  }
}

// HTML5 Drag & Drop Handlers
function onObDragStart(e, taskId) {
  draggedOnboardingTaskId = taskId;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", taskId);
  setTimeout(() => {
    e.target.classList.add("opacity-40");
  }, 0);
}

function onObDragEnd(e) {
  e.target.classList.remove("opacity-40");
}

function onObDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("ring-2", "ring-teal-400", "bg-teal-50/40");
}

function onObDragLeave(e) {
  e.currentTarget.classList.remove("ring-2", "ring-teal-400", "bg-teal-50/40");
}

function onObDrop(e, targetStage) {
  e.preventDefault();
  e.currentTarget.classList.remove("ring-2", "ring-teal-400", "bg-teal-50/40");

  const taskId = draggedOnboardingTaskId || e.dataTransfer.getData("text/plain");
  if (!taskId) return;

  const ob = onboardingList.find(o => o.id === activeOnboardingId);
  if (!ob) return;

  const task = ob.tasks.find(t => t.id === taskId);
  if (task) {
    task.stage = targetStage;
    if (targetStage === "STAGE_GOLIVE") {
      task.status = "DONE";
    }
    saveOnboardingStorage();
    renderOnboardingView();
    showToast(`✓ Đã chuyển Bước ${task.step_no} sang cột mới!`);
  }
  draggedOnboardingTaskId = null;
}

let onboardingFilter = "ALL"; // ALL | PENDING | DONE

function setOnboardingFilter(f) {
  onboardingFilter = f;
  renderOnboardingView();
}

function renderOnboardingView() {
  saveOnboardingStorage();

  const activeList = onboardingList.filter(o => !o.graduated);
  const graduatedList = onboardingList.filter(o => o.graduated);
  const visibleList = showGraduatedOnboarding ? onboardingList : activeList;

  if (!visibleList.some(o => o.id === activeOnboardingId)) {
    activeOnboardingId = visibleList[0]?.id || "";
  }

  // 1. Render Pills
  const pillsBar = document.getElementById("onboarding-pills-bar");
  if (pillsBar) {
    const pillsHtml = visibleList.map(ob => {
      const isActive = ob.id === activeOnboardingId;
      const doneCnt = ob.tasks.filter(t => t.status === "DONE").length;
      const pct = Math.round((doneCnt / ob.total_steps) * 100);
      const slaEval = typeof evaluateOnboardingSla === "function" ? evaluateOnboardingSla(ob) : { dotColor: "green", dotLabel: "Đúng tiến độ" };
      const dotCls = slaEval.dotColor === "red" ? "bg-rose-500" : (slaEval.dotColor === "amber" ? "bg-amber-400" : "bg-emerald-500");
      return `
        <button onclick="selectOnboardingMerchant('${ob.id}')" title="${slaEval.dotLabel}" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
          isActive ? 'bg-teal-700 text-white shadow-sm' : (ob.graduated ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
        }">
          <span class="w-2 h-2 rounded-full ${ob.graduated ? 'bg-emerald-500' : dotCls} shrink-0"></span>
          <span>${ob.merchant_name}</span>
          <span class="px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'}">${ob.graduated ? 'Đã bàn giao' : pct + '%'}</span>
        </button>
      `;
    }).join('');

    const toggleGraduatedBtn = graduatedList.length > 0 ? `
      <button onclick="toggleShowGraduatedOnboarding()" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 border ${
        showGraduatedOnboarding
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
      }" title="Ẩn/hiện các chuỗi đã hoàn tất Go-Live & Bàn giao">
        <i data-lucide="archive" class="w-3.5 h-3.5"></i>
        <span>${showGraduatedOnboarding ? 'Ẩn chuỗi đã bàn giao' : `Đã bàn giao (${graduatedList.length})`}</span>
      </button>
    ` : '';

    pillsBar.innerHTML = pillsHtml + toggleGraduatedBtn;
  }

  const activeOb = visibleList.find(o => o.id === activeOnboardingId);
  const headerEl = document.getElementById("onboarding-active-header");
  const boardEl = document.getElementById("onboarding-kanban-board");

  if (!activeOb) {
    if (headerEl) {
      headerEl.innerHTML = graduatedList.length > 0
        ? `<div class="text-center text-xs text-slate-500 py-3">Tất cả chuỗi đối tác đã hoàn tất triển khai & bàn giao sang <b>Dự Án Chuỗi Đối Tác</b>! Bấm <b>"Đã bàn giao (${graduatedList.length})"</b> ở trên nếu cần xem lại hồ sơ 18 bước, hoặc thêm đối tác mới.</div>`
        : `<div class="text-center text-xs text-slate-400 py-2">Chưa có đối tác triển khai nào. Bấm "+ Thêm Đối Tác / Triển Khai Mới" để bắt đầu!</div>`;
    }
    if (boardEl) boardEl.innerHTML = "";
    lucide.createIcons();
    return;
  }

  // 2. Tính tiến độ % chuẩn xác 100% + Rollup Stage theo cơ chế Attio
  const rollup = typeof computeAttioProjectRollup === "function"
    ? computeAttioProjectRollup(activeOb)
    : {
        completed_steps: activeOb.tasks.filter(t => t.status === "DONE").length,
        total_steps: activeOb.total_steps,
        progress_rate: Math.round((activeOb.tasks.filter(t => t.status === "DONE").length / activeOb.total_steps) * 100),
        current_stage: "LEGAL_AND_CMS"
      };
  const completedCount = rollup.completed_steps;
  const pendingCount = activeOb.total_steps - completedCount;
  const progressPct = rollup.progress_rate;
  const stageLabel = (typeof ATTIO_STAGE_LABELS !== "undefined" && ATTIO_STAGE_LABELS[rollup.current_stage]) || rollup.current_stage;
  const chInfo = SOP_CHANNELS[activeOb.channel]?.label || activeOb.channel;

  // Tìm bước tiếp theo cần làm (Next Action Step - số thứ tự nhỏ nhất chưa DONE)
  const pendingTasksSorted = activeOb.tasks.filter(t => t.status !== "DONE").sort((a, b) => a.step_no - b.step_no);
  const nextActionId = pendingTasksSorted[0]?.id || null;

  if (headerEl) {
    headerEl.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <!-- Left: Title & Channel & Progress -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-black text-slate-900">${activeOb.merchant_name}</h3>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">${chInfo}</span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200" title="Giai đoạn tự động tính theo Attio Rollup">${stageLabel}</span>
          </div>

          <div class="flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <span class="text-[11px] font-bold text-slate-600">Tiến độ: <strong class="text-teal-700">${completedCount}/${activeOb.total_steps}</strong></span>
            <div class="w-28 bg-slate-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-teal-600 to-emerald-500 h-2 rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
            </div>
            <span class="text-xs font-black text-teal-700">${progressPct}%</span>
          </div>
        </div>

        <!-- Right: Graduation Button + Quick Filter Pills + Delete -->
        <div class="flex flex-wrap items-center gap-2">
          ${activeOb.graduated ? `
            <button onclick="selectMerchant('${activeOb.linked_merchant_id}'); navigateTo('PROJECTS');" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>Đã Bàn Giao • Mở Workspace →</span>
            </button>
          ` : progressPct === 100 ? `
            <button onclick="openGraduateModal('${activeOb.id}')" class="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[11px] font-black flex items-center space-x-1.5 shadow-md shadow-emerald-500/30 animate-pulse transition">
              <i data-lucide="rocket" class="w-3.5 h-3.5"></i>
              <span>Đạt 100% • Bàn Giao Sang Dự Án Chuỗi →</span>
            </button>
          ` : `
            <button onclick="openGraduateModal('${activeOb.id}')" class="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 rounded-xl text-[11px] font-semibold flex items-center space-x-1 transition" title="Đẩy đối tác sang Dự Án Chuỗi Đối Tác">
              <i data-lucide="arrow-right-circle" class="w-3.5 h-3.5"></i>
              <span>Đẩy Sang Dự Án Chuỗi</span>
            </button>
          `}

          <div class="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center text-[11px] font-bold">
            <button onclick="setOnboardingFilter('ALL')" class="px-2.5 py-1 rounded-lg transition ${onboardingFilter === 'ALL' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">
              Tất cả (${activeOb.total_steps})
            </button>
            <button onclick="setOnboardingFilter('PENDING')" class="px-2.5 py-1 rounded-lg transition ${onboardingFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">
              Chưa xong (${pendingCount})
            </button>
            <button onclick="setOnboardingFilter('DONE')" class="px-2.5 py-1 rounded-lg transition ${onboardingFilter === 'DONE' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">
              Đã xong (${completedCount})
            </button>
          </div>

          <button onclick="deleteOnboardingMerchant('${activeOb.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 hover:bg-rose-50 transition" title="Xóa quy trình này">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  // 3. Render Giao Diện Pipedrive 2 Tầng: Thanh Tiến Trình Chặng + 4 Giai Đoạn Thu Gọn Thông Minh + SLA
  const slaSummary = typeof evaluateOnboardingSla === "function"
    ? evaluateOnboardingSla(activeOb)
    : { dotColor: "green", dotLabel: "Đúng tiến độ", stepSla: {}, capWarning: null, elapsedWorkingDays: 0, overdueCount: 0, warningCount: 0 };

  const stages = [
    { id: "STAGE_LEGAL_CMS", short: "1. Pháp Lý & CMS", title: "1. Pháp Lý & Phê Duyệt Hệ Thống (CMS)" },
    { id: "STAGE_SIGN_HANDOVER", short: "2. Ký Kết & BG", title: "2. Ký Kết & Bàn Giao Hồ Sơ" },
    { id: "STAGE_CONFIG_DEVICE", short: "3. Cấu Hình & TB", title: "3. Cấu Hình Kỹ Thuật & Cấp Thiết Bị" },
    { id: "STAGE_GOLIVE", short: "4. Nghiệm Thu", title: "4. Nghiệm Thu & Chính Thức Hoạt Động (Go-Live)" }
  ];

  const deptBadgeColor = (dept) => {
    if (dept === 'Duyệt') return 'bg-purple-100 text-purple-700';
    if (dept === 'DevOps') return 'bg-rose-100 text-rose-700';
    if (dept === 'ASM') return 'bg-amber-100 text-amber-800';
    if (dept === 'Core') return 'bg-blue-100 text-blue-700';
    if (dept === 'BGĐ' || dept === 'Đối tác') return 'bg-teal-100 text-teal-800';
    return 'bg-slate-100 text-slate-700';
  };

  if (boardEl) {
    // Thanh tiến trình chặng ngang + Cảnh báo trần 22 ngày làm việc
    const stepperHtml = `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2 text-xs">
            <span class="w-2.5 h-2.5 rounded-full ${slaSummary.dotColor === 'red' ? 'bg-rose-500 animate-pulse' : (slaSummary.dotColor === 'amber' ? 'bg-amber-400' : 'bg-emerald-500')}"></span>
            <span class="font-bold text-slate-800">Tình trạng SLA: ${slaSummary.dotLabel}</span>
            ${activeOb.project_start_date ? `<span class="text-slate-400">• Đã chạy ${slaSummary.elapsedWorkingDays}/22 ngày làm việc</span>` : ''}
          </div>
          ${slaSummary.capWarning ? `<span class="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">${slaSummary.capWarning}</span>` : ''}
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          ${stages.map((st, idx) => {
            const stTasks = activeOb.tasks.filter(t => t.stage === st.id);
            const doneCnt = stTasks.filter(t => t.status === "DONE").length;
            const totalCnt = stTasks.length;
            const isAllDone = totalCnt > 0 && doneCnt === totalCnt;
            const hasNext = stTasks.some(t => t.id === nextActionId);
            return `
              <div class="px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                isAllDone ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : (hasNext ? 'bg-teal-50 border-teal-400 text-teal-900 ring-1 ring-teal-300' : 'bg-slate-50 border-slate-200 text-slate-500')
              }">
                <span class="truncate">${isAllDone ? '✓' : (hasNext ? '▶' : (idx + 1) + '.')} ${st.short}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/80 shrink-0">${doneCnt}/${totalCnt}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 4 Giai đoạn Smart Auto-Collapse
    const stagesHtml = stages.map(st => {
      let stageTasks = activeOb.tasks.filter(t => t.stage === st.id);
      const colDoneCount = stageTasks.filter(t => t.status === "DONE").length;
      const colTotalCount = stageTasks.length;
      const isStageCompleted = colTotalCount > 0 && colDoneCount === colTotalCount;
      const hasNextAction = stageTasks.some(t => t.id === nextActionId);

      // Mặc định: Giai đoạn xong 100% -> Thu gọn; Giai đoạn đang chạy -> Mở; Tương lai -> Thu gọn (trừ khi user bấm mở)
      const overrideKey = `${activeOb.id}_${st.id}`;
      let isExpanded = hasNextAction || (!isStageCompleted && colDoneCount > 0);
      if (onboardingFilter !== "ALL") isExpanded = true;
      if (Object.prototype.hasOwnProperty.call(onboardingStageOverrides, overrideKey)) {
        isExpanded = onboardingStageOverrides[overrideKey];
      }

      if (onboardingFilter === "PENDING") stageTasks = stageTasks.filter(t => t.status !== "DONE");
      if (onboardingFilter === "DONE") stageTasks = stageTasks.filter(t => t.status === "DONE");
      stageTasks.sort((a, b) => a.step_no - b.step_no);

      return `
        <div class="rounded-2xl border transition overflow-hidden ${
          isStageCompleted ? 'border-emerald-200 bg-emerald-50/30'
          : (hasNextAction ? 'border-teal-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/70')
        }">
          <button type="button" onclick="toggleOnboardingStageCollapse('${activeOb.id}', '${st.id}')" class="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02] transition">
            <div class="flex items-center space-x-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                isStageCompleted ? 'bg-emerald-600 text-white' : (hasNextAction ? 'bg-teal-600 text-white' : 'bg-slate-300 text-white')
              }">${isStageCompleted ? '✓' : (hasNextAction ? '●' : '○')}</span>
              <span class="text-xs font-black ${isStageCompleted ? 'text-emerald-900' : (hasNextAction ? 'text-slate-900' : 'text-slate-600')} truncate">${st.title}</span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isStageCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-700'
              }">${colDoneCount}/${colTotalCount} bước</span>
            </div>
            <span class="text-[11px] font-bold text-slate-500 shrink-0">${isExpanded ? 'Thu gọn ▲' : 'Mở rộng ▼'}</span>
          </button>

          ${isExpanded ? `
            <div class="px-4 pb-4 pt-1 space-y-2 border-t border-slate-100">
              ${stageTasks.length > 0 ? stageTasks.map(t => {
                const isDone = t.status === "DONE";
                const isNext = t.id === nextActionId;
                const slaInfo = slaSummary.stepSla[t.step_no];
                const slaText = typeof formatSlaRemainingText === "function" ? formatSlaRemainingText(slaInfo) : "";

                let slaPillClass = "bg-slate-100 text-slate-500";
                if (slaInfo?.statusCode === "OVERDUE") slaPillClass = "bg-rose-100 text-rose-700 font-bold";
                else if (slaInfo?.statusCode === "WARNING") slaPillClass = "bg-amber-100 text-amber-800 font-bold";
                else if (slaInfo?.statusCode === "ON_TRACK") slaPillClass = "bg-emerald-50 text-emerald-700 font-semibold";
                else if (slaInfo?.statusCode === "SOFT_WAIT") slaPillClass = "bg-slate-100 text-slate-600 font-semibold";

                return `
                  <div class="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                    isDone ? 'bg-emerald-50/40 border-emerald-200/70 opacity-80'
                    : (isNext ? 'bg-teal-50/40 border-teal-500 ring-1 ring-teal-500/20 shadow-xs'
                    : (slaInfo?.activated ? 'bg-white border-slate-200' : 'bg-slate-50/80 border-slate-200/70 opacity-75'))
                  }">
                    <div class="flex items-start space-x-2.5 min-w-0">
                      <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleOnboardingTaskDone('${t.id}')" class="w-4 h-4 mt-0.5 text-teal-600 rounded cursor-pointer shrink-0" />
                      <div class="min-w-0">
                        <div class="flex items-center flex-wrap gap-1.5">
                          <span class="text-[10px] font-black px-1.5 py-0.5 rounded ${isNext ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}">B${t.step_no}</span>
                          ${isNext ? `<span class="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Bước kế tiếp cần làm</span>` : ''}
                          ${t.step_no === 16 ? `<span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Thời hạn mềm</span>` : ''}
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${deptBadgeColor(t.dept)}">${t.dept}</span>
                        </div>
                        <p class="text-xs font-bold mt-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 sm:pl-4">
                      ${slaText ? `<span class="text-[11px] px-2.5 py-1 rounded-lg ${slaPillClass} whitespace-nowrap">${slaText}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('') : `<div class="text-xs text-slate-400 py-3 text-center">Không có bước nào khớp bộ lọc.</div>`}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    boardEl.innerHTML = `<div class="col-span-full space-y-3">${stepperHtml}${stagesHtml}</div>`;
  }

  lucide.createIcons();
}

