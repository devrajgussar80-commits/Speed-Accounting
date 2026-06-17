Speed Accounting Backend
========================

Run:
1. Double-click START-SPEED-ACCOUNTING-BACKEND.bat
2. Open http://127.0.0.1:8765/ in Chrome

What it does:
- Serves the existing Speed Accounting app.
- Saves app data to backend/speed_accounting.db using SQLite.
- Keeps localStorage fallback, so file-open mode still works.
- Exposes APIs:
  - GET  /api/health
  - GET  /api/state
  - PUT  /api/state
  - GET  /api/companies
  - GET  /api/backup
  - GET  /api/license/status
  - POST /api/license/activate

Important:
- Keep qrcode.min.js, index.html, style.css, script.js, backend folder, and this BAT file together.
- For paid rental/lifetime licensing, the license API is scaffolded and ready for the next phase.
