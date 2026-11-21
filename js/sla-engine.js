// -------------------------------------------------------------
// SLA & BUSINESS HOURS ENGINE (PAYOO B2B 18-STEP POS & PAYLINK)
// -------------------------------------------------------------

const SLA_BUSINESS_POLICY = {
  maxCalendarDays: 30,
  maxWorkingDays: 22,
  workStartHour: 8,
  workStartMin: 30,
  lunchStartHour: 12,
  lunchEndHour: 13,
  workEndHour: 17,
  workEndMin: 30,
  hoursPerDay: 8
};

// Cấu hình định mức 18 bước chuẩn (Mục 2 & Mục 5 Đặc tả SLA)
const SLA_STEP_CONFIG = {
  1:  { hours: 8,  type: "CUNG", startRule: "PROJECT_INIT", note: "Khởi tạo dự án" },
  2:  { hours: 8,  type: "CUNG", startRule: "AFTER_PREV", prev: 1 },
  3:  { hours: 16, type: "CUNG", startRule: "AFTER_PREV", prev: 2, note: "TBP duyệt tối đa 2 ngày" },
  4:  { hours: 8,  type: "CUNG", startRule: "AFTER_PREV", prev: 3 },
  5:  { hours: 32, type: "CUNG", startRule: "T_PLUS_1_AFTER_4", prev: 4, note: "FC duyệt tối đa 4 ngày từ T+1" },
  6:  { hours: 32, type: "CUNG", startRule: "T_PLUS_1_AFTER_4", prev: 4, note: "LC duyệt tối đa 4 ngày từ T+1" },
  7:  { hours: 16, type: "CUNG", startRule: "AFTER_5_AND_6", deps: [5, 6] },
  8:  { hours: 24, type: "CUNG", startRule: "AFTER_PREV", prev: 7 },
  9:  { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 8 },
  10: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 9 },
  11: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 10 },
  12: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 11 },
  13: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 12 },
  14: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 13 },
  15: { hours: 4,  type: "CUNG", startRule: "AFTER_PREV", prev: 14 },
  16: { hours: 40, type: "MEM",  startRule: "AFTER_PREV", prev: 15, softSla: true, note: "Trễ hạn không tính blocker" },
  17: { hours: 16, type: "CUNG", startRule: "AFTER_PREV", prev: 15 },
  18: { hours: 8,  type: "CUNG", startRule: "AFTER_PREV", prev: 17 }
};

function isBusinessDay(date) {
  const day = date.getDay(); // 0 = CN, 6 = T7
  return day >= 1 && day <= 5;
}

// Chuyển mốc thời gian về 08:30 ngày làm việc tiếp theo (T+1)
function getNextBusinessDayStart(fromDate) {
  const d = new Date(fromDate.getTime());
  d.setDate(d.getDate() + 1);
  while (!isBusinessDay(d)) {
    d.setDate(d.getDate() + 1);
  }
  d.setHours(SLA_BUSINESS_POLICY.workStartHour, SLA_BUSINESS_POLICY.workStartMin, 0, 0);
  return d;
}

// Đưa thời điểm bất kỳ vào khung giờ hành chính hợp lệ gần nhất
function snapToBusinessHour(date) {
  const d = new Date(date.getTime());
  while (!isBusinessDay(d)) {
    d.setDate(d.getDate() + 1);
    d.setHours(8, 30, 0, 0);
  }
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins < 8 * 60 + 30) {
    d.setHours(8, 30, 0, 0);
  } else if (mins >= 12 * 60 && mins < 13 * 60) {
    d.setHours(13, 0, 0, 0);
  } else if (mins >= 17 * 60 + 30) {
    return getNextBusinessDayStart(d);
  }
  return d;
}

