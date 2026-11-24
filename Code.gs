/**
 * GOOGLE APPS SCRIPT - BACKEND REST API, STRICT WHITELIST + PIN, DATA ISOLATION (10 OMNI USERS)
 * Hạ tầng: GitHub Pages (Frontend) + Google Apps Script (Backend) + Google Sheets Master
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const ALERT_RECIPIENTS = "quantritc1805@gmail.com,tri.nguyen2@vietunion.com.vn";

function getSheetRowsAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
      }
      obj[h] = val;
    });
    return obj;
  });
}

function filterByOwner(rows, userEmail) {
  const target = String(userEmail || "").trim().toLowerCase();
  return rows.filter(r => String(r.owner_email || "").trim().toLowerCase() === target);
}

const USERS_HEADERS = ["email", "name", "role", "pin", "active", "deleted_at", "purge_after", "updated_at"];
const USER_DATA_SHEETS = ["Merchants", "Stakeholders", "Projects", "Tasks", "Meetings", "Folders", "Onboarding"];

/**
 * Xác thực nghiêm ngặt theo danh sách tài khoản trong Sheet `Users` (BỎ kiểm tra đuôi domain)
 */
function verifyUserCredentials(ss, email, pin) {
  const targetEmail = String(email || "").trim().toLowerCase();
  const targetPin = String(pin || "").trim();
  if (!targetEmail || !targetPin) return null;

  const users = getSheetRowsAsObjects(ss, "Users");
  const found = users.find(u =>
    String(u.email || "").trim().toLowerCase() === targetEmail &&
    String(u.active).toUpperCase() !== "FALSE" &&
    !String(u.deleted_at || "").trim() &&
    String(u.pin || "").trim() === targetPin
  );
  if (!found) return null;
  return {
    email: targetEmail,
    name: found.name || "Nhân sự Omni",
    role: String(found.role || "USER").toUpperCase()
  };
}

function writeUsersSheetRows(ss, users) {
  let uSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  uSheet.clear();
  uSheet.appendRow(USERS_HEADERS);
  if (users.length > 0) {
    uSheet.getRange(2, 1, users.length, USERS_HEADERS.length).setValues(
      users.map(r => USERS_HEADERS.map(h => r[h] !== undefined ? r[h] : ""))
    );
  }
}

/**
 * Xóa vĩnh viễn toàn bộ dữ liệu thuộc về `targetEmail` trên tất cả 7 sheet dữ liệu
 */
function purgeUserDataFromAllSheets(ss, targetEmail) {
  const target = String(targetEmail || "").trim().toLowerCase();
  if (!target) return 0;
  let removedTotal = 0;

  USER_DATA_SHEETS.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() <= 1) return;
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(h => String(h).trim());
    const ownerIdx = headers.indexOf("owner_email");
    if (ownerIdx === -1) return;

    const keptRows = [];
    for (let i = 1; i < values.length; i++) {
      const rowOwner = String(values[i][ownerIdx] || "").trim().toLowerCase();
      if (rowOwner === target) {
        removedTotal++;
      } else {
        keptRows.push(values[i]);
      }
    }
    sheet.clear();
    sheet.appendRow(headers);
    if (keptRows.length > 0) {
      sheet.getRange(2, 1, keptRows.length, headers.length).setValues(keptRows);
    }
  });
  return removedTotal;
}

/**
 * Tự động dọn sạch user & toàn bộ dữ liệu liên quan đã quá hạn chờ 7 ngày
 */
function purgeExpiredDeletedUsers(ss) {
  const users = getSheetRowsAsObjects(ss, "Users");
  if (users.length === 0) return [];
  const nowMs = Date.now();
  const purgedEmails = [];
  const remainingUsers = [];

  users.forEach(u => {
    const delAt = String(u.deleted_at || "").trim();
    const purgeAt = String(u.purge_after || "").trim();
    if (delAt && purgeAt && new Date(purgeAt).getTime() <= nowMs) {
      const email = String(u.email || "").trim().toLowerCase();
      if (email) {
        purgeUserDataFromAllSheets(ss, email);
        purgedEmails.push(email);
      }
    } else {
      remainingUsers.push(u);
    }
  });

  if (purgedEmails.length > 0) {
    writeUsersSheetRows(ss, remainingUsers);
  }
  return purgedEmails;
}

/**
 * Hàm gắn Time-driven Trigger chạy hàng ngày trên Google Apps Script để tự động dọn tài khoản quá 7 ngày
 */
function runDailyUserPurge() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return purgeExpiredDeletedUsers(ss);
}

/**
 * Kiểm tra xem email có phải chủ sở hữu Google Calendar mặc định của script không
 */
function isCalendarOwnerEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (e === "tri.nguyen2@vietunion.com.vn" || e === "quantritc1805@gmail.com") return true;
  try {
    const active = String(Session.getActiveUser().getEmail() || "").trim().toLowerCase();
    return active && active === e;
  } catch (err) {
    return false;
  }
}

