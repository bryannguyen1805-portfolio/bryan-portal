/**
 * GOOGLE APPS SCRIPT - BACKEND REST API CHO BRYAN PORTAL (B2B COMMERCIAL & PROJECT DELIVERY)
 * Tác giả: Bryan (Lead B2B Project Manager) & Antigravity
 * 
 * Hướng dẫn cài đặt nhanh:
 * 1. Mở Google Sheets mới (đặt tên: "Bryan Portal Database").
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Dán toàn bộ mã nguồn này vào file Code.gs.
 * 4. Chạy hàm `initSampleSheets` một lần để tự động tạo 4 Sheet và nạp sẵn dữ liệu mẫu thực chiến.
 * 5. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Loại: Ứng dụng web (Web app).
 * 6. Ai có quyền truy cập: "Bất kỳ ai" (Anyone).
 * 7. Copy URL Web App và dán vào nút Cài đặt trên Header của Bryan Portal.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * GET request: Trả về toàn bộ dữ liệu 4 tabs dưới dạng JSON
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
 * POST request: Tiếp nhận lệnh thêm/sửa từ Frontend hoặc Antigravity Bot
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
        body.type || "COMMERCIAL",
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

    // 2. Cập nhật trạng thái Blocker cam kết
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
        mSheet.appendRow(["id", "name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "contract_status"]);
      }
      const mId = "m-" + Date.now();
      const name = body.name || "Đối tác mới";
      mSheet.appendRow([
        mId,
        name,
        body.alias || ("@" + name.toLowerCase().replace(/\s+/g, '')),
        body.industry || "Doanh nghiệp Chuỗi",
        body.expected_gmv || "~500M GMV/tháng",
        name.charAt(0).toUpperCase(),
        body.color || "bg-teal-700",
        "Đã Ký Hợp Đồng • Chuẩn Bị Triển Khai"
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
          body.stakeholder.role || "Giám Đốc Vận Hành / Đại Diện Chuỗi",
          body.stakeholder.phone || "",
          body.stakeholder.email || "",
          body.stakeholder.group || "Đại Diện Chuỗi"
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
 * Khởi tạo dữ liệu mẫu thực chiến B2B Commercial & Technical Project Delivery
 */
function initSampleSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Sheet Merchants
  let mSheet = ss.getSheetByName("Merchants") || ss.insertSheet("Merchants");
  mSheet.clear();
  mSheet.appendRow(["id", "name", "alias", "industry", "expected_gmv", "avatar_letter", "color", "contract_status"]);
  mSheet.appendRow(["m-highlands", "Highlands Coffee", "@highlands", "Chuỗi F&B Toàn Quốc (700+ Cửa Hàng)", "~1.5 Tỷ VNĐ/tháng", "H", "bg-red-700", "Đã Ký Hợp Đồng Kinh Tế • Đang Triển Khai Delivery"]);
  mSheet.appendRow(["m-jdv", "JDV Chuỗi Bán Lẻ", "@jdv", "Hệ thống Siêu Thị Bán Lẻ Tiêu Dùng", "~750M VNĐ/tháng", "J", "bg-blue-700", "Đã Ký Phụ Lục 3 Bên • Đang Thử Nghiệm POS"]);
  mSheet.appendRow(["m-vietthanh", "Xe Điện Việt Thanh", "@vietthanh", "Chuỗi 35 Showroom Xe Điện Toàn Quốc", "~1.2 Tỷ VNĐ/tháng", "V", "bg-emerald-700", "Đã Ký Hợp Đồng Trả Góp 0% • Chuẩn Bị Go-Live"]);

  // Sheet Stakeholders (Danh bạ 3 bên)
  let sSheet = ss.getSheetByName("Stakeholders") || ss.insertSheet("Stakeholders");
  sSheet.clear();
  sSheet.appendRow(["id", "merchant_id", "name", "role", "phone", "email", "group"]);
  // Highlands
  sSheet.appendRow(["s-hl-1", "m-highlands", "Anh Tuấn", "Head of IT & Digital", "0908123456", "tuan.it@highlandscoffee.com.vn", "Tech Chuỗi"]);
  sSheet.appendRow(["s-hl-2", "m-highlands", "Chị Mai", "Acquiring Lead - VietinBank", "0912334455", "mai.bank@vietinbank.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-hl-3", "m-highlands", "Bryan Nguyen", "Lead B2B PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);
  // JDV
  sSheet.appendRow(["s-jdv-1", "m-jdv", "Anh Khoa", "Lead Solution Arch JDV", "0988776655", "khoa.arch@jdv.vn", "Tech Chuỗi"]);
  sSheet.appendRow(["s-jdv-2", "m-jdv", "Anh Tuấn Dũng", "Core Banking Lead - Pvcombank", "0977221100", "dung.pvcom@pvcombank.com.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-jdv-3", "m-jdv", "Bryan Nguyen", "Lead B2B PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);
  // Việt Thanh
  sSheet.appendRow(["s-vt-1", "m-vietthanh", "Anh Thanh", "CEO & Founder Việt Thanh", "0966554433", "thanh.ceo@xedienvietthanh.com", "Đại Diện Chuỗi"]);
  sSheet.appendRow(["s-vt-2", "m-vietthanh", "Chị Hạnh", "Phụ trách Trả góp 0% Đối tác", "0944112233", "hanh.bank@partner.vn", "Ngân Hàng"]);
  sSheet.appendRow(["s-vt-3", "m-vietthanh", "Bryan Nguyen", "Lead B2B PM Delivery", "0934000111", "bryan.nguyen@hub.internal", "Nội Bộ Bryan"]);

  // Sheet Projects
  let pSheet = ss.getSheetByName("Projects") || ss.insertSheet("Projects");
  pSheet.clear();
  pSheet.appendRow(["id", "merchant_id", "title", "stage", "due_date", "progress", "milestone_name", "is_blocked", "blocker_reason", "blocker_owner", "gate_step"]);
  pSheet.appendRow(["p-hl-1", "m-highlands", "Recurring Tokenization & Trừ Tiền Tự Động Trên Highlands App", "UAT SIGN-OFF", "2026-11-28", 75, "3. UAT Nghiệm Thu Lỗi Thẻ & Quy Trình Đối Soát", "TRUE", "Chưa mở Whitelist IP Callback Webhook dẫn tới chưa thể ký nghiệm thu UAT", "Anh Tuấn (IT Chuỗi)", 3]);
  pSheet.appendRow(["p-hl-2", "m-highlands", "Smart POS Tích Hợp VietQR Động Quầy Thu Ngân", "STORE PILOT", "2026-12-15", 40, "4. Thử nghiệm quầy mẫu & đào tạo thu ngân", "FALSE", "", "", 4]);
  pSheet.appendRow(["p-jdv-1", "m-jdv", "Smart POS 3 Bên (Pvcombank - JDV - Payoo) Đồng Bộ Hóa Đơn ERP", "INTEGRATION", "2026-12-10", 45, "2. Khảo sát luồng hóa đơn ERP & Kế toán", "FALSE", "", "", 2]);
  pSheet.appendRow(["p-vt-1", "m-vietthanh", "Cổng Thanh Toán & Trả Góp 0% 25 Ngân Hàng Tại 35 Showroom", "STORE PILOT", "2026-12-05", 85, "4. Pilot 5 Showroom Hà Nội & Nghiệm thu", "FALSE", "", "", 4]);

  // Sheet Tasks
  let tSheet = ss.getSheetByName("Tasks") || ss.insertSheet("Tasks");
  tSheet.clear();
  tSheet.appendRow(["id", "type", "project_id", "title", "pic", "stage", "priority", "due_date", "is_overdue"]);
  tSheet.appendRow(["t-1", "COMMERCIAL", "p-hl-1", "Rà soát biểu phí MDR & Phụ lục đối soát tự động T+1 với VietinBank", "Bryan", "STAGE_DOING", "CAO", "2026-11-25", "FALSE"]);
  tSheet.appendRow(["t-2", "TECH_DELIVERY", "p-hl-1", "Đôn đốc IT Highlands mở Whitelist IP Webhook để nghiệm thu UAT", "Anh Tuấn", "STAGE_TODO", "KHẨN CẤP", "2026-11-20", "TRUE"]);
  tSheet.appendRow(["t-3", "TECH_DELIVERY", "p-hl-2", "Kiểm tra 20 máy SmartPOS demo trước khi bàn giao cho cửa hàng mẫu", "Bryan", "STAGE_DOING", "TRUNG BÌNH", "2026-11-30", "FALSE"]);
  tSheet.appendRow(["t-4", "COMMERCIAL", "p-jdv-1", "Thống nhất quy trình đối soát hoàn tiền (Refund) giữa JDV và Pvcombank", "Bryan", "STAGE_TODO", "CAO", "2026-12-02", "FALSE"]);
  tSheet.appendRow(["t-5", "COMMERCIAL", "p-vt-1", "Ký biên bản nghiệm thu pilot đợt 1 tại 5 showroom với anh Thanh CEO", "Bryan", "STAGE_DONE", "TRUNG BÌNH", "2026-11-18", "FALSE"]);
  tSheet.appendRow(["t-6", "PERSONAL", "", "Cafe trưa trao đổi kế hoạch mở rộng chuỗi miền Nam với anh Khoa JDV", "Bryan", "STAGE_DONE", "TRUNG BÌNH", "2026-11-20", "FALSE"]);
}
