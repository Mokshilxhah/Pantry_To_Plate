import React from 'react';
import './PasswordStrengthIndicator.css';

/**
 * Validates password strength and missing requirements.
 * Reusable across Auth forms.
 */
export function validatePassword(pwd) {
  if (!pwd) {
    return {
      isValid: false,
      label: 'None',
      color: '#9ca3af',
      pct: 0,
      missing: ['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character'],
      reason: 'Password cannot be empty.'
    };
  }

  const checks = [
    { key: 'minLen', label: 'At least 8 characters', met: pwd.length >= 8 },
    { key: 'upper', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
    { key: 'lower', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
    { key: 'num', label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
    { key: 'special', label: 'One special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const missing = checks.filter(c => !c.met).map(c => c.label);

  let score = 0;
  if (pwd.length >= 8) score += 20;
  if (pwd.length >= 12) score += 10;
  if (pwd.length >= 16) score += 10;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
  score = Math.min(score, 100);

  let label = 'Strong';
  let color = '#10b981';
  let pct = 100;

  if (score < 30) { label = 'Very Weak'; color = '#ef4444'; pct = 20; }
  else if (score < 50) { label = 'Weak'; color = '#f97316'; pct = 40; }
  else if (score < 65) { label = 'Medium / Fair'; color = '#eab308'; pct = 60; }
  else if (score < 80) { label = 'Good'; color = '#84cc16'; pct = 80; }

  // A password is valid for account creation if it has score >= 65 and no missing required checks
  const isValid = missing.length === 0 && score >= 65;

  let reason = '';
  if (!isValid) {
    if (missing.length > 0) {
      reason = `Missing requirements: ${missing.join(', ')}`;
    } else {
      reason = `Password strength is ${label}. Please add special characters or length to reach Good or Strong.`;
    }
  }

  return { isValid, label, color, pct, missing, checks, score, reason };
}

export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const { isValid, label, color, pct, checks, reason } = validatePassword(password);

  return (
    <div className="password-strength-container mt-2">
      <div className="strength-bar-wrapper">
        <div
          className="strength-bar"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            transition: 'all 0.35s ease',
          }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-1 text-xs font-semibold">
        <span className="text-gray-500">Password strength:</span>
        <span style={{ color }} className="font-bold">
          {label}
        </span>
      </div>

      {/* Live Requirement Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-gray-100 text-[11px]">
        {checks.map(c => (
          <div key={c.key} className={`flex items-center gap-1.5 font-medium ${c.met ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
            <span>{c.met ? '✓' : '○'}</span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Warning alert if password is weak/medium or restricted */}
      {!isValid && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="font-bold text-amber-900">Weak / Medium Password Restricted</p>
            <p className="text-amber-700 mt-0.5">{reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
