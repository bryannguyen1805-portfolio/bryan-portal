# HỒ SƠ CHUYỂN GIAO KỸ THUẬT: BRYAN PORTAL (CRM & PM OPS HUB)
> **Dành cho:** Antigravity AI Engine / Development Agent  
> **Chủ dự án:** Bryan (Lead Project Manager)  
> **Trạng thái:** Giai đoạn 1 (UI/UX & Logic Frontend Mockup) đã hoàn tất 100%. Sẵn sàng đấu nối Backend Google Sheets & Deploy GitHub Pages.

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU NGHIỆP VỤ

### 1.1 Mục tiêu hệ thống
**Bryan Portal** là một trạm điều hành vận hành cá nhân (Personal Ops Hub / Micro-SaaS) kết hợp giữa:
1. **CRM Pipeline (Phong cách Bitrix24)**: Theo dõi các thương vụ B2B đang tiếp cận, demo và đàm phán hợp đồng (*Merchant Đang Deal / Approach*).
2. **Dedicated Project Management Workspace (Phong cách TaskFlow / Linear)**: Quản lý các dự án kỹ thuật phức tạp với **Merchant Hiện Hữu** đã ký hợp đồng.
   * Mỗi Merchant là một không gian riêng biệt với **Danh bạ Stakeholders 3 bên** (Tech chuỗi, Ngân hàng, Nội bộ Bryan) được lưu cố định ngay khi ký hợp đồng.
   * Một Merchant có thể có nhiều dự án phối hợp kỹ thuật cùng lúc (VD: Highlands vừa làm *Recurring Tokenization*, vừa làm *Smart POS VietQR*).
   * Giám sát tiến độ từng cổng kỹ thuật ("Làm tới đâu"), hạn chót (Due date) và gắn cờ **Blocker SLA khẩn cấp** kèm nút bấm **Bắn Nhắc Hẹn (Ping PIC)** tự động copy mẫu tin nhắn nhắc việc qua Zalo/Email.
3. **Thanh lệnh Antigravity NLP**: Nhập lệnh ngôn ngữ tự nhiên tiếng Việt ở đáy màn hình để tạo task, kích hoạt blocker hoặc chuyển nhanh đến Merchant.

### 1.2 Kiến trúc mục tiêu (Phương Án 1 - Lean Stack 0 đồng)
```text
[ Người dùng / Bot Antigravity ]
          │ (Nhập lệnh NLP / Text)
          ▼
[ Google Apps Script Web App (API Engine) ] 
          │ 
     (Đọc / Ghi JSON 2 chiều)
          ▼
[ Google Sheets (Database 4 Tabs: Merchants, Stakeholders, Projects, Tasks) ]
          ▲
          │ (HTTP GET fetch JSON)
[ Web Frontend (index.html) - Host miễn phí trên GitHub Pages ]
```

---

## 2. HIỆN TRẠNG MÃ NGUỒN FRONTEND (`index.html`)

Toàn bộ giao diện đã được gói gọn trong **1 tệp duy nhất** (`index.html`) sử dụng:
* **Tailwind CSS (CDN)**: Giao diện biển nhiệt đới Bitrix24 kết hợp các thẻ card trắng bo góc mềm của TaskFlow.
* **Lucide Icons (CDN)**: Hệ thống biểu tượng giao diện.
* **Chart.js (CDN)**: 2 biểu đồ Velocity 7 ngày và Phân bố trạng thái trên Dashboard.

### Các hàm cốt lõi đang chạy trên Frontend:
* `navigateTo(screenId)`: Điều hướng giữa 6 màn hình (`DASHBOARD`, `PROJECTS`, `TASKS`, `CALENDAR`, `NOTIFICATIONS`, `AUTOMATION`).
* `selectSpecificMerchant(mId)` & `renderActiveMerchantWorkspace()`: Quản lý không gian riêng của từng Merchant hiện hữu.
* `handlePingPIC(merchantName, projectTitle, reason)`: Cơ chế copy tin nhắn nhắc hẹn SLA vào Clipboard.
* `handleCommandSubmit(e)`: Nhận diện lệnh tự nhiên từ thanh Antigravity NLP ở đáy màn hình.
* `handleSaveNewMerchant(e)`: Khởi tạo Merchant mới kèm Stakeholders và Dự án ban đầu.
* `handleSaveNewTask(e)`: Thêm nhiệm vụ mới vào bảng dữ liệu.

---

## 3. CÁC ĐẦU VIỆC ANTIGRAVITY CẦN THỰC HIỆN TIẾP THEO

### Nhiệm Vụ 1: Thiết Lập Backend Google Apps Script (`Code.gs`)
Antigravity cần triển khai đoạn mã sau vào Google Apps Script gắn với Google Sheets của Bryan:

