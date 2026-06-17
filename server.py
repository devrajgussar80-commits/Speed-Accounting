from __future__ import annotations

import json
import mimetypes
import os
import sqlite3
import sys
import hashlib
import hmac
import base64
import secrets
import smtplib
from datetime import datetime, timezone, timedelta
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse
from urllib import error as urlerror
from urllib import request as urlrequest
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = Path(__file__).resolve().parent
STATE_ID = "default"


def load_env_file() -> None:
    for env_path in (ROOT_DIR / ".env", BACKEND_DIR / ".env"):
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            clean = line.strip()
            if not clean or clean.startswith("#") or "=" not in clean:
                continue
            key, value = clean.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()

DB_PATH = Path(os.environ.get("DATABASE_PATH", str(BACKEND_DIR / "speed_accounting.db"))).expanduser()
if not DB_PATH.is_absolute():
    DB_PATH = (ROOT_DIR / DB_PATH).resolve()

# ===== RAZORPAY CONFIG =====
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

# ===== EMAIL CONFIG =====
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
EMAIL_FROM = os.environ.get("EMAIL_FROM", "your_email@gmail.com")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "your_app_password")

PLANS = {
    "monthly": {"label": "Monthly", "amount": 39900, "duration": 30},
    "quarterly": {"label": "Quarterly", "amount": 109900, "duration": 90},
    "semi_annual": {"label": "6 Months", "amount": 205000, "duration": 180},
    "annual": {"label": "Annual", "amount": 419900, "duration": 365},
    "lifetime": {"label": "Lifetime", "amount": 3000000, "duration": 36500},
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password hash"""
    return hash_password(password) == hashed


def generate_token() -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(32)


def init_db() -> None:
    BACKEND_DIR.mkdir(parents=True, exist_ok=True)
    with db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS app_state (
              id TEXT PRIMARY KEY,
              state_json TEXT NOT NULL,
              company_books_json TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_log (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              action TEXT NOT NULL,
              detail TEXT NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS licenses (
              license_key TEXT PRIMARY KEY,
              plan TEXT NOT NULL,
              status TEXT NOT NULL,
              customer_name TEXT NOT NULL DEFAULT '',
              expires_at TEXT NOT NULL DEFAULT '',
              activated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              name TEXT NOT NULL,
              phone TEXT DEFAULT '',
              token TEXT UNIQUE,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              plan TEXT NOT NULL,
              status TEXT NOT NULL,
              amount REAL NOT NULL,
              payment_id TEXT,
              order_id TEXT,
              activated_at TEXT NOT NULL,
              expires_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS payments (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              amount REAL NOT NULL,
              currency TEXT DEFAULT 'INR',
              status TEXT NOT NULL,
              razorpay_order_id TEXT,
              razorpay_payment_id TEXT,
              razorpay_signature TEXT,
              description TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS backup_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              backup_name TEXT,
              file_size INTEGER,
              status TEXT,
              created_at TEXT NOT NULL,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS email_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              recipient TEXT NOT NULL,
              subject TEXT NOT NULL,
              status TEXT NOT NULL,
              error_message TEXT,
              created_at TEXT NOT NULL
            );
            """
        )
        try:
            connection.execute("ALTER TABLE licenses ADD COLUMN user_id TEXT NOT NULL DEFAULT ''")
        except sqlite3.OperationalError:
            pass


def generate_license_key(user_id: str, plan: str) -> str:
    return f"SA-{user_id[:6].upper()}-{plan.upper()}-{secrets.token_hex(4).upper()}"


def activate_user_license(user_id: str, plan: str, customer_name: str, expires_at: str) -> dict:
    license_key = generate_license_key(user_id, plan)
    now = now_iso()
    with db() as connection:
        connection.execute(
            "UPDATE licenses SET status = 'expired' WHERE user_id = ? AND status = 'active'",
            (user_id,),
        )
        connection.execute(
            """
            INSERT INTO licenses(license_key, plan, status, customer_name, expires_at, activated_at, user_id)
            VALUES (?, ?, 'active', ?, ?, ?, ?)
            """,
            (license_key, plan, customer_name, expires_at, now, user_id),
        )
    log_action("activate_license", {"userId": user_id, "plan": plan, "licenseKey": license_key})
    return {
        "licenseKey": license_key,
        "plan": plan,
        "planLabel": PLANS.get(plan, {}).get("label", plan),
        "status": "active",
        "expiresAt": expires_at,
        "customerName": customer_name,
    }


