/**
 * GOOGLE APPS SCRIPT - BACKEND REST API CHO BRYAN PORTAL (CRM & PM OPS HUB)
 * Tác giả: Bryan (Lead PM) & Antigravity
 * 
 * Hướng dẫn cài đặt nhanh:
 * 1. Mở Google Sheets mới (ví dụ đặt tên: "Bryan Portal Database").
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Dán toàn bộ mã nguồn này vào file Code.gs.
 * 4. Chạy hàm `initSampleSheets` một lần để tự động tạo 4 Sheet và nạp sẵn dữ liệu mẫu thực chiến.
 * 5. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Loại: Ứng dụng web (Web app).
 * 6. Ai có quyền truy cập: "Bất kỳ ai" (Anyone).
 * 7. Copy URL Web App và dán vào nút Cài đặt trên Header của Bryan Portal.
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
 * Xử lý POST request: Tiếp nhận lệnh thêm/sửa từ Frontend hoặc Antigravity Bot
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
        sheet.appendRow(["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue"]);
      }
      const newId = "t-" + Date.now();
      sheet.appendRow([
        newId,
        body.type || "B2B",
        body.project_id || "",
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
        mSheet.appendRow(["id", "name", "alias", "industry", "avatar_letter", "color", "contract_status"]);
      }
      const mId = "m-" + Date.now();
      const name = body.name || "Đối tác mới";
      mSheet.appendRow([
        mId,
        name,
        body.alias || ("@" + name.toLowerCase().replace(/\s+/g, '')),
        body.industry || "Doanh nghiệp B2B",
        name.charAt(0).toUpperCase(),
        body.color || "bg-teal-700",
        "Đã Ký Kết & Đang Triển Khai"
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
          body.stakeholder.role || "Tech Lead Chuỗi",
          body.stakeholder.phone || "",
          body.stakeholder.email || "",
          body.stakeholder.group || "Tech Chuỗi"
        ]);
      }

      return resJSON({ success: true, id: mId, message: "Đã tạo Merchant và Stakeholder vào Google Sheets" });
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
 * Khởi tạo dữ liệu mẫu thực chiến chuẩn 100% 3 Case Studies của Bryan
 */
function initSampleSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Sheet Merchants
  let mSheet = ss.getSheetByName("Merchants") || ss.insertSheet("Merchants");
  mSheet.clear();
  mSheet.appendRow(["id", "name", "alias", "industry", "avatar_letter", "color", "contract_status"]);
  mSheet.appendRow(["m-highlands", "Highlands Coffee", "@highlands", "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)", "H", "bg-red-700", "Đã Ký Kết & Đang Triển Khai"]);
  mSheet.appendRow(["m-jdv", "JDV Chuỗi Bán Lẻ", "@jdv", "Hệ thống Siêu Thị Bán Lẻ Tiêu Dùng", "J", "bg-blue-700", "Đã Ký Kết & Đang Triển Khai"]);
  mSheet.appendRow(["m-vietthanh", "Xe Điện Việt Thanh", "@vietthanh", "Chuỗi 35 Showroom Xe Điện Toàn Quốc", "V", "bg-emerald-700", "Đã Ký Kết & Đang Triển Khai"]);

  // Sheet Stakeholders (Danh bạ 3 bên cố định)
  let sSheet = ss.getSheetByName("Stakeholders") || ss.insertSheet("Stakeholders");
  sSheet.clear();
  sSheet.appendRow(["id", "merchant_id", "name", "role", "phone", "email", "group"]);
  // Highlands
  sSheet.appendRow(["s-hl-1", "m-highlands", "Anh Tuấn", "Head of IT & Digital", "0908123456", "tuan.it@highlandscoffee.com.vn", "Tech Chuỗi"]);
  sSheet.appendRow(["s-hl-2", "m-highlands", "Chị Mai", "Acquiring Lead - VietinBank", "0912334455", "mai.bank@vietinbank.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-hl-3", "m-highlands", "Bryan Nguyen", "Lead PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);
  // JDV
  sSheet.appendRow(["s-jdv-1", "m-jdv", "Anh Khoa", "Lead Solution Arch JDV", "0988776655", "khoa.arch@jdv.vn", "Tech Chuỗi"]);
  sSheet.appendRow(["s-jdv-2", "m-jdv", "Anh Tuấn Dũng", "Core Banking Lead - Pvcombank", "0977221100", "dung.pvcom@pvcombank.com.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-jdv-3", "m-jdv", "Bryan Nguyen", "Lead PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);
  // Việt Thanh
  sSheet.appendRow(["s-vt-1", "m-vietthanh", "Anh Thanh", "CEO & Founder Việt Thanh", "0966554433", "thanh.ceo@xedienvietthanh.com", "Tech Chuỗi"]);
  sSheet.appendRow(["s-vt-2", "m-vietthanh", "Chị Hạnh", "Phụ trách Trả góp 0% Đối tác", "0944112233", "hanh.bank@partner.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-vt-3", "m-vietthanh", "Bryan Nguyen", "Lead PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);

  // Sheet Projects
  let pSheet = ss.getSheetByName("Projects") || ss.insertSheet("Projects");
  pSheet.clear();
  pSheet.appendRow(["id", "merchant_id", "title", "stage", "due_date", "progress", "tech_gate", "is_blocked", "blocker_reason", "blocker_owner", "gate_step"]);
  pSheet.appendRow(["p-hl-1", "m-highlands", "Recurring Tokenization & Auto-Debit App", "UAT", "2026-11-28", 75, "UAT Sandbox & Test Thẻ", "TRUE", "Chờ Merchant mở IP whitelist Webhook Callback", "Anh Tuấn (Tech Chuỗi)", 3]);
  pSheet.appendRow(["p-hl-2", "m-highlands", "Smart POS Tích Hợp VietQR Động Quầy Thu Ngân", "PILOT", "2026-12-15", 40, "Đang nạp firmware 20 máy demo", "FALSE", "", "", 4]);
  pSheet.appendRow(["p-jdv-1", "m-jdv", "Smart POS 3 Bên (Pvcombank - JDV - Payoo)", "SIT", "2026-12-10", 45, "Đồng bộ mã hóa đơn ERP siêu thị", "FALSE", "", "", 2]);
  pSheet.appendRow(["p-vt-1", "m-vietthanh", "Cổng Thanh Toán & Trả Góp 0% 35 Showroom", "PILOT", "2026-12-05", 85, "Pilot 5 Showroom Hà Nội", "FALSE", "", "", 4]);

  // Sheet Tasks
  let tSheet = ss.getSheetByName("Tasks") || ss.insertSheet("Tasks");
  tSheet.clear();
  tSheet.appendRow(["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue"]);
  tSheet.appendRow(["t-1", "B2B", "p-hl-1", "Kiểm thử kịch bản trừ tiền định kỳ lỗi thẻ ngân hàng", "Bryan", "STAGE_DOING", "CAO", "2026-11-25", "FALSE"]);
  tSheet.appendRow(["t-2", "B2B", "p-hl-1", "Follow up IP Whitelist cho cổng Webhook", "Anh Tuấn", "STAGE_TODO", "KHẨN CẤP", "2026-11-20", "TRUE"]);
  tSheet.appendRow(["t-3", "B2B", "p-hl-2", "Bàn giao 20 máy SmartPOS demo cho cửa hàng mẫu", "Bryan", "STAGE_DOING", "TRUNG BÌNH", "2026-11-30", "FALSE"]);
  tSheet.appendRow(["t-4", "B2B", "p-jdv-1", "Kiểm tra log gọi Webhook hoàn tiền Refund với Pvcombank", "Bryan", "STAGE_TODO", "CAO", "2026-12-02", "FALSE"]);
  tSheet.appendRow(["t-5", "B2B", "p-vt-1", "Rà soát hạn mức trả góp thẻ tín dụng 25 ngân hàng", "Bryan", "STAGE_DONE", "TRUNG BÌNH", "2026-11-18", "FALSE"]);
  tSheet.appendRow(["t-6", "PERSONAL", "", "Cafe trưa trao đổi định hướng tích hợp với anh Khoa JDV", "Bryan", "STAGE_DONE", "TRUNG BÌNH", "2026-11-20", "FALSE"]);
}
