import httpx
import os
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Resend API using Replit Connectors."""
    
    async def _get_resend_credentials(self) -> dict | None:
        """Get Resend API key from Replit Connectors."""
        hostname = os.environ.get("REPLIT_CONNECTORS_HOSTNAME")
        
        repl_identity = os.environ.get("REPL_IDENTITY")
        web_repl_renewal = os.environ.get("WEB_REPL_RENEWAL")
        
        if repl_identity:
            x_replit_token = f"repl {repl_identity}"
        elif web_repl_renewal:
            x_replit_token = f"depl {web_repl_renewal}"
        else:
            logger.warning("No Replit token available for email service")
            return None
        
        if not hostname:
            logger.warning("REPLIT_CONNECTORS_HOSTNAME not set")
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://{hostname}/api/v2/connection",
                    params={"include_secrets": "true", "connector_names": "resend"},
                    headers={
                        "Accept": "application/json",
                        "X_REPLIT_TOKEN": x_replit_token
                    }
                )
                
                if response.status_code != 200:
                    logger.warning(f"Failed to get Resend credentials: {response.status_code}")
                    return None
                
                data = response.json()
                items = data.get("items", [])
                
                if not items:
                    logger.warning("No Resend connection found")
                    return None
                
                settings = items[0].get("settings", {})
                return {
                    "api_key": settings.get("api_key"),
                    "from_email": settings.get("from_email", "noreply@myceo.app")
                }
                
        except Exception as e:
            logger.error(f"Error getting Resend credentials: {e}")
            return None
    
    async def send_welcome_email(self, to_email: str, first_name: str | None = None) -> bool:
        """Send a welcome email to a new user."""
        credentials = await self._get_resend_credentials()
        
        if not credentials or not credentials.get("api_key"):
            logger.warning("Resend not configured, skipping welcome email")
            return False
        
        name = first_name or "there"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h1 style="font-size: 28px; font-weight: 600; color: #1d1d1f; margin: 0 0 20px 0;">
                        Welcome to myCEO, {name}!
                    </h1>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #424245; margin: 0 0 20px 0;">
                        Thank you for joining myCEO - the AI-powered business planning platform that turns your ideas into actionable business plans.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #424245; margin: 0 0 20px 0;">
                        With myCEO, you can:
                    </p>
                    
                    <ul style="font-size: 16px; line-height: 1.8; color: #424245; padding-left: 20px; margin: 0 0 30px 0;">
                        <li>Generate comprehensive business plans in minutes</li>
                        <li>Get detailed market research and competitor analysis</li>
                        <li>Create financial projections and pitch decks</li>
                        <li>Receive a 90-day action plan to launch your business</li>
                    </ul>
                    
                    <a href="https://myceo.app" style="display: inline-block; background: #1d1d1f; color: white; padding: 14px 28px; border-radius: 30px; text-decoration: none; font-weight: 500; font-size: 16px;">
                        Start Building Your Business
                    </a>
                    
                    <p style="font-size: 14px; color: #86868b; margin: 40px 0 0 0;">
                        Questions? Reply to this email - we're here to help!
                    </p>
                </div>
                
                <p style="font-size: 12px; color: #86868b; text-align: center; margin: 20px 0 0 0;">
                    myCEO - Turn your idea into a business. Instantly.
                </p>
            </div>
        </body>
        </html>
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {credentials['api_key']}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": credentials.get("from_email", "myCEO <noreply@myceo.app>"),
                        "to": [to_email],
                        "subject": f"Welcome to myCEO, {name}!",
                        "html": html_content
                    }
                )
                
                if response.status_code in (200, 201):
                    logger.info(f"Welcome email sent to {to_email}")
                    return True
                else:
                    logger.error(f"Failed to send welcome email: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")
            return False


email_service = EmailService()
