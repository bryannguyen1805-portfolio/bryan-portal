// -------------------------------------------------------------
// 8. ANTIGRAVITY NLP ENGINE (TIẾNG VIỆT)
// -------------------------------------------------------------
function setNlpCommand(cmd) {
  const input = document.getElementById("nlp-command-input");
  if (input) {
    input.value = cmd;
    input.focus();
  }
}

function hideOmnibarPreview() {
  document.getElementById("omnibar-preview")?.classList.add("hidden");
}

// Phím tắt toàn cục Ctrl+K (Windows) / Cmd+K (macOS) & Esc
window.addEventListener("DOMContentLoaded", () => {
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
  const kbd = document.getElementById("omnibar-shortcut-kbd");
  const inp = document.getElementById("nlp-command-input");
  if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl+K";
  if (inp) inp.placeholder = `Tìm kiếm đối tác, dự án hoặc nhập lệnh nhanh (${isMac ? "⌘K" : "Ctrl + K"})...`;
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const inp = document.getElementById("nlp-command-input");
    if (inp) {
      inp.focus();
      inp.select();
      handleOmnibarLivePreview(inp.value);
    }
  } else if (e.key === "Escape") {
    hideOmnibarPreview();
  }
});

// Live Token Preview khi người dùng đang gõ trên Omnibar (Mục 2.3 SRS)
function handleOmnibarLivePreview(raw) {
  const box = document.getElementById("omnibar-preview");
  const tokensEl = document.getElementById("omnibar-preview-tokens");
  if (!box || !tokensEl) return;

  const val = (raw || "").trim();
  if (!val) {
    box.classList.add("hidden");
    return;
  }

  const lower = val.toLowerCase();
  const chips = [];

  // 0. Lệnh GO LIVE nhanh: "go live [Tên thương hiệu / Tên đối tác]"
  if (/^(go\s*-?\s*live|golive|bàn giao)\b/i.test(lower)) {
    const qName = val.replace(/^(go\s*-?\s*live|golive|bàn giao)\s*/i, "").trim();
    const matchedOb = findOnboardingByBrandOrName(qName);
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">🚀 Hoàn tất toàn bộ bước & Chuyển sang Chuỗi Đối Tác</span>`);
    if (matchedOb) {
      chips.push(`<span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">🏢 ${matchedOb.brand_name || matchedOb.merchant_name}</span>`);
    } else if (qName) {
      chips.push(`<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">Tìm đối tác: ${qName}</span>`);
    }
  }
  // 1. Tạo quy trình mới
  else if (lower.includes("triển khai mới") || lower.includes("onboard mới")) {
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">🚀 Khởi tạo quy trình mới</span>`);
    let ch = "POS (15 bước)";
    if (lower.includes("paylink")) ch = "POS & Paylink (18 bước)";
    else if (lower.includes("pos") && lower.includes("pgw")) ch = "POS & PGW (18 bước)";
    else if (lower.includes("pgw")) ch = "PGW (19 bước)";
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">Kênh: ${ch}</span>`);
  }
  // 2. Đặt lịch họp
  else if ((lower.startsWith("họp") || lower.includes("lịch họp")) && !lower.includes("tạo task")) {
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">📅 Tạo lịch họp</span>`);
    const tMatch = val.match(/\b(\d{1,2})[:h](\d{0,2})\b/i);
    if (tMatch) {
      const hh = String(parseInt(tMatch[1], 10)).padStart(2, "0");
      const mm = tMatch[2] ? tMatch[2].padStart(2, "0") : "00";
      chips.push(`<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">🕒 ${hh}:${mm}</span>`);
    }
    const dMatch = val.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (dMatch) {
      chips.push(`<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">📆 ${dMatch[0]}</span>`);
    }
    const mFound = state.merchants.find(m => lower.includes(m.name.toLowerCase()) || lower.includes(m.alias.replace("@","").toLowerCase()));
    if (mFound) chips.push(`<span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">🏢 ${mFound.name}</span>`);
  }
  // 3. Tick bước Onboarding (Context-Aware + Attio NLP Aliases)
  else if (/\b(xong|hoàn thành|done|đã duyệt|duyệt|tới)\b/i.test(lower) || /\bb\d{1,2}\b/i.test(lower) || /\bbước\s*\d{1,2}\b/i.test(lower) || (typeof resolveAttioCommandTarget === "function" && resolveAttioCommandTarget(val).targetStepNo !== null)) {
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">✓ Cập nhật tiến độ (Attio)</span>`);
    const resolved = typeof resolveAttioCommandTarget === "function" ? resolveAttioCommandTarget(val) : null;
    const targetOb = resolved?.targetOb;
    if (targetOb) {
      chips.push(`<span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">🏢 ${targetOb.merchant_name}</span>`);
      if (resolved.targetStepNo) {
        const st = targetOb.tasks.find(t => t.step_no === resolved.targetStepNo);
        if (st) chips.push(`<span class="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-semibold">B${st.step_no}: ${st.title}</span>`);
      }
    }
  }
  // 4. Tạo Task
  else if (lower.includes("tạo task") || lower.includes("task")) {
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">📋 Tạo đầu việc mới</span>`);
  }
  // Mặc định: gợi ý thao tác nhanh
  else {
    chips.push(`<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">💡 Gợi ý: <strong>xong B3</strong> • <strong>TBP duyệt</strong> • <strong>Họp Highlands 13h 23/11</strong> • <strong>Triển khai mới [Tên] kênh [POS]</strong></span>`);
  }

  tokensEl.innerHTML = chips.join("");
  box.classList.remove("hidden");
}