// Cộng thêm N giờ làm việc (loại trừ T7, CN và 12:00-13:00)
function addBusinessHours(startDate, hoursToAdd) {
  let cur = snapToBusinessHour(startDate);
  let remainingMins = Math.round(hoursToAdd * 60);

  while (remainingMins > 0) {
    cur = snapToBusinessHour(cur);
    const curMins = cur.getHours() * 60 + cur.getMinutes();
    const blockEndMins = curMins < 12 * 60 ? 12 * 60 : 17 * 60 + 30;
    const availMins = blockEndMins - curMins;

    if (remainingMins <= availMins) {
      cur = new Date(cur.getTime() + remainingMins * 60000);
      remainingMins = 0;
    } else {
      remainingMins -= availMins;
      if (blockEndMins === 12 * 60) {
        cur.setHours(13, 0, 0, 0);
      } else {
        cur = getNextBusinessDayStart(cur);
      }
    }
  }
  return cur;
}

// Tính số giờ làm việc giữa 2 mốc (có dấu: dương nếu to > from, âm nếu quá hạn)
function diffBusinessHours(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const sign = toDate >= fromDate ? 1 : -1;
  let start = new Date(Math.min(fromDate.getTime(), toDate.getTime()));
  const end = new Date(Math.max(fromDate.getTime(), toDate.getTime()));

  let totalMins = 0;
  let guard = 0;
  while (start < end && guard < 2000) {
    guard++;
    start = snapToBusinessHour(start);
    if (start >= end) break;
    const curMins = start.getHours() * 60 + start.getMinutes();
    const blockEndMins = curMins < 12 * 60 ? 12 * 60 : 17 * 60 + 30;
    const blockEnd = new Date(start.getTime());
    blockEnd.setHours(Math.floor(blockEndMins / 60), blockEndMins % 60, 0, 0);

    const sliceEnd = blockEnd < end ? blockEnd : end;
    totalMins += Math.max(0, (sliceEnd.getTime() - start.getTime()) / 60000);

    if (sliceEnd >= end) break;
    if (blockEndMins === 12 * 60) {
      start = new Date(start.getTime());
      start.setHours(13, 0, 0, 0);
    } else {
      start = getNextBusinessDayStart(start);
    }
  }
  return sign * (totalMins / 60);
}

