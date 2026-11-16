import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from ..config import settings

logger = logging.getLogger("zyronbyte.youtube")

# In-memory store for PKCE verifiers keyed by OAuth state
_oauth_verifiers: Dict[str, str] = {}

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly"
]

class YouTubeUploader:
    """
    Manages official YouTube Data API v3 OAuth2 authorization
    and Shorts publishing for channel ZyronByteYT.
    """

    def get_auth_url(self, client_id: str, client_secret: str, redirect_uri: str) -> Dict[str, str]:
        """Generates standard Google OAuth2 Authorization URL with PKCE verifier."""
        client_id = client_id.strip()
        client_secret = client_secret.strip()
        redirect_uri = redirect_uri.strip()
        logger.info(f"Generating YouTube OAuth URL for client_id: {client_id}")

        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        }
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

        # Store PKCE code_verifier so it can be re-applied upon callback
        verifier = getattr(flow, 'code_verifier', None)
        if verifier:
            _oauth_verifiers[state] = verifier
            logger.info(f"Saved PKCE code_verifier for state: {state[:8]}...")

        return {"auth_url": auth_url, "state": state, "code_verifier": verifier or ""}

    def exchange_code_for_tokens(
        self,
        code: str,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        state: Optional[str] = None,
        code_verifier: Optional[str] = None
    ) -> Dict[str, Any]:
        """Exchanges auth code for user credentials and fetches channel info using PKCE verifier."""
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        }
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )

        # Resolve verifier from explicit argument, in-memory store, or state
        resolved_verifier = code_verifier or (state and _oauth_verifiers.pop(state, None))
        if resolved_verifier:
            flow.code_verifier = resolved_verifier
            logger.info("Applied PKCE code_verifier to OAuth flow before token fetch.")
        else:
            logger.warning("No PKCE code_verifier available for token exchange.")

        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Fetch channel profile
        youtube = build("youtube", "v3", credentials=credentials)
        channel_response = youtube.channels().list(mine=True, part="snippet").execute()
        channel_title = "ZyronByteYT"
        channel_id = ""
        if channel_response.get("items"):
            item = channel_response["items"][0]
            channel_title = item.get("snippet", {}).get("title", channel_title)
            channel_id = item.get("id", "")

        credentials_dict = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes
        }

        return {
            "credentials_json": json.dumps(credentials_dict),
            "channel_title": channel_title,
            "channel_id": channel_id
        }

    def upload_short(
        self,
        credentials_json: str,
        file_path: str,
        title: str,
        description: str,
        tags: Optional[list] = None,
        privacy_status: str = "public",
        publish_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uploads a video to YouTube Shorts using official resumable upload.
        If publish_at is provided, video privacy is set to 'private' with scheduled publish time.
        """
        creds_data = json.loads(credentials_json)
        credentials = Credentials(
            token=creds_data.get("token"),
            refresh_token=creds_data.get("refresh_token"),
            token_uri=creds_data.get("token_uri", "https://oauth2.googleapis.com/token"),
            client_id=creds_data.get("client_id"),
            client_secret=creds_data.get("client_secret"),
            scopes=creds_data.get("scopes", SCOPES)
        )

        youtube = build("youtube", "v3", credentials=credentials)

        # Ensure #Shorts is present in title or description so YouTube tags it as a Short
        if "#Shorts" not in title and "#shorts" not in title:
            title = f"{title} #Shorts"[:100]

        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags or ["Shorts", "Gaming", "ZyronByteYT"],
                "categoryId": "20"  # 20 = Gaming category in YouTube Data API
            },
            "status": {
                "privacyStatus": "private" if publish_at else privacy_status,
                "selfDeclaredMadeForKids": False
            }
        }

        if publish_at:
            body["status"]["publishAt"] = publish_at

        media = MediaFileUpload(
            file_path,
            mimetype="video/mp4",
            resumable=True,
            chunksize=1024 * 1024 * 4  # 4MB chunks
        )

        logger.info(f"Uploading Short to YouTube: '{title}'...")
        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info(f"YouTube upload progress: {int(status.progress() * 100)}%")

        video_id = response.get("id")
        video_url = f"https://youtube.com/shorts/{video_id}"
        logger.info(f"YouTube Short successfully uploaded: {video_url}")

        return {
            "success": True,
            "video_id": video_id,
            "url": video_url,
            "response": response
        }

youtube_uploader = YouTubeUploader()
