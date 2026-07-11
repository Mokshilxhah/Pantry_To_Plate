"""
Modern password validation utilities with strength checking
"""

import re
from typing import Dict, List, Tuple


class PasswordValidator:
    """
    Password validation with strength scoring
    Checks for: length, uppercase, lowercase, numbers, special characters
    """
    
    # Strength score bands
    STRENGTH_BANDS = {
        'very_weak': (0, 20),
        'weak': (20, 40),
        'fair': (40, 60),
        'good': (60, 80),
        'strong': (80, 100)
    }
    
    def __init__(self, min_length=8):
        self.min_length = min_length
    
    @staticmethod
    def check_length(password: str, min_length: int = 8) -> Dict:
        """Check password length"""
        length = len(password)
        is_valid = length >= min_length
        score = min(int(length / min_length * 30), 30)  # Max 30 points
        return {
            'valid': is_valid,
            'message': f'At least {min_length} characters',
            'score': score,
            'met': is_valid
        }
    
    @staticmethod
    def check_uppercase() -> Dict:
        """Pattern for uppercase letters"""
        pattern = re.compile(r'[A-Z]')
        return {
            'pattern': pattern,
            'message': 'At least one uppercase letter (A-Z)',
            'score': 15
        }
    
    @staticmethod
    def check_lowercase() -> Dict:
        """Pattern for lowercase letters"""
        pattern = re.compile(r'[a-z]')
        return {
            'pattern': pattern,
            'message': 'At least one lowercase letter (a-z)',
            'score': 15
        }
    
    @staticmethod
    def check_numbers() -> Dict:
        """Pattern for numbers"""
        pattern = re.compile(r'[0-9]')
        return {
            'pattern': pattern,
            'message': 'At least one number (0-9)',
            'score': 15
        }
    
    @staticmethod
    def check_special_characters() -> Dict:
        """Pattern for special characters"""
        pattern = re.compile(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]')
        return {
            'pattern': pattern,
            'message': 'At least one special character (!@#$%^&* etc)',
            'score': 25
        }
    
    def validate(self, password: str) -> Tuple[bool, Dict]:
        """
        Validate password and return strength analysis
        
        Returns:
            Tuple of (is_valid, strength_info)
            is_valid: Boolean if password meets minimum requirements
            strength_info: Dictionary with detailed feedback
        """
        strength_info = {
            'score': 0,
            'strength': None,
            'requirements': [],
            'feedback': [],
            'score_breakdown': {},
        }
        
        # Check length
        length_check = self.check_length(password, self.min_length)
        strength_info['score'] += length_check['score']
        strength_info['score_breakdown']['length'] = length_check['score']
        strength_info['requirements'].append({
            'name': 'Length',
            'met': length_check['met'],
            'message': length_check['message']
        })
        
        # Check patterns
        patterns = [
            self.check_uppercase(),
            self.check_lowercase(),
            self.check_numbers(),
            self.check_special_characters(),
        ]
        
        requirements_met = 0
        for pattern_info in patterns:
            pattern = pattern_info['pattern']
            met = bool(pattern.search(password))
            score = pattern_info['score'] if met else 0
            
            strength_info['score'] += score
            strength_info['score_breakdown'][pattern_info['message']] = score
            strength_info['requirements'].append({
                'name': pattern_info['message'].split(' ')[3].capitalize(),  # Extract readable name
                'met': met,
                'message': pattern_info['message']
            })
            
            if met:
                requirements_met += 1
        
        # Normalize score to 0-100
        strength_info['score'] = min(strength_info['score'], 100)
        
        # Determine strength level
        for level, (min_score, max_score) in self.STRENGTH_BANDS.items():
            if min_score <= strength_info['score'] < max_score:
                strength_info['strength'] = level.replace('_', ' ').title()
                break
        
        # Generate feedback
        strength_info['feedback'] = self._generate_feedback(
            password, 
            strength_info['score'], 
            requirements_met
        )
        
        # Determine if password is valid
        # Must have: length + at least 2 more requirements
        is_valid = length_check['met'] and requirements_met >= 3
        
        return is_valid, strength_info
    
    @staticmethod
    def _generate_feedback(password: str, score: int, requirements_met: int) -> List[str]:
        """Generate helpful feedback for password"""
        feedback = []
        
        if score < 40:
            feedback.append("Password is too weak. Add uppercase, numbers, or special characters.")
        elif score < 60:
            feedback.append("Password is fair. Consider adding special characters for better security.")
        elif score < 80:
            feedback.append("Password is good. Adding more variety would make it stronger.")
        else:
            feedback.append("Password is strong!")
        
        if len(password) < 10:
            feedback.append("Consider using 10+ characters for better security.")
        
        return feedback
    
    def validate_multiple_passwords(self, password: str, confirm_password: str) -> Tuple[bool, Dict, str]:
        """
        Validate password and confirm it matches
        
        Returns:
            Tuple of (is_valid, strength_info, error_message)
        """
        is_valid, strength_info = self.validate(password)
        
        if not is_valid:
            return False, strength_info, "Password does not meet minimum requirements"
        
        if password != confirm_password:
            return False, strength_info, "Passwords do not match"
        
        return True, strength_info, ""
