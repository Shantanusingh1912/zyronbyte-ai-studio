import os
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SocialAccount, AppSetting, SystemLog
from ..schemas import SocialAccountResponse
from ..services.youtube_uploader import youtube_uploader
from ..services.instagram_uploader import instagram_uploader
from ..config import settings

router = APIRouter(prefix="/social", tags=["Social Media"])

class InstagramConnectRequest(BaseModel):
    access_token: str
    account_id: str

@router.get("/accounts", response_model=List[SocialAccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).all()
    # Ensure default entries exist
    known = {a.platform: a for a in accounts}
    results = []
    for platform, default_name in [("youtube", "ZyronByteYT (YouTube)"), ("instagram", "ZyronByteYT (Instagram)")]:
        if platform in known:
            acc = known[platform]
            results.append(SocialAccountResponse(
                platform=acc.platform,
                account_name=acc.account_name,
                channel_title=acc.channel_title,
                is_connected=acc.is_connected,
                updated_at=acc.updated_at
            ))
        else:
            results.append(SocialAccountResponse(
                platform=platform,
                account_name=default_name,
                channel_title=None,
                is_connected=False,
                updated_at=None
            ))
    return results

def _clean_credential(val: str | None) -> str:
    """Strips whitespace, quotes, and trailing periods from credentials."""
    if not val:
        return ""
    return val.strip().strip("\"'").rstrip(".")

@router.get("/youtube/auth-url")
def get_youtube_auth_url(db: Session = Depends(get_db)):
    """Generates Google OAuth URL for channel authentication."""
    # Read client credentials from DB settings or environment
    cid_setting = db.query(AppSetting).filter(AppSetting.key == "youtube_client_id").first()
    sec_setting = db.query(AppSetting).filter(AppSetting.key == "youtube_client_secret").first()

    db_cid = _clean_credential(cid_setting.value if cid_setting and cid_setting.value else "")
    db_sec = _clean_credential(sec_setting.value if sec_setting and sec_setting.value else "")

    env_cid = _clean_credential(settings.YOUTUBE_CLIENT_ID or os.getenv("YOUTUBE_CLIENT_ID", ""))
    env_sec = _clean_credential(settings.YOUTUBE_CLIENT_SECRET or os.getenv("YOUTUBE_CLIENT_SECRET", ""))

    client_id = db_cid or env_cid
    client_secret = db_sec or env_sec

    # Sync cleaned values back to DB if needed
    if client_id and (not db_cid or (cid_setting and cid_setting.value != client_id)):
        if not cid_setting:
            db.add(AppSetting(key="youtube_client_id", value=client_id))
        else:
            cid_setting.value = client_id
        db.commit()
    if client_secret and (not db_sec or (sec_setting and sec_setting.value != client_secret)):
        if not sec_setting:
            db.add(AppSetting(key="youtube_client_secret", value=client_secret))
        else:
            sec_setting.value = client_secret
        db.commit()

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=400,
            detail="YouTube Client ID and Client Secret must be configured in Settings first."
        )

    auth_info = youtube_uploader.get_auth_url(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=settings.YOUTUBE_REDIRECT_URI
    )
    return auth_info

@router.get("/youtube/callback")
def youtube_callback(code: str, db: Session = Depends(get_db)):
    """Handles OAuth redirect from Google."""
    cid_setting = db.query(AppSetting).filter(AppSetting.key == "youtube_client_id").first()
    sec_setting = db.query(AppSetting).filter(AppSetting.key == "youtube_client_secret").first()

    client_id = _clean_credential((cid_setting.value if cid_setting else "") or settings.YOUTUBE_CLIENT_ID)
    client_secret = _clean_credential((sec_setting.value if sec_setting else "") or settings.YOUTUBE_CLIENT_SECRET)

    try:
        token_info = youtube_uploader.exchange_code_for_tokens(
            code=code,
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=settings.YOUTUBE_REDIRECT_URI
        )

        acc = db.query(SocialAccount).filter(SocialAccount.platform == "youtube").first()
        if not acc:
            acc = SocialAccount(platform="youtube")
            db.add(acc)

        acc.account_name = token_info.get("channel_title", "ZyronByteYT")
        acc.channel_title = token_info.get("channel_title", "ZyronByteYT")
        acc.channel_id = token_info.get("channel_id")
        acc.credentials_json = token_info.get("credentials_json")
        acc.is_connected = True
        acc.updated_at = datetime.utcnow()

        db.commit()

        # Redirect user back to dashboard with success query param
        return RedirectResponse(url="/?youtube_connected=true")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth exchange failed: {e}")

@router.post("/instagram/connect")
def connect_instagram(req: InstagramConnectRequest, db: Session = Depends(get_db)):
    """Connects Instagram account using Graph API token."""
    try:
        acc_info = instagram_uploader.verify_account(req.access_token, req.account_id)
        
        acc = db.query(SocialAccount).filter(SocialAccount.platform == "instagram").first()
        if not acc:
            acc = SocialAccount(platform="instagram")
            db.add(acc)

        acc.account_name = acc_info.get("username", "ZyronByteYT")
        acc.channel_title = acc_info.get("name", "ZyronByteYT")
        acc.channel_id = req.account_id
        acc.credentials_json = json.dumps({"access_token": req.access_token, "account_id": req.account_id})
        acc.is_connected = True
        acc.updated_at = datetime.utcnow()

        db.commit()
        return {"message": "Instagram connected successfully", "account": acc_info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Instagram connection failed: {e}")

@router.post("/disconnect/{platform}")
def disconnect_platform(platform: str, db: Session = Depends(get_db)):
    acc = db.query(SocialAccount).filter(SocialAccount.platform == platform).first()
    if acc:
        acc.is_connected = False
        acc.credentials_json = None
        db.commit()
    return {"message": f"{platform.capitalize()} disconnected successfully"}
