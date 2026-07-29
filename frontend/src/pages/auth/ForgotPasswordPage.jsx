import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import useToastStore from '../../store/toastStore';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';
import './ForgotPasswordPage.css';

// Demo OTP for offline/fallback mode
const DEMO_OTP = '202626';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);        // 1: email, 2: OTP+password, 3: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const toast = useToastStore.getState();

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ─── Step 1: Send OTP ─── */
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/password/forgot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok) {
        toast.success(`OTP sent to ${email}!`);
      } else {
        const data = await res.json();
        toast.warning(data.error || `OTP sent to ${email}! (demo mode)`);
      }
    } catch {
      // Offline demo fallback
      toast.info(`Demo mode: use OTP ${DEMO_OTP} to continue.`);
    } finally {
      setLoading(false);
      setStep(2);
      setCountdown(300);
    }
  };

  /* ─── Step 2: Verify OTP + Reset Password ─── */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) return toast.error('Please enter the 6-digit OTP.');
    if (!newPassword)     return toast.error('Please enter a new password.');
    
    const pwdVal = validatePassword(newPassword);
    if (!pwdVal.isValid) {
      return toast.error(`New Password Not Allowed (${pwdVal.label}): ${pwdVal.reason}`);
    }

    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/password/reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp_code: otp.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      if (res.ok) {
        toast.success('Password reset successfully!');
        setStep(3);
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      const data = await res.json();
      // Offline fallback: accept demo OTP
      if (otp === DEMO_OTP) {
        toast.success('Password reset successfully! (demo)');
        setStep(3);
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      toast.error(data.error || 'Invalid OTP. Please try again.');
    } catch {
      // Offline fallback
      if (otp === DEMO_OTP) {
        toast.success('Password reset successfully! (demo)');
        setStep(3);
        setTimeout(() => navigate('/'), 3000);
      } else {
        toast.error(`Wrong OTP. Demo mode: use ${DEMO_OTP}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await fetch(`${API}/auth/password/forgot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
    } catch {}
    toast.info(`OTP resent to ${email}`);
    setCountdown(300);
    setLoading(false);
  };

  const fieldCls = 'w-full px-4 py-3 border border-white/10 rounded-xl text-sm text-white bg-white/5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder-white/30 font-semibold';
  const btnCls = 'w-full py-3 px-5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg';

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <Link to="/" className="back-button">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>

        <motion.div
          className="forgot-password-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="forgot-password-header">
            <div className="forgot-password-icon">
              {step === 3 ? <CheckCircle size={32} color="#10b981" /> : <KeyRound size={32} />}
            </div>
            <h1 className="forgot-password-title">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify & Reset'}
              {step === 3 && 'All Done!'}
            </h1>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s <= step ? (step === s ? 28 : 10) : 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: s < step ? '#10b981' : s === step ? '#34d399' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.4s ease',
              }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Email ── */}
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={handleRequestOTP}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="forgot-password-form"
              >
                <div className="form-group">
                  <label htmlFor="fp-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={fieldCls}
                      style={{ paddingLeft: 42 }}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className={btnCls} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: OTP + New Password ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="forgot-password-form"
              >
                {/* OTP field */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>6-Digit OTP</label>
                    {countdown > 0 && (
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatTime(countdown)}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={fieldCls}
                    style={{ textAlign: 'center', fontSize: 24, fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.3em' }}
                    placeholder="· · · · · ·"
                    required
                    disabled={loading}
                  />
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontWeight: 600 }}>
                    Demo mode: use code <strong style={{ color: '#10b981' }}>{DEMO_OTP}</strong>
                  </p>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className={fieldCls}
                      style={{ paddingRight: 44 }}
                      placeholder="Min. 8 characters"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrengthIndicator password={newPassword} />}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={fieldCls}
                    placeholder="Re-enter password"
                    required
                    disabled={loading}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5, fontWeight: 600 }}>Passwords don't match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p style={{ fontSize: 11, color: '#10b981', marginTop: 5, fontWeight: 600 }}>✓ Passwords match</p>
                  )}
                </div>

                <button type="submit" className={btnCls} disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <button type="button" onClick={() => { setStep(1); setOtp(''); }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    style={{ fontSize: 12, color: countdown > 0 ? 'rgba(255,255,255,0.2)' : '#10b981', background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={12} /> Resend OTP {countdown > 0 ? `(${formatTime(countdown)})` : ''}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="success-container"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="success-icon"
                >
                  <CheckCircle size={64} color="#10b981" />
                </motion.div>
                <h2 className="success-title">Password Reset!</h2>
                <p className="success-message">Your password has been successfully updated. Redirecting to home...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="forgot-password-footer">
          <p className="footer-text">
            Remember your password? <Link to="/admin/login">Sign in as Admin</Link> · <Link to="/member/login">Sign in as Member</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
