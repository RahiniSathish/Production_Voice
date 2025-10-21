"""
Utility Functions for AI Travel Agent
"""

import hashlib
import secrets
import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SERVICE_PRICES, USD_TO_INR_RATE

logger = logging.getLogger(__name__)

# Password hashing functions
def hash_password(password: str) -> tuple:
    """Hash a password with a random salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt, password_hash.hex()

def verify_password(password: str, salt: str, stored_hash: str) -> bool:
    """Verify a password against its stored hash"""
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return password_hash.hex() == stored_hash

# Flight class options
def get_flight_class_options():
    """Get flight class options with pricing in both USD and INR"""
    flight_classes = SERVICE_PRICES['Flight']
    options = []
    
    for class_name, usd_price in flight_classes.items():
        inr_price = usd_price * USD_TO_INR_RATE
        options.append({
            'class': class_name,
            'usd_price': usd_price,
            'inr_price': round(inr_price, 2),
            'description': get_class_description(class_name)
        })
    
    return options

def get_class_description(class_name):
    """Get description for each flight class"""
    descriptions = {
        'Economy': 'Standard seating with meals and entertainment',
        'Business': 'Premium seating with extra legroom, priority boarding, and enhanced meals',
        'First': 'Luxury seating with full flat beds, premium dining, and exclusive lounge access'
    }
    return descriptions.get(class_name, 'Standard service')

# Email notification
def send_booking_confirmation_email(customer_email, booking_data):
    """Send booking confirmation email to customer"""
    try:
        # Get SMTP settings from environment
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = os.getenv("SMTP_PORT", "587")
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)
        
        subject = "✈️ Travel Booking Confirmation - Attar Travel"
        
        # HTML Email body with Attar Travel branding
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: bold;">✈️ ATTAR TRAVEL</h1>
                <p style="color: white; margin: 10px 0; font-size: 1.1rem;">عطار للسياحة</p>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0; font-size: 1rem;">Travel Booking Confirmation</p>
            </div>
            
            <div style="padding: 30px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af; margin-top: 0;">Dear Valued Customer,</h2>
                <p style="font-size: 1.1rem;">Your travel booking with <strong>Attar Travel</strong> has been <strong style="color: #059669;">CONFIRMED</strong>!</p>
                
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #1e40af;">
                    <h3 style="color: #1e40af; margin-top: 0; font-size: 1.3rem;">📋 Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Booking ID:</td>
                            <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">#{booking_data['booking_id']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Service Type:</td>
                            <td style="padding: 8px 0;">{booking_data.get('service_type', 'Travel Service')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Destination:</td>
                            <td style="padding: 8px 0;">{booking_data.get('destination', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Departure Date:</td>
                            <td style="padding: 8px 0;">{booking_data.get('departure_date', booking_data.get('check_in', 'N/A'))}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Return Date:</td>
                            <td style="padding: 8px 0;">{booking_data.get('return_date', booking_data.get('check_out', 'N/A'))}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Number of Travelers:</td>
                            <td style="padding: 8px 0;">{booking_data.get('num_travelers', booking_data.get('num_guests', 'N/A'))}</td>
                        </tr>
                        <tr style="border-top: 2px solid #e2e8f0;">
                            <td style="padding: 12px 0; font-weight: bold; color: #374151; font-size: 1.1rem;">Total Amount:</td>
                            <td style="padding: 12px 0; color: #1e40af; font-size: 1.3rem; font-weight: bold;">₹{booking_data['total_amount']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Status:</td>
                            <td style="padding: 8px 0;"><span style="color: #059669; font-weight: bold; text-transform: uppercase;">{booking_data['status'].upper()}</span></td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #0ea5e9;">
                    <h4 style="color: #0c4a6e; margin-top: 0;">📞 Next Steps:</h4>
                    <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                        <li>Payment details will be sent separately</li>
                        <li>Travel documents will be provided 24-48 hours before departure</li>
                        <li>Contact us for any special requests or modifications</li>
                    </ul>
                </div>
                
                <p style="font-size: 1.1rem; color: #374151;">We look forward to making your travel dreams come true with <strong>Attar Travel</strong>!</p>
                <p style="color: #6b7280;">If you have any questions, please don't hesitate to contact our customer support team.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; color: #1e40af; font-weight: bold;">Happy Travels! ✈️</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">Alex & Attar Travel Team</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #9ca3af;">Saudi Arabia Airlines & Travel Specialist</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # If SMTP is configured, send email
        if smtp_server and smtp_username and smtp_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = customer_email
                
                msg.attach(MIMEText(html_body, 'html'))
                
                with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
                    server.starttls()
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
                
                logger.info(f"📧 Travel booking confirmation email SENT to {customer_email}")
                return True
                
            except Exception as email_err:
                logger.warning(f"⚠️ Email sending failed: {email_err}")
                logger.info(f"📧 Booking confirmation prepared (email not sent)")
                return False
        else:
            logger.info(f"📧 Travel booking confirmation prepared for {customer_email}")
            logger.info(f"   Booking ID: #{booking_data['booking_id']}")
            logger.info(f"   Service: {booking_data.get('service_type', 'Travel Service')}")
            logger.info(f"   Total: ₹{booking_data['total_amount']}")
            logger.info(f"   ⚠️ Email NOT sent - Configure SMTP in .env to enable")
            return False
        
    except Exception as e:
        logger.warning(f"⚠️ Email notification failed: {e}")
        return False


def send_password_reset_email(customer_email, reset_token):
    """Send password reset email to customer"""
    try:
        # Get SMTP settings from environment
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = os.getenv("SMTP_PORT", "587")
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)
        
        subject = "🔐 Password Reset Request - Attar Travel"
        
        # Create reset link for React frontend
        reset_link = f"http://localhost:3001/reset-password?token={reset_token}&email={customer_email}"
        
        # HTML Email body with Attar Travel branding
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: bold;">✈️ ATTAR TRAVEL</h1>
                <p style="color: white; margin: 10px 0; font-size: 1.1rem;">عطار للسياحة</p>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0; font-size: 1rem;">Password Reset Request</p>
            </div>
            
            <div style="padding: 30px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af; margin-top: 0;">Password Reset Request</h2>
                <p style="font-size: 1.1rem;">We received a request to reset your password for your Attar Travel account.</p>
                
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #1e40af;">
                    <h3 style="color: #1e40af; margin-top: 0; font-size: 1.3rem;">🔐 Reset Your Password</h3>
                    <p style="margin: 15px 0;">Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{reset_link}" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="font-size: 0.9rem; color: #6b7280; margin: 15px 0;">Or copy and paste this link in your browser:</p>
                    <p style="font-size: 0.9rem; color: #1e40af; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 5px;">{reset_link}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #f59e0b;">
                    <h4 style="color: #92400e; margin-top: 0;">⚠️ Important Security Information:</h4>
                    <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                        <li>This link will expire in 24 hours for security reasons</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you click the link</li>
                        <li>For security, never share this link with anyone</li>
                    </ul>
                </div>
                
                <p style="font-size: 1.1rem; color: #374151;">If you have any questions or need assistance, please contact our customer support team.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; color: #1e40af; font-weight: bold;">Secure Travels! ✈️</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">Alex & Attar Travel Team</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #9ca3af;">Saudi Arabia Airlines & Travel Specialist</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # If SMTP is configured, send email
        if smtp_server and smtp_username and smtp_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = customer_email
                
                msg.attach(MIMEText(html_body, 'html'))
                
                with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
                    server.starttls()
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
                
                logger.info(f"📧 Password reset email SENT to {customer_email}")
                return True
                
            except Exception as email_err:
                logger.warning(f"⚠️ Password reset email sending failed: {email_err}")
                logger.info(f"📧 Password reset email prepared (email not sent)")
                return False
        else:
            logger.info(f"📧 Password reset email prepared for {customer_email}")
            logger.info(f"   Reset Token: {reset_token}")
            logger.info(f"   Reset Link: {reset_link}")
            logger.info(f"   ⚠️ Email NOT sent - Configure SMTP in .env to enable")
            return False
        
    except Exception as e:
        logger.warning(f"⚠️ Password reset email notification failed: {e}")
        return False


def send_conversation_transcript_email(customer_email, customer_name, transcripts, room_name):
    """Send conversation transcript email to customer after call ends"""
    try:
        # Get SMTP settings from environment
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = os.getenv("SMTP_PORT", "587")
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)
        
        subject = "💬 Your Conversation Transcript - Attar Travel"
        
        # Format transcript messages in beautiful card format
        transcript_html = ""
        for msg in transcripts:
            speaker = msg.get('speaker', 'unknown')
            text = msg.get('text', '')
            timestamp = msg.get('created_at', '')
            
            if speaker == 'user':
                icon = "👤"
                speaker_label = "You"
                gradient = "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)"
                shadow_color = "rgba(14, 165, 233, 0.2)"
                text_color = "#0c4a6e"
            elif speaker == 'assistant':
                icon = "🤖"
                speaker_label = "Alex (AI Agent)"
                gradient = "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
                shadow_color = "rgba(139, 92, 246, 0.2)"
                text_color = "#4c1d95"
            else:
                icon = "ℹ️"
                speaker_label = "System"
                gradient = "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                shadow_color = "rgba(245, 158, 11, 0.2)"
                text_color = "#78350f"
            
            transcript_html += f"""
            <div style="margin: 20px auto; max-width: 600px; background: white; border-radius: 16px; 
                        box-shadow: 0 8px 24px {shadow_color}; overflow: hidden; transition: transform 0.2s;">
                <div style="background: {gradient}; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.8rem;">{icon}</span>
                        <div>
                            <strong style="color: white; font-size: 1.1rem; display: block;">{speaker_label}</strong>
                            <span style="color: rgba(255,255,255,0.8); font-size: 0.75rem;">{timestamp[:19] if timestamp else 'Just now'}</span>
                        </div>
                    </div>
                </div>
                <div style="padding: 20px 24px; background: white;">
                    <p style="margin: 0; color: {text_color}; line-height: 1.7; font-size: 1rem;">{text}</p>
                </div>
            </div>
            """
        
        # HTML Email body with card-based design
        html_body = f"""
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);">
            
            <!-- Header Card -->
            <div style="background: white; margin: 30px auto; max-width: 700px; border-radius: 20px; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; 
                                margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; 
                                backdrop-filter: blur(10px);">
                        <span style="font-size: 3rem;">✈️</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 2.2rem; font-weight: bold; letter-spacing: 1px;">ATTAR TRAVEL</h1>
                    <p style="color: white; margin: 10px 0; font-size: 1.2rem; font-weight: 300;">عطار للسياحة</p>
                    <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 25px; 
                                display: inline-block; margin-top: 15px; backdrop-filter: blur(10px);">
                        <span style="color: white; font-size: 0.95rem; font-weight: 500;">💬 Conversation Transcript</span>
                    </div>
                </div>
            </div>
            
            <!-- Welcome Card -->
            <div style="background: white; margin: 20px auto; max-width: 700px; padding: 35px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 1.6rem;">Dear {customer_name},</h2>
                <p style="font-size: 1.1rem; color: #374151; margin: 0 0 10px 0;">
                    Thank you for speaking with <strong style="color: #1e40af;">Alex</strong>, your AI travel assistant! 🌟
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 1rem;">
                    Here's a complete record of your recent conversation with us.
                </p>
            </div>
            
            <!-- Session Info Card -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 20px auto; 
                        max-width: 700px; padding: 20px 30px; border-radius: 16px; 
                        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">🔖</span>
                    <div>
                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 500;">Session ID</p>
                        <p style="margin: 5px 0 0 0; color: white; font-size: 1rem; font-weight: 600;">{room_name}</p>
                    </div>
                </div>
            </div>
            
            <!-- Conversation Transcript Section Header -->
            <div style="margin: 40px auto 20px; max-width: 700px; text-align: center;">
                <h3 style="color: #1e40af; font-size: 1.5rem; margin: 0;">
                    📝 Your Conversation History
                </h3>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 0.95rem;">
                    Every message from your chat with Alex
                </p>
            </div>
            
            <!-- Transcript Messages as Cards -->
            {transcript_html}
            
            <!-- Call to Action Card -->
            <div style="background: white; margin: 30px auto; max-width: 700px; padding: 30px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
                        border-left: 5px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">📞</span> Need More Help?
                </h4>
                <p style="color: #0c4a6e; margin: 0; line-height: 1.7; font-size: 1rem;">
                    Feel free to start a new conversation anytime! We're here <strong>24/7</strong> to help you plan your perfect journey to Saudi Arabia. 🌙✨
                </p>
            </div>
            
            <!-- Thank You Card -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin: 20px auto; 
                        max-width: 700px; padding: 30px; border-radius: 16px; 
                        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25); text-align: center;">
                <p style="font-size: 1.3rem; color: white; margin: 0 0 10px 0; font-weight: 600;">
                    Thank you for choosing Attar Travel! 🙏
                </p>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 1rem;">
                    Your trusted partner for Saudi Arabia travel experiences
                </p>
            </div>
            
            <!-- Footer Card -->
            <div style="background: white; margin: 20px auto 40px; max-width: 700px; padding: 30px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); text-align: center;">
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 2.5rem;">✈️</span>
                </div>
                <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold; font-size: 1.2rem;">Safe Travels!</p>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 1rem;">Alex & Attar Travel Team</p>
                <p style="margin: 0; font-size: 0.9rem; color: #9ca3af;">Saudi Arabia Airlines & Travel Specialist</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 0.85rem; color: #9ca3af;">
                        © 2025 Attar Travel. All rights reserved.
                    </p>
                </div>
            </div>
            
        </body>
        </html>
        """
        
        # If SMTP is configured, send email
        if smtp_server and smtp_username and smtp_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = customer_email
                
                msg.attach(MIMEText(html_body, 'html'))
                
                with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
                    server.starttls()
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
                
                logger.info(f"📧 Conversation transcript email SENT to {customer_email}")
                return True
                
            except Exception as email_err:
                logger.warning(f"⚠️ Transcript email sending failed: {email_err}")
                return False
        else:
            logger.info(f"📧 Conversation transcript prepared for {customer_email}")
            logger.info(f"   Messages: {len(transcripts)}")
            logger.info(f"   Room: {room_name}")
            logger.info(f"   ⚠️ Email NOT sent - Configure SMTP in .env to enable")
            return False
        
    except Exception as e:
        logger.warning(f"⚠️ Transcript email notification failed: {e}")
        return False


def send_conversation_summary_email(customer_email, customer_name, conversation_summary, message_count, room_name):
    """Send AI-generated conversation summary email to customer after call ends"""
    try:
        # Get SMTP settings from environment
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = os.getenv("SMTP_PORT", "587")
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)
        
        subject = "📝 Your Conversation Summary - Attar Travel"
        
        # Build HTML email with the AI-generated summary
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            
            <!-- Main Header Card -->
            <div style="background: white; margin: 40px auto; max-width: 700px; padding: 40px 30px; 
                        border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e40af; margin: 0; font-size: 2.2rem; font-weight: 700; 
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                        ✈️ Attar Travel
                    </h1>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 1.1rem; font-style: italic;">
                        Your Journey, Our Passion
                    </p>
                </div>
                
                <div style="border-bottom: 3px solid #0ea5e9; margin: 25px 0;"></div>
                
                <h2 style="color: #0c4a6e; margin: 25px 0 20px 0; font-size: 1.7rem; text-align: center;">
                    📝 Conversation Summary
                </h2>
                
                <p style="color: #374151; font-size: 1.05rem; line-height: 1.7; margin-bottom: 25px;">
                    Dear <strong>{customer_name}</strong>,
                </p>
                
                <p style="color: #374151; font-size: 1.05rem; line-height: 1.7; margin-bottom: 30px;">
                    Thank you for connecting with <strong>Alex</strong>, our AI Travel Agent! Here's a summary of your conversation:
                </p>
            </div>
            
            <!-- AI Summary Card -->
            <div style="background: white; margin: 20px auto; max-width: 700px; padding: 35px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
                        border-left: 5px solid #8b5cf6;">
                {conversation_summary}
            </div>
            
            <!-- Stats Card -->
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%); margin: 20px auto; 
                        max-width: 700px; padding: 25px; border-radius: 16px; 
                        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.25); text-align: center;">
                <p style="color: white; margin: 0; font-size: 1.1rem; font-weight: 600;">
                    📊 <strong>{message_count}</strong> messages exchanged in this conversation
                </p>
            </div>
            
            <!-- Call to Action Card -->
            <div style="background: white; margin: 30px auto; max-width: 700px; padding: 30px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
                        border-left: 5px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">📞</span> Need More Help?
                </h4>
                <p style="color: #0c4a6e; margin: 0; line-height: 1.7; font-size: 1rem;">
                    Feel free to start a new conversation anytime! We're here <strong>24/7</strong> to help you plan your perfect journey to Saudi Arabia. 🌙✨
                </p>
            </div>
            
            <!-- Thank You Card -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin: 20px auto; 
                        max-width: 700px; padding: 30px; border-radius: 16px; 
                        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25); text-align: center;">
                <p style="font-size: 1.3rem; color: white; margin: 0 0 10px 0; font-weight: 600;">
                    Thank you for choosing Attar Travel! 🙏
                </p>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 1rem;">
                    Your trusted partner for Saudi Arabia travel experiences
                </p>
            </div>
            
            <!-- Footer Card -->
            <div style="background: white; margin: 20px auto 40px; max-width: 700px; padding: 30px; 
                        border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); text-align: center;">
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 2.5rem;">✈️</span>
                </div>
                <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold; font-size: 1.2rem;">Safe Travels!</p>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 1rem;">Alex & Attar Travel Team</p>
                <p style="margin: 0; font-size: 0.9rem; color: #9ca3af;">Saudi Arabia Airlines & Travel Specialist</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 0.85rem; color: #9ca3af;">
                        © 2025 Attar Travel. All rights reserved.
                    </p>
                </div>
            </div>
            
        </body>
        </html>
        """
        
        # If SMTP is configured, send email
        if smtp_server and smtp_username and smtp_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = customer_email
                
                msg.attach(MIMEText(html_body, 'html'))
                
                with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
                    server.starttls()
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
                
                logger.info(f"📧 Conversation summary email SENT to {customer_email}")
                return True
                
            except Exception as email_err:
                logger.warning(f"⚠️ Summary email sending failed: {email_err}")
                return False
        else:
            logger.info(f"📧 Conversation summary prepared for {customer_email}")
            logger.info(f"   Messages summarized: {message_count}")
            logger.info(f"   Room: {room_name}")
            logger.info(f"   ⚠️ Email NOT sent - Configure SMTP in .env to enable")
            return False
        
    except Exception as e:
        logger.warning(f"⚠️ Summary email notification failed: {e}")
        return False

