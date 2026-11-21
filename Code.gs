/**
 * GOOGLE APPS SCRIPT - BACKEND REST API & EMAIL ENGINE CHO BRYAN PORTAL
 * Tác giả: Bryan Nguyen (Quản Lý Dự Án B2B)
 *
 * Hướng dẫn cài đặt:
 * 1. Mở Google Sheets mới (https://sheets.new), đặt tên: "Bryan Portal Database".
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Dán toàn bộ mã nguồn này vào file Code.gs.
 * 4. Chạy hàm `initSampleSheets` 1 lần để tự động tạo đủ các Sheet chuẩn.
 * 5. (Tùy chọn tự gửi mail sáng) Chạy hàm `setupDailyEmailTrigger` 1 lần để tự gửi mail lúc 08:30 mỗi ngày.
 * 6. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới -> Loại: Ứng dụng web (Web app)
 *    -> Ai có quyền truy cập: "Bất kỳ ai" (Anyone) -> Sao chép URL Web App dán vào Bryan Portal.
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

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const payload = {
      merchants: getSheetRowsAsObjects(ss, "Merchants"),
      stakeholders: getSheetRowsAsObjects(ss, "Stakeholders"),
      projects: getSheetRowsAsObjects(ss, "Projects").map(p => {
        p.is_blocked = String(p.is_blocked).toUpperCase() === "TRUE" || p.is_blocked === true;
        p.is_archived = String(p.is_archived).toUpperCase() === "TRUE" || p.is_archived === true;
        p.progress = Number(p.progress || 0);
        if (p.notes_json) {
          try { p.notes = JSON.parse(p.notes_json); } catch (err) { p.notes = []; }
        }
        return p;
      }),
      tasks: getSheetRowsAsObjects(ss, "Tasks").map(t => {
        t.is_overdue = String(t.is_overdue).toUpperCase() === "TRUE" || t.is_overdue === true;
        return t;
      }),
      meetings: getSheetRowsAsObjects(ss, "Meetings"),
      folders: getSheetRowsAsObjects(ss, "Folders"),
      onboarding: getSheetRowsAsObjects(ss, "Onboarding").map(ob => {
        ob.graduated = String(ob.graduated).toUpperCase() === "TRUE" || ob.graduated === true;
        ob.total_steps = Number(ob.total_steps || 18);
        if (ob.tasks_json) {
          try { ob.tasks = JSON.parse(ob.tasks_json); } catch (err) { ob.tasks = []; }
        }
        return ob;
      }),
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return resJSON({ success: false, error: err.toString() });
  }
}

function writeObjectsToSheet(ss, sheetName, headers, rows) {
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  sheet.appendRow(headers);
  if (Array.isArray(rows) && rows.length > 0) {
    const matrix = rows.map(r => headers.map(h => r[h] !== undefined && r[h] !== null ? r[h] : ""));
    sheet.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // 0. Đồng bộ toàn bộ trạng thái từ Bryan Portal (MacBook <-> Windows)
    if (action === "SYNC_FULL_STATE") {
      if (Array.isArray(body.merchants)) {
        writeObjectsToSheet(ss, "Merchants",
          ["id", "name", "brand_name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "logo_url", "contract_expiry_date", "contract_status"],
          body.merchants
        );
      }
      if (Array.isArray(body.stakeholders)) {
        writeObjectsToSheet(ss, "Stakeholders",
          ["id", "merchant_id", "name", "role", "phone", "email", "group"],
          body.stakeholders
        );
      }
      if (Array.isArray(body.projects)) {
        writeObjectsToSheet(ss, "Projects",
          ["id", "merchant_id", "title", "stage", "due_date", "progress", "milestone_name", "is_blocked", "blocker_reason", "blocker_owner", "gate_step", "is_archived", "notes_json"],
          body.projects.map(p => ({ ...p, is_blocked: p.is_blocked ? "TRUE" : "FALSE", is_archived: p.is_archived ? "TRUE" : "FALSE", notes_json: JSON.stringify(p.notes || []) }))
        );
      }
      if (Array.isArray(body.tasks)) {
        writeObjectsToSheet(ss, "Tasks",
          ["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue", "completed_at"],
          body.tasks.map(t => ({ ...t, is_overdue: t.is_overdue ? "TRUE" : "FALSE" }))
        );
      }
      if (Array.isArray(body.meetings)) {
        writeObjectsToSheet(ss, "Meetings", ["id", "date", "time", "title", "partner", "attendees"], body.meetings);
      }
      if (Array.isArray(body.folders)) {
        writeObjectsToSheet(ss, "Folders", ["id", "merchant_id", "title", "file_name", "path", "action_label", "badge"], body.folders);
      }
      if (Array.isArray(body.onboarding)) {
        writeObjectsToSheet(ss, "Onboarding",
          ["id", "merchant_name", "brand_name", "channel", "total_steps", "graduated", "linked_merchant_id", "project_start_date", "tasks_json"],
          body.onboarding.map(o => ({ ...o, graduated: o.graduated ? "TRUE" : "FALSE", tasks_json: JSON.stringify(o.tasks || []) }))
        );
      }
      return resJSON({ success: true, message: "Đã đồng bộ toàn bộ dữ liệu lên Google Sheets!" });
    }

    // 1. Tạo Task mới
    if (action === "CREATE_TASK") {
      let sheet = ss.getSheetByName("Tasks");
      if (!sheet) {
        sheet = ss.insertSheet("Tasks");
        sheet.appendRow(["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue", "completed_at"]);
      }
      const newId = body.id || ("t-" + Date.now());
      sheet.appendRow([
        newId,
        body.type || "COMMERCIAL",
        body.project_id || "",
        body.title || "Nhiệm vụ mới",
        body.pic || "Bryan",
        body.stage || "STAGE_TODO",
        body.priority || "TRUNG BÌNH",
        body.due_date || "",
        body.is_overdue === true ? "TRUE" : "FALSE",
        body.completed_at || ""
      ]);
      return resJSON({ success: true, id: newId, message: "Đã ghi đầu việc vào Google Sheets" });
    }

    // 2. Cập nhật trạng thái vướng mắc
    if (action === "UPDATE_BLOCKER") {
      const sheet = ss.getSheetByName("Projects");
      if (!sheet) return resJSON({ success: false, message: "Không tìm thấy Sheet Projects" });
      const data = sheet.getDataRange().getValues();
      const projId = body.project_id;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(projId).trim()) {
          sheet.getRange(i + 1, 8).setValue(body.is_blocked ? "TRUE" : "FALSE");
          sheet.getRange(i + 1, 9).setValue(body.blocker_reason || "");
          sheet.getRange(i + 1, 10).setValue(body.blocker_owner || "");
          return resJSON({ success: true, message: "Đã cập nhật trạng thái vướng mắc" });
        }
      }
      return resJSON({ success: false, message: "Không tìm thấy dự án có ID: " + projId });
    }

    // 3. Khởi tạo Chuỗi đối tác mới
    if (action === "CREATE_MERCHANT") {
      let mSheet = ss.getSheetByName("Merchants");
      if (!mSheet) {
        mSheet = ss.insertSheet("Merchants");
        mSheet.appendRow(["id", "name", "brand_name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "logo_url", "contract_expiry_date", "contract_status"]);
      }
      const mId = body.id || ("m-" + Date.now());
      const name = body.name || "Đối tác mới";
      const brand = body.brand_name || name;
      mSheet.appendRow([
        mId,
        name,
        brand,
        body.alias || ("@" + brand.toLowerCase().replace(/\s+/g, '')),
        body.industry || "Doanh nghiệp Chuỗi",
        body.expected_gmv || "~500M VNĐ/tháng",
        brand.charAt(0).toUpperCase(),
        body.color || "bg-teal-700",
        body.logo_url || "",
        body.contract_expiry_date || "",
        "Đã Ký Hợp Đồng • Đang Vận Hành"
      ]);

      if (body.stakeholder) {
        let sSheet = ss.getSheetByName("Stakeholders");
        if (!sSheet) {
          sSheet = ss.insertSheet("Stakeholders");
          sSheet.appendRow(["id", "merchant_id", "name", "role", "phone", "email", "group"]);
        }
        sSheet.appendRow([
          "s-" + Date.now(),
          mId,
          body.stakeholder.name || "N/A",
          body.stakeholder.role || "Đại Diện Chuỗi",
          body.stakeholder.phone || "",
          body.stakeholder.email || "",
          body.stakeholder.group || "Đại Diện Chuỗi"
        ]);
      }

      return resJSON({ success: true, id: mId, message: "Đã tạo chuỗi đối tác vào Google Sheets" });
    }

    return resJSON({ success: false, message: "Action không hợp lệ: " + action });
  } catch (err) {
    return resJSON({ success: false, error: err.toString() });
  }
}

function resJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tự động gửi Email tổng hợp mỗi ngày (Lịch họp, Đầu việc sắp/quá hạn, Gia hạn HĐ trước 30 ngày)
 */
