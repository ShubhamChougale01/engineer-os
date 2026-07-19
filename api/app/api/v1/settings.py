"""Platform feature flags: public read, admin-only write.

GET  /settings        → anyone (the frontend needs the flags before sign-in
                        to know whether to show the sign-up option and which
                        skills are enabled)
PUT  /admin/settings  → admins only; partial update of any flag
"""

import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_admin
from app.models.app_setting import AppSetting

router = APIRouter(tags=["settings"])

DEFAULTS: dict = {
    "signup_enabled": True,
    "disabled_skills": [],
}


class SettingsOut(BaseModel):
    signup_enabled: bool
    disabled_skills: list[str]


class SettingsPatch(BaseModel):
    signup_enabled: bool | None = None
    disabled_skills: list[str] | None = None


def get_flags(db: Session) -> dict:
    """Current flags: stored values over defaults. Unknown keys are ignored."""
    flags = dict(DEFAULTS)
    for row in db.query(AppSetting).all():
        if row.key in flags:
            try:
                flags[row.key] = json.loads(row.value)
            except ValueError:
                pass  # corrupt row → keep the default
    return flags


def _set_flag(db: Session, key: str, value) -> None:
    row = db.get(AppSetting, key)
    if row is None:
        db.add(AppSetting(key=key, value=json.dumps(value)))
    else:
        row.value = json.dumps(value)


@router.get("/settings", response_model=SettingsOut)
def read_settings(db: Session = Depends(get_db)) -> SettingsOut:
    return SettingsOut(**get_flags(db))


@router.put("/admin/settings", response_model=SettingsOut, dependencies=[Depends(require_admin)])
def update_settings(body: SettingsPatch, db: Session = Depends(get_db)) -> SettingsOut:
    if body.signup_enabled is not None:
        _set_flag(db, "signup_enabled", body.signup_enabled)
    if body.disabled_skills is not None:
        _set_flag(db, "disabled_skills", sorted(set(body.disabled_skills)))
    db.commit()
    return SettingsOut(**get_flags(db))
