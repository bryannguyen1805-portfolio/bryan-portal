# BRYAN PORTAL (CRM & PM OPS HUB)

> **Hệ thống điều hành vận hành B2B FinTech & Quản lý Dự án Merchant**  
> Dành cho Lead Project Manager & Technical Sales Operations.

---

## 🚀 KIẾN TRÚC HỆ THỐNG (LEAN STACK 0 ĐỒNG)
- **Frontend**: Single-page App (`index.html`) sử dụng Tailwind CSS, Lucide Icons, Chart.js.
- **Backend**: Google Apps Script REST API (`Code.gs`).
- **Database**: Google Sheets (4 Tabs: `Merchants`, `Stakeholders`, `Projects`, `Tasks`).
- **Deploy**: GitHub Pages (Miễn phí 24/7).

---

## 📋 HƯỚNG DẪN 3 BƯỚC ĐẤU NỐI GOOGLE SHEETS

### Bước 1: Tạo Google Sheet mới
1. Mở [Google Sheets](https://sheets.new) tạo một bảng tính mới, đặt tên: `Bryan Portal Database`.
2. Tạo 4 Tabs (Trang tính):
   - `Merchants`: `id | name | alias | industry | avatar_letter | color`
   - `Stakeholders`: `id | merchant_id | name | role | phone | email | group`
   - `Projects`: `id | merchant_id | title | stage | due_date | progress | tech_gate | is_blocked | blocker_reason | blocker_owner`
   - `Tasks`: `id | project_id | title | pic | stage | priority | due_date | is_overdue`

### Bước 2: Dán mã `Code.gs` & Triển khai Web App
1. Trên Google Sheets, chọn **Tiện ích mở rộng (Extensions)** $\rightarrow$ **Apps Script**.
2. Xóa nội dung mặc định, copy toàn bộ mã trong file [Code.gs](file:///Users/quangtri/Documents/Bryan%20Portal/Code.gs) dán vào.
3. (Tùy chọn) Chọn hàm `initSampleSheets` và bấm **Chạy (Run)** để tự động điền dữ liệu mẫu ban đầu.
4. Bấm nút **Triển khai (Deploy)** ở góc trên bên phải $\rightarrow$ **Tùy chọn triển khai mới (New deployment)**.
   - Loại: **Ứng dụng web (Web app)**
   - Mô tả: `Bryan Portal API v1`
   - Thực thi dưới dạng: **Tôi (email của bạn)**
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
5. Bấm **Triển khai** và sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/AKfycb.../exec`).

### Bước 3: Kết nối vào Bryan Portal
1. Mở file [index.html](file:///Users/quangtri/Documents/Bryan%20Portal/index.html) trên trình duyệt.
2. Bấm vào nút trạng thái kết nối trên thanh Header (góc trên bên phải).
3. Dán Web App URL vừa sao chép vào ô cấu hình $\rightarrow$ Bấm **Lưu & Đồng Bộ**.
4. Đèn báo sẽ chuyển sang màu xanh lá: **Google Sheets Online**!

---

## 🌐 HƯỚNG DẪN DEPLOY GITHUB PAGES
1. Khởi tạo kho chứa trên GitHub (ví dụ: `bryan-portal`).
2. Đẩy các file vào kho chứa:
   ```bash
   git init
   git add .
   git commit -m "feat: Bryan Portal B2B CRM & PM Ops Hub v1.0"
   git branch -M main
   git remote add origin https://github.com/<username>/bryan-portal.git
   git push -u origin main
   ```
3. Trên GitHub, vào **Settings** $\rightarrow$ **Pages** $\rightarrow$ Chọn Branch `main` $\rightarrow$ Bấm **Save**.
4. Website sẽ chạy tại: `https://<username>.github.io/bryan-portal/`

---

## ⚡ THANH LỆNH ANTIGRAVITY NLP
Bạn có thể gõ trực tiếp tiếng Việt vào thanh lệnh ở đáy màn hình:
- **Tạo Task**: `Tạo task Highlands test kịch bản thẻ lỗi due date 25/11`
- **Bật Blocker**: `@highlands khẩn cấp lỗi IP webhook Sandbox trễ 2 ngày`
- **Tạo Merchant**: `Tạo đối tác Katinat @katinat chuỗi F&B 80 quán PIC Anh Nam 0912345678`
- **Chuyển Workspace**: `@highlands` hoặc `@thiso`
