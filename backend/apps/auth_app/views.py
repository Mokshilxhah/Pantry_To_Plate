from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
import bcrypt
import random
import string
import re
from django.core.mail import send_mail
from django.conf import settings
from .models import User, OTPToken
from .password_validator import PasswordValidator
from .serializers import (
    PasswordStrengthSerializer, OTPRequestSerializer, 
    OTPVerifySerializer, PasswordChangeSerializer
)
from apps.kitchen.models import Kitchen
from .subscription_manager import SubscriptionManager
from datetime import datetime, timedelta


def send_otp_email(email, otp_code, purpose="verification"):
    """Send real OTP email using Django configured SMTP settings."""
    subject = f"Pantry to Plate — Your {purpose.title()} OTP Code"
    message = (
        f"Hello,\n\n"
        f"Your OTP code for Pantry to Plate is: {otp_code}\n\n"
        f"Please enter this code to complete your {purpose}.\n"
        f"This code will expire in 10 minutes.\n\n"
        f"If you did not request this code, please ignore this email.\n\n"
        f"Warm regards,\nPantry to Plate Team"
    )
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', 'noreply@pantrytoplate.com')
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[email],
            fail_silently=True
        )
        return True
    except Exception as e:
        print(f"Error sending OTP email: {e}")
        return False


def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


def make_tokens(user):
    """Create JWT tokens with user info embedded."""
    refresh = RefreshToken()
    refresh['user_id'] = str(user.id)
    refresh['role'] = user.role

    kitchen_id = ''
    kitchen_name = ''
    invite_code = ''
    try:
        if user.kitchen_id:
            kitchen_id = str(user.kitchen_id.id)
            kitchen_name = user.kitchen_id.kitchen_name
            invite_code = user.kitchen_id.invite_code
    except Exception:
        pass

    # Resolve subscription plan and member limit for user/kitchen
    from .subscription_manager import SubscriptionManager
    admin_user = user
    if user.role == 'member' and user.kitchen_id:
        admin_user = user.kitchen_id.admin_id or user

    try:
        subscription = SubscriptionManager.get_user_subscription(admin_user)
        plan_name = subscription.plan.name
        max_members = subscription.plan.max_members
    except Exception:
        plan_name = admin_user.subscription_plan or 'free'
        if plan_name == 'free':
            max_members = 2
        elif plan_name == 'pro':
            max_members = 5
        else:
            max_members = -1

    user_data = {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
        'kitchen_id': kitchen_id,
        'kitchen_name': kitchen_name,
        'invite_code': invite_code,
        'plan': plan_name,
        'member_limit': max_members,
    }
    return str(refresh.access_token), str(refresh), user_data


def get_user_from_request(request):
    """Extract user from Authorization header."""
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token or token == 'mock-token':
        return None
    try:
        data = UntypedToken(token)
        user_id = data['user_id']
        return User.objects(id=user_id).first()
    except Exception:
        return None


# ──────────────────────────────────────────────────────────────────────
#  ADMIN REGISTER
# ──────────────────────────────────────────────────────────────────────
class AdminRegisterView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')
        full_name = request.data.get('full_name', '').strip()
        kitchen_name = request.data.get('kitchen_name', '').strip()

        if not all([email, password, confirm_password, full_name, kitchen_name]):
            return Response({'error': 'All fields are required.'}, status=400)

        # Validate email format
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            return Response({'error': 'Invalid email address format.'}, status=400)

        if password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=400)

        # Validate password strength
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(password)
        
        if not is_valid:
            return Response({
                'error': 'Password does not meet minimum requirements',
                'feedback': strength_info['feedback'],
                'requirements': strength_info['requirements']
            }, status=400)

        try:
            if User.objects(email=email).first():
                return Response({'error': 'Email already registered. Please sign in.'}, status=400)
        except Exception as e:
            return Response({'error': f'Database error: {str(e)}'}, status=500)

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        try:
            user = User(
                email=email,
                password_hash=hashed,
                full_name=full_name,
                role='admin',
            )
            user.save()
            kitchen = Kitchen(
                kitchen_name=kitchen_name,
                admin_id=user,
                invite_code=generate_invite_code(),
            )
            kitchen.save()
            user.kitchen_id = kitchen
            user.save()
        except Exception as e:
            return Response({'error': str(e)}, status=500)

        access, refresh, user_data = make_tokens(user)
        return Response({
            'message': 'Admin account created successfully.',
            'user': user_data,
            'tokens': {'access': access, 'refresh': refresh},
        }, status=201)