function sendDailyDigestEmail() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const todayStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  const todayDisplay = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
  const todayMs = new Date(todayStr + "T00:00:00").getTime();

  const meetings = getSheetRowsAsObjects(ss, "Meetings").filter(m => m.date === todayStr);
  const tasks = getSheetRowsAsObjects(ss, "Tasks").filter(t => t.stage !== "STAGE_DONE");
  const merchants = getSheetRowsAsObjects(ss, "Merchants");
  const projects = getSheetRowsAsObjects(ss, "Projects").filter(p => String(p.is_blocked).toUpperCase() === "TRUE");

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
    `Chào Bryan,`,
    `Dưới đây là tổng hợp công việc & nhắc hẹn tự động ngày ${todayDisplay}:`,
    ``,
    `1. LỊCH HỌP HÔM NAY (${meetings.length}):`,
    ...(meetings.length ? meetings.map(m => `   - ${m.time || ''} | ${m.title} (${m.partner || 'Nội bộ'})`) : ["   - Không có lịch họp hôm nay."]),
    ``,
    `2. ĐẦU VIỆC QUÁ HẠN & SẮP ĐẾN HẠN 48H (${dueSoonOrOverdueTasks.length}):`,
    ...(dueSoonOrOverdueTasks.length ? dueSoonOrOverdueTasks.map(t => `   - ${t.title} | Hạn: ${t.due_date} | Phụ trách: ${t.pic}`) : ["   - Không có đầu việc sắp/quá hạn."]),
    ``,
    `3. DỰ ÁN ĐANG CÓ VƯỚNG MẮC (${projects.length}):`,
    ...(projects.length ? projects.map(p => `   - ${p.title}: ${p.blocker_reason}`) : ["   - Mọi dự án đang thông suốt."]),
    ``,
    `4. HỢP ĐỒNG CẦN GIA HẠN TRONG 30 NGÀY (${expiringContracts.length}):`,
    ...(expiringContracts.length ? expiringContracts.map(m => `   - ${m.name} (${m.brand_name || m.name}) • Hết hạn: ${m.contract_expiry_date}`) : ["   - Chưa có hợp đồng nào sắp hết hạn."])
  ];

  MailApp.sendEmail({
    to: ALERT_RECIPIENTS,
    subject: `[Bryan Portal] Tổng hợp Lịch họp & Đầu việc ngày ${todayDisplay}`,
    body: lines.join("\n")
  });
}

