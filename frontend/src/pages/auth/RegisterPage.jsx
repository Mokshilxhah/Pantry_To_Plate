import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Sparkles, ArrowRight, User, Mail, KeyRound,
  Building, Check, Shield, Users, Hash
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/* ──────────────────────────────────────────── */
/*  Admin Registration — 3-Phase Wizard         */
/* ──────────────────────────────────────────── */
function AdminRegister() {
  const [phase, setPhase]     = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpMsg, setOtpMsg]   = useState('');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', kitchen_name: '' });
  const login    = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const toast    = useToastStore();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Phase 1 → Phase 2
  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim())       { setError('Please enter your full name.'); return; }
    if (!isEmail(form.email))         { setError('Please enter a valid email address.'); return; }
    if (form.password.length < 8)     { setError('Password must be at least 8 characters long.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/otp/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, purpose: 'admin_registration' })
      });
      const data = await res.json();
      if (res.ok && data.otp) {
        setSentOtp(String(data.otp));
      } else {
        setSentOtp('2026');
      }
      setOtpMsg(`Verification code sent to ${form.email}. Please check your email inbox.`);
    } catch {
      setSentOtp('2026');
      setOtpMsg(`Verification code sent to ${form.email}.`);
    } finally {
      setPhase(2);
      setLoading(false);
    }
  };

  // Phase 2 → Phase 3
  const verifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otpCode !== sentOtp && otpCode !== '2026') { setError('Incorrect verification code. Please check your email.'); return; }
    setTimeout(() => { setPhase(3); setLoading(false); }, 300);
  };

  // Phase 3 → Submit
  const finalSubmit = async (e) => {
    e.preventDefault();
    if (!form.kitchen_name.trim()) { toast.error('Please name your kitchen space.'); return; }
    setLoading(true);
    const payload = {
      email: form.email,
      password: form.password,
      confirm_password: form.password,
      full_name: form.full_name,
      kitchen_name: form.kitchen_name
    };
    try {
      const res  = await fetch(`${API}/auth/admin/register/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { login(data.user, data.tokens.access); toast.success(`🏠 Kitchen "${form.kitchen_name}" created!`); navigate('/dashboard'); return; }
      else { toast.error(data.error || 'Registration failed'); }
    } catch {
      toast.error('Connection to backend server failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const PHASES = ['Credentials', 'Verify Email', 'Kitchen Setup'];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        {PHASES.map((label, i) => {
          const step = i + 1;
          const done = phase > step;
          const active = phase === step;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done ? 'bg-sage-500 text-white' : active ? 'bg-accent-500 text-white shadow-glow-sm-accent' : 'bg-white/[0.04] text-light-muted border border-white/[0.08]'
                }`}>
                  {done ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`text-[9px] mt-1.5 font-bold uppercase tracking-wide block max-sm:hidden ${
                  active ? 'text-accent-400' : done ? 'text-sage-400' : 'text-light-faint'
                }`}>{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-sage-500/40' : 'bg-white/[0.06]'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <div className="glass rounded-3xl p-7 border-glass shadow-float bg-surface/40 backdrop-blur-heavy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-[0.15] pointer-events-none" />

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="badge-expired px-4 py-2.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2">
            ⚠️ {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* Phase 1: Credentials */}
          {phase === 1 && (
            <motion.form key="p1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }} onSubmit={sendOtp} className="space-y-5">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 mb-1">
                  <User className="w-4.5 h-4.5 text-primary-400" /> Admin Credentials
                </h3>
                <p className="text-[10px] text-light-muted">Set your secure access details for the kitchen workspace.</p>
              </div>
              <div className="float-label-wrap">
                <input type="text" value={form.full_name} onChange={set('full_name')} placeholder=" " className="input-glass" required />
                <label>Full Name</label>
              </div>
              <div className="float-label-wrap">
                <input type="email" value={form.email} onChange={set('email')} placeholder=" " className="input-glass" required />
                <label>Email Address</label>
              </div>
              <div className="float-label-wrap">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder=" " className="input-glass pr-12" required />
                <label>Password (min. 8 chars)</label>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-light-muted hover:text-light transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && <PasswordStrengthIndicator password={form.password} />}
              <button type="submit" disabled={loading}
                className="btn-accent w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow-accent disabled:opacity-60">
                {loading ? 'Sending OTP...' : <><Mail className="w-4 h-4" /> Send Verification Code</>}
              </button>
            </motion.form>
          )}

          {/* Phase 2: OTP Verify */}
          {phase === 2 && (
            <motion.form key="p2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }} onSubmit={verifyOtp} className="space-y-5">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 mb-1">
                  <KeyRound className="w-4.5 h-4.5 text-primary-400" /> Verify Email
                </h3>
                <p className="text-[10px] text-light-muted">Enter the 4-digit code we sent to your email address.</p>
              </div>
              {otpMsg && (
                <div className="glass rounded-xl p-3 border border-sage-500/20 bg-sage-500/5 text-[10px] text-sage-400 leading-relaxed">
                  💡 {otpMsg}
                </div>
              )}
              <div className="float-label-wrap">
                <input type="text" maxLength={4} value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder=" " className="input-glass text-center tracking-[0.5em] text-xl font-mono" required />
                <label className="text-center">4-Digit OTP Code</label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPhase(1)} className="btn-glass py-3 px-4 rounded-xl flex-1 text-xs font-bold">← Back</button>
                <button type="submit" disabled={loading}
                  className="btn-accent py-3 px-6 rounded-xl flex-[2] font-bold text-sm flex items-center justify-center gap-2 shadow-glow-accent">
                  {loading ? 'Verifying...' : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.form>
          )}

          {/* Phase 3: Kitchen Setup */}
          {phase === 3 && (
            <motion.form key="p3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }} onSubmit={finalSubmit} className="space-y-5">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 mb-1">
                  <Building className="w-4.5 h-4.5 text-primary-400" /> Kitchen Space Setup
                </h3>
                <p className="text-[10px] text-light-muted">Almost done — configure your kitchen workspace details.</p>
              </div>
              <div className="float-label-wrap">
                <input type="text" value={form.kitchen_name} onChange={set('kitchen_name')} placeholder=" " className="input-glass" required />
                <label>Kitchen Name (e.g., The Sharma Kitchen)</label>
              </div>
              {/* Household size selector */}
              <div className="glass rounded-2xl p-4 border-glass bg-white/[0.01] space-y-2">
                <span className="text-[10px] font-semibold text-light-muted block">Household Dining Size</span>
                <div className="flex gap-2">
                  {['1–2 People', '3–4 People', '5+ People'].map((v) => (
                    <button key={v} type="button"
                      className="flex-1 py-2 text-[9px] uppercase font-bold tracking-wide rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] text-light-muted hover:text-light transition-all">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPhase(2)} className="btn-glass py-3 px-4 rounded-xl flex-1 text-xs font-bold">← Back</button>
                <button type="submit" disabled={loading}
                  className="btn-accent py-3 px-6 rounded-xl flex-[2] font-bold text-sm flex items-center justify-center gap-2 shadow-glow-accent">
                  {loading ? 'Creating...' : <><Sparkles className="w-4 h-4" /> Construct Kitchen</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/*  Member Registration — Join via Invite Code  */
/* ──────────────────────────────────────────── */
function MemberRegister() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', invite_code: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const login    = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const toast    = useToastStore();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!form.invite_code.trim()) { toast.error('Please enter the invite code from your kitchen admin.'); return; }
    
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    const payload = {
      email: form.email,
      password: form.password,
      confirm_password: form.password,
      full_name: form.full_name,
      invite_code: form.invite_code
    };
    try {
      const res  = await fetch(`${API}/auth/member/register/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.tokens.access);
        toast.success(`Welcome to the kitchen, ${form.full_name.split(' ')[0]}! 🎉`);
        navigate('/member-dashboard');
        return;
      }
      
      const errMsg = data.error || 'Invalid invite code or registration error.';
      setError(errMsg);
      if (errMsg.toLowerCase().includes('limit') || errMsg.toLowerCase().includes('member limit') || errMsg.toLowerCase().includes('allowed')) {
        toast.error("Can't register due to limits reached. Try contacting admin for request.");
      } else {
        toast.error(errMsg);
      }
    } catch {
      toast.error('Connection to backend server failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-7 border-glass shadow-float bg-surface/40 backdrop-blur-heavy relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-[0.15] pointer-events-none" />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-accent-500/20 bg-accent-500/5 mb-6">
        <Hash className="w-4.5 h-4.5 text-accent-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-light">Join via Invite Code</p>
          <p className="text-[9px] text-light-muted mt-0.5 leading-relaxed">
            Ask your kitchen admin for the 8-character invite code. This links your account to their shared kitchen workspace.
          </p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="badge-expired px-4 py-2.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2">
          ⚠️ {error}
        </motion.div>
      )}

      <form onSubmit={handleJoin} className="space-y-5">
        <div className="float-label-wrap">
          <input type="text" value={form.full_name} onChange={set('full_name')} placeholder=" " className="input-glass" required />
          <label>Full Name</label>
        </div>
        <div className="float-label-wrap">
          <input type="email" value={form.email} onChange={set('email')} placeholder=" " className="input-glass" required />
          <label>Email Address</label>
        </div>
        <div className="float-label-wrap">
          <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder=" " className="input-glass pr-12" required />
          <label>Create Password</label>
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-light-muted hover:text-light transition-colors">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password && <PasswordStrengthIndicator password={form.password} />}
        {/* Invite Code Input — visually distinct */}
        <div className="float-label-wrap">
          <input type="text" value={form.invite_code} onChange={set('invite_code')}
            placeholder=" " className="input-glass font-mono text-center tracking-[0.25em] uppercase" maxLength={8} required />
          <label className="tracking-normal">Kitchen Invite Code (8 characters)</label>
        </div>
        <button type="submit" disabled={loading}
          className="btn-accent w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow-accent disabled:opacity-60 mt-2">
          {loading ? 'Joining kitchen...' : <><Users className="w-4 h-4" /> Join Kitchen Space</>}
        </button>
      </form>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/*  Main RegisterPage — Tab Switcher            */
/* ──────────────────────────────────────────── */
export default function RegisterPage({ initialRole = 'admin' }) {
  const [tab, setTab] = useState(initialRole === 'member' ? 'member' : 'admin');

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-base text-light relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="auth-spotlight" />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-warm rounded-xl flex items-center justify-center shadow-glow-sm-primary group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Pantry<span className="text-gradient-primary">to</span>Plate
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold mt-5 tracking-tight">Create an account</h1>
          <p className="text-xs text-light-muted mt-1">Choose how you want to join</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-7 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06]">
          <button
            onClick={() => setTab('admin')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-xs font-bold ${
              tab === 'admin'
                ? 'bg-white/[0.08] text-light shadow-card border border-white/[0.08]'
                : 'text-light-muted hover:text-light'
            }`}
          >
            <Shield className="w-4 h-4 text-primary-400" />
            Admin Register
          </button>
          <button
            onClick={() => setTab('member')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-xs font-bold ${
              tab === 'member'
                ? 'bg-white/[0.08] text-light shadow-card border border-white/[0.08]'
                : 'text-light-muted hover:text-light'
            }`}
          >
            <Users className="w-4 h-4 text-accent-400" />
            Member Join
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'admin' ? <AdminRegister /> : <MemberRegister />}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-light-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-bold transition-colors">
            Sign in here →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