# ──────────────────────────────────────────────────────────────────────
#  ADMIN LOGIN
# ──────────────────────────────────────────────────────────────────────
class AdminLoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        try:
            user = User.objects(email=email, role='admin').first()
            if not user:
                return Response({'error': 'Invalid admin credentials. Check email and password.'}, status=401)

            # Check lockout
            if user.lockout_time:
                now = datetime.utcnow()
                if now < user.lockout_time + timedelta(minutes=15):
                    rem_seconds = int((user.lockout_time + timedelta(minutes=15) - now).total_seconds())
                    rem_minutes = max(1, rem_seconds // 60)
                    return Response({
                        'error': f'Account locked due to multiple failed login attempts. Try again in {rem_minutes} minutes.'
                    }, status=403)
                else:
                    # Reset lockout
                    user.update(set__login_attempts=0, set__lockout_time=None)
                    user.reload()

            if bcrypt.checkpw(password.encode(), user.password_hash.encode()):
                user.update(set__login_attempts=0, set__lockout_time=None)
                access, refresh, user_data = make_tokens(user)
                return Response({
                    'user': user_data,
                    'tokens': {'access': access, 'refresh': refresh},
                })
            else:
                attempts = (user.login_attempts or 0) + 1
                if attempts >= 5:
                    user.update(set__login_attempts=attempts, set__lockout_time=datetime.utcnow())
                    return Response({
                        'error': 'Account locked due to too many failed attempts. Try again in 15 minutes.'
                    }, status=403)
                else:
                    user.update(set__login_attempts=attempts)
                    rem = 5 - attempts
                    return Response({
                        'error': f'Invalid admin credentials. {rem} attempt{"s" if rem > 1 else ""} remaining before lockout.'
                    }, status=401)
        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)