def log_action(action: str, detail: dict | str) -> None:
    text = detail if isinstance(detail, str) else json.dumps(detail, ensure_ascii=True)
    with db() as connection:
        connection.execute(
            "INSERT INTO audit_log(action, detail, created_at) VALUES (?, ?, ?)",
            (action, text, now_iso()),
        )


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email notification"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email
        
        msg.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        
        with db() as connection:
            connection.execute(
                "INSERT INTO email_logs(recipient, subject, status, created_at) VALUES (?, ?, 'sent', ?)",
                (to_email, subject, now_iso())
            )
        return True
    except Exception as e:
        with db() as connection:
            connection.execute(
                "INSERT INTO email_logs(recipient, subject, status, error_message, created_at) VALUES (?, ?, 'failed', ?, ?)",
                (to_email, subject, str(e), now_iso())
            )
        return False


def load_state() -> dict:
    with db() as connection:
        row = connection.execute(
            "SELECT state_json, company_books_json, updated_at FROM app_state WHERE id = ?",
            (STATE_ID,),
        ).fetchone()
    if not row:
        return {"state": None, "companyBooks": None, "updatedAt": ""}
    return {
        "state": json.loads(row["state_json"]),
        "companyBooks": json.loads(row["company_books_json"]),
        "updatedAt": row["updated_at"],
    }


def save_state(payload: dict) -> dict:
    state = payload.get("state")
    company_books = payload.get("companyBooks") or {"activeCompanyId": "", "books": []}
    if not isinstance(state, dict):
        raise ValueError("state object is required")
    if not isinstance(state.get("ledgers"), list) or not isinstance(state.get("transactions"), list):
        raise ValueError("state must include ledgers and transactions arrays")
    if not isinstance(company_books, dict):
        raise ValueError("companyBooks must be an object")

    updated_at = now_iso()
    with db() as connection:
        connection.execute(
            """
            INSERT INTO app_state(id, state_json, company_books_json, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              state_json = excluded.state_json,
              company_books_json = excluded.company_books_json,
              updated_at = excluded.updated_at
            """,
            (
                STATE_ID,
                json.dumps(state, ensure_ascii=False, separators=(",", ":")),
                json.dumps(company_books, ensure_ascii=False, separators=(",", ":")),
                updated_at,
            ),
        )
    log_action("save_state", {"company": (state.get("company") or {}).get("name", ""), "updatedAt": updated_at})
    return {"ok": True, "updatedAt": updated_at}


def company_list() -> list[dict]:
    data = load_state()
    books = ((data.get("companyBooks") or {}).get("books") or [])
    if books:
        return [
            {
                "id": str(book.get("id", "")),
                "name": str(book.get("name", "")),
                "gstin": str(book.get("gstin", "")),
                "state": str(book.get("state", "")),
                "phone": str(book.get("phone", "")),
                "updatedOn": str(book.get("updatedOn", "")),
            }
            for book in books
        ]
    state = data.get("state") or {}
    company = state.get("company") or {}
    if not company:
        return []
    return [
        {
            "id": str(company.get("id", "default")),
            "name": str(company.get("name", "")),
            "gstin": str(company.get("gstin", "")),
            "state": str(company.get("state", "")),
            "phone": str(company.get("phone", "")),
            "updatedOn": data.get("updatedAt", ""),
        }
    ]


def license_status() -> dict:
    with db() as connection:
        row = connection.execute(
            "SELECT license_key, plan, status, customer_name, expires_at, activated_at FROM licenses ORDER BY activated_at DESC LIMIT 1"
        ).fetchone()
    if not row:
        return {"status": "trial", "plan": "local", "message": "Local backend active. License module ready for future paid plans."}
    return dict(row)