```javascript
/**
 * GOOGLE APPS SCRIPT - BACKEND REST API CHO BRYAN PORTAL
 */
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const getRows = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];
    const headers = values[0];
    return values.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
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
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "CREATE_TASK") {
      const sheet = ss.getSheetByName("Tasks");
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

    if (action === "UPDATE_BLOCKER") {
      const sheet = ss.getSheetByName("Projects");
      const data = sheet.getDataRange().getValues();
      const projId = body.project_id;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === projId) { // Column A: id
          sheet.getRange(i + 1, 8).setValue(body.is_blocked ? "TRUE" : "FALSE"); // Col H: is_blocked
          sheet.getRange(i + 1, 9).setValue(body.blocker_reason || "");          // Col I: blocker_reason
          sheet.getRange(i + 1, 10).setValue(body.blocker_owner || "");          // Col J: blocker_owner
          return resJSON({ success: true, message: "Đã cập nhật trạng thái Blocker" });
        }
      }
      return resJSON({ success: false, message: "Không tìm thấy dự án" });
    }

    if (action === "CREATE_MERCHANT") {
      const mSheet = ss.getSheetByName("Merchants");
      const mId = "m-" + Date.now();
      mSheet.appendRow([
        mId,
        body.name,
        body.alias,
        body.industry,
        body.name.charAt(0).toUpperCase(),
        "bg-emerald-700"
      ]);

      if (body.stakeholder) {
        const sSheet = ss.getSheetByName("Stakeholders");
        sSheet.appendRow([
          "s-" + Date.now(),
          mId,
          body.stakeholder.name,
          body.stakeholder.role,
          body.stakeholder.phone,
          body.stakeholder.email,
          "Merchant Lead"
        ]);
      }
      return resJSON({ success: true, id: mId, message: "Đã tạo Merchant và Stakeholder" });
    }

    return resJSON({ success: false, message: "Action không hợp lệ" });
  } catch (err) {
    return resJSON({ success: false, error: err.toString() });
  }
}

function resJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

### Nhiệm Vụ 2: Đấu Nối Frontend `index.html` Với Google Apps Script API
Thay thế các mảng biến mẫu tĩnh (`existingMerchants`, `allTasksData`) bằng hàm gọi API bất đồng bộ:

```javascript
// Cấu hình URL Web App Apps Script của Bryan
const API_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";

// 1. Tải toàn bộ dữ liệu từ Google Sheets về Frontend
async function syncDataFromGoogleSheets() {
  try {
    const res = await fetch(API_ENDPOINT);
    const data = await res.json();
    
    // Tái cấu trúc dữ liệu theo định dạng Frontend mong đợi
    mapGoogleSheetsDataToState(data);
    
    // Vẽ lại toàn bộ giao diện
    renderMerchantPills();
    renderActiveMerchantWorkspace();
    renderTasksGrid();
    renderDealsKanban();
    showToast("✓ Đã đồng bộ dữ liệu mới nhất từ Google Sheets!");
  } catch (err) {
    console.warn("Đang chạy offline với Mock Data:", err);
  }
}

// 2. Gửi lệnh thêm/sửa từ Frontend hoặc Antigravity lên Google Sheets
async function postDataToGoogleSheets(payload) {
  try {
    await fetch(API_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    // Gọi lại đồng bộ sau 1.5 giây
    setTimeout(syncDataFromGoogleSheets, 1500);
  } catch (err) {
    console.error("Lỗi gửi dữ liệu:", err);
  }
}
```

---

### Nhiệm Vụ 3: Cấu Hình Prompt & JSON Schema Cho Antigravity NLP Engine
Khi Bryan nhắn tin bằng ngôn ngữ tự nhiên tiếng Việt, Antigravity cần phân loại và xuất đúng định dạng JSON Schema sau:

#### System Prompt dành cho Antigravity AI Parser:
> *"Bạn là trợ lý ảo vận hành B2B của Bryan tại Bryan Portal. Nhiệm vụ của bạn là nhận tin nhắn tiếng Việt từ Bryan, phân tích ý định và trích xuất thành đối tượng JSON có cấu trúc chuẩn xác để gửi vào Google Apps Script POST API."*

#### Bảng ánh xạ ý định (Intent Mapping Table):
| Tin nhắn của Bryan | `action` trích xuất | Payload JSON tương ứng |
| :--- | :---: | :--- |
| *"Tạo task Highlands test kịch bản thẻ lỗi due date 25/11"* | `CREATE_TASK` | `{"action": "CREATE_TASK", "project_id": "p-hl-1", "title": "Test kịch bản thẻ lỗi", "pic": "Bryan", "priority": "CAO", "due_date": "2026-11-25"}` |
| *"@highlands khẩn cấp lỗi IP webhook Sandbox trễ 2 ngày"* | `UPDATE_BLOCKER` | `{"action": "UPDATE_BLOCKER", "project_id": "p-hl-1", "is_blocked": true, "blocker_reason": "Lỗi IP webhook Sandbox (Trễ 2 ngày)", "blocker_owner": "Merchant Tech"}` |
| *"Tạo đối tác Katinat @katinat chuỗi F&B 80 quán PIC Anh Nam 0912345678"* | `CREATE_MERCHANT` | `{"action": "CREATE_MERCHANT", "name": "Katinat", "alias": "@katinat", "industry": "Chuỗi F&B / 80 Quán", "stakeholder": {"name": "Anh Nam", "role": "Tech Lead", "phone": "0912345678"}}` |

---

### Nhiệm Vụ 4: Triển Khai Lên GitHub Pages (Hosting Miễn Phí 24/7)
1. Khởi tạo kho chứa mới trên GitHub: `bryan-portal`.
2. Đẩy file `index.html` vào nhánh `main`.
3. Bật **Settings** $\rightarrow$ **Pages** $\rightarrow$ Chọn nhánh `main` $\rightarrow$ Bấm **Save**.
4. Website sẽ online tức thì tại URL: `https://[username].github.io/bryan-portal/`.

---
*Tài liệu này là đặc tả hoàn chỉnh. Antigravity có thể dựa vào tài liệu này để triển khai từng module mà không cần hỏi lại ngữ cảnh.*