# ──────────────────────────────────────────────────────────────────────
#  MEMBER REGISTER
# ──────────────────────────────────────────────────────────────────────
class MemberRegisterView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')
        full_name = request.data.get('full_name', '').strip()
        invite_code = request.data.get('invite_code', '').upper().strip()

        if not all([email, password, confirm_password, full_name, invite_code]):
            return Response({'error': 'All fields required, including the invite code.'}, status=400)

        # Validate email format
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            return Response({'error': 'Invalid email address format.'}, status=400)

        # Validate invite code format (8-character alphanumeric)
        if not re.match(r'^[A-Z0-9]{8}$', invite_code):
            return Response({'error': 'Invalid invite code format. Must be an 8-character alphanumeric code.'}, status=400)

        if password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=400)

        # Validate password strength
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(password)
        
        if not is_valid:
            return Response({
                'error': 'Password does not meet minimum requirements',
                'feedback': strength_info['feedback'],
                'requirements': strength_info['requirements']
            }, status=400)

        try:
            kitchen = Kitchen.objects(invite_code=invite_code).first()
            if not kitchen:
                return Response({'error': 'Invalid invite code. Ask your kitchen admin for the code.'}, status=400)
            
            # Enforce max members limits check based on admin subscription plan
            admin_user = kitchen.admin_id
            if admin_user:
                can_add, message = SubscriptionManager.can_add_member(admin_user, kitchen)
                if not can_add:
                    # Create system alert for admin to recommend upgrading
                    try:
                        from apps.alerts.models import Alert
                        current_plan = getattr(admin_user, 'subscription_plan', 'free') or 'free'
                        next_plan_suggestion = "Pro Family plan" if current_plan == 'free' else "Premium Pro plan"
                        Alert(
                            kitchen_id=str(kitchen.id),
                            user_id=admin_user,
                            title="Join Attempt Blocked: Member Limit Reached",
                            category='system',
                            severity='warning',
                            status='unread',
                            description=f"A new member tried to join your kitchen using the family code, but was blocked because you have reached the member limit for your {current_plan.capitalize()} plan. Please consider upgrading to the {next_plan_suggestion} to add more members."
                        ).save()
                    except Exception:
                        pass
                    return Response({'error': message}, status=400)

            if User.objects(email=email).first():
                return Response({'error': 'Email already registered.'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        try:
            user = User(
                email=email,
                password_hash=hashed,
                full_name=full_name,
                role='member',
                kitchen_id=kitchen,
            )
            user.save()
            # Create system alert for admin about new member registration
            try:
                from apps.alerts.models import Alert
                admin_user = kitchen.admin_id
                if admin_user:
                    Alert(
                        kitchen_id=str(kitchen.id),
                        user_id=admin_user,
                        title=f"New member registered: {full_name}",
                        category='system',
                        severity='info',
                        status='unread',
                        description=f"Member {email} has registered and joined your family kitchen workspace."
                    ).save()
            except Exception as alert_err:
                pass
        except Exception as e:
            return Response({'error': str(e)}, status=500)

        access, refresh, user_data = make_tokens(user)
        return Response({
            'message': 'Member account created successfully.',
            'user': user_data,
            'tokens': {'access': access, 'refresh': refresh},
        }, status=201)


# ──────────────────────────────────────────────────────────────────────
#  MEMBER LOGIN
# ──────────────────────────────────────────────────────────────────────
class MemberLoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        invite_code = request.data.get('invite_code', '').upper().strip()

        if not invite_code:
            return Response({'error': 'Invite code is required to log in as a member.'}, status=400)

        try:
            user = User.objects(email=email, role='member').first()
            if not user:
                return Response({'error': 'Invalid member credentials.'}, status=401)

            # Check lockout
            if user.lockout_time:
                now = datetime.utcnow()
                if now < user.lockout_time + timedelta(minutes=15):
                    rem_seconds = int((user.lockout_time + timedelta(minutes=15) - now).total_seconds())
                    rem_minutes = max(1, rem_seconds // 60)
                    return Response({
                        'error': f'Account locked due to multiple failed login attempts. Try again in {rem_minutes} minutes.'
                    }, status=403)
                else:
                    # Reset lockout
                    user.update(set__login_attempts=0, set__lockout_time=None)
                    user.reload()

            if bcrypt.checkpw(password.encode(), user.password_hash.encode()):
                # Verify that the invite code provided matches the member's kitchen invite code
                if not user.kitchen_id or user.kitchen_id.invite_code != invite_code:
                    return Response({'error': 'Invalid invite code for this member account.'}, status=400)
                
                user.update(set__login_attempts=0, set__lockout_time=None)
                access, refresh, user_data = make_tokens(user)
                return Response({
                    'user': user_data,
                    'tokens': {'access': access, 'refresh': refresh},
                })
            else:
                attempts = (user.login_attempts or 0) + 1
                if attempts >= 5:
                    user.update(set__login_attempts=attempts, set__lockout_time=datetime.utcnow())
                    return Response({
                        'error': 'Account locked due to too many failed attempts. Try again in 15 minutes.'
                    }, status=403)
                else:
                    user.update(set__login_attempts=attempts)
                    rem = 5 - attempts
                    return Response({
                        'error': f'Invalid member credentials. {rem} attempt{"s" if rem > 1 else ""} remaining before lockout.'
                    }, status=401)
        except Exception as e:
            return Response({'error': f'Server error: {str(e)}'}, status=500)




# ──────────────────────────────────────────────────────────────────────
#  GET INVITE CODE  (for admin to share with members)
# ──────────────────────────────────────────────────────────────────────
class GetInviteCodeView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            if not user.kitchen_id:
                return Response({'error': 'No kitchen associated with your account'}, status=404)
            kitchen = user.kitchen_id
            return Response({
                'invite_code': kitchen.invite_code,
                'kitchen_name': kitchen.kitchen_name,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ──────────────────────────────────────────────────────────────────────
#  LEGACY  (keep for backward compat)
# ──────────────────────────────────────────────────────────────────────
class RegisterView(AdminRegisterView):
    """Alias kept for backward compatibility."""
    pass


class LoginView(APIView):
    """Legacy unified login — tries admin then member."""
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        try:
            user = User.objects(email=email).first()
            if user and bcrypt.checkpw(password.encode(), user.password_hash.encode()):
                access, refresh, user_data = make_tokens(user)
                return Response({'user': user_data, 'tokens': {'access': access, 'refresh': refresh}})
        except Exception:
            pass
        return Response({'error': 'Invalid credentials'}, status=401)


# ──────────────────────────────────────────────────────────────────────
#  PASSWORD STRENGTH CHECK
# ──────────────────────────────────────────────────────────────────────
class PasswordStrengthCheckView(APIView):
    """Check password strength and return detailed feedback"""
    permission_classes = []
    
    def post(self, request):
        password = request.data.get('password', '')
        
        if not password:
            return Response({
                'error': 'Password is required'
            }, status=400)
        
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(password)
        
        return Response({
            'is_valid': is_valid,
            'score': strength_info['score'],
            'strength': strength_info['strength'],
            'requirements': strength_info['requirements'],
            'feedback': strength_info['feedback'],
        }, status=200)


# ──────────────────────────────────────────────────────────────────────
#  FORGOT PASSWORD - REQUEST OTP
# ──────────────────────────────────────────────────────────────────────
class ForgotPasswordView(APIView):
    """Request OTP for password reset"""
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=400)
        
        try:
            user = User.objects(email=email).first()
            if not user:
                # Don't reveal if email exists or not for security
                return Response({
                    'message': 'If this email exists in our system, you will receive an OTP'
                }, status=200)
            
            # Generate OTP
            otp_code = OTPToken.generate_otp(email, purpose='password_reset')
            
            # Send real email via Django SMTP
            sent = send_otp_email(email, otp_code, purpose='password reset')
            
            return Response({
                'message': 'OTP sent to your email address.',
                'email': email,
                'sent': sent,
                'otp': otp_code,
            }, status=200)
        except Exception as e:
            return Response({
                'error': f'Error processing request: {str(e)}'
            }, status=500)


# ──────────────────────────────────────────────────────────────────────
#  FORGOT PASSWORD - VERIFY OTP AND RESET PASSWORD
# ──────────────────────────────────────────────────────────────────────
class ResetPasswordView(APIView):
    """Verify OTP and reset password"""
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        otp_code = request.data.get('otp_code', '').strip()
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')
        
        if not all([email, otp_code, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required'
            }, status=400)
        
        try:
            # Find and verify OTP
            otp = OTPToken.objects(
                email=email, 
                otp_code=otp_code, 
                purpose='password_reset'
            ).first()
            
            if not otp:
                return Response({
                    'error': 'Invalid OTP'
                }, status=400)
            
            if not otp.verify(otp_code):
                remaining = otp.max_attempts - otp.attempts
                if remaining <= 0:
                    return Response({
                        'error': 'OTP expired or max attempts exceeded'
                    }, status=400)
                return Response({
                    'error': f'Invalid OTP. {remaining} attempts remaining'
                }, status=400)
            
            # Validate new password
            validator = PasswordValidator()
            is_valid, strength_info = validator.validate(new_password)
            
            if not is_valid:
                return Response({
                    'error': 'Password does not meet minimum requirements',
                    'feedback': strength_info['feedback']
                }, status=400)
            
            if new_password != confirm_password:
                return Response({
                    'error': 'Passwords do not match'
                }, status=400)
            
            # Reset password
            user = User.objects(email=email).first()
            if not user:
                return Response({
                    'error': 'User not found'
                }, status=404)
            
            hashed_password = bcrypt.hashpw(
                new_password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
            user.password_hash = hashed_password
            user.updated_at = datetime.utcnow()
            user.save()
            
            return Response({
                'message': 'Password reset successfully. Please login with your new password'
            }, status=200)
        except Exception as e:
            return Response({
                'error': f'Error resetting password: {str(e)}'
            }, status=500)


# ──────────────────────────────────────────────────────────────────────
#  CHANGE PASSWORD (Authenticated users)
# ──────────────────────────────────────────────────────────────────────
class ChangePasswordView(APIView):
    """Change password for authenticated user"""
    
    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({
                'error': 'Authentication required'
            }, status=401)
        
        current_password = request.data.get('current_password') or request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')
        
        if not all([current_password, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required'
            }, status=400)
        
        try:
            # Verify current password
            if not bcrypt.checkpw(current_password.encode(), user.password_hash.encode()):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=400)
            
            # Validate new password
            validator = PasswordValidator()
            is_valid, strength_info = validator.validate(new_password)
            
            if not is_valid:
                return Response({
                    'error': 'Password does not meet minimum requirements',
                    'feedback': strength_info['feedback']
                }, status=400)
            
            if new_password != confirm_password:
                return Response({
                    'error': 'Passwords do not match'
                }, status=400)
            
            # Update password
            hashed_password = bcrypt.hashpw(
                new_password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
            user.password_hash = hashed_password
            user.updated_at = datetime.utcnow()
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=200)
        except Exception as e:
            return Response({
                'error': f'Error changing password: {str(e)}'
            }, status=500)


# ──────────────────────────────────────────────────────────────────────
#  PROFILE UPDATE (Authenticated users)
# ──────────────────────────────────────────────────────────────────────
class ProfileUpdateView(APIView):
    """View and update profile details (full_name, kitchen_name, and dietary preferences) for authenticated user"""
    
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        from apps.dietary.models import DietaryProfile
        dp = DietaryProfile.objects(user_id=user.id).first()
        diet_type = dp.diet_type if dp else []
        allergies = dp.allergies if dp else []
        
        kitchen_id = str(user.kitchen_id.id) if user.kitchen_id else ''
        kitchen_name = user.kitchen_id.kitchen_name if user.kitchen_id else ''
        invite_code = user.kitchen_id.invite_code if (user.kitchen_id and user.role == 'admin') else ''
        
        user_data = {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'kitchen_id': kitchen_id,
            'kitchen_name': kitchen_name,
            'invite_code': invite_code,
            'subscription_plan': user.subscription_plan or 'free',
            'diet_type': diet_type,
            'allergies': allergies,
        }
        return Response({'user': user_data}, status=200)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Verify OTP if user is admin
        if user.role == 'admin':
            otp_code = request.data.get('otp', '').strip()
            if not otp_code:
                return Response({'error': 'OTP verification code is required to update admin profile.'}, status=400)
            
            otp = OTPToken.objects(
                email=user.email,
                otp_code=otp_code,
                purpose='email_verification',
                is_used=False
            ).first()
            
            if not otp or not otp.verify(otp_code):
                return Response({'error': 'Invalid or expired OTP code.'}, status=400)
        
        full_name = request.data.get('full_name', '').strip()
        kitchen_name = request.data.get('kitchen_name', '').strip()
        diet_type = request.data.get('diet_type', [])
        allergies = request.data.get('allergies', [])
        
        try:
            if full_name:
                user.full_name = full_name
                user.save()
                
            if kitchen_name and user.role == 'admin' and user.kitchen_id:
                kitchen = user.kitchen_id
                kitchen.kitchen_name = kitchen_name
                kitchen.save()
                
            # Update Dietary Profile
            from apps.dietary.models import DietaryProfile
            dp = DietaryProfile.objects(user_id=user.id).first()
            if not dp and user.kitchen_id:
                dp = DietaryProfile(user_id=user, kitchen_id=user.kitchen_id)
            if dp:
                if isinstance(diet_type, list):
                    dp.diet_type = diet_type
                if isinstance(allergies, list):
                    dp.allergies = allergies
                dp.save()
                user.dietary_profile_id = dp
                user.save()
                
            kitchen_id = str(user.kitchen_id.id) if user.kitchen_id else ''
            kitchen_name_str = user.kitchen_id.kitchen_name if user.kitchen_id else ''
            invite_code = user.kitchen_id.invite_code if (user.kitchen_id and user.role == 'admin') else ''
            
            user_data = {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'kitchen_id': kitchen_id,
                'kitchen_name': kitchen_name_str,
                'invite_code': invite_code,
                'subscription_plan': user.subscription_plan or 'free',
                'diet_type': dp.diet_type if dp else [],
                'allergies': dp.allergies if dp else [],
            }
            
            return Response({
                'message': 'Profile updated successfully',
                'user': user_data
            }, status=200)
        except Exception as e:
            return Response({
                'error': f'Error updating profile: {str(e)}'
            }, status=500)


class ProfileRequestOTPView(APIView):
    """Request OTP for profile updates (admin only)"""
    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        if user.role != 'admin':
            return Response({'error': 'OTP verification is only required for Admin profile updates.'}, status=400)
        
        try:
            otp_code = OTPToken.generate_otp(user.email, purpose='email_verification')
            sent = send_otp_email(user.email, otp_code, purpose='profile update')
            return Response({
                'message': 'OTP sent to your email',
                'sent': sent,
                'otp': otp_code
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class SendOTPView(APIView):
    """Send real OTP email for registration or email verification"""
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        purpose = request.data.get('purpose', 'email_verification')
        if not email:
            return Response({'error': 'Email address is required'}, status=400)
        
        try:
            otp_code = OTPToken.generate_otp(email, purpose=purpose)
            sent = send_otp_email(email, otp_code, purpose=purpose)
            return Response({
                'message': f'OTP code sent to {email}. Check your email inbox.',
                'sent': sent,
                'otp': otp_code
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