function parseMeetingDateRange(dateStr, timeStr) {
  const dMatch = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dMatch) return null;
  const y = Number(dMatch[1]), m = Number(dMatch[2]) - 1, d = Number(dMatch[3]);
  const tMatch = String(timeStr || "").match(/(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
  if (!tMatch) {
    return { allDay: true, start: new Date(y, m, d), end: new Date(y, m, d + 1) };
  }
  const sh = Number(tMatch[1]), sm = Number(tMatch[2]);
  const start = new Date(y, m, d, sh, sm, 0);
  const eh = tMatch[3] ? Number(tMatch[3]) : sh + 1;
  const em = tMatch[4] ? Number(tMatch[4]) : sm;
  const end = new Date(y, m, d, eh, em, 0);
  if (end <= start) end.setHours(start.getHours() + 1);
  return { allDay: false, start: start, end: end };
}

/**
 * Đẩy lịch họp từ Portal lên Google Calendar (tạo mới / cập nhật / xóa sự kiện đã xóa)
 */
function pushMeetingsToGoogleCalendar(ss, ownerEmail, incomingMeetings) {
  const list = (incomingMeetings || []).map(m => ({ ...m }));
  if (typeof CalendarApp === "undefined" || !isCalendarOwnerEmail(ownerEmail)) return list;

  try {
    const cal = CalendarApp.getDefaultCalendar();
    if (!cal) return list;

    const existing = filterByOwner(getSheetRowsAsObjects(ss, "Meetings"), ownerEmail);
    const incomingIds = {};
    list.forEach(m => { if (m.id) incomingIds[m.id] = true; });

    // Xóa trên Google Calendar những lịch đã bị xóa khỏi Portal
    existing.forEach(oldM => {
      if (oldM.id && !incomingIds[oldM.id] && oldM.gcal_event_id) {
        try {
          const ev = cal.getEventById(oldM.gcal_event_id);
          if (ev) ev.deleteEvent();
        } catch (e) {}
      }
    });

    const existingById = {};
    existing.forEach(oldM => { if (oldM.id) existingById[oldM.id] = oldM; });

    // Tạo hoặc cập nhật lên Google Calendar
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      const range = parseMeetingDateRange(m.date, m.time);
      if (!range) continue;

      const gcalId = m.gcal_event_id || (existingById[m.id] && existingById[m.id].gcal_event_id) || "";
      const title = m.title || "Lịch họp Payoo B2B";
      const desc = `Đối tác: ${m.partner || "Nội bộ"}\nThành phần: ${m.attendees || "Bryan"}\n[BryanPortal:${m.id || ""}]`;

      let ev = null;
      if (gcalId) {
        try { ev = cal.getEventById(gcalId); } catch (e) { ev = null; }
      }

      if (ev) {
        ev.setTitle(title);
        ev.setDescription(desc);
        if (range.allDay) ev.setAllDayDate(range.start);
        else ev.setTime(range.start, range.end);
        m.gcal_event_id = ev.getId();
      } else {
        const created = range.allDay
          ? cal.createAllDayEvent(title, range.start, { description: desc, location: m.partner || "" })
          : cal.createEvent(title, range.start, range.end, { description: desc, location: m.partner || "" });
        if (created) m.gcal_event_id = created.getId();
      }
    }
  } catch (err) {
    Logger.log("Google Calendar push skipped: " + err);
  }
  return list;
}

/**
 * Đồng bộ 2 chiều: đẩy lịch Portal lên Google Calendar + kéo sự kiện từ Google Calendar về Portal
 */
function syncTwoWayGoogleCalendar(ss, ownerEmail) {
  const existing = filterByOwner(getSheetRowsAsObjects(ss, "Meetings"), ownerEmail);
  let merged = pushMeetingsToGoogleCalendar(ss, ownerEmail, existing);

  if (typeof CalendarApp !== "undefined" && isCalendarOwnerEmail(ownerEmail)) {
    try {
      const cal = CalendarApp.getDefaultCalendar();
      if (cal) {
        const startWin = new Date(Date.now() - 14 * 86400000);
        const endWin = new Date(Date.now() + 60 * 86400000);
        const gEvents = cal.getEvents(startWin, endWin);
        const knownGcalIds = {};
        merged.forEach(m => { if (m.gcal_event_id) knownGcalIds[m.gcal_event_id] = true; });

        gEvents.forEach(ev => {
          const eid = ev.getId();
          if (knownGcalIds[eid]) return;
          const st = ev.getStartTime();
          const en = ev.getEndTime();
          const dateStr = Utilities.formatDate(st, "GMT+7", "yyyy-MM-dd");
          const timeStr = ev.isAllDayEvent()
            ? "Trong ngày"
            : `${Utilities.formatDate(st, "GMT+7", "HH:mm")} - ${Utilities.formatDate(en, "GMT+7", "HH:mm")}`;
          merged.push({
            id: "gcal-" + eid.replace(/[^a-zA-Z0-9]/g, "").slice(-8),
            date: dateStr,
            time: timeStr,
            title: ev.getTitle() || "Sự kiện Google Calendar",
            partner: ev.getLocation() || "",
            attendees: "Google Calendar",
            gcal_event_id: eid
          });
        });
      }
    } catch (err) {
      Logger.log("Google Calendar pull skipped: " + err);
    }
  }

  upsertOwnerRowsToSheet(ss, "Meetings", ["id", "date", "time", "title", "partner", "attendees", "gcal_event_id", "owner_email", "updated_at"], ownerEmail, merged);
  return merged;
}

/**
 * Xuất feed iCalendar (.ics) trực tiếp cho Apple Calendar & Google Calendar Subscribe (không cần tải file)
 */
