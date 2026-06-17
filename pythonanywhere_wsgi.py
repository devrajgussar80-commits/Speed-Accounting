from __future__ import annotations

import json
import mimetypes
import os
import sys
from http import HTTPStatus
from pathlib import Path
from urllib.parse import unquote


PROJECT_DIR = Path(__file__).resolve().parent
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

os.environ.setdefault("DATABASE_PATH", str(PROJECT_DIR / "backend" / "speed_accounting.db"))

from backend.server import (  # noqa: E402
    ROOT_DIR,
    activate_license,
    company_list,
    create_backup,
    create_payment_order,
    get_backup_history,
    get_subscription_status,
    init_db,
    license_status,
    load_state,
    login_user,
    now_iso,
    register_user,
    save_state,
    verify_payment,
    verify_token,
)


init_db()


def _headers(content_type: str = "application/json; charset=utf-8", extra: list[tuple[str, str]] | None = None):
    values = [
        ("Content-Type", content_type),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type, Authorization"),
    ]
    if extra:
        values.extend(extra)
    return values


def _json_response(start_response, data: dict | list, status: HTTPStatus = HTTPStatus.OK):
    body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    start_response(f"{status.value} {status.phrase}", _headers(extra=[("Content-Length", str(len(body)))]))
    return [body]


def _error(start_response, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST):
    return _json_response(start_response, {"ok": False, "error": message}, status)


def _read_json(environ: dict) -> dict:
    length = int(environ.get("CONTENT_LENGTH") or 0)
    raw = environ["wsgi.input"].read(length).decode("utf-8") if length else "{}"
    return json.loads(raw or "{}")


def _auth_user(environ: dict):
    auth_header = environ.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return None, "Unauthorized"
    user = verify_token(auth_header[7:])
    if not user:
        return None, "Invalid token"
    return user, ""


def _static_response(start_response, path: str):
    if path in ("", "/"):
        path = "/index.html"
    safe = unquote(path).lstrip("/\\")
    file_path = (ROOT_DIR / safe).resolve()
    if not str(file_path).startswith(str(ROOT_DIR)) or not file_path.is_file():
        start_response("404 Not Found", _headers("text/plain; charset=utf-8"))
        return [b"Not Found"]
    content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    body = file_path.read_bytes()
    start_response("200 OK", _headers(content_type, [("Content-Length", str(len(body)))]))
    return [body]


def application(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET").upper()
    path = environ.get("PATH_INFO", "/")

    if method == "OPTIONS":
        start_response("204 No Content", _headers("text/plain; charset=utf-8"))
        return [b""]

    try:
        if method == "GET":
            if path == "/api/health":
                return _json_response(start_response, {"ok": True, "app": "Speed Accounting v2.0", "time": now_iso()})
            if path == "/api/state":
                return _json_response(start_response, {"ok": True, **load_state()})
            if path == "/api/companies":
                return _json_response(start_response, {"ok": True, "companies": company_list()})
            if path == "/api/license/status":
                return _json_response(start_response, {"ok": True, "license": license_status()})
            if path == "/api/backup":
                user, auth_error = _auth_user(environ)
                if auth_error:
                    return _error(start_response, auth_error, HTTPStatus.UNAUTHORIZED)
                backup = create_backup(user["id"])
                body = json.dumps(backup["data"], ensure_ascii=False, indent=2).encode("utf-8")
                start_response(
                    "200 OK",
                    _headers(
                        "application/json; charset=utf-8",
                        [
                            ("Content-Disposition", f'attachment; filename="{backup["backup"]["name"]}"'),
                            ("Content-Length", str(len(body))),
                        ],
                    ),
                )
                return [body]
            if path == "/api/backup/history":
                user, auth_error = _auth_user(environ)
                if auth_error:
                    return _error(start_response, auth_error, HTTPStatus.UNAUTHORIZED)
                return _json_response(start_response, get_backup_history(user["id"]))
            return _static_response(start_response, path)

        if method in ("POST", "PUT"):
            payload = _read_json(environ)
            if path == "/api/state":
                return _json_response(start_response, save_state(payload))
            if path == "/api/license/activate":
                return _json_response(start_response, {"ok": True, "license": activate_license(payload)})
            if path == "/api/auth/register":
                return _json_response(start_response, register_user(payload), HTTPStatus.CREATED)
            if path == "/api/auth/login":
                return _json_response(start_response, login_user(payload))
            if path == "/api/payment/create-order":
                user, auth_error = _auth_user(environ)
                if auth_error:
                    return _error(start_response, auth_error, HTTPStatus.UNAUTHORIZED)
                payload["user_id"] = user["id"]
                return _json_response(start_response, create_payment_order(payload))
            if path == "/api/payment/verify":
                user, auth_error = _auth_user(environ)
                if auth_error:
                    return _error(start_response, auth_error, HTTPStatus.UNAUTHORIZED)
                payload["user_id"] = user["id"]
                return _json_response(start_response, verify_payment(payload))
            if path == "/api/subscription/status":
                user, auth_error = _auth_user(environ)
                if auth_error:
                    return _error(start_response, auth_error, HTTPStatus.UNAUTHORIZED)
                return _json_response(start_response, {"ok": True, **get_subscription_status(user["id"])})
            return _error(start_response, "Unknown API endpoint", HTTPStatus.NOT_FOUND)

        return _error(start_response, "Method not allowed", HTTPStatus.METHOD_NOT_ALLOWED)
    except json.JSONDecodeError:
        return _error(start_response, "Invalid JSON")
    except ValueError as exc:
        return _error(start_response, str(exc))
    except Exception as exc:
        return _error(start_response, str(exc), HTTPStatus.INTERNAL_SERVER_ERROR)
