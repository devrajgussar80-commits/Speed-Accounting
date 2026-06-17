# Publish Speed Accounting Online

## What Is Ready
- The app serves frontend and backend from `backend/server.py`.
- Online platforms can start it with `python backend/server.py`.
- `PORT` is supported automatically.
- Razorpay keys are read from environment variables.
- SQLite database path can be set with `DATABASE_PATH`.
- `render.yaml` is included for Render deployment with a persistent disk.

## Recommended Render Setup
1. Create/login to a Render account.
2. Upload/connect this project from GitHub, or use the manual deploy option if available.
3. Choose **Web Service**.
4. Use:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python backend/server.py`
5. Add a persistent disk:
   - Mount Path: `/var/data`
   - Size: `1 GB`
6. Add environment variables:
   - `SPEED_ACCOUNTING_HOST=0.0.0.0`
   - `DATABASE_PATH=/var/data/speed_accounting.db`
   - `RAZORPAY_KEY_ID=rzp_live_your_key_id`
   - `RAZORPAY_KEY_SECRET=your_live_key_secret`

## Before Live Payments
1. Keep `.env` private. Do not upload it publicly.
2. Use Razorpay **Live Mode** keys only when you want real payments.
3. Add your hosted app URL in Razorpay business/app settings after deploy.
4. Keep local test keys in `.env`; put live keys only in the hosting dashboard.

## Start Command
```bash
python backend/server.py
```

## Files To Upload
Upload the project folder, but do not upload:
- `.env`
- `*.db`
- `*.db-shm`
- `*.db-wal`
- backup folders

## Important Hosting Note
Free hosting without persistent storage can delete the SQLite database after restart. Use persistent disk for customer data, or later move the database to PostgreSQL/MySQL.

## Local Production Test
Run:
```powershell
$env:SPEED_ACCOUNTING_HOST="0.0.0.0"
$env:SPEED_ACCOUNTING_PORT="8765"
python backend\server.py
```

Open:
```text
http://127.0.0.1:8765/
```