function buildUserIcsFeed(userEmail, meetings, projects, tasks) {
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const fmtDate = (d) => String(d || "").replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bryan Portal//Payoo B2B Ops//VI",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Bryan Portal (" + userEmail + ")",
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh"
  ];

  (meetings || []).forEach(m => {
    const dStr = fmtDate(m.date);
    if (!/^\d{8}$/.test(dStr)) return;
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + esc(m.id || dStr) + "@bryanportal.io.vn");
    const tMatch = String(m.time || "").match(/(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
    if (tMatch) {
      const sh = String(tMatch[1]).padStart(2, "0"), sm = tMatch[2];
      const eh = tMatch[3] ? String(tMatch[3]).padStart(2, "0") : String((Number(sh) + 1) % 24).padStart(2, "0");
      const em = tMatch[4] || sm;
      lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${dStr}T${sh}${sm}00`);
      lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${dStr}T${eh}${em}00`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dStr}`);
    }
    lines.push("SUMMARY:" + esc(m.title));
    if (m.partner) lines.push("LOCATION:" + esc(m.partner));
    const remMin = Number(m.reminder_minutes);
    if (!isNaN(remMin) && m.reminder_minutes !== "none" && m.reminder_minutes !== "") {
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:Nhắc hẹn BPortal");
      lines.push(`TRIGGER:-PT${Math.max(0, remMin)}M`);
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
  });

  (projects || []).filter(p => p.due_date && Number(p.progress || 0) < 100).forEach(p => {
    const dStr = fmtDate(p.due_date);
    if (!/^\d{8}$/.test(dStr)) return;
    lines.push("BEGIN:VEVENT");
    lines.push("UID:proj-" + esc(p.id) + "@bryanportal.io.vn");
    lines.push(`DTSTART;VALUE=DATE:${dStr}`);
    lines.push("SUMMARY:" + esc("Mốc dự án: " + p.title));
    lines.push("END:VEVENT");
  });

  (tasks || []).filter(t => t.due_date && t.stage !== "STAGE_DONE").forEach(t => {
    const dStr = fmtDate(t.due_date);
    if (!/^\d{8}$/.test(dStr)) return;
    lines.push("BEGIN:VEVENT");
    lines.push("UID:task-" + esc(t.id) + "@bryanportal.io.vn");
    lines.push(`DTSTART;VALUE=DATE:${dStr}`);
    lines.push("SUMMARY:" + esc("Hạn việc: " + t.title));
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * GET request: Hỗ trợ `action=login` & `action=getData` (Bắt buộc đúng Email + PIN)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = String((e && e.parameter && e.parameter.action) || "getData");
    const userEmail = String((e && e.parameter && e.parameter.user_email) || "").trim().toLowerCase();
    const userPin = String((e && e.parameter && e.parameter.user_pin) || "").trim();

    const verifiedUser = verifyUserCredentials(ss, userEmail, userPin);
    if (!verifiedUser) {
      return resJSON({
        success: false,
        status: 403,
        error: "403 Forbidden: Email chưa được cấp quyền hoặc Mã PIN không chính xác."
      });
    }

    if (action === "login") {
      return resJSON({ success: true, user: verifiedUser });
    }

    if (action === "listUsers") {
      if (verifiedUser.role !== "ADMIN") {
        return resJSON({ success: false, status: 403, error: "Chỉ Admin mới có quyền xem danh sách tài khoản." });
      }
      purgeExpiredDeletedUsers(ss);
      const allUsers = getSheetRowsAsObjects(ss, "Users").map(u => ({
        email: String(u.email || "").trim().toLowerCase(),
        name: u.name || "Nhân sự Omni",
        role: String(u.role || "USER").toUpperCase(),
        pin: String(u.pin || ""),
        active: String(u.active).toUpperCase() !== "FALSE",
        deleted_at: u.deleted_at || "",
        purge_after: u.purge_after || ""
      }));
      return resJSON({ success: true, users: allUsers });
    }

    if (action === "ics") {
      const myMeetings = filterByOwner(getSheetRowsAsObjects(ss, "Meetings"), userEmail);
      const myProjects = filterByOwner(getSheetRowsAsObjects(ss, "Projects"), userEmail);
      const myTasks = filterByOwner(getSheetRowsAsObjects(ss, "Tasks"), userEmail);
      const icsBody = buildUserIcsFeed(userEmail, myMeetings, myProjects, myTasks);
      return ContentService.createTextOutput(icsBody).setMimeType(ContentService.MimeType.ICAL);
    }

    if (action === "syncGoogleCalendar") {
      const mergedMeetings = syncTwoWayGoogleCalendar(ss, userEmail);
      return resJSON({ success: true, meetings: mergedMeetings, message: "Đã đồng bộ lịch 2 chiều với Google Calendar!" });
    }

    const payload = {
      success: true,
      user: verifiedUser,
      merchants: filterByOwner(getSheetRowsAsObjects(ss, "Merchants"), userEmail),
      stakeholders: filterByOwner(getSheetRowsAsObjects(ss, "Stakeholders"), userEmail),
      projects: filterByOwner(getSheetRowsAsObjects(ss, "Projects"), userEmail).map(p => {
        p.is_blocked = String(p.is_blocked).toUpperCase() === "TRUE" || p.is_blocked === true;
        p.is_archived = String(p.is_archived).toUpperCase() === "TRUE" || p.is_archived === true;
        p.progress = Number(p.progress || 0);
        if (p.notes_json) {
          try { p.notes = JSON.parse(p.notes_json); } catch (err) { p.notes = []; }
        }
        return p;
      }),
      tasks: filterByOwner(getSheetRowsAsObjects(ss, "Tasks"), userEmail).map(t => {
        t.is_overdue = String(t.is_overdue).toUpperCase() === "TRUE" || t.is_overdue === true;
        return t;
      }),
      meetings: filterByOwner(getSheetRowsAsObjects(ss, "Meetings"), userEmail),
      folders: filterByOwner(getSheetRowsAsObjects(ss, "Folders"), userEmail),
      onboarding: filterByOwner(getSheetRowsAsObjects(ss, "Onboarding"), userEmail).map(ob => {
        ob.graduated = String(ob.graduated).toUpperCase() === "TRUE" || ob.graduated === true;
        ob.total_steps = Number(ob.total_steps || 18);
        if (ob.tasks_json) {
          try { ob.tasks = JSON.parse(ob.tasks_json); } catch (err) { ob.tasks = []; }
        }
        return ob;
      }),
      timestamp: new Date().toISOString()
    };

    return resJSON(payload);
  } catch (err) {
    return resJSON({ success: false, error: err.toString() });
  }
}

/**
 * Ghi cô lập theo owner_email: Giữ nguyên dữ liệu của 9 nhân sự khác
 */
function upsertOwnerRowsToSheet(ss, sheetName, headers, userEmail, ownerRows) {
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  const existing = getSheetRowsAsObjects(ss, sheetName);
  const target = String(userEmail || "").trim().toLowerCase();
  const nowIso = new Date().toISOString();

  const otherUsersRows = existing.filter(r => String(r.owner_email || "").trim().toLowerCase() !== target);
  const taggedOwnerRows = (ownerRows || []).map(r => ({
    ...r,
    owner_email: target,
    updated_at: nowIso
  }));

  const merged = otherUsersRows.concat(taggedOwnerRows);
  sheet.clear();
  sheet.appendRow(headers);
  if (merged.length > 0) {
    const matrix = merged.map(r => headers.map(h => r[h] !== undefined && r[h] !== null ? r[h] : ""));
    sheet.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
  }
}

/**
 * POST request: LockService 15s + Xác thực Email/PIN + Đổi PIN + Admin cấp tài khoản
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ownerEmail = String(body.owner_email || "").trim().toLowerCase();
    const ownerPin = String(body.owner_pin || "").trim();

    const verifiedUser = verifyUserCredentials(ss, ownerEmail, ownerPin);
    if (!verifiedUser) {
      return resJSON({ success: false, status: 403, error: "403 Forbidden: Email hoặc Mã PIN không hợp lệ." });
    }

    const nowIso = new Date().toISOString();

    // Đổi Mã PIN cá nhân
    if (action === "CHANGE_PIN") {
      const newPin = String(body.new_pin || "").trim();
      if (newPin.length < 4) return resJSON({ success: false, message: "Mã PIN mới phải từ 4 ký tự trở lên." });
      const users = getSheetRowsAsObjects(ss, "Users");
      let updated = false;
      for (let i = 0; i < users.length; i++) {
        if (String(users[i].email || "").trim().toLowerCase() === ownerEmail) {
          users[i].pin = newPin;
          users[i].updated_at = nowIso;
          updated = true;
          break;
        }
      }
      if (!updated) return resJSON({ success: false, message: "Không tìm thấy tài khoản." });
      writeUsersSheetRows(ss, users);
      return resJSON({ success: true, message: "Đã cập nhật Mã PIN mới trên Google Sheets!" });
    }

    // Admin cấp / cập nhật tài khoản nhân sự Omni
    if (action === "ADMIN_UPSERT_USER") {
      if (verifiedUser.role !== "ADMIN") {
        return resJSON({ success: false, status: 403, error: "Chỉ Admin mới có quyền cấp tài khoản." });
      }
      const target = body.target_user || {};
      const tEmail = String(target.email || "").trim().toLowerCase();
      if (!tEmail) return resJSON({ success: false, message: "Thiếu email tài khoản mới." });

      const users = getSheetRowsAsObjects(ss, "Users");
      const idx = users.findIndex(u => String(u.email || "").trim().toLowerCase() === tEmail);
      const existing = idx !== -1 ? users[idx] : {};
      const nextObj = {
        email: tEmail,
        name: target.name || existing.name || "Nhân sự Omni",
        role: target.role || existing.role || "USER",
        pin: String(target.pin || existing.pin || "123456"),
        active: target.active === false || String(target.active).toUpperCase() === "FALSE" ? "FALSE" : "TRUE",
        deleted_at: target.deleted_at !== undefined ? target.deleted_at : (existing.deleted_at || ""),
        purge_after: target.purge_after !== undefined ? target.purge_after : (existing.purge_after || ""),
        updated_at: nowIso
      };
      if (idx !== -1) users[idx] = nextObj;
      else users.push(nextObj);
      writeUsersSheetRows(ss, users);
      return resJSON({ success: true, message: "Đã lưu tài khoản " + tEmail });
    }

    // Admin xóa mềm tài khoản (chờ 7 ngày trước khi xóa sạch dữ liệu)
    if (action === "ADMIN_DELETE_USER") {
      if (verifiedUser.role !== "ADMIN") {
        return resJSON({ success: false, status: 403, error: "Chỉ Admin mới có quyền xóa tài khoản." });
      }
      const tEmail = String(body.target_email || "").trim().toLowerCase();
      if (!tEmail || tEmail === ownerEmail) {
        return resJSON({ success: false, message: "Không thể tự xóa tài khoản đang đăng nhập." });
      }
      const users = getSheetRowsAsObjects(ss, "Users");
      const idx = users.findIndex(u => String(u.email || "").trim().toLowerCase() === tEmail);
      if (idx === -1) return resJSON({ success: false, message: "Không tìm thấy tài khoản " + tEmail });

      const purgeAfterIso = new Date(Date.now() + 7 * 86400000).toISOString();
      users[idx].active = "FALSE";
      users[idx].deleted_at = nowIso;
      users[idx].purge_after = purgeAfterIso;
      users[idx].updated_at = nowIso;
      writeUsersSheetRows(ss, users);
      return resJSON({ success: true, purge_after: purgeAfterIso, message: `Đã đưa ${tEmail} vào chờ xóa (dữ liệu sẽ bị xóa sau 7 ngày nếu không khôi phục).` });
    }

    // Admin khôi phục tài khoản đang chờ xóa trong vòng 7 ngày
    if (action === "ADMIN_RESTORE_USER") {
      if (verifiedUser.role !== "ADMIN") {
        return resJSON({ success: false, status: 403, error: "Chỉ Admin mới có quyền khôi phục tài khoản." });
      }
      const tEmail = String(body.target_email || "").trim().toLowerCase();
      const users = getSheetRowsAsObjects(ss, "Users");
      const idx = users.findIndex(u => String(u.email || "").trim().toLowerCase() === tEmail);
      if (idx === -1) return resJSON({ success: false, message: "Không tìm thấy tài khoản " + tEmail });

      users[idx].active = "TRUE";
      users[idx].deleted_at = "";
      users[idx].purge_after = "";
      users[idx].updated_at = nowIso;
      writeUsersSheetRows(ss, users);
      return resJSON({ success: true, message: "Đã khôi phục tài khoản & toàn bộ dữ liệu cho " + tEmail });
    }

    // Admin xóa vĩnh viễn NGAY LẬP TỨC toàn bộ tài khoản + dữ liệu (không cần chờ hết 7 ngày)
    if (action === "ADMIN_PURGE_USER") {
      if (verifiedUser.role !== "ADMIN") {
        return resJSON({ success: false, status: 403, error: "Chỉ Admin mới có quyền xóa vĩnh viễn tài khoản." });
      }
      const tEmail = String(body.target_email || "").trim().toLowerCase();
      if (!tEmail || tEmail === ownerEmail) {
        return resJSON({ success: false, message: "Không thể tự xóa tài khoản đang đăng nhập." });
      }
      const removedDataCount = purgeUserDataFromAllSheets(ss, tEmail);
      const users = getSheetRowsAsObjects(ss, "Users").filter(u => String(u.email || "").trim().toLowerCase() !== tEmail);
      writeUsersSheetRows(ss, users);
      return resJSON({ success: true, removed_rows: removedDataCount, message: `Đã xóa vĩnh viễn ${tEmail} và ${removedDataCount} dòng dữ liệu liên quan.` });
    }

    if (action === "SYNC_FULL_STATE") {
      if (Array.isArray(body.merchants)) {
        upsertOwnerRowsToSheet(ss, "Merchants",
          ["id", "name", "brand_name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "logo_url", "contract_expiry_date", "contract_status", "owner_email", "updated_at"],
          ownerEmail, body.merchants
        );
      }
      if (Array.isArray(body.stakeholders)) {
        upsertOwnerRowsToSheet(ss, "Stakeholders",
          ["id", "merchant_id", "name", "role", "phone", "email", "group", "owner_email", "updated_at"],
          ownerEmail, body.stakeholders
        );
      }
      if (Array.isArray(body.projects)) {
        upsertOwnerRowsToSheet(ss, "Projects",
          ["id", "merchant_id", "title", "stage", "due_date", "progress", "milestone_name", "is_blocked", "blocker_reason", "blocker_owner", "gate_step", "is_archived", "notes_json", "owner_email", "updated_at"],
          ownerEmail, body.projects.map(p => ({ ...p, is_blocked: p.is_blocked ? "TRUE" : "FALSE", is_archived: p.is_archived ? "TRUE" : "FALSE", notes_json: JSON.stringify(p.notes || []) }))
        );
      }
      if (Array.isArray(body.tasks)) {
        upsertOwnerRowsToSheet(ss, "Tasks",
          ["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "reminder_minutes", "notify_channels", "is_overdue", "completed_at", "owner_email", "updated_at"],
          ownerEmail, body.tasks.map(t => ({ ...t, is_overdue: t.is_overdue ? "TRUE" : "FALSE" }))
        );
      }
      if (Array.isArray(body.meetings)) {
        const syncedMeetings = pushMeetingsToGoogleCalendar(ss, ownerEmail, body.meetings);
        upsertOwnerRowsToSheet(ss, "Meetings", ["id", "date", "time", "title", "partner", "attendees", "reminder_minutes", "notify_channels", "gcal_event_id", "owner_email", "updated_at"], ownerEmail, syncedMeetings);
      }
      if (Array.isArray(body.folders)) {
        upsertOwnerRowsToSheet(ss, "Folders", ["id", "merchant_id", "title", "file_name", "path", "note", "action_label", "badge", "owner_email", "updated_at"], ownerEmail, body.folders);
      }
      if (Array.isArray(body.onboarding)) {
        upsertOwnerRowsToSheet(ss, "Onboarding",
          ["id", "merchant_name", "brand_name", "channel", "total_steps", "graduated", "linked_merchant_id", "project_start_date", "tasks_json", "owner_email", "updated_at"],
          ownerEmail, body.onboarding.map(o => ({ ...o, graduated: o.graduated ? "TRUE" : "FALSE", tasks_json: JSON.stringify(o.tasks || []) }))
        );
      }
      return resJSON({ success: true, message: "Đã đồng bộ dữ liệu cô lập cho " + ownerEmail });
    }

    if (action === "SEND_REMINDER_EMAIL") {
      const recipient = String(body.recipient_email || ownerEmail).trim();
      const subject = String(body.subject || "[BPortal] Nhắc hẹn công việc").trim();
      const textBody = String(body.body || "").trim();
      if (recipient) {
        MailApp.sendEmail(recipient, subject, textBody);
      }
      return resJSON({ success: true, message: "Đã gửi email nhắc hẹn tới " + recipient });
    }

    if (action === "REGISTER_PUSH_TOKEN") {
      const token = String(body.token || "").trim();
      if (!token) return resJSON({ success: false, message: "Thiếu FCM token" });
      let sheet = ss.getSheetByName("PushTokens");
      if (!sheet) {
        sheet = ss.insertSheet("PushTokens");
        sheet.appendRow(["owner_email", "token", "platform", "updated_at"]);
      }
      const rows = getSheetRowsAsObjects(ss, "PushTokens");
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i].token || "").trim() === token) {
          sheet.getRange(i + 2, 1).setValue(ownerEmail);
          sheet.getRange(i + 2, 3).setValue(body.platform || "Web");
          sheet.getRange(i + 2, 4).setValue(nowIso);
          return resJSON({ success: true, message: "Đã cập nhật FCM token" });
        }
      }
      sheet.appendRow([ownerEmail, token, body.platform || "Web", nowIso]);
      return resJSON({ success: true, message: "Đã đăng ký FCM token mới" });
    }

    if (action === "CREATE_TASK") {
      let sheet = ss.getSheetByName("Tasks");
      if (!sheet) {
        sheet = ss.insertSheet("Tasks");
        sheet.appendRow(["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue", "completed_at", "owner_email", "updated_at"]);
      }
      const newId = body.id || ("t-" + Date.now());
      sheet.appendRow([
        newId, body.type || "COMMERCIAL", body.project_id || "", body.title || "Nhiệm vụ mới",
        body.pic || "Bryan", body.stage || "STAGE_TODO", body.priority || "TRUNG BÌNH",
        body.due_date || "", body.is_overdue === true ? "TRUE" : "FALSE", body.completed_at || "",
        ownerEmail, nowIso
      ]);
      return resJSON({ success: true, id: newId, message: "Đã ghi đầu việc vào Google Sheets" });
    }

    if (action === "UPDATE_BLOCKER") {
      const sheet = ss.getSheetByName("Projects");
      if (!sheet) return resJSON({ success: false, message: "Không tìm thấy Sheet Projects" });
      const rows = getSheetRowsAsObjects(ss, "Projects");
      const projId = String(body.project_id || "").trim();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i].id || "").trim() === projId && String(rows[i].owner_email || "").trim().toLowerCase() === ownerEmail) {
          sheet.getRange(i + 2, 8).setValue(body.is_blocked ? "TRUE" : "FALSE");
          sheet.getRange(i + 2, 9).setValue(body.blocker_reason || "");
          sheet.getRange(i + 2, 10).setValue(body.blocker_owner || "");
          sheet.getRange(i + 2, 15).setValue(nowIso);
          return resJSON({ success: true, message: "Đã cập nhật trạng thái vướng mắc" });
        }
      }
      return resJSON({ success: false, message: "Không tìm thấy dự án thuộc quyền sở hữu của " + ownerEmail });
    }

    return resJSON({ success: false, message: "Action không hợp lệ: " + action });
  } catch (err) {
    return resJSON({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function resJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendDailyDigestEmail() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const bryanEmail = "tri.nguyen2@vietunion.com.vn";
  const todayStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  const todayDisplay = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
  const todayMs = new Date(todayStr + "T00:00:00").getTime();

  const meetings = filterByOwner(getSheetRowsAsObjects(ss, "Meetings"), bryanEmail).filter(m => m.date === todayStr);
  const tasks = filterByOwner(getSheetRowsAsObjects(ss, "Tasks"), bryanEmail).filter(t => t.stage !== "STAGE_DONE");
  const merchants = filterByOwner(getSheetRowsAsObjects(ss, "Merchants"), bryanEmail);
  const projects = filterByOwner(getSheetRowsAsObjects(ss, "Projects"), bryanEmail).filter(p => String(p.is_blocked).toUpperCase() === "TRUE");

  const dueSoonOrOverdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const diffDays = Math.round((new Date(t.due_date + "T00:00:00").getTime() - todayMs) / 86400000);
    return diffDays <= 2;
  });

  const expiringContracts = merchants.filter(m => {
    if (!m.contract_expiry_date) return false;
    const diffDays = Math.round((new Date(m.contract_expiry_date + "T00:00:00").getTime() - todayMs) / 86400000);
    return diffDays <= 30;
  });

  const lines = [
    "Chào Bryan,",
    "Dưới đây là tổng hợp công việc & nhắc hẹn tự động ngày " + todayDisplay + ":",
    "",
    "1. LỊCH HỌP HÔM NAY (" + meetings.length + "):",
    ...(meetings.length ? meetings.map(m => "   - " + (m.time || "") + " | " + m.title + " (" + (m.partner || "Nội bộ") + ")") : ["   - Không có lịch họp hôm nay."]),
    "",
    "2. ĐẦU VIỆC QUÁ HẠN & SẮP ĐẾN HẠN 48H (" + dueSoonOrOverdueTasks.length + "):",
    ...(dueSoonOrOverdueTasks.length ? dueSoonOrOverdueTasks.map(t => "   - " + t.title + " | Hạn: " + t.due_date + " | Phụ trách: " + t.pic) : ["   - Không có đầu việc sắp/quá hạn."]),
    "",
    "3. DỰ ÁN ĐANG CÓ VƯỚNG MẮC (" + projects.length + "):",
    ...(projects.length ? projects.map(p => "   - " + p.title + ": " + p.blocker_reason) : ["   - Mọi dự án đang thông suốt."]),
    "",
    "4. HỢP ĐỒNG CẦN GIA HẠN TRONG 30 NGÀY (" + expiringContracts.length + "):",
    ...(expiringContracts.length ? expiringContracts.map(m => "   - " + m.name + " (" + (m.brand_name || m.name) + ") • Hết hạn: " + m.contract_expiry_date) : ["   - Chưa có hợp đồng nào sắp hết hạn."])
  ];

  MailApp.sendEmail({
    to: ALERT_RECIPIENTS,
    subject: "[Bryan Portal] Tổng hợp Lịch họp & Đầu việc ngày " + todayDisplay,
    body: lines.join("\n")
  });
}

function setupDailyEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === "sendDailyDigestEmail") ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger("sendDailyDigestEmail")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(30)
    .create();
}

function initSampleSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const owner = "tri.nguyen2@vietunion.com.vn";
  const nowIso = new Date().toISOString();

  // Sheet Users: chỉ khởi tạo nếu chưa có (tránh ghi đè user/PIN đã tạo)
  const existingUsers = getSheetRowsAsObjects(ss, "Users");
  if (existingUsers.length === 0) {
    writeUsersSheetRows(ss, [
      { email: "tri.nguyen2@vietunion.com.vn", name: "Bryan Nguyen", role: "ADMIN", pin: "180526", active: "TRUE", deleted_at: "", purge_after: "", updated_at: nowIso },
      { email: "quantritc1805@gmail.com", name: "Bryan Nguyen", role: "ADMIN", pin: "180526", active: "TRUE", deleted_at: "", purge_after: "", updated_at: nowIso }
    ]);
  }

  // Chỉ seed dữ liệu mẫu nếu sheet Merchants đang trống (tránh ghi đè dữ liệu thật khi chạy lại initSampleSheets)
  const mSheetExisting = ss.getSheetByName("Merchants");
  if (mSheetExisting && mSheetExisting.getLastRow() > 1) {
    return;
  }

  upsertOwnerRowsToSheet(ss, "Merchants",
    ["id", "name", "brand_name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "logo_url", "contract_expiry_date", "contract_status", "owner_email", "updated_at"],
    owner,
    [
      { id: "m-highlands", name: "Highlands Coffee", brand_name: "HIGHLANDS", alias: "@highlands", industry: "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)", expected_gmv: "~1.5 Tỷ VNĐ/tháng", avatar_letter: "H", color: "bg-red-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Hợp Đồng Kinh Tế • Đang Triển Khai" },
      { id: "m-jdv", name: "JDV Chuỗi Bán Lẻ", brand_name: "JDV", alias: "@jdv", industry: "Hệ thống Siêu Thị Bán Lẻ Tiêu Dùng", expected_gmv: "~750M VNĐ/tháng", avatar_letter: "J", color: "bg-blue-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Phụ Lục 3 Bên • Đang Thử Nghiệm POS" },
      { id: "m-vietthanh", name: "Xe Điện Việt Thanh", brand_name: "VIETTHANH", alias: "@vietthanh", industry: "Chuỗi 35 Showroom Xe Điện Toàn Quốc", expected_gmv: "~1.2 Tỷ VNĐ/tháng", avatar_letter: "V", color: "bg-emerald-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Hợp Đồng Trả Góp 0% • Chuẩn Bị Go-Live" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Stakeholders",
    ["id", "merchant_id", "name", "role", "phone", "email", "group", "owner_email", "updated_at"],
    owner,
    [
      { id: "s-hl-1", merchant_id: "m-highlands", name: "Anh Tuấn", role: "Head of IT & Digital", phone: "0908123456", email: "tuan.it@highlandscoffee.com.vn", group: "Tech Chuỗi" },
      { id: "s-hl-2", merchant_id: "m-highlands", name: "Chị Mai", role: "Acquiring Lead - VietinBank", phone: "0912334455", email: "mai.bank@vietinbank.vn", group: "Ngân Hàng" },
      { id: "s-jdv-1", merchant_id: "m-jdv", name: "Anh Khoa", role: "Lead Solution Arch JDV", phone: "0988776655", email: "khoa.arch@jdv.vn", group: "Tech Chuỗi" },
      { id: "s-vt-1", merchant_id: "m-vietthanh", name: "Anh Thanh", role: "CEO & Founder Việt Thanh", phone: "0966554433", email: "thanh.ceo@xedienvietthanh.com", group: "Đại Diện Chuỗi" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Projects",
    ["id", "merchant_id", "title", "stage", "due_date", "progress", "milestone_name", "is_blocked", "blocker_reason", "blocker_owner", "gate_step", "is_archived", "notes_json", "owner_email", "updated_at"],
    owner,
    [
      { id: "p-hl-1", merchant_id: "m-highlands", title: "Recurring Tokenization & Trừ Tiền Tự Động Trên Highlands App", stage: "UAT SIGN-OFF", due_date: "2026-11-28", progress: 75, milestone_name: "3. UAT Nghiệm Thu Lỗi Thẻ & Quy Trình Đối Soát", is_blocked: "TRUE", blocker_reason: "Chưa mở Whitelist IP Callback Webhook dẫn tới chưa thể ký nghiệm thu UAT", blocker_owner: "Anh Tuấn (IT Chuỗi)", gate_step: 3, is_archived: "FALSE", notes_json: "[]" },
      { id: "p-jdv-1", merchant_id: "m-jdv", title: "Smart POS 3 Bên (Pvcombank - JDV - Payoo) Đồng Bộ ERP", stage: "INTEGRATION", due_date: "2026-12-10", progress: 45, milestone_name: "2. Khảo sát luồng hóa đơn ERP & Kế toán", is_blocked: "FALSE", blocker_reason: "", blocker_owner: "", gate_step: 2, is_archived: "FALSE", notes_json: "[]" },
      { id: "p-vt-1", merchant_id: "m-vietthanh", title: "Cổng Thanh Toán & Trả Góp 0% 25 Ngân Hàng Tại 35 Showroom", stage: "PILOT", due_date: "2026-12-05", progress: 85, milestone_name: "4. Pilot 5 Showroom Hà Nội & Nghiệm thu", is_blocked: "FALSE", blocker_reason: "", blocker_owner: "", gate_step: 4, is_archived: "FALSE", notes_json: "[]" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Tasks",
    ["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue", "completed_at", "owner_email", "updated_at"],
    owner,
    [
      { id: "t-1", type: "TECH_DELIVERY", project_id: "p-hl-1", title: "Đôn đốc IT Highlands mở Whitelist IP Webhook để nghiệm thu UAT", pic: "Anh Tuấn", stage: "STAGE_DOING", priority: "KHẨN CẤP", due_date: "2026-11-25", is_overdue: "FALSE", completed_at: "" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Meetings",
    ["id", "date", "time", "title", "partner", "attendees", "owner_email", "updated_at"],
    owner,
    [
      { id: "mt-1", date: "2026-11-21", time: "14:30 - 15:30", title: "Họp 3 bên: Nghiệm thu lỗi thẻ Ứng dụng", partner: "Highlands Coffee", attendees: "Bryan, Anh Tuấn (IT), Chị Mai (Ngân hàng)" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Folders",
    ["id", "merchant_id", "title", "file_name", "path", "action_label", "badge", "owner_email", "updated_at"],
    owner,
    [
      { id: "f-hl-1", merchant_id: "m-highlands", title: "Hợp đồng nguyên tắc & Phụ lục biểu phí", file_name: "Hop_Dong_Nguyen_Tac_Highlands_2026.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-highlands-contract", action_label: "Mở tài liệu", badge: "Đã ký duyệt" }
    ]
  );

  upsertOwnerRowsToSheet(ss, "Onboarding",
    ["id", "merchant_name", "brand_name", "channel", "total_steps", "graduated", "linked_merchant_id", "project_start_date", "tasks_json", "owner_email", "updated_at"],
    owner,
    []
  );
}

// =============================================================
// FCM HTTP v1 BACKGROUND PUSH SENDER (Chạy theo lịch Time-driven)
// Hướng dẫn: Dán nội dung JSON của Service Account vào
// Apps Script -> Project Settings -> Script Properties:
//   Key: FCM_SERVICE_ACCOUNT_JSON
// =============================================================
function getFcmAccessToken_(serviceAccount) {
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=+$/, "");
  const nowSec = Math.floor(Date.now() / 1000);
  const claim = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: nowSec + 3600,
    iat: nowSec
  })).replace(/=+$/, "");
  const sigInput = header + "." + claim;
  const sigBytes = Utilities.computeRsaSha256Signature(sigInput, serviceAccount.private_key);
  const sig = Utilities.base64EncodeWebSafe(sigBytes).replace(/=+$/, "");
  const jwt = sigInput + "." + sig;

  const resp = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    }
  });
  return JSON.parse(resp.getContentText()).access_token;
}

function sendFcmNotificationToTokens_(fcmUrl, accessToken, tokens, title, body, tag) {
  (tokens || []).forEach(tk => {
    UrlFetchApp.fetch(fcmUrl, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + accessToken },
      payload: JSON.stringify({
        message: {
          token: tk,
          notification: { title: title, body: body },
          webpush: {
            fcm_options: { link: "https://bryanportfolio.io.vn/" }
          },
          data: { tag: tag || "bportal-push", url: "https://bryanportfolio.io.vn/" }
        }
      }),
      muteHttpExceptions: true
    });
  });
}

function sendDailyDeadlineFcmPush() {
  const saRaw = PropertiesService.getScriptProperties().getProperty("FCM_SERVICE_ACCOUNT_JSON");
  if (!saRaw) throw new Error("Chưa cấu hình FCM_SERVICE_ACCOUNT_JSON trong Script Properties.");
  const sa = JSON.parse(saRaw);
  const accessToken = getFcmAccessToken_(sa);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tokenRows = getSheetRowsAsObjects(ss, "PushTokens");
  if (!tokenRows.length) return;

  const taskRows = getSheetRowsAsObjects(ss, "Tasks");
  const projectRows = getSheetRowsAsObjects(ss, "Projects");
  const merchantRows = getSheetRowsAsObjects(ss, "Merchants");
  const meetingRows = getSheetRowsAsObjects(ss, "Meetings");

  const todayIso = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  const todayMs = new Date(todayIso + "T00:00:00").getTime();

  const digestByOwner = {};
  const addLine = (owner, line) => {
    const em = String(owner || "").trim().toLowerCase();
    if (!em) return;
    digestByOwner[em] = digestByOwner[em] || [];
    digestByOwner[em].push(line);
  };

  taskRows.forEach(t => {
    if (String(t.stage || "") === "STAGE_DONE") return;
    const due = String(t.due_date || "").slice(0, 10);
    if (!due) return;
    const diffDays = Math.round((new Date(due + "T00:00:00").getTime() - todayMs) / 86400000);
    if (diffDays <= 2) {
      const prefix = diffDays < 0 ? "[Trễ hạn]" : (diffDays === 0 ? "[Hôm nay]" : "[Sắp hạn]");
      addLine(t.owner_email, prefix + " " + String(t.title || ""));
    }
  });

  projectRows.forEach(p => {
    if (String(p.is_blocked).toUpperCase() === "TRUE") {
      addLine(p.owner_email, "[Vướng mắc] " + String(p.title || "Dự án") + (p.blocker_reason ? " — " + p.blocker_reason : ""));
    }
  });

  merchantRows.forEach(m => {
    const exp = String(m.contract_expiry_date || "").slice(0, 10);
    if (!exp) return;
    const diffDays = Math.round((new Date(exp + "T00:00:00").getTime() - todayMs) / 86400000);
    if (diffDays <= 30) {
      addLine(m.owner_email, "[Hợp đồng] " + String(m.name || "") + " còn " + diffDays + " ngày hết hạn");
    }
  });

  meetingRows.forEach(mt => {
    if (String(mt.date || "").slice(0, 10) === todayIso) {
      addLine(mt.owner_email, "[Họp " + String(mt.time || "") + "] " + String(mt.title || ""));
    }
  });

  const fcmUrl = "https://fcm.googleapis.com/v1/projects/" + sa.project_id + "/messages:send";
  tokenRows.forEach(row => {
    const email = String(row.owner_email || "").trim().toLowerCase();
    const token = String(row.token || "").trim();
    const lines = digestByOwner[email] || [];
    if (!token || lines.length === 0) return;
    sendFcmNotificationToTokens_(
      fcmUrl, accessToken, [token],
      "BPortal • " + lines.length + " mục cần chú ý hôm nay",
      lines.slice(0, 3).join(" | "),
      "bportal-daily-digest"
    );
  });
}

// Chạy mỗi 5 phút (Minutes timer -> Every 5 minutes):
// Quét toàn bộ: Lịch họp (trước 15p), Nhiệm vụ/Tasks (tới hạn/quá hạn), Hợp đồng (30/7/1 ngày), Dự án vướng mắc
function checkAndSendUpcomingFcmPush() {
  const saRaw = PropertiesService.getScriptProperties().getProperty("FCM_SERVICE_ACCOUNT_JSON");
  if (!saRaw) return;
  const sa = JSON.parse(saRaw);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tokenRows = getSheetRowsAsObjects(ss, "PushTokens");
  if (!tokenRows.length) return;

  const taskRows = getSheetRowsAsObjects(ss, "Tasks");
  const projectRows = getSheetRowsAsObjects(ss, "Projects");
  const merchantRows = getSheetRowsAsObjects(ss, "Merchants");
  const meetingRows = getSheetRowsAsObjects(ss, "Meetings");

  const props = PropertiesService.getScriptProperties();
  const sentMap = JSON.parse(props.getProperty("FCM_SENT_ALERTS_LOG") || "{}");
  const now = new Date();
  const todayIso = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  const todayMs = new Date(todayIso + "T00:00:00").getTime();
  const nowMinutes = parseInt(Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "HH"), 10) * 60 +
                     parseInt(Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "mm"), 10);

  const tokensByOwner = {};
  tokenRows.forEach(r => {
    const em = String(r.owner_email || "").trim().toLowerCase();
    const tk = String(r.token || "").trim();
    if (!em || !tk) return;
    tokensByOwner[em] = tokensByOwner[em] || [];
    tokensByOwner[em].push(tk);
  });

  let accessToken = null;
  const fcmUrl = "https://fcm.googleapis.com/v1/projects/" + sa.project_id + "/messages:send";
  let changedLog = false;

  const pushOnce = (ownerEmail, dedupeKey, title, body, tag) => {
    if (sentMap[dedupeKey]) return;
    const owner = String(ownerEmail || "").trim().toLowerCase();
    const userTokens = tokensByOwner[owner] || [];
    if (!userTokens.length) return;
    if (!accessToken) accessToken = getFcmAccessToken_(sa);
    sendFcmNotificationToTokens_(fcmUrl, accessToken, userTokens, title, body, tag);
    sentMap[dedupeKey] = now.toISOString();
    changedLog = true;
  };

  // 1. LỊCH HỌP: Đẩy đúng trước 15 phút (hoặc remind_before_mins)
  meetingRows.forEach(mt => {
    if (String(mt.date || "").slice(0, 10) !== todayIso) return;
    const mTimeMatch = String(mt.time || "").match(/(\d{1,2}):(\d{2})/);
    if (!mTimeMatch) return;
    const startMinutes = parseInt(mTimeMatch[1], 10) * 60 + parseInt(mTimeMatch[2], 10);
    const diffMins = startMinutes - nowMinutes;
    const leadMins = Number(mt.remind_before_mins || 15);
    if (diffMins >= 0 && diffMins <= leadMins) {
      pushOnce(
        mt.owner_email,
        "mt_" + mt.id + "_" + todayIso + "_" + mTimeMatch[0],
        "Sắp đến giờ họp (" + mTimeMatch[0] + ")",
        String(mt.title || "Cuộc họp đối tác") + (mt.partner ? " • " + mt.partner : ""),
        "bportal-meeting-" + mt.id
      );
    }
  });

  // 2. NHIỆM VỤ / TASKS: Quá hạn, hạn hôm nay, hạn ngày mai (mỗi task 1 lần/ngày)
  taskRows.forEach(t => {
    if (String(t.stage || "") === "STAGE_DONE") return;
    const due = String(t.due_date || "").slice(0, 10);
    if (!due) return;
    const diffDays = Math.round((new Date(due + "T00:00:00").getTime() - todayMs) / 86400000);
    if (diffDays <= 1) {
      const label = diffDays < 0 ? ("Quá hạn " + Math.abs(diffDays) + " ngày") : (diffDays === 0 ? "Hạn hôm nay" : "Hạn ngày mai");
      pushOnce(
        t.owner_email,
        "tsk_" + t.id + "_" + todayIso,
        "Nhắc nhiệm vụ • " + label,
        String(t.title || "Đầu việc cần xử lý"),
        "bportal-task-" + t.id
      );
    }
  });

  // 3. THỜI HẠN HỢP ĐỒNG: Còn 30, 7, 1, 0 ngày (mỗi mốc 1 lần)
  merchantRows.forEach(m => {
    const exp = String(m.contract_expiry_date || "").slice(0, 10);
    if (!exp) return;
    const diffDays = Math.round((new Date(exp + "T00:00:00").getTime() - todayMs) / 86400000);
    if (diffDays <= 30 && (diffDays === 30 || diffDays === 7 || diffDays === 1 || diffDays <= 0)) {
      const msg = diffDays <= 0 ? "Hợp đồng đã đến/quá hạn gia hạn!" : ("Hợp đồng còn " + diffDays + " ngày hết hạn");
      pushOnce(
        m.owner_email,
        "exp_" + m.id + "_" + todayIso,
        "Gia hạn hợp đồng • " + String(m.name || "Đối tác"),
        msg + " (" + exp + ")",
        "bportal-contract-" + m.id
      );
    }
  });

  // 4. DỰ ÁN ĐANG VƯỚNG MẮC (1 lần/ngày)
  projectRows.forEach(p => {
    if (String(p.is_blocked).toUpperCase() === "TRUE") {
      pushOnce(
        p.owner_email,
        "blk_" + p.id + "_" + todayIso,
        "Dự án đang vướng mắc",
        String(p.title || "Dự án") + (p.blocker_reason ? " — " + p.blocker_reason : ""),
        "bportal-blocker-" + p.id
      );
    }
  });

  if (changedLog) {
    const keys = Object.keys(sentMap);
    if (keys.length > 150) {
      keys.slice(0, keys.length - 150).forEach(k => delete sentMap[k]);
    }
    props.setProperty("FCM_SENT_ALERTS_LOG", JSON.stringify(sentMap));
  }
}
