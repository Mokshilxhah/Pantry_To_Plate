import React from 'react';
import './PasswordStrengthIndicator.css';

/**
 * Validates password length.
 * Reusable across Auth forms.
 */
export function validatePassword(pwd) {
  if (!pwd) return { isValid: false, reason: 'Password cannot be empty.' };
  if (pwd.length < 8) return { isValid: false, reason: 'Password must be at least 8 characters long.' };
  return { isValid: true, reason: '' };
}

export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
    score = Math.min(score, 100);

    if (score < 30) return { color: '#ef4444', pct: 20 };
    if (score < 50) return { color: '#f97316', pct: 40 };
    if (score < 65) return { color: '#eab308', pct: 60 };
    if (score < 80) return { color: '#84cc16', pct: 80 };
    return { color: '#10b981', pct: 100 };
  };

  const { color, pct } = getStrength(password);

  return (
    <div className="password-strength-container mt-2">
      <div className="strength-bar-wrapper" style={{ height: '6px', borderRadius: '4px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
        <div
          className="strength-bar"
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'all 0.35s ease',
          }}
        />
      </div>
    </div>
  );
}
