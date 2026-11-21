// -------------------------------------------------------------
// ATTIO OBJECT-ATTRIBUTE-RELATIONSHIP & ROLLUP ENGINE
// -------------------------------------------------------------

const ATTIO_STAGE_LABELS = {
  LEGAL_AND_CMS: "1. Pháp Lý & CMS",
  CONTRACT_AND_SIGNING: "2. Ký Kết & Bàn Giao",
  CONFIG_AND_HARDWARE: "3. Cấu Hình & Thiết Bị",
  TESTING_AND_GOLIVE: "4. Nghiệm Thu & Go-Live",
  HANDED_OVER: "5. Đã Bàn Giao (Handed Over)"
};

// Chuẩn hóa tiếng Việt không dấu để đối soát alias chính xác
function normalizeViText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Từ điển NLP Aliases cho quy trình 18 bước Payoo B2B (Mục 3 Đặc tả Attio)
const ATTIO_STEP_NLP_ALIASES = {
  1: ["b1", "hop dong", "lam hop dong", "phu luc"],
  2: ["b2", "trinh cms", "cms"],
  3: ["b3", "tbp duyet", "nho tbp duyet", "truong bo phan"],
  4: ["b4", "dua noi dung tbp duyet", "cap nhat tbp", "up lai cms", "2 ban pdf"],
  5: ["b5", "fc duyet", "tai chinh duyet", "mail team core"],
  6: ["b6", "lc duyet", "phap che duyet"],
  7: ["b7", "bgd", "gui bgd", "giam doc ky", "dong moc"],
  8: ["b8", "gui doi tac", "ban giao hop dong"],
  9: ["b9", "bm03", "gui asm"],
  10: ["b10", "request cau hinh", "cau hinh cong", "xin thong so"],
  11: ["b11", "tai khoan", "mat khau", "cai dat tk", "lap dat tbtt"],
  12: ["b12", "mail core", "core go live", "go live shopid"],
  13: ["b13", "phi dich vu so", "bieu phi"],
  14: ["b14", "asm cau hinh pos", "tid", "mid", "phi tra gop"],
  15: ["b15", "devops", "mo ip", "whitelist", "mapping"],
  16: ["b16", "bm01", "bien ban tra", "ky nhay asm"],
  17: ["b17", "training", "quet thu", "test pos", "request training"],
  18: ["b18", "scan hop dong", "luu hop dong", "ban scan"]
};

function getStepNlpAliases(stepNo, title) {
  const base = ATTIO_STEP_NLP_ALIASES[stepNo] || [`b${stepNo}`];
  const normTitle = normalizeViText(title);
  return Array.from(new Set([`b${stepNo}`, `buoc ${stepNo}`, ...base, normTitle]));
}

// Rollup Calculation: Tính số bước hoàn thành, % tiến độ và chuyển Stage tự động
function computeAttioProjectRollup(obRecord) {
  if (!obRecord || !Array.isArray(obRecord.tasks)) {
    return {
      completed_steps: 0,
      total_steps: 18,
      progress_rate: 0,
      current_stage: "LEGAL_AND_CMS"
    };
  }

  const totalSteps = obRecord.total_steps || obRecord.tasks.length || 18;
  const completedSteps = obRecord.tasks.filter(t => t.status === "DONE").length;
  const progressRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const isDone = (no) => {
    const st = obRecord.tasks.find(t => t.step_no === no);
    return st ? st.status === "DONE" : false;
  };

  let currentStage = "LEGAL_AND_CMS";
  if (obRecord.graduated || (completedSteps === totalSteps && totalSteps > 0)) {
    currentStage = "HANDED_OVER";
  } else {
    // Stage Transition Trigger dựa trên các nhóm bước
    const legalDone = obRecord.tasks.filter(t => t.stage === "STAGE_LEGAL_CMS").every(t => t.status === "DONE");
    const signDone = obRecord.tasks.filter(t => t.stage === "STAGE_SIGN_HANDOVER").every(t => t.status === "DONE");
    const configDone = obRecord.tasks.filter(t => t.stage === "STAGE_CONFIG_DEVICE").every(t => t.status === "DONE");

    if (legalDone && !signDone) currentStage = "CONTRACT_AND_SIGNING";
    else if (legalDone && signDone && !configDone) currentStage = "CONFIG_AND_HARDWARE";
    else if (legalDone && signDone && configDone) currentStage = "TESTING_AND_GOLIVE";
    else if (isDone(7) && isDone(8) && !isDone(9)) currentStage = "CONFIG_AND_HARDWARE";
  }

  obRecord.current_stage = currentStage;
  obRecord.progress_rate = progressRate;
  obRecord.completed_steps = completedSteps;

  return {
    completed_steps: completedSteps,
    total_steps: totalSteps,
    progress_rate: progressRate,
    current_stage: currentStage
  };
}