// Tính toán lại toàn bộ SLA cho một dự án Onboarding (T+1 cho B5/B6, B5+B6 cho B7, B16 mềm, trần 22 ngày)
function evaluateOnboardingSla(obRecord, nowDate = new Date()) {
  if (!obRecord || !Array.isArray(obRecord.tasks)) {
    return { dotColor: "green", dotLabel: "Đúng tiến độ", stepSla: {}, capWarning: null, overdueCount: 0, warningCount: 0 };
  }

  const byNo = {};
  obRecord.tasks.forEach(t => { byNo[t.step_no] = t; });

  const b1 = byNo[1];
  if (b1 && b1.status === "DONE" && !obRecord.project_start_date) {
    obRecord.project_start_date = b1.completed_at || nowDate.toISOString();
  }

  const stepSla = {};
  let overdueCount = 0;
  let warningCount = 0;

  obRecord.tasks.forEach(t => {
    const cfg = SLA_STEP_CONFIG[t.step_no] || { hours: 8, type: "CUNG", startRule: "AFTER_PREV", prev: t.step_no - 1 };
    const isSoft = !!cfg.softSla || cfg.type === "MEM";

    // Xác định thời điểm bắt đầu (started_at) theo đúng quy tắc phụ thuộc
    let startedAt = t.started_at ? new Date(t.started_at) : null;
    let activated = false;

    if (t.step_no === 1) {
      activated = true;
      if (!startedAt) {
        startedAt = obRecord.created_at ? new Date(obRecord.created_at) : snapToBusinessHour(nowDate);
      }
    } else if (cfg.startRule === "T_PLUS_1_AFTER_4") {
      const b4 = byNo[4];
      if (b4 && b4.status === "DONE") {
        activated = true;
        const b4Done = b4.completed_at ? new Date(b4.completed_at) : nowDate;
        startedAt = getNextBusinessDayStart(b4Done);
      }
    } else if (cfg.startRule === "AFTER_5_AND_6") {
      const b5 = byNo[5];
      const b6 = byNo[6];
      if (b5 && b5.status === "DONE" && b6 && b6.status === "DONE") {
        activated = true;
        const d5 = b5.completed_at ? new Date(b5.completed_at) : nowDate;
        const d6 = b6.completed_at ? new Date(b6.completed_at) : nowDate;
        startedAt = snapToBusinessHour(d5 > d6 ? d5 : d6);
      }
    } else {
      const prevTask = byNo[cfg.prev || (t.step_no - 1)];
      if (prevTask && prevTask.status === "DONE") {
        activated = true;
        if (!startedAt) {
          startedAt = snapToBusinessHour(prevTask.completed_at ? new Date(prevTask.completed_at) : nowDate);
        }
      }
    }

    if (activated && startedAt && !t.started_at) {
      t.started_at = startedAt.toISOString();
    }

    let dueAt = null;
    let remainingHours = cfg.hours;
    let statusCode = "LOCKED"; // DONE | ON_TRACK | WARNING | OVERDUE | SOFT_WAIT | LOCKED

    if (t.status === "DONE") {
      statusCode = "DONE";
    } else if (activated && startedAt) {
      dueAt = addBusinessHours(startedAt, cfg.hours);
      t.due_date = dueAt.toISOString();
      remainingHours = diffBusinessHours(nowDate, dueAt);

      if (isSoft) {
        statusCode = remainingHours < 0 ? "SOFT_WAIT" : "ON_TRACK";
      } else if (remainingHours < 0) {
        statusCode = "OVERDUE";
        overdueCount++;
      } else if (remainingHours <= cfg.hours * 0.25) {
        statusCode = "WARNING";
        warningCount++;
      } else {
        statusCode = "ON_TRACK";
      }
    }

    stepSla[t.step_no] = {
      ...cfg,
      isSoft,
      activated,
      startedAt,
      dueAt,
      remainingHours,
      statusCode
    };
  });

  // Kiểm tra trần 22 ngày làm việc (1 tháng) tính từ khi xong B1
  let capWarning = null;
  let elapsedWorkingDays = 0;
  if (obRecord.project_start_date && !obRecord.graduated) {
    const startDt = new Date(obRecord.project_start_date);
    elapsedWorkingDays = Math.max(0, Math.floor(diffBusinessHours(startDt, nowDate) / 8));
    if (elapsedWorkingDays >= 20) {
      const daysLeft = Math.max(0, SLA_BUSINESS_POLICY.maxWorkingDays - elapsedWorkingDays);
      capWarning = daysLeft > 0
        ? `⚠️ Sắp chạm trần 1 tháng cam kết (Còn ${daysLeft} ngày làm việc)`
        : `⚠️ Đã chạm trần 22 ngày làm việc cam kết!`;
    }
  }

  let dotColor = "green";
  let dotLabel = "Đúng tiến độ";
  if (overdueCount > 0) {
    dotColor = "red";
    dotLabel = `Trễ ${overdueCount} bước SLA`;
  } else if (warningCount > 0 || capWarning) {
    dotColor = "amber";
    dotLabel = warningCount > 0 ? `${warningCount} bước sắp tới hạn` : "Sắp chạm trần 1 tháng";
  }

  return {
    dotColor,
    dotLabel,
    stepSla,
    capWarning,
    elapsedWorkingDays,
    overdueCount,
    warningCount
  };
}

function formatSlaRemainingText(slaInfo) {
  if (!slaInfo) return "";
  if (slaInfo.statusCode === "DONE") return "Đã hoàn thành";
  if (!slaInfo.activated) return "Chưa kích hoạt";
  if (slaInfo.isSoft && slaInfo.remainingHours < 0) {
    return "Chờ biên bản ASM (Không tính trễ)";
  }
  const h = slaInfo.remainingHours;
  if (h < 0) {
    const lateH = Math.abs(h);
    return lateH >= 8 ? `Trễ ${(lateH / 8).toFixed(1)} ngày làm việc` : `Trễ ${Math.ceil(lateH)} giờ làm việc`;
  }
  return h >= 8 ? `Hạn còn: ${(h / 8).toFixed(1)} ngày làm việc` : `Hạn còn: ${Math.max(1, Math.round(h))} giờ làm việc`;
}
