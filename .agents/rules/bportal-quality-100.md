---
trigger: always_on
---

# BPortal Quality & Lighthouse 100/100 Standard

When making any UI, CSS, HTML, or JavaScript change in **Bryan Portal**:

1. **Maintain 100/100 Lighthouse & PageSpeed Scores (Desktop & Mobile):**
   - **Performance: 100**, **Accessibility: 100**, **Best Practices: 100**, **SEO: 100**, **Agentic Browsing: 2/2 (100)**.
   - Keep compiled Tailwind + theme CSS inlined inside `<style id="bportal-inline-css">` in `index.html` (no render-blocking external stylesheets).
   - Keep `defer` on `<script>` tags and never add a dummy `window.lucide` shim.
   - Always specify explicit `width` and `height` attributes on `<img>` elements.
   - Never add `maximum-scale=1.0` or `user-scalable=no` to `<meta name="viewport">`.
   - Maintain WCAG AA color contrast in both Light Mode and Dark Mode (`html.theme-dark`).
   - When minifying/inlining `css/flip7-theme.css`, only strip `/* ... */` comments and collapse whitespace; **never** strip spaces around `:` (which breaks `html.theme-dark :is(...)` descendant selectors).

2. **Pre-Release Verification & Git Workflow:**
   - Test UI changes in local preview first and verify with Chrome DevTools (`lighthouse_audit` for both `desktop` and `mobile`, plus `list_console_messages` showing 0 errors).
   - Never commit or push to `main` without explicit user approval.
