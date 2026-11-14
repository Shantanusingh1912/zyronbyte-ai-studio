import time
import json
import logging
import requests
from typing import Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("zyronbyte.instagram")

class InstagramUploader:
    """
    Publishes gaming Reels to Instagram via the official Instagram Graph API.
    Flow:
      1. Create Media Container (POST /{ig_user_id}/media)
      2. Poll Container Status until 'FINISHED'
      3. Publish Container (POST /{ig_user_id}/media_publish)
    """

    GRAPH_URL = "https://graph.facebook.com/v19.0"

    def verify_account(self, access_token: str, instagram_account_id: str) -> Dict[str, Any]:
        """Validates connection to the Instagram Professional account."""
        url = f"{self.GRAPH_URL}/{instagram_account_id}"
        params = {
            "fields": "id,username,name,profile_picture_url",
            "access_token": access_token
        }
        res = requests.get(url, params=params)
        if res.status_code != 200:
            raise RuntimeError(f"Instagram API Error: {res.text}")
        return res.json()

    def upload_reel(
        self,
        access_token: str,
        instagram_account_id: str,
        video_url: str,
        caption: str,
        share_to_feed: bool = True
    ) -> Dict[str, Any]:
        """
        Publishes a video to Instagram Reels.
        Note: The video must be hosted at a publicly accessible URL or staged URL.
        """
        # Step 1: Create Reel Container
        create_url = f"{self.GRAPH_URL}/{instagram_account_id}/media"
        payload = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": share_to_feed,
            "access_token": access_token
        }

        logger.info(f"Creating Instagram Reel container for account {instagram_account_id}...")
        resp = requests.post(create_url, data=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Failed to create Instagram Reel container: {resp.text}")

        container_id = resp.json().get("id")
        if not container_id:
            raise RuntimeError("No container ID returned from Instagram.")

        # Step 2: Poll Container Status until ready
        status_url = f"{self.GRAPH_URL}/{container_id}"
        status_params = {
            "fields": "status_code",
            "access_token": access_token
        }

        max_polls = 30
        poll_interval = 5
        ready = False

        for _ in range(max_polls):
            time.sleep(poll_interval)
            status_res = requests.get(status_url, params=status_params)
            if status_res.status_code == 200:
                status_code = status_res.json().get("status_code")
                logger.info(f"Instagram container {container_id} status: {status_code}")
                if status_code == "FINISHED":
                    ready = True
                    break
                elif status_code == "ERROR":
                    raise RuntimeError(f"Instagram video encoding error: {status_res.text}")
            else:
                logger.warning(f"Failed to poll container: {status_res.text}")

        if not ready:
            raise TimeoutError("Timed out waiting for Instagram to process video container.")

        # Step 3: Publish Container
        publish_url = f"{self.GRAPH_URL}/{instagram_account_id}/media_publish"
        publish_payload = {
            "creation_id": container_id,
            "access_token": access_token
        }
        pub_res = requests.post(publish_url, data=publish_payload)
        if pub_res.status_code != 200:
            raise RuntimeError(f"Failed to publish Instagram container: {pub_res.text}")

        media_id = pub_res.json().get("id")
        logger.info(f"Successfully published Reel to Instagram! Media ID: {media_id}")

        return {
            "success": True,
            "media_id": media_id,
            "container_id": container_id
        }

instagram_uploader = InstagramUploader()
