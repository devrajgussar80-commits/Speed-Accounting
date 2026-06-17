# 🚀 Quick Start - Speed Accounting Backend v2.0

## ✨ What's New?

```
OLD: Basic accounting app (no backend)
NEW: Full-featured SaaS platform!

✅ User Authentication (Login/Register)
✅ Razorpay Payment Gateway Integration  
✅ 5 Subscription Plans Ready
✅ Email Notifications
✅ Cloud Backup & Sync
✅ Multi-user Support
✅ Production Ready! 🎯
```

---

## 📋 Setup in 5 Minutes

### 1️⃣ Replace Backend File
```bash
cd "Desktop\Hisaab Pro"
# Backup old file
copy server.py server_old.py

# Use new enhanced version
copy server_enhanced.py server.py
```

### 2️⃣ Get Razorpay Test Keys
1. Go: https://dashboard.razorpay.com
2. Sign up (free)
3. Get Test Keys (Key ID + Secret)
4. Copy them

### 3️⃣ Setup Gmail (for emails)
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Copy 16-character password

### 4️⃣ Create .env File
In "Desktop\Hisaab Pro" folder, create `.env`:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=your_secret_key
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=16_char_app_password
```

### 5️⃣ Run Backend
Double-click: `START-SPEED-ACCOUNTING-BACKEND.bat`

Expected output:
```
🚀 Speed Accounting Backend v2.0 running at http://127.0.0.1:8765/

✅ Features:
   • User Authentication (Register/Login)
   • Razorpay Payment Integration
   • Subscription Management
   • Cloud Backup & Sync
   • Email Notifications
   • Audit Logging
```

---

## 🧪 Test It Now!

### Register User
```
Email: test@example.com
Password: Test123!
Name: John Doe
Phone: 9999999999

✅ Success! Email sent to test@example.com
```

### Subscribe to Plan
```
Plan: Monthly (₹399)
✅ Payment order created
✅ Subscription activated
✅ Confirmation email sent
```

---

## 📡 New API Endpoints Ready to Use

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Payments
```
POST /api/payment/create-order
POST /api/payment/verify
```

### Subscriptions
```
GET /api/subscription/status
```

### Backup
```
GET /api/backup (download)
GET /api/backup/history (list)
```

---

## 🎯 What to Do Next?

1. ✅ **Setup backend** (follow steps above)
2. 📝 **Update frontend** to use new APIs
3. 💳 **Test payments** with Razorpay test mode
4. 📧 **Verify emails** are working
5. 🚀 **Deploy to production**

---

## 📚 Full Documentation

See: `ENHANCED-BACKEND-README.md`

---

## ❓ Common Issues

### Email not working?
- Check .env file has correct EMAIL_FROM and EMAIL_PASSWORD
- Verify App Password (16 characters)
- Check email_logs table in database

### Payment failing?
- Verify RAZORPAY_KEY_ID starts with "rzp_test_"
- Use test card: 4111 1111 1111 1111
- Check payments table for details

### Backend not starting?
- Verify Python 3.8+ installed
- Check port 8765 is free
- Run: `python server.py` directly to see errors

---

## 💰 Subscription Plans

| Plan | Price | Duration |
|------|-------|----------|
| Monthly | ₹399 | 30 days |
| Quarterly | ₹1,099 | 90 days |
| Semi-Annual | ₹2,050 | 180 days |
| Annual | ₹4,199 | 365 days |
| Lifetime | ₹30,000 | Forever ♾️ |

---

## 🔑 API Keys Location

```
Razorpay: https://dashboard.razorpay.com/app/keys
Gmail: https://myaccount.google.com/apppasswords
```

---

## ✅ Checklist

- [ ] Backup old server.py
- [ ] Copy server_enhanced.py → server.py
- [ ] Get Razorpay test keys
- [ ] Setup Gmail app password
- [ ] Create .env file
- [ ] Run backend
- [ ] Test register endpoint
- [ ] Test payment endpoint
- [ ] Test email received
- [ ] Test backup download

---

**Status:** Ready to Use! 🎉  
**Version:** 2.0  
**Date:** 2025