function findOnboardingByBrandOrName(query) {
  const q = (query || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const candidates = onboardingList.filter(o => !o.graduated);
  const pool = candidates.length > 0 ? candidates : onboardingList;
  if (!q) return pool.find(o => o.id === activeOnboardingId) || pool[0] || null;
  return pool.find(o => {
    const b = (o.brand_name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
    const n = (o.merchant_name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
    return (b && (b.includes(q) || q.includes(b))) || (n && (n.includes(q) || q.includes(n)));
  }) || null;
}

function executeAutoGoLiveByName(queryName) {
  const ob = findOnboardingByBrandOrName(queryName);
  if (!ob) {
    showToast(`Không tìm thấy đối tác đang triển khai khớp với "${queryName}".`, true);
    return false;
  }

  const nowIso = new Date().toISOString();
  ob.tasks.forEach(t => {
    t.status = "DONE";
    t.completed_at = t.completed_at || nowIso;
    t.completed_by = t.completed_by || "ANTIGRAVITY_AUTOMATION";
  });
  if (typeof computeAttioProjectRollup === "function") computeAttioProjectRollup(ob);

  const brand = ob.brand_name || ob.merchant_name;
  const chLabel = (typeof SOP_CHANNELS !== "undefined" && SOP_CHANNELS[ob.channel]?.label) || ob.channel;
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  if (!ob.graduated) {
    const newMId = "m-" + Date.now().toString().slice(-5);
    const aliasBase = brand.toLowerCase().replace(/[^a-z0-9]/g, "") || "partner";
    state.merchants.push({
      id: newMId,
      name: ob.merchant_name,
      brand_name: brand,
      alias: "@" + aliasBase,
      industry: "Chuỗi B2B Enterprise",
      expected_gmv: "~500M VNĐ/tháng",
      avatar_letter: brand.charAt(0).toUpperCase(),
      color: "bg-teal-700",
      contract_expiry_date: nextYear.toISOString().split("T")[0],
      contract_status: `Đã Hoàn Tất Triển Khai (${chLabel}) • Đang Vận Hành`
    });
    state.projects.push({
      id: "p-" + Date.now().toString().slice(-5),
      merchant_id: newMId,
      title: `Triển Khai & Vận Hành Kênh ${ob.channel.replace("_", " & ")}`,
      stage: "GO-LIVE",
      due_date: nowIso.split("T")[0],
      progress: 100,
      milestone_name: "5. Go-Live Chuỗi & Khai Thác GMV",
      gate_step: 5,
      is_blocked: false,
      blocker_reason: "",
      blocker_owner: ""
    });
    ob.graduated = true;
    ob.linked_merchant_id = newMId;
  }

  saveOnboardingStorage();
  saveStateStorage();
  updateAllKpis();
  if (typeof renderDashboardOnboardingSummary === "function") renderDashboardOnboardingSummary();
  if (typeof renderDashboardProjectsProgress === "function") renderDashboardProjectsProgress();
  if (ob.linked_merchant_id && typeof selectMerchant === "function") {
    selectMerchant(ob.linked_merchant_id);
    navigateTo("PROJECTS");
  }
  if (typeof addNotificationLog === "function") {
    addNotificationLog(`Đã tự động Go-Live toàn bộ ${ob.total_steps} bước cho ${brand} và chuyển sang Chuỗi Đối Tác!`);
  }
  showToast(`Đã hoàn tất ${ob.total_steps}/${ob.total_steps} bước và chuyển "${brand}" sang Chuỗi Đối Tác!`);
  return true;
}

async function handleCommandSubmit(e) {
  e.preventDefault();
  hideOmnibarPreview();
  const input = document.getElementById("nlp-command-input");
  const cmd = input.value.trim();
  if (!cmd) return;

  input.value = "";
  const lower = cmd.toLowerCase();

  // 0. LỆNH GO LIVE TỰ ĐỘNG: "go live [Tên thương hiệu / Tên đối tác]"
  if (/^(go\s*-?\s*live|golive|bàn giao)\b/i.test(lower)) {
    const qName = cmd.replace(/^(go\s*-?\s*live|golive|bàn giao)\s*/i, "").trim();
    executeAutoGoLiveByName(qName);
    return;
  }

  // 0-CUSTOM. KIỂM TRA LỆNH TẮT DO NGƯỜI DÙNG TỰ TẠO TRONG MỤC TỰ ĐỘNG HÓA
  if (typeof customAutomationRules !== "undefined" && Array.isArray(customAutomationRules)) {
    const matchedCmdRule = customAutomationRules.find(r =>
      r.enabled && r.trigger === "COMMAND" && r.keyword && lower.startsWith(r.keyword.toLowerCase().trim())
    );
    if (matchedCmdRule) {
      const argText = cmd.slice(matchedCmdRule.keyword.trim().length).trim();
      if (matchedCmdRule.action === "COMPLETE_AND_GRADUATE") {
        executeAutoGoLiveByName(argText);
      } else {
        executeSingleAutomationRule(matchedCmdRule, { title: argText || cmd, pic: "Bryan" }, true);
      }
      return;
    }
  }

  // 0A. TỰ ĐỘNG HÓA ONBOARDING SOP: "Triển khai mới [Tên] kênh [Kênh]"
  if (lower.includes("triển khai mới") || lower.includes("onboard mới") || lower.includes("onboarding mới")) {
    // Trích xuất tên đối tác (giữa prefix và chữ 'kênh', hoặc phần còn lại)
    let cleanText = cmd.replace(/^(triển khai mới|onboarding mới|onboard mới)\s*/i, "").trim();
    let merchantName = cleanText;
    let channelPart = lower;

    const kenhMatch = cleanText.match(/^(.*?)\s+kênh\s+(.+)$/i);
    if (kenhMatch) {
      merchantName = kenhMatch[1].trim();
      channelPart = kenhMatch[2].toLowerCase();
    } else {
      // Loại bỏ tên kênh nếu không có chữ "kênh"
      merchantName = cleanText.replace(/\b(pos\s*&\s*paylink|pos\s*&\s*pgw|paylink|pgw|pos)\b/gi, "").trim();
    }

    if (!merchantName) merchantName = "Đối Tác Mới";

    // Xác định kênh triển khai
    let channelKey = "POS";
    if (channelPart.includes("paylink")) {
      channelKey = "POS_PAYLINK";
    } else if (channelPart.includes("pos") && channelPart.includes("pgw")) {
      channelKey = "POS_PGW";
    } else if (channelPart.includes("pgw")) {
      channelKey = "PGW";
    }

    const tasks = generateSopTasks(channelKey, 0);
    const newOb = {
      id: "ob-" + Date.now().toString().slice(-5),
      merchant_name: merchantName,
      channel: channelKey,
      total_steps: tasks.length,
      tasks: tasks
    };

    onboardingList.unshift(newOb);
    activeOnboardingId = newOb.id;
    saveOnboardingStorage();
    navigateTo("ONBOARDING");
    showToast(`✓ Đã tự động tạo Onboarding "${merchantName}" (${SOP_CHANNELS[channelKey].label})!`);
    return;
  }

  // 0B. TỰ ĐỘNG TICK XONG TỚI BƯỚC ONBOARDING (ATTIO CONTEXT & ROLLUP ENGINE)
  const attioPrecheck = typeof resolveAttioCommandTarget === "function" ? resolveAttioCommandTarget(cmd) : null;
  const hasOnboardingDoneCue = /\b(xong|hoàn thành|done|đã duyệt|duyệt|đã trình|đã gửi|đã làm|tới)\b/i.test(lower) || /\bb\d{1,2}\b/i.test(lower) || /\bbước\s*\d{1,2}\b/i.test(lower) || (attioPrecheck && attioPrecheck.targetStepNo !== null);
  if (hasOnboardingDoneCue && !lower.includes("tạo task") && !lower.includes("khẩn cấp") && !lower.includes("blocker") && !lower.startsWith("họp")) {
    const resolved = attioPrecheck || { targetOb: null, targetStepNo: null };
    if (resolved.targetOb && resolved.targetStepNo) {
      const targetOb = resolved.targetOb;
      const targetStep = resolved.targetStepNo;
      const beforeSnap = {
        obId: targetOb.id,
        tasks: JSON.parse(JSON.stringify(targetOb.tasks)),
        project_start_date: targetOb.project_start_date || null,
        current_stage: targetOb.current_stage || "LEGAL_AND_CMS",
        progress_rate: targetOb.progress_rate || 0,
        completed_steps: targetOb.completed_steps || 0
      };
      const ev = typeof mutateAttioDeploymentStep === "function"
        ? mutateAttioDeploymentStep(targetOb, targetStep, cmd)
        : null;

      activeOnboardingId = targetOb.id;
      saveOnboardingStorage();
      updateAllKpis();
      navigateTo("ONBOARDING");

      const stepTitle = ev?.data?.updated_step?.title || `Bước ${targetStep}`;
      const msgText = `Đã hoàn tất B${targetStep} (${stepTitle}) cho ${targetOb.merchant_name}.`;
      if (typeof pushUndoAction === "function") {
        pushUndoAction({
          module: "DEPLOYMENT_STEP",
          action_type: "COMPLETE",
          entity_id: `${targetOb.id}_B${targetStep}`,
          display_label: `B${targetStep} (${stepTitle})`,
          context_label: targetOb.merchant_name,
          before: beforeSnap,
          after: { obId: targetOb.id, tasks: targetOb.tasks, project_start_date: targetOb.project_start_date, current_stage: targetOb.current_stage, progress_rate: targetOb.progress_rate, completed_steps: targetOb.completed_steps },
          toastMessage: msgText
        });
      } else {
        showToast(msgText);
      }
      if (typeof addNotificationLog === "function") {
        addNotificationLog(`[Attio Automation] ${msgText}`);
      }

      const is100 = targetOb.tasks.length > 0 && targetOb.tasks.every(item => item.status === "DONE");
      if (is100 && !targetOb.graduated) {
        setTimeout(() => openGraduateModal(targetOb.id), 450);
      }
      return;
    }
  }

  // 1. Chuyển nhanh workspace @merchant
  if (lower.startsWith("@")) {
    const tag = lower.split(" ")[0];
    const m = state.merchants.find(item => item.alias.toLowerCase() === tag);
    if (m) {
      selectMerchant(m.id);
      navigateTo("PROJECTS");
      showToast(`✓ Đã chuyển sang không gian đối tác ${m.name}`);
      return;
    }
  }

  // 2. Kích hoạt Blocker
  if (lower.includes("khẩn cấp") || lower.includes("blocker") || lower.includes("lỗi ip")) {
    let matchedProj = state.projects[0];
    if (lower.includes("highlands")) matchedProj = state.projects.find(p => p.merchant_id === "m-highlands");
    if (lower.includes("jdv")) matchedProj = state.projects.find(p => p.merchant_id === "m-jdv");
    if (lower.includes("việt thanh") || lower.includes("vietthanh")) matchedProj = state.projects.find(p => p.merchant_id === "m-vietthanh");

    if (matchedProj) {
      matchedProj.is_blocked = true;
      matchedProj.blocker_reason = cmd.replace(/@\w+/g, '').replace(/khẩn cấp/gi, '').trim() || "Vướng mắc tiến độ cam kết";
      matchedProj.blocker_owner = "Đội ngũ Đối tác";

      postDataToGoogleSheets({
        action: "UPDATE_BLOCKER",
        project_id: matchedProj.id,
        is_blocked: true,
        blocker_reason: matchedProj.blocker_reason,
        blocker_owner: matchedProj.blocker_owner
      });

      renderMerchantWorkspaceBody();
      updateAllKpis();
      showToast(`✓ Antigravity AI đã gắn cờ Blocker cho ${matchedProj.title}`);
      return;
    }
  }

  // 2B. Tạo Lịch Họp Nhanh Qua NLP (VD: "Họp Recurring Highlands 13h 23/11/2026")
  if ((lower.startsWith("họp") || lower.includes("lịch họp")) && !lower.includes("tạo task")) {
    // 1. Trích xuất Ngày (DD/MM/YYYY, DD/MM, ngày mai, hôm nay)
    let meetDate = "2026-11-21";
    const dateMatch = cmd.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (dateMatch) {
      const dd = String(parseInt(dateMatch[1], 10)).padStart(2, "0");
      const mm = String(parseInt(dateMatch[2], 10)).padStart(2, "0");
      let yyyy = dateMatch[3] || "2026";
      if (yyyy.length === 2) yyyy = "20" + yyyy;
      meetDate = `${yyyy}-${mm}-${dd}`;
    } else if (lower.includes("ngày mai") || lower.includes("mai")) {
      meetDate = "2026-11-22";
    }

    // 2. Trích xuất Giờ (13h, 13h30, 14:30)
    const timeMatch = cmd.match(/\b(\d{1,2})[:h](\d{0,2})\b/i);
    let meetTime = "Trong ngày";
    if (timeMatch) {
      const hh = String(parseInt(timeMatch[1], 10)).padStart(2, "0");
      const min = timeMatch[2] ? timeMatch[2].padStart(2, "0") : "00";
      meetTime = `${hh}:${min}`;
    }

    // 3. Tự động nhận diện Đối Tác trong câu
    let matchedPartner = "";
    const foundMerchant = state.merchants.find(m =>
      lower.includes(m.name.toLowerCase()) ||
      lower.includes(m.alias.replace("@", "").toLowerCase())
    );
    if (foundMerchant) {
      matchedPartner = foundMerchant.name;
    } else {
      const foundOb = onboardingList.find(o => lower.includes(o.merchant_name.toLowerCase()));
      if (foundOb) matchedPartner = foundOb.merchant_name;
    }

    // 4. Làm sạch tiêu đề cuộc họp
    let meetTitle = cmd
      .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, "")
      .replace(/\b(\d{1,2})[:h](\d{0,2})\b/gi, "")
      .replace(/\b(lịch họp|lúc|ngày mai|hôm nay|ngày)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!meetTitle) meetTitle = "Họp đối tác" + (matchedPartner ? " " + matchedPartner : "");

    state.meetings.push({
      id: "mt-" + Date.now().toString().slice(-4),
      date: meetDate,
      time: meetTime,
      title: meetTitle,
      partner: matchedPartner,
      attendees: "Bryan" + (matchedPartner ? ", Đại diện " + matchedPartner : "")
    });
    saveStateStorage();

    // Cập nhật tháng & ngày đang chọn trên Lịch Calendar rồi chuyển sang xem ngay
    const dParts = meetDate.split("-");
    if (dParts.length === 3) {
      calYear = parseInt(dParts[0], 10);
      calMonth = parseInt(dParts[1], 10) - 1;
      selectedCalendarDate = meetDate;
    }

    renderDashboardMeetings();
    navigateTo("CALENDAR");
    const vnDate = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
    showToast(`✓ Đã thêm vào Lịch: "${meetTitle}" lúc ${meetTime} ngày ${vnDate}!`);
    return;
  }

  // 3. Tạo Task mới
  if (lower.includes("tạo task") || lower.includes("task") || lower.includes("họp")) {
    let matchedProj = state.projects.find(p => p.merchant_id === activeMerchantId) || state.projects[0];
    if (lower.includes("highlands")) matchedProj = state.projects.find(p => p.merchant_id === "m-highlands");
    if (lower.includes("jdv")) matchedProj = state.projects.find(p => p.merchant_id === "m-jdv");
    if (lower.includes("việt thanh") || lower.includes("vietthanh")) matchedProj = state.projects.find(p => p.merchant_id === "m-vietthanh");

    let taskType = "COMMERCIAL";
    if (lower.includes("kỹ thuật") || lower.includes("test") || lower.includes("ip") || lower.includes("webhook")) taskType = "TECH_DELIVERY";
    if (lower.includes("cá nhân") || lower.includes("ăn") || lower.includes("cafe")) taskType = "PERSONAL";

    const newTask = {
      id: "t-" + Date.now().toString().slice(-4),
      type: taskType,
      project_id: matchedProj ? matchedProj.id : "",
      title: cmd.replace(/tạo task/gi, '').trim(),
      pic: "Bryan",
      stage: "STAGE_TODO",
      priority: lower.includes("khẩn") ? "KHẨN CẤP" : (lower.includes("cao") ? "CAO" : "TRUNG BÌNH"),
      due_date: "2026-11-25",
      is_overdue: false
    };

    const beforeTasks = JSON.parse(JSON.stringify(state.tasks));
    state.tasks.unshift(newTask);
    if (typeof runAutomationRules === "function") {
      runAutomationRules("TASK_CREATED", { title: newTask.title, project_id: newTask.project_id, pic: newTask.pic, taskObj: newTask });
    }
    postDataToGoogleSheets({ action: "CREATE_TASK", ...newTask });

    updateAllKpis();
    renderDashboardQuickTasks();
    renderTasksMainView();
    renderMerchantWorkspaceBody();
    if (typeof pushUndoAction === "function") {
      pushUndoAction({
        module: "TODO",
        action_type: "CREATE",
        entity_id: newTask.id,
        display_label: newTask.title,
        before: { tasks: beforeTasks },
        after: { tasks: state.tasks },
        toastMessage: `Đã thêm việc mới: "${newTask.title}".`
      });
    } else {
      showToast(`Đã thêm việc mới: "${newTask.title}".`);
    }
    return;
  }

  showToast(`ℹ Đã ghi nhận lệnh: "${cmd}"`);
}

