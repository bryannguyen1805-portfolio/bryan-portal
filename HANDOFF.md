# BPortal (Bryan Portal) — Context & Technical Handoff

> **Purpose:** Read this file at the start of a new Antigravity session (e.g., on another laptop) to immediately understand the full architecture, completed features, conventions, and deployment setup of **BPortal**.

---

## 1. Project Overview
- **Product:** BPortal (`Bryan Portal — Business Operation`)
- **Repository:** `https://github.com/bryannguyen1805-portfolio/bryan-portal` (`main` branch)
- **Live Hosting:** GitHub Pages (`CNAME`: `bryanportal.io.vn`)
- **Stack:** Vanilla HTML + Tailwind CSS (CDN) + Custom Theme CSS (`css/flip7-theme.css`) + Modular Vanilla JS (`js/*.js`) + Google Apps Script (`Code.gs`) backed by Google Sheets.
- **No build step:** All JS/CSS files are loaded directly by `index.html` with `?v=...` cache-busting query strings. Always bump `?v=...` in `index.html` when editing CSS/JS.

---

## 2. File Map
- `index.html` — App shell, Sidebar (Desktop collapsible + Mobile slide-over drawer + sticky Mobile Bottom Nav), Topbar (Mobile `🔍 Tìm & Lệnh nhanh...` trigger + Desktop Omnibar), Dashboard (Morning Focus + Operations tabs), all views (`PROJECTS`, `ONBOARDING`, `PIPELINE`, `TASKS`, `CALENDAR`, `NOTIFICATIONS`, `AUTOMATION`), Enterprise CRM Footer (pinned at bottom via `flex-col` `<main>`), and CRUD modals.
- `css/flip7-theme.css` — Brand theme layer (Teal / Gold / Coral / Cream) + **Calmed Matte Dark Mode** (`html.theme-dark` using `#0D1117` / `#161B22` / `#1C222B`) + macOS/WebKit `<select>` `border-radius: 12px` normalization.
- `Code.gs` — Google Apps Script REST API (`doGet`, `doPost`), `LockService` concurrency protection, strict `Users` whitelist + PIN verification, 7-day Soft Delete + Restore + Immediate Purge + Daily Auto-Purge (`runDailyUserPurge`), per-owner (`owner_email`) data isolation across 7 sheets (`Merchants`, `Stakeholders`, `Projects`, `Tasks`, `Meetings`, `Folders`, `Onboarding`), 2-way Google Calendar sync (`CalendarApp`), live `.ics` subscription feed (`action=ics`), and personalized reminder emails (`SEND_REMINDER_EMAIL`).
- `js/auth.js` — Strict Whitelist + PIN login overlay (`#auth-login-overlay`), Admin user provisioning/locking/7-day soft-delete/restore/immediate-purge modal (`#modal-admin-users`), and self-service PIN change (`#modal-change-pin`).
- `js/state-sync.js` — Per-user isolated `localStorage` keys, default `API_ENDPOINT` (`DEFAULT_API_ENDPOINT`), `flushFullCloudSyncNow()` before logout, `400ms` debounced `SYNC_FULL_STATE` (without blind `mode: "no-cors"`), and KPI updates.
- `js/dashboard.js` — Time-of-day hero greeting (`syncWelcomeAccountGreeting`), Daily Focus Goal widget, **Bnews Morning Briefing** (`https://bryanportfolio.io.vn/fintech-intelligence`, configurable + read-tracked per day/user), Appearance switcher (`light` / `dark` / `system`), and Feedback modal (emails `quangtritc1805@gmail.com`).
- `js/projects.js` — Merchant workspace, Mobile card directory vs Desktop table (`renderMerchantDirectoryPanel`), and Task CRUD modal with Reminder presets + channels.
- `js/calendar.js` — Unified Calendar (Month grid with dot indicators on Mobile + full pills on Desktop, Timeline mode), and Google/Apple Calendar Sync modal (`openCalendarSyncModal()`).
- `js/omnibar.js` — Desktop inline Omnibar + Mobile Hybrid Command Center (`#command-center-modal`) with 16px input (no iOS zoom), live search across Merchants/Onboarding/Tasks, and 1-tap command presets (`go live`, `xong B...`, `Họp...`, `Tạo task...`, `Triển khai mới...`).
- `js/notifications-automation.js` — Per-user Notification Preferences (`openNotifPrefsModal()`), Real-Time Reminder Scheduler (`checkDueRemindersEngine()` checking every 30s for Meetings, Tasks, and Contract Renewals across Bell, Laptop Pop-up, and Email), and custom Automation rules.
- `js/undo-engine.js` — Global Undo stack + compact bottom-right `#toast` (2s auto-dismiss for normal toasts, 6s when Undo is enabled).
- `assets/brand/` & root icons (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`) — Approved BPortal brand kit.

---

## 3. Key Architectural Decisions & Conventions
1. **Strict Whitelist + PIN Auth (No Domain Wildcard):**
   - Both `doGet` and `doPost` in `Code.gs` validate `email + pin` against the `Users` sheet (`active !== "FALSE"` and `!deleted_at`).
   - Admin accounts (`role === "ADMIN"`) can provision, lock/unlock, soft-delete (7-day grace period), restore, or immediately purge users.
   - Note: Never store real/sensitive PINs in client-side repo files or documentation since the repository is Public for GitHub Pages.
2. **7-Day Soft Delete & Auto-Purge:**
   - Deleting a user sets `active = "FALSE"`, `deleted_at`, and `purge_after = +7 days`. Data across all 7 sheets remains intact for 7 days so Admin can restore, OR Admin can click **Xóa ngay** (`ADMIN_PURGE_USER`) to wipe all 7 sheets immediately.
   - `runDailyUserPurge()` can be attached to a daily Time-driven Trigger in Google Apps Script.
3. **Personalized Reminders (Bell, Laptop Pop-up, User Email):**
   - Meetings and Tasks store `reminder_minutes` (`none`, `0`, `5`, `10`, `15`, `30`, `60`, `120`, `1440`, `2880`, `10080`) and `notify_channels` (`bell,popup,email`).
   - Each user configures their own target email(s) and default lead times (including Contract Renewal) via `⚙️ Cá nhân hóa` (`openNotifPrefsModal()`).
4. **Calendar Sync (Zero File Upload):**
   - `Code.gs` syncs Bryan's meetings to Google Calendar via `CalendarApp` (`pushMeetingsToGoogleCalendar` & `action=syncGoogleCalendar`) and exposes `?action=ics&user_email=...&user_pin=...` with `VALARM` triggers for Apple/Google Calendar URL subscription.
5. **UI/UX Rules Agreed With User:**
   - Avoid colorful AI emojis in institutional UI (use crisp monochrome Lucide icons).
   - Keep Light Mode bright/clean and Dark Mode matte/low-saturation (`#0D1117` / `#161B22`, zero neon glow).
   - Keep Footer pinned at the bottom of `<main>` even on short views.
   - Verify all JS edits with `node --check js/*.js` and `Code.gs` edits with a Node `vm` test suite before committing.

---

## 4. Deployment Reminder When Updating `Code.gs`
Whenever `Code.gs` changes, copy it into the linked Google Apps Script project and run **Deploy -> Manage deployments -> Edit -> New version -> Deploy** (and authorize `CalendarApp` / `MailApp` if prompted).