// Xây dựng Attio Graph (companies -> deployment_projects -> deployment_steps) từ state hiện tại
function buildAttioGraph() {
  const companies = state.merchants.map(m => {
    const compId = `COMP_${m.id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
    const projs = state.projects.filter(p => p.merchant_id === m.id);
    const people = state.stakeholders.filter(s => s.merchant_id === m.id);
    return {
      company_id: compId,
      name: m.name,
      tier: "Key Account",
      industry: "F&B / Retail",
      account_owner: "Bryan Nguyen",
      projects: projs.map(p => p.id),
      stakeholders: people.map(s => s.id)
    };
  });

  const deployment_projects = onboardingList.map(ob => {
    const rollup = computeAttioProjectRollup(ob);
    const projId = `PRJ_${ob.merchant_name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${ob.channel}`;
    return {
      project_id: projId,
      name: `${ob.merchant_name} - ${ob.channel}`,
      company: ob.linked_merchant_id || ob.id,
      solution_type: ob.channel.split("_"),
      current_stage: rollup.current_stage,
      total_steps: rollup.total_steps,
      completed_steps: rollup.completed_steps,
      progress_rate: rollup.progress_rate,
      is_blocked: false,
      steps: ob.tasks.map(t => ({
        step_id: `${projId}_B${t.step_no}`,
        project: projId,
        step_code: `B${t.step_no}`,
        title: t.title,
        stage_group: t.stage,
        is_completed: t.status === "DONE",
        completed_at: t.completed_at || null,
        completed_by: t.completed_by || null,
        nlp_aliases: getStepNlpAliases(t.step_no, t.title)
      }))
    };
  });

  return { companies, deployment_projects };
}

// Quy tắc 1 & 2: Context Resolution + NLP Step Matching theo đặc tả Attio
function resolveAttioCommandTarget(rawInput) {
  const normInput = normalizeViText(rawInput);

  // Ưu tiên 2: Target rõ ràng trong câu (tên Merchant/Company được gọi tên)
  let explicitOb = onboardingList.find(o => {
    const normName = normalizeViText(o.merchant_name);
    if (!normName) return false;
    if (normInput.includes(normName)) return true;
    // Khớp từ đầu tiên nếu tên chuỗi dài (VD: "Katinat" cho "Katinat Saigon Kafe")
    const firstWord = normName.split(" ")[0];
    return firstWord.length >= 4 && normInput.includes(firstWord);
  });

  // Ưu tiên 1: Context ngầm định (tab Onboarding đang mở)
  const targetOb = explicitOb
    || onboardingList.find(o => o.id === activeOnboardingId)
    || onboardingList.find(o => !o.graduated)
    || onboardingList[0];

  if (!targetOb) return { targetOb: null, targetStepNo: null, matchedBy: null };

  // Tách câu nếu có từ nối "hoặc" (VD: "xong B3 hoặc TBP duyệt") -> ưu tiên kiểm tra tất cả vế
  let targetStepNo = null;
  let matchedBy = null;

  // 1. Khớp trực tiếp mã bước B1..B18
  const stepMatches = [...normInput.matchAll(/\b(?:b|buoc|step)\s*(\d{1,2})\b/g)];
  if (stepMatches.length > 0) {
    const nums = stepMatches
      .map(m => parseInt(m[1], 10))
      .filter(n => n >= 1 && n <= targetOb.tasks.length);
    if (nums.length > 0) {
      targetStepNo = Math.max(...nums);
      matchedBy = `B${targetStepNo}`;
    }
  }

  // 2. Nếu chưa ra mã bước, quét từ điển nlp_aliases của từng bước
  if (targetStepNo === null) {
    const cleaned = normInput
      .replace(normalizeViText(targetOb.merchant_name), "")
      .replace(/\b(xong|hoan thanh|done|da|toi|cho|cua|ben|doi tac|hoac|or|nha|nhe|roi)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let bestScore = 0;
    targetOb.tasks.forEach(t => {
      const aliases = getStepNlpAliases(t.step_no, t.title);
      aliases.forEach(alias => {
        if (alias.length >= 3 && (normInput.includes(alias) || (cleaned && cleaned.includes(alias)))) {
          const score = alias.length + (t.status !== "DONE" ? 5 : 0);
          if (score > bestScore) {
            bestScore = score;
            targetStepNo = t.step_no;
            matchedBy = alias;
          }
        }
      });
    });

    // Fallback: khớp từng token trong tiêu đề bước
    if (targetStepNo === null && cleaned.length >= 2) {
      const tokens = cleaned.split(" ").filter(w => w.length >= 2);
      if (tokens.length > 0) {
        const candidates = targetOb.tasks.filter(t => {
          const nt = normalizeViText(t.title);
          return tokens.every(tok => nt.includes(tok));
        });
        if (candidates.length > 0) {
          const picked = candidates.find(c => c.status !== "DONE") || candidates[0];
          targetStepNo = picked.step_no;
          matchedBy = cleaned;
        }
      }
    }
  }

  return { targetOb, targetStepNo, matchedBy, isExplicitCompany: !!explicitOb };
}

// Quy tắc 2 & 3: Thực thi Mutation trên Attio Record + Rollup + Trả Event Sync
function mutateAttioDeploymentStep(targetOb, targetStepNo, rawInput) {
  if (!targetOb || !targetStepNo) return null;

  const nowIso = new Date().toISOString();
  targetOb.tasks.forEach(t => {
    if (t.step_no <= targetStepNo) {
      if (t.status !== "DONE") {
        t.status = "DONE";
        t.completed_at = nowIso;
        t.completed_by = "ANTIGRAVITY_AUTOMATION";
      }
    }
  });

  const rollup = computeAttioProjectRollup(targetOb);
  const updatedStep = targetOb.tasks.find(t => t.step_no === targetStepNo);
  const projId = `PRJ_${targetOb.merchant_name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${targetOb.channel}`;

  const eventResult = {
    event: "AUTOMATION_EXECUTION_SUCCESS",
    input_hook: {
      event: "QUICK_COMMAND_SUBMITTED",
      raw_input: rawInput,
      timestamp: nowIso
    },
    mutation_payload: {
      action: "MUTATE_ATTIO_RECORD",
      target_object: "deployment_steps",
      lookup: { project_id: projId, step_code: `B${targetStepNo}` },
      attributes_to_update: {
        is_completed: true,
        completed_at: nowIso,
        completed_by: "ANTIGRAVITY_AUTOMATION"
      }
    },
    data: {
      target_company: targetOb.merchant_name,
      target_project_id: projId,
      updated_step: {
        step_code: `B${targetStepNo}`,
        title: updatedStep ? updatedStep.title : `Bước ${targetStepNo}`,
        is_completed: true
      },
      rollup_summary: rollup,
      toast_notification: {
        type: "SUCCESS",
        message: `Đã cập nhật hoàn thành B${targetStepNo} (${updatedStep ? updatedStep.title : ''}) cho ${targetOb.merchant_name} • ${rollup.progress_rate}% (${ATTIO_STAGE_LABELS[rollup.current_stage] || rollup.current_stage})`
      }
    }
  };

  window.lastAttioEvent = eventResult;
  return eventResult;
}