/**
 * Chạy hàm này 1 lần để đặt lịch tự gửi Email lúc 08:30 sáng mỗi ngày
 */
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

/**
 * Khởi tạo dữ liệu mẫu đầy đủ tất cả 7 Sheet
 */
function initSampleSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  writeObjectsToSheet(ss, "Merchants",
    ["id", "name", "brand_name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "logo_url", "contract_expiry_date", "contract_status"],
    [
      { id: "m-highlands", name: "Highlands Coffee", brand_name: "HIGHLANDS", alias: "@highlands", industry: "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)", expected_gmv: "~1.5 Tỷ VNĐ/tháng", avatar_letter: "H", color: "bg-red-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Hợp Đồng Kinh Tế • Đang Triển Khai" },
      { id: "m-jdv", name: "JDV Chuỗi Bán Lẻ", brand_name: "JDV", alias: "@jdv", industry: "Hệ thống Siêu Thị Bán Lẻ Tiêu Dùng", expected_gmv: "~750M VNĐ/tháng", avatar_letter: "J", color: "bg-blue-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Phụ Lục 3 Bên • Đang Thử Nghiệm POS" },
      { id: "m-vietthanh", name: "Xe Điện Việt Thanh", brand_name: "VIETTHANH", alias: "@vietthanh", industry: "Chuỗi 35 Showroom Xe Điện Toàn Quốc", expected_gmv: "~1.2 Tỷ VNĐ/tháng", avatar_letter: "V", color: "bg-emerald-700", logo_url: "", contract_expiry_date: "2027-11-21", contract_status: "Đã Ký Hợp Đồng Trả Góp 0% • Chuẩn Bị Go-Live" }
    ]
  );

  writeObjectsToSheet(ss, "Stakeholders",
    ["id", "merchant_id", "name", "role", "phone", "email", "group"],
    [
      { id: "s-hl-1", merchant_id: "m-highlands", name: "Anh Tuấn", role: "Head of IT & Digital", phone: "0908123456", email: "tuan.it@highlandscoffee.com.vn", group: "Tech Chuỗi" },
      { id: "s-hl-2", merchant_id: "m-highlands", name: "Chị Mai", role: "Acquiring Lead - VietinBank", phone: "0912334455", email: "mai.bank@vietinbank.vn", group: "Ngân Hàng" },
      { id: "s-jdv-1", merchant_id: "m-jdv", name: "Anh Khoa", role: "Lead Solution Arch JDV", phone: "0988776655", email: "khoa.arch@jdv.vn", group: "Tech Chuỗi" },
      { id: "s-vt-1", merchant_id: "m-vietthanh", name: "Anh Thanh", role: "CEO & Founder Việt Thanh", phone: "0966554433", email: "thanh.ceo@xedienvietthanh.com", group: "Đại Diện Chuỗi" }
    ]
  );

  writeObjectsToSheet(ss, "Projects",
    ["id", "merchant_id", "title", "stage", "due_date", "progress", "milestone_name", "is_blocked", "blocker_reason", "blocker_owner", "gate_step", "is_archived", "notes_json"],
    [
      { id: "p-hl-1", merchant_id: "m-highlands", title: "Recurring Tokenization & Trừ Tiền Tự Động Trên Highlands App", stage: "UAT SIGN-OFF", due_date: "2026-11-28", progress: 75, milestone_name: "3. UAT Nghiệm Thu Lỗi Thẻ & Quy Trình Đối Soát", is_blocked: "TRUE", blocker_reason: "Chưa mở Whitelist IP Callback Webhook dẫn tới chưa thể ký nghiệm thu UAT", blocker_owner: "Anh Tuấn (IT Chuỗi)", gate_step: 3, is_archived: "FALSE", notes_json: "[]" },
      { id: "p-jdv-1", merchant_id: "m-jdv", title: "Smart POS 3 Bên (Pvcombank - JDV - Payoo) Đồng Bộ ERP", stage: "INTEGRATION", due_date: "2026-12-10", progress: 45, milestone_name: "2. Khảo sát luồng hóa đơn ERP & Kế toán", is_blocked: "FALSE", blocker_reason: "", blocker_owner: "", gate_step: 2, is_archived: "FALSE", notes_json: "[]" },
      { id: "p-vt-1", merchant_id: "m-vietthanh", title: "Cổng Thanh Toán & Trả Góp 0% 25 Ngân Hàng Tại 35 Showroom", stage: "PILOT", due_date: "2026-12-05", progress: 85, milestone_name: "4. Pilot 5 Showroom Hà Nội & Nghiệm thu", is_blocked: "FALSE", blocker_reason: "", blocker_owner: "", gate_step: 4, is_archived: "FALSE", notes_json: "[]" }
    ]
  );

  writeObjectsToSheet(ss, "Tasks",
    ["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue", "completed_at"],
    [
      { id: "t-1", type: "TECH_DELIVERY", project_id: "p-hl-1", title: "Đôn đốc IT Highlands mở Whitelist IP Webhook để nghiệm thu UAT", pic: "Anh Tuấn", stage: "STAGE_DOING", priority: "KHẨN CẤP", due_date: "2026-11-25", is_overdue: "FALSE", completed_at: "" }
    ]
  );

  writeObjectsToSheet(ss, "Meetings",
    ["id", "date", "time", "title", "partner", "attendees"],
    [
      { id: "mt-1", date: "2026-11-21", time: "14:30 - 15:30", title: "Họp 3 bên: Nghiệm thu lỗi thẻ Ứng dụng", partner: "Highlands Coffee", attendees: "Bryan, Anh Tuấn (IT), Chị Mai (Ngân hàng)" }
    ]
  );

  writeObjectsToSheet(ss, "Folders",
    ["id", "merchant_id", "title", "file_name", "path", "action_label", "badge"],
    [
      { id: "f-hl-1", merchant_id: "m-highlands", title: "Hợp đồng nguyên tắc & Phụ lục biểu phí", file_name: "Hop_Dong_Nguyen_Tac_Highlands_2026.pdf", path: "https://drive.google.com/drive/folders/payoo-dms-highlands-contract", action_label: "Mở tài liệu", badge: "Đã ký duyệt" }
    ]
  );

  writeObjectsToSheet(ss, "Onboarding",
    ["id", "merchant_name", "brand_name", "channel", "total_steps", "graduated", "linked_merchant_id", "project_start_date", "tasks_json"],
    []
  );
}
