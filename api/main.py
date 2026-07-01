from __future__ import annotations

import os
from copy import deepcopy
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import JSON, DateTime, Integer, String, URL, func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy import create_engine


def load_local_env() -> None:
    env_file = Path(__file__).resolve().parent.parent / ".env.local"
    if not env_file.exists():
        return

    for line in env_file.read_text(encoding="utf-8").splitlines():
        cleaned = line.strip()
        if not cleaned or cleaned.startswith("#") or "=" not in cleaned:
            continue

        key, value = cleaned.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_local_env()


DEFAULT_STATE: dict[str, Any] = {
    "tasks": [],
    "studySessions": [],
    "projects": [],
    "milestones": [],
    "habits": [],
    "habitLogs": [],
    "journalEntries": [],
    "settings": {
        "userName": "Leo",
        "themeColor": "blue",
        "soundEnabled": True,
        "autoSaveCloud": True,
        "quickNote": "",
    },
}

ALLOWED_USERS = {
    "leo": {"display_name": "Leo", "password": "0126"},
    "preksha": {"display_name": "Preksha", "password": "0126"},
}


def get_mysql_settings() -> dict[str, Any]:
    host = os.getenv("MYSQL_HOST", "127.0.0.1")
    port = int(os.getenv("MYSQL_PORT", "3306"))
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "tracker")
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": database,
    }


def build_database_url() -> URL | str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    settings = get_mysql_settings()
    return URL.create(
        drivername="mysql+pymysql",
        username=settings["user"],
        password=settings["password"],
        host=settings["host"],
        port=settings["port"],
        database=settings["database"],
    )


def build_mysql_server_url() -> URL:
    settings = get_mysql_settings()
    return URL.create(
        drivername="mysql+pymysql",
        username=settings["user"],
        password=settings["password"],
        host=settings["host"],
        port=settings["port"],
    )


def ensure_database_exists() -> None:
    if os.getenv("DATABASE_URL"):
        return

    settings = get_mysql_settings()
    database = settings["database"]
    escaped_database = database.replace("`", "``")
    server_engine = create_engine(build_mysql_server_url(), pool_pre_ping=True, isolation_level="AUTOCOMMIT")

    try:
        with server_engine.connect() as connection:
            connection.execute(text(f"CREATE DATABASE IF NOT EXISTS `{escaped_database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
    finally:
        server_engine.dispose()


class Base(DeclarativeBase):
    pass


class LeoOSStateRow(Base):
    __tablename__ = "leo_os_state"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    updated_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


engine = create_engine(
    build_database_url(),
    pool_pre_ping=True,
    pool_recycle=280,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

app = FastAPI(title="Leo OS API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "PUT", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class StatePayload(BaseModel):
    state: dict[str, Any] = Field(default_factory=dict)


def get_current_user(
    x_leo_user: str = Header(default=""),
    x_leo_password: str = Header(default=""),
) -> dict[str, str]:
    user_key = x_leo_user.strip().lower()
    user = ALLOWED_USERS.get(user_key)

    if not user or x_leo_password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid Leo OS user credentials.")

    return {"id": user_key, "display_name": user["display_name"]}


def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)


def normalize_state(state: dict[str, Any], user_name: str = "Leo") -> dict[str, Any]:
    merged = deepcopy(DEFAULT_STATE)
    merged.update(state or {})
    merged["settings"] = {
        **DEFAULT_STATE["settings"],
        **(state or {}).get("settings", {}),
        "userName": user_name,
    }
    return merged


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        db.execute(select(1))
    except SQLAlchemyError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return {"ok": True, "database": "connected"}


@app.get("/api/state")
def get_state(
    current_user: dict[str, str] = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = db.get(LeoOSStateRow, current_user["id"])
    if row is None:
        row = LeoOSStateRow(
            id=current_user["id"],
            payload=normalize_state({}, current_user["display_name"]),
            version=1,
        )
        db.add(row)
        db.flush()

    return {
        "state": normalize_state(row.payload, current_user["display_name"]),
        "version": row.version,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


@app.put("/api/state")
def put_state(
    payload: StatePayload,
    current_user: dict[str, str] = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = db.get(LeoOSStateRow, current_user["id"])
    next_state = normalize_state(payload.state, current_user["display_name"])

    if row is None:
        row = LeoOSStateRow(id=current_user["id"], payload=next_state, version=1)
        db.add(row)
    else:
        row.payload = next_state
        row.version += 1

    db.flush()
    db.refresh(row)

    return {
        "state": normalize_state(row.payload, current_user["display_name"]),
        "version": row.version,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }
