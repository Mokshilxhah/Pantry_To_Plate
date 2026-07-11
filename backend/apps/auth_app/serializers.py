from rest_framework import serializers
from .models import User, OTPToken
from .password_validator import PasswordValidator
import bcrypt

class PasswordStrengthSerializer(serializers.Serializer):
    """Serialize password strength check results"""
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False)
    
    def validate_password(self, value):
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(value)
        self.context['strength_info'] = strength_info
        self.context['is_valid'] = is_valid
        
        if not is_valid:
            raise serializers.ValidationError({
                'strength': strength_info,
                'message': 'Password does not meet minimum requirements'
            })
        return value
    
    def validate(self, data):
        if 'confirm_password' in data and data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    kitchen_name = serializers.CharField(required=False)

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_password(self, value):
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(value)
        
        if not is_valid:
            raise serializers.ValidationError(
                f"Password does not meet minimum requirements. {strength_info['feedback'][0]}"
            )
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user = User(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password_hash=hashed_password,
            role='admin' if validated_data.get('kitchen_name') else 'member'
        )
        user.save()
        return user


class OTPRequestSerializer(serializers.Serializer):
    """Request for OTP generation"""
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(
        choices=['password_reset', 'email_verification'],
        default='password_reset'
    )


class OTPVerifySerializer(serializers.Serializer):
    """Verify OTP and reset password"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(value)
        
        if not is_valid:
            raise serializers.ValidationError(
                f"Password does not meet minimum requirements. {strength_info['feedback'][0]}"
            )
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data


class PasswordChangeSerializer(serializers.Serializer):
    """Change password for authenticated user"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validator = PasswordValidator()
        is_valid, strength_info = validator.validate(value)
        
        if not is_valid:
            raise serializers.ValidationError(
                f"Password does not meet minimum requirements. {strength_info['feedback'][0]}"
            )
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data