def activate_license(payload: dict) -> dict:
    key = str(payload.get("licenseKey") or "").strip()
    plan = str(payload.get("plan") or "lifetime").strip()
    customer = str(payload.get("customerName") or "").strip()
    if not key:
        raise ValueError("licenseKey is required")
    with db() as connection:
        connection.execute(
            """
            INSERT INTO licenses(license_key, plan, status, customer_name, expires_at, activated_at)
            VALUES (?, ?, 'active', ?, '', ?)
            ON CONFLICT(license_key) DO UPDATE SET
              plan = excluded.plan,
              status = 'active',
              customer_name = excluded.customer_name
            """,
            (key, plan, customer, now_iso()),
        )
    log_action("activate_license", {"licenseKey": key, "plan": plan, "customerName": customer})
    return license_status()


# ===== USER AUTHENTICATION =====

def register_user(payload: dict) -> dict:
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", "")).strip()
    name = str(payload.get("name", "")).strip()
    phone = str(payload.get("phone", "")).strip()
    
    if not email or not password or not name:
        raise ValueError("email, password, and name are required")
    
    user_id = secrets.token_hex(8)
    token = generate_token()
    password_hash = hash_password(password)
    now = now_iso()
    
    try:
        with db() as connection:
            connection.execute(
                """
                INSERT INTO users(id, email, password_hash, name, phone, token, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, email, password_hash, name, phone, token, now, now)
            )
    except sqlite3.IntegrityError:
        raise ValueError("Email already registered")
    
    log_action("register_user", {"email": email, "name": name})
    
    # Send welcome email
    send_email(email, "Welcome to Speed Accounting! 🎉",
        f"<h2>Welcome {name}!</h2><p>Your account has been created successfully.</p>")
    
    return {
        "ok": True,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "phone": phone,
            "token": token
        }
    }


def login_user(payload: dict) -> dict:
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", "")).strip()
    
    if not email or not password:
        raise ValueError("email and password are required")
    
    with db() as connection:
        user = connection.execute(
            "SELECT id, name, phone, password_hash FROM users WHERE email = ?",
            (email,)
        ).fetchone()
    
    if not user or not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")
    
    # Generate new token
    new_token = generate_token()
    with db() as connection:
        connection.execute(
            "UPDATE users SET token = ?, updated_at = ? WHERE id = ?",
            (new_token, now_iso(), user["id"])
        )
    
    log_action("login_user", {"email": email})
    
    return {
        "ok": True,
        "user": {
            "id": user["id"],
            "email": email,
            "name": user["name"],
            "phone": user["phone"],
            "token": new_token
        }
    }


def verify_token(token: str) -> dict | None:
    if not token:
        return None
    with db() as connection:
        user = connection.execute(
            "SELECT id, email, name, phone FROM users WHERE token = ?",
            (token,)
        ).fetchone()
    return dict(user) if user else None


# ===== RAZORPAY PAYMENT =====

def user_by_id(user_id: str) -> dict | None:
    with db() as connection:
        user = connection.execute(
            "SELECT id, email, name, phone FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
    return dict(user) if user else None


def require_razorpay_config() -> None:
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise ValueError("Razorpay keys missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.")


def razorpay_request(path: str, payload: dict) -> dict:
    require_razorpay_config()
    body = json.dumps(payload).encode("utf-8")
    auth = base64.b64encode(f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}".encode("utf-8")).decode("ascii")
    req = urlrequest.Request(
        "https://api.razorpay.com/v1" + path,
        data=body,
        headers={
            "Authorization": "Basic " + auth,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except urlerror.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(detail)
            message = ((parsed.get("error") or {}).get("description") or detail)
        except Exception:
            message = detail or str(exc)
        raise ValueError("Razorpay error: " + message)
    except urlerror.URLError as exc:
        raise ValueError("Razorpay connection failed: " + str(exc.reason))


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def create_payment_order(payload: dict) -> dict:
    user_id = payload.get("user_id", "")
    plan = str(payload.get("plan", "monthly")).strip()
    if plan not in PLANS:
        raise ValueError("Invalid plan")

    plan_info = PLANS[plan]
    local_payment_id = f"local_pay_{secrets.token_hex(8)}"
    receipt = f"sa_{local_payment_id[-16:]}"
    order = razorpay_request("/orders", {
        "amount": int(plan_info["amount"]),
        "currency": "INR",
        "receipt": receipt,
        "notes": {
            "app": "Speed Accounting",
            "user_id": user_id,
            "plan": plan,
        },
    })
    order_id = str(order.get("id") or "")
    if not order_id:
        raise ValueError("Razorpay did not return an order id")

    with db() as connection:
        connection.execute(
            """
            INSERT INTO payments(id, user_id, amount, status, razorpay_order_id, razorpay_payment_id,
                                description, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', ?, '', ?, ?, ?)
            """,
            (local_payment_id, user_id, plan_info["amount"], order_id,
             f"Speed Accounting - {plan} subscription", now_iso(), now_iso())
        )

    log_action("create_payment_order", {"plan": plan, "amount": plan_info["amount"]})
    return {
        "ok": True,
        "orderId": order_id,
        "amount": plan_info["amount"],
        "currency": "INR",
        "keyId": RAZORPAY_KEY_ID,
        "plan": plan,
        "planLabel": plan_info["label"],
        "name": "Speed Accounting",
        "description": f"{plan_info['label']} rental plan",
    }


def verify_payment(payload: dict) -> dict:
    user_id = payload.get("user_id", "")
    order_id = str(payload.get("razorpayOrderId", "")).strip()
    payment_id = str(payload.get("razorpayPaymentId", "")).strip()
    signature = str(payload.get("razorpaySignature", "")).strip()
    plan = str(payload.get("plan", "monthly")).strip()

    if plan not in PLANS:
        raise ValueError("Invalid plan")
    if not payment_id or not order_id or not signature:
        raise ValueError("Invalid payment details")
    require_razorpay_config()
    if not verify_razorpay_signature(order_id, payment_id, signature):
        raise ValueError("Payment signature verification failed")

    plan_info = PLANS[plan]
    now = now_iso()
    expires_at = (datetime.now(timezone.utc) + timedelta(days=plan_info["duration"])).isoformat()

    with db() as connection:
        payment = connection.execute(
            """
            SELECT id, amount, status FROM payments
            WHERE user_id = ? AND razorpay_order_id = ?
            """,
            (user_id, order_id)
        ).fetchone()
        if not payment:
            raise ValueError("Payment order not found")
        if int(payment["amount"]) != int(plan_info["amount"]):
            raise ValueError("Payment amount mismatch")
        if payment["status"] == "completed":
            existing = connection.execute(
                """
                SELECT id, plan, status, expires_at FROM subscriptions
                WHERE user_id = ? AND order_id = ? AND status = 'active'
                ORDER BY activated_at DESC LIMIT 1
                """,
                (user_id, order_id)
            ).fetchone()
            license_row = connection.execute(
                """
                SELECT license_key, plan, status, expires_at, customer_name
                FROM licenses
                WHERE user_id = ? AND status = 'active'
                ORDER BY activated_at DESC LIMIT 1
                """,
                (user_id,),
            ).fetchone()
            if existing and license_row:
                return {
                    "ok": True,
                    "subscription": {
                        "id": existing["id"],
                        "plan": existing["plan"],
                        "planLabel": plan_info["label"],
                        "status": "active",
                        "expiresAt": existing["expires_at"],
                    },
                    "license": dict(license_row),
                }

        subscription_id = f"sub_{secrets.token_hex(8)}"
        connection.execute(
            """
            UPDATE payments
            SET status = 'completed', razorpay_payment_id = ?, razorpay_signature = ?, updated_at = ?
            WHERE id = ?
            """,
            (payment_id, signature, now, payment["id"])
        )
        connection.execute(
            "UPDATE subscriptions SET status = 'expired', updated_at = ? WHERE user_id = ? AND status = 'active'",
            (now, user_id)
        )
        connection.execute(
            """
            INSERT INTO subscriptions(id, user_id, plan, status, amount, payment_id, order_id,
                                     activated_at, expires_at, created_at, updated_at)
            VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?)
            """,
            (subscription_id, user_id, plan, plan_info["amount"], payment_id, order_id, now, expires_at, now, now)
        )

    user = user_by_id(user_id) or {}
    customer_name = str(user.get("name") or user.get("email") or "")
    license_info = activate_user_license(user_id, plan, customer_name, expires_at)

    log_action("verify_payment", {"plan": plan, "paymentId": payment_id, "orderId": order_id, "licenseKey": license_info["licenseKey"]})
    if user.get("email"):
        send_email(
            user["email"],
            "License Activated - Speed Accounting",
            (
                f"<h2>Payment successful. License activated.</h2>"
                f"<p>Plan: {plan_info['label']}<br>"
                f"Amount: Rs. {plan_info['amount']/100:.2f}<br>"
                f"License Key: <strong>{license_info['licenseKey']}</strong><br>"
                f"Valid till: {format_license_date(expires_at)}</p>"
            ),
        )

    return {
        "ok": True,
        "subscription": {
            "id": subscription_id,
            "plan": plan,
            "planLabel": plan_info["label"],
            "status": "active",
            "expiresAt": expires_at,
        },
        "license": license_info,
    }


def format_license_date(value: str) -> str:
    if not value:
        return ""
    try:
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).strftime("%d %b %Y")
    except ValueError:
        return value


def get_subscription_status(user_id: str) -> dict:
    with db() as connection:
        sub = connection.execute(
            """
            SELECT id, plan, status, expires_at
            FROM subscriptions
            WHERE user_id = ?
            ORDER BY activated_at DESC LIMIT 1
            """,
            (user_id,),
        ).fetchone()
        license_row = connection.execute(
            """
            SELECT license_key, plan, status, expires_at, customer_name
            FROM licenses
            WHERE user_id = ?
            ORDER BY activated_at DESC LIMIT 1
            """,
            (user_id,),
        ).fetchone()

    if not sub:
        return {"status": "none", "plan": "trial", "license": None}

    expires_at = datetime.fromisoformat(sub["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    is_expired = expires_at < datetime.now(timezone.utc)
    status = "expired" if is_expired else sub["status"]
    plan = sub["plan"]
    license_data = dict(license_row) if license_row else None
    if license_data and is_expired:
        license_data["status"] = "expired"

    return {
        "status": status,
        "plan": plan,
        "planLabel": PLANS.get(plan, {}).get("label", plan),
        "expiresAt": sub["expires_at"],
        "licenseKey": (license_data or {}).get("license_key", ""),
        "license": license_data,
    }


# ===== CLOUD BACKUP =====

def create_backup(user_id: str) -> dict:
    data = load_state()
    backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    backup_data = {
        "userId": user_id,
        "backupName": backup_name,
        "createdAt": now_iso(),
        **data
    }
    
    backup_json = json.dumps(backup_data, ensure_ascii=False, indent=2)
    file_size = len(backup_json.encode('utf-8'))
    
    with db() as connection:
        connection.execute(
            "INSERT INTO backup_logs(user_id, backup_name, file_size, status, created_at) VALUES (?, ?, ?, 'completed', ?)",
            (user_id, backup_name, file_size, now_iso())
        )
    
    log_action("create_backup", {"user_id": user_id, "backup_name": backup_name, "size": file_size})
    
    return {
        "ok": True,
        "backup": {
            "name": backup_name,
            "size": file_size,
            "createdAt": now_iso()
        },
        "data": backup_data
    }


def get_backup_history(user_id: str, limit: int = 10) -> dict:
    with db() as connection:
        backups = connection.execute(
            "SELECT backup_name, file_size, status, created_at FROM backup_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
    
    return {
        "ok": True,
        "backups": [dict(b) for b in backups]
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "SpeedAccountingBackend/2.0"

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw or "{}")

    def send_json(self, data: dict | list, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST) -> None:
        self.send_json({"ok": False, "error": message}, status)

    def get_auth_token(self) -> str | None:
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]
        return None

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path == "/api/health":
                self.send_json({"ok": True, "app": "Speed Accounting v2.0", "time": now_iso()})
                return
            if path == "/api/state":
                self.send_json({"ok": True, **load_state()})
                return
            if path == "/api/companies":
                self.send_json({"ok": True, "companies": company_list()})
                return
            if path == "/api/license/status":
                self.send_json({"ok": True, "license": license_status()})
                return
            if path == "/api/backup":
                token = self.get_auth_token()
                if not token:
                    self.send_error_json("Unauthorized", HTTPStatus.UNAUTHORIZED)
                    return
                user = verify_token(token)
                if not user:
                    self.send_error_json("Invalid token", HTTPStatus.UNAUTHORIZED)
                    return
                
                backup = create_backup(user["id"])
                body = json.dumps(backup["data"], ensure_ascii=False, indent=2).encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Disposition", f'attachment; filename="{backup["backup"]["name"]}"')
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            
            if path == "/api/backup/history":
                token = self.get_auth_token()
                if not token:
                    self.send_error_json("Unauthorized", HTTPStatus.UNAUTHORIZED)
                    return
                user = verify_token(token)
                if not user:
                    self.send_error_json("Invalid token", HTTPStatus.UNAUTHORIZED)
                    return
                self.send_json(get_backup_history(user["id"]))
                return
            
            self.serve_static(path)
        except Exception as exc:
            self.send_error_json(str(exc), HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_POST(self) -> None:
        self.handle_write()

    def do_PUT(self) -> None:
        self.handle_write()

    def handle_write(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            payload = self.read_json()
            
            if path == "/api/state":
                self.send_json(save_state(payload))
                return
            if path == "/api/license/activate":
                self.send_json({"ok": True, "license": activate_license(payload)})
                return
            
            # ===== AUTH ENDPOINTS =====
            if path == "/api/auth/register":
                result = register_user(payload)
                self.send_json(result, HTTPStatus.CREATED)
                return
            if path == "/api/auth/login":
                result = login_user(payload)
                self.send_json(result)
                return
            
            # ===== PAYMENT ENDPOINTS =====
            if path == "/api/payment/create-order":
                token = self.get_auth_token()
                if not token:
                    self.send_error_json("Unauthorized", HTTPStatus.UNAUTHORIZED)
                    return
                user = verify_token(token)
                if not user:
                    self.send_error_json("Invalid token", HTTPStatus.UNAUTHORIZED)
                    return
                payload["user_id"] = user["id"]
                result = create_payment_order(payload)
                self.send_json(result)
                return
            
            if path == "/api/payment/verify":
                token = self.get_auth_token()
                if not token:
                    self.send_error_json("Unauthorized", HTTPStatus.UNAUTHORIZED)
                    return
                user = verify_token(token)
                if not user:
                    self.send_error_json("Invalid token", HTTPStatus.UNAUTHORIZED)
                    return
                payload["user_id"] = user["id"]
                result = verify_payment(payload)
                self.send_json(result)
                return
            
            if path == "/api/subscription/status":
                token = self.get_auth_token()
                if not token:
                    self.send_error_json("Unauthorized", HTTPStatus.UNAUTHORIZED)
                    return
                user = verify_token(token)
                if not user:
                    self.send_error_json("Invalid token", HTTPStatus.UNAUTHORIZED)
                    return
                result = get_subscription_status(user["id"])
                self.send_json({"ok": True, **result})
                return
            
            self.send_error_json("Unknown API endpoint", HTTPStatus.NOT_FOUND)
        except json.JSONDecodeError:
            self.send_error_json("Invalid JSON")
        except ValueError as exc:
            self.send_error_json(str(exc))
        except Exception as exc:
            self.send_error_json(str(exc), HTTPStatus.INTERNAL_SERVER_ERROR)

    def serve_static(self, path: str) -> None:
        if path in ("", "/"):
            path = "/index.html"
        safe = unquote(path).lstrip("/\\")
        file_path = (ROOT_DIR / safe).resolve()
        if not str(file_path).startswith(str(ROOT_DIR)) or not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        body = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    init_db()
    host = os.environ.get("SPEED_ACCOUNTING_HOST", "127.0.0.1")
    if os.environ.get("PORT"):
        host = os.environ.get("SPEED_ACCOUNTING_HOST", "0.0.0.0")
    port = int(os.environ.get("PORT") or os.environ.get("SPEED_ACCOUNTING_PORT", "8765"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"\nSpeed Accounting Backend v2.0 running at http://{host}:{port}/")
    print(f"SQLite database: {DB_PATH}")
    print("\nFeatures:")
    print("   - User Authentication (Register/Login)")
    print("   - Razorpay Payment Integration")
    print("   - Subscription Management")
    print("   - Cloud Backup & Sync")
    print("   - Email Notifications")
    print("   - Audit Logging\n")
    server.serve_forever()


if __name__ == "__main__":
    main()
