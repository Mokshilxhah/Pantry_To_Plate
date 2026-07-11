import './PasswordStrengthIndicator.css';

/**
 * PasswordStrengthIndicator
 * Shows only a colored progress bar + strength label (no text requirements list).
 * Uses local regex computation — no API call needed.
 */
export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)  score += 20;
    if (pwd.length >= 12) score += 10;
    if (pwd.length >= 16) score += 10;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
    score = Math.min(score, 100);

    if (score < 30)  return { label: 'Very Weak', color: '#ef4444', pct: 15 };
    if (score < 50)  return { label: 'Weak',      color: '#f97316', pct: 35 };
    if (score < 65)  return { label: 'Fair',       color: '#eab308', pct: 55 };
    if (score < 80)  return { label: 'Good',       color: '#84cc16', pct: 75 };
    return              { label: 'Strong',     color: '#10b981', pct: 100 };
  };

  const { label, color, pct } = getStrength(password);

  return (
    <div className="password-strength-container">
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
      <div className="strength-info">
        <span className="strength-label">Password strength:</span>
        <span className="strength-text" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
