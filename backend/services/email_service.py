import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.example.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', 'noreply@example.com')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('SMTP_FROM_EMAIL', self.smtp_user)
        self.enabled = all([self.smtp_server, self.smtp_user, self.smtp_password])

    def send_notification_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an HTML email notification"""
        if not self.enabled:
            print("Email service is not configured. Set SMTP_* environment variables.")
            return False

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Create the HTML part
            html = f"""
            <!DOCTYPE html>
            <html>
                <body>
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                            {html_content}
                        </div>
                        <div style="margin-top: 20px; font-size: 12px; color: #6c757d;">
                            This is an automated message, please do not reply.
                        </div>
                    </div>
                </body>
            </html>
            """

            # Attach HTML content
            msg.attach(MIMEText(html, 'html'))

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
