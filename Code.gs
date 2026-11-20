/**
 * GOOGLE APPS SCRIPT - BACKEND REST API CHO BRYAN PORTAL (CRM & PM OPS HUB)
 * Tác giả: Bryan (Lead PM) & Antigravity
 * 
 * Hướng dẫn cài đặt:
 * 1. Mở Google Sheet của Bryan Portal.
 * 2. Tạo 4 Tabs: "Merchants", "Stakeholders", "Projects", "Tasks".
 * 3. Vào Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Dán toàn bộ mã này vào file Code.gs.
 * 5. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Loại: Ứng dụng web (Web app).
 * 6. Ai có quyền truy cập: "Bất kỳ ai" (Anyone).
 * 7. Sao chép URL Web App thu được (dạng https://script.google.com/macros/s/.../exec) và dán vào Bryan Portal.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * Xử lý GET request: Trả về toàn bộ dữ liệu 4 tabs dưới dạng JSON
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    const getRows = (sheetName) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      const values = sheet.getDataRange().getValues();
      if (values.length < 2) return [];
      const headers = values[0];
      return values.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => { 
          obj[h] = row[i]; 
        });
        return obj;
      });
    };

    const payload = {
      merchants: getRows("Merchants"),
      stakeholders: getRows("Stakeholders"),
      projects: getRows("Projects"),
      tasks: getRows("Tasks"),
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý POST request: Thực thi các lệnh thêm/sửa từ Frontend hoặc Antigravity Bot
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // 1. Tạo Task mới
    if (action === "CREATE_TASK") {
      let sheet = ss.getSheetByName("Tasks");
      if (!sheet) {
        sheet = ss.insertSheet("Tasks");
        sheet.appendRow(["id", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue"]);
      }
      const newId = "t-" + Date.now();
      sheet.appendRow([
        newId,
        body.project_id || "internal",
        body.title || "Nhiệm vụ mới",
        body.pic || "Bryan",
        body.stage || "STAGE_TODO",
        body.priority || "TRUNG BÌNH",
        body.due_date || "",
        body.is_overdue === true ? "TRUE" : "FALSE"
      ]);
      return resJSON({ success: true, id: newId, message: "Đã ghi Task vào Google Sheets" });
    }

    // 2. Cập nhật trạng thái Blocker SLA dự án
    if (action === "UPDATE_BLOCKER") {
      const sheet = ss.getSheetByName("Projects");
      if (!sheet) return resJSON({ success: false, message: "Không tìm thấy Sheet Projects" });
      
      const data = sheet.getDataRange().getValues();
      const projId = body.project_id;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(projId).trim()) { // Cột A: id
          sheet.getRange(i + 1, 8).setValue(body.is_blocked ? "TRUE" : "FALSE"); // Cột H: is_blocked
          sheet.getRange(i + 1, 9).setValue(body.blocker_reason || "");          // Cột I: blocker_reason
          sheet.getRange(i + 1, 10).setValue(body.blocker_owner || "");          // Cột J: blocker_owner
          return resJSON({ success: true, message: "Đã cập nhật trạng thái Blocker" });
        }
      }
      return resJSON({ success: false, message: "Không tìm thấy dự án có ID: " + projId });
    }

    // 3. Khởi tạo Merchant & Stakeholder ban đầu
    if (action === "CREATE_MERCHANT") {
      let mSheet = ss.getSheetByName("Merchants");
      if (!mSheet) {
        mSheet = ss.insertSheet("Merchants");
        mSheet.appendRow(["id", "name", "alias", "industry", "avatar_letter", "color"]);
      }
      const mId = "m-" + Date.now();
      const name = body.name || "Đối tác mới";
      mSheet.appendRow([
        mId,
        name,
        body.alias || ("@" + name.toLowerCase().replace(/\s+/g, '')),
        body.industry || "B2B Enterprise",
        name.charAt(0).toUpperCase(),
        body.color || "bg-emerald-700"
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
          body.stakeholder.role || "Tech Lead",
          body.stakeholder.phone || "",
          body.stakeholder.email || "",
          body.stakeholder.group || "Merchant Lead"
        ]);
      }

      if (body.initial_project) {
        let pSheet = ss.getSheetByName("Projects");
        if (!pSheet) {
          pSheet = ss.insertSheet("Projects");
          pSheet.appendRow(["id", "merchant_id", "title", "stage", "due_date", "progress", "tech_gate", "is_blocked", "blocker_reason", "blocker_owner"]);
        }
        pSheet.appendRow([
          "p-" + Date.now(),
          mId,
          body.initial_project.title || "Tích hợp cổng kỹ thuật",
          "KICKOFF",
          body.initial_project.due_date || "",
          0,
          "Ký Hợp Đồng & Khảo Sát",
          "FALSE",
          "",
          ""
        ]);
      }

      return resJSON({ success: true, id: mId, message: "Đã tạo Merchant và dữ liệu liên quan" });
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
 * Hàm khởi tạo dữ liệu mẫu lần đầu vào Google Sheet (chạy trực tiếp trong Apps Script nếu muốn)
 */
function initSampleSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Sheet Merchants
  let mSheet = ss.getSheetByName("Merchants") || ss.insertSheet("Merchants");
  mSheet.clear();
  mSheet.appendRow(["id", "name", "alias", "industry", "avatar_letter", "color"]);
  mSheet.appendRow(["m-highlands", "Highlands Coffee", "@highlands", "Chuỗi F&B Toàn Quốc", "H", "bg-red-700"]);
  mSheet.appendRow(["m-thiso", "Thiso Retail", "@thiso", "Trung tâm Thương mại", "T", "bg-blue-700"]);
  mSheet.appendRow(["m-pharmacity", "Pharmacity", "@pharmacity", "Chuỗi Bán lẻ Dược phẩm", "P", "bg-emerald-700"]);

  // Sheet Stakeholders
  let sSheet = ss.getSheetByName("Stakeholders") || ss.insertSheet("Stakeholders");
  sSheet.clear();
  sSheet.appendRow(["id", "merchant_id", "name", "role", "phone", "email", "group"]);
  sSheet.appendRow(["s-1", "m-highlands", "Anh Tuấn", "Head of IT & Digital", "0908123456", "tuan.it@highlandscoffee.com.vn", "Tech Merchant"]);
  sSheet.appendRow(["s-2", "m-highlands", "Chị Mai", "Phụ trách Đối tác - VietinBank", "0912334455", "mai.bank@vietinbank.vn", "Ngân Hàng Đối Tác"]);
  sSheet.appendRow(["s-3", "m-highlands", "Bryan Nguyen", "Lead PM / Tech Sales Ops", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);
  
  sSheet.appendRow(["s-4", "m-thiso", "Anh Khoa", "Lead POS Architecture", "0988776655", "khoa.arch@thiso.vn", "Tech Merchant"]);
  sSheet.appendRow(["s-5", "m-thiso", "Chị Hương", "Relationship Manager - BIDV", "0977221100", "huong.bidv@bidv.com.vn", "Ngân Hàng Đối Tác"]);
  sSheet.appendRow(["s-6", "m-thiso", "Bryan Nguyen", "Lead PM / Tech Sales Ops", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);

  // Sheet Projects
  let pSheet = ss.getSheetByName("Projects") || ss.insertSheet("Projects");
  pSheet.clear();
  pSheet.appendRow(["id", "merchant_id", "title", "stage", "due_date", "progress", "tech_gate", "is_blocked", "blocker_reason", "blocker_owner"]);
  pSheet.appendRow(["p-hl-1", "m-highlands", "Recurring Tokenization & Auto-Debit App", "UAT", "2026-11-28", 75, "UAT Sandbox & Test Thẻ", "TRUE", "Chờ Merchant mở IP whitelist Webhook Callback", "Tech Merchant"]);
  pSheet.appendRow(["p-hl-2", "m-highlands", "Smart POS Tích hợp VietQR Động", "PILOT", "2026-12-15", 40, "Đang nạp firmware 20 máy demo", "FALSE", "", ""]);
  pSheet.appendRow(["p-th-1", "m-thiso", "Hệ thống Thanh toán Tập trung Mall & Park", "SIT", "2026-12-05", 55, "Kiểm thử kết nối Core ERP", "FALSE", "", ""]);

  // Sheet Tasks
  let tSheet = ss.getSheetByName("Tasks") || ss.insertSheet("Tasks");
  tSheet.clear();
  tSheet.appendRow(["id", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue"]);
  tSheet.appendRow(["t-1", "p-hl-1", "Kiểm thử kịch bản trừ tiền định kỳ lỗi thẻ", "Bryan", "STAGE_IN_PROGRESS", "CAO", "2026-11-25", "FALSE"]);
  tSheet.appendRow(["t-2", "p-hl-1", "Follow up IP Whitelist cho cổng Webhook", "Anh Tuấn", "STAGE_TODO", "KHẨN CẤP", "2026-11-22", "TRUE"]);
  tSheet.appendRow(["t-3", "p-hl-2", "Bàn giao 20 máy SmartPOS demo cho cửa hàng mẫu", "Bryan", "STAGE_TODO", "TRUNG BÌNH", "2026-11-30", "FALSE"]);
  tSheet.appendRow(["t-4", "p-th-1", "Rà soát tài liệu tích hợp API v2 với anh Khoa", "Bryan", "STAGE_DONE", "TRUNG BÌNH", "2026-11-19", "FALSE"]);
}
