import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Hash, Users, KeyRound } from 'lucide-react';
import AuthSplitLayout from '../../components/layout/AuthSplitLayout';
import { useAuthStore } from '../../store/authStore';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';
import useToastStore from '../../store/toastStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const fieldClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all placeholder-gray-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";
const btnPrimary = "w-full py-3 px-5 rounded-xl bg-amber-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-60 shadow-md mt-1";

/* ─── Login Form ─── */
function MemberLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore.getState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Invite code is required to log in.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/member/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, invite_code: inviteCode.toUpperCase().trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...data.user, role: 'member' }, data.tokens.access);
        toast.success('Welcome back! 👋');
        navigate('/member-dashboard');
        return;
      }
      toast.error(data.error || 'Invalid credentials. Please try again.');
    } catch {
      toast.error('Connection to backend server failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className={labelClass}>Email address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="member@family.com" required />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass.replace('mb-1.5', '')}>Password</label>
          <Link to="/forgot-password" className="text-xs text-amber-600 font-semibold hover:underline">Forgot password?</Link>
        </div>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={fieldClass + ' pr-10'} placeholder="••••••••" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Family Invite Code</label>
        <input
          type="text"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value.toUpperCase().slice(0, 8))}
          className={fieldClass + ' font-mono tracking-widest text-center uppercase font-bold'}
          placeholder="XXXXXXXX"
          maxLength={8}
          required
        />
      </div>

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Sign In to Member Portal
      </button>
    </form>
  );
}

/* ─── Register Form ─── */
function MemberRegisterForm() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', invite_code: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore.getState();

  const setVal = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invite_code.trim()) return toast.error('Please enter the invite code from your admin.');
    
    const pwdVal = validatePassword(form.password);
    if (!pwdVal.isValid) {
      return toast.error(`Password Not Allowed (${pwdVal.label}): ${pwdVal.reason}`);
    }
    
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/member/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
          full_name: form.full_name,
          invite_code: form.invite_code.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...data.user, role: 'member' }, data.tokens.access);
        toast.success(`Welcome to the kitchen, ${form.full_name.split(' ')[0]}! 🎉`);
        navigate('/member-dashboard');
        return;
      }
      const errMsg = data.error || 'Failed to join kitchen. Check your invite code.';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <Hash className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed font-semibold">
          Ask your household administrator for the 8-character invite code.
        </p>
      </div>

      <div>
        <label className={labelClass}>Full Name</label>
        <input type="text" value={form.full_name} onChange={setVal('full_name')} className={fieldClass} placeholder="e.g. Mukul Sharma" required />
      </div>

      <div>
        <label className={labelClass}>Email address</label>
        <input type="email" value={form.email} onChange={setVal('email')} className={fieldClass} placeholder="member@family.com" required />
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={setVal('password')} className={fieldClass + ' pr-10'} placeholder="Min. 8 characters" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {/* Only one PasswordStrengthIndicator — on the password field only */}
        {form.password && <PasswordStrengthIndicator password={form.password} />}
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <input type="password" value={form.confirmPassword} onChange={setVal('confirmPassword')} className={fieldClass} placeholder="Re-enter password" required />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="text-[11px] text-red-500 mt-1 font-semibold">Passwords don't match</p>
        )}
        {form.confirmPassword && form.password === form.confirmPassword && form.password && (
          <p className="text-[11px] text-green-600 mt-1 font-semibold">✓ Passwords match</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Workspace Invite Code</label>
        <input
          type="text"
          value={form.invite_code}
          onChange={e => setForm(f => ({ ...f, invite_code: e.target.value.toUpperCase().slice(0, 8) }))}
          className={fieldClass + ' font-mono tracking-widest text-center uppercase font-bold'}
          placeholder="XXXXXXXX"
          maxLength={8}
          required
        />
      </div>

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Users className="w-4 h-4" /> Join Household Workspace</>}
      </button>
    </form>
  );
}

/* ─── Page Shell ─── */
export default function MemberAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname.includes('register');

  return (
    <AuthSplitLayout role="member">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Welcome Member</h1>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-8 w-fit border border-gray-200">
          <button onClick={() => navigate('/member/login')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${!isRegister ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Sign In
          </button>
          <button onClick={() => navigate('/member/register')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isRegister ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Register
          </button>
        </div>

        {!isRegister ? <MemberLoginForm /> : <MemberRegisterForm />}

        {!isRegister ? (
          <Link to="/member/register" className="text-amber-600 font-bold hover:underline block text-center mt-6 text-xs">Join via Invite Code →</Link>
        ) : (
          <Link to="/member/login" className="text-amber-600 font-bold hover:underline block text-center mt-6 text-xs">Sign in as Member →</Link>
        )}
      </div>
    </AuthSplitLayout>
  );
}
