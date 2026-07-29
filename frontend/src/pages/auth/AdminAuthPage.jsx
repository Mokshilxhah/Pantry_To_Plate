import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check, Mail, Loader2, KeyRound, Sparkles } from 'lucide-react';
import AuthSplitLayout from '../../components/layout/AuthSplitLayout';
import { useAuthStore } from '../../store/authStore';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';
import SubscriptionModal from '../../components/common/SubscriptionModal';
import useToastStore from '../../store/toastStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const fieldClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";
const btnPrimary = "w-full py-3 px-5 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-md";

/* ─── Login Form ─── */
function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore.getState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...data.user, role: 'admin' }, data.tokens.access);
        toast.success('Welcome back, Admin! 👋');
        navigate('/dashboard');
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
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="admin@family.com" required />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass.replace('mb-1.5', '')}>Password</label>
          <Link to="/forgot-password" className="text-xs text-green-600 font-semibold hover:underline">Forgot password?</Link>
        </div>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={fieldClass + ' pr-10'} placeholder="••••••••" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Sign In as Admin
      </button>
    </form>
  );
}

/* ─── Register Form ─── */
function AdminRegisterForm() {
  const [phase, setPhase] = useState(1); // 1=account, 2=otp, 3=workspace+plan
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', kitchen_name: '' });
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore.getState();

  const setVal = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  /* Phase 1 → Phase 2 */
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error('Please enter your full name.');
    if (!form.email.includes('@')) return toast.error('Please enter a valid email address.');
    
    const pwdVal = validatePassword(form.password);
    if (!pwdVal.isValid) {
      return toast.error(`Password Not Allowed (${pwdVal.label}): ${pwdVal.reason}`);
    }
    
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    setTimeout(() => {
      toast.info(`Verification code sent to ${form.email}. Demo code: 2026`);
      setPhase(2);
      setLoading(false);
    }, 800);
  };

  /* Phase 2 → Phase 3 */
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '2026') return toast.error('Wrong OTP. Use demo code: 2026');
    setLoading(true);
    setTimeout(() => { setPhase(3); setLoading(false); }, 400);
  };

  /* Phase 3 → Plan selection → Register */
  const handleSelectPlan = () => {
    if (!form.kitchen_name.trim()) return toast.error('Please name your kitchen workspace.');
    setShowPlanModal(true);
  };

  const handlePlanSelected = (planId, memberLimit) => {
    setSelectedPlan({ planId, memberLimit });
    setShowPlanModal(false);
    // Proceed to registration
    handleRegister(planId, memberLimit);
  };

  const handleRegister = async (planId, memberLimit) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/admin/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
          full_name: form.full_name,
          kitchen_name: form.kitchen_name,
          plan: planId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...data.user, role: 'admin', plan: planId, member_limit: memberLimit }, data.tokens.access);
        toast.success(`🏠 Kitchen "${form.kitchen_name}" created! Plan: ${planId}`);
        navigate('/dashboard');
        return;
      }
      toast.error(data.error || 'Registration failed. Please try again.');
    } catch {
      toast.error('Connection to backend server failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const PHASES = ['Account', 'Verify', 'Workspace'];

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
        {PHASES.map((p, idx) => {
          const stepNum = idx + 1;
          const isDone = phase > stepNum;
          const isActive = phase === stepNum;
          return (
            <React.Fragment key={p}>
              <div className={`flex items-center gap-1.5 ${isActive ? 'text-gray-900' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span className="text-[10px] font-bold hidden sm:inline">{p}</span>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 rounded-full ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase 1: Account Details */}
      {phase === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={form.full_name} onChange={setVal('full_name')} className={fieldClass} placeholder="e.g. Priyanshu Sharma" required />
          </div>
          <div>
            <label className={labelClass}>Email address</label>
            <input type="email" value={form.email} onChange={setVal('email')} className={fieldClass} placeholder="admin@family.com" required />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={setVal('password')} className={fieldClass + ' pr-10'} placeholder="Min. 8 characters" required />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength bar only */}
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
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Verification OTP</>}
          </button>
        </form>
      )}

      {/* Phase 2: Verify OTP */}
      {phase === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
            💡 Code sent to {form.email}. Enter demo code <strong>2026</strong> to continue.
          </div>
          <div>
            <label className={labelClass}>4-Digit Verification Code</label>
            <input
              type="text" maxLength={4} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className={fieldClass + ' text-center text-xl tracking-widest font-mono font-bold'}
              placeholder="2026" required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setPhase(1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">← Back</button>
            <button type="submit" disabled={loading} className="flex-[2] py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify &amp; Next <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      )}

      {/* Phase 3: Workspace + Plan */}
      {phase === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Family Kitchen Name</label>
            <input type="text" value={form.kitchen_name} onChange={setVal('kitchen_name')} className={fieldClass} placeholder="e.g. Sharma Family Kitchen" required />
          </div>

          {/* Plan selection teaser */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Choose a Plan</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { id: 'free', label: 'Free', sub: '2 members', color: '#6b7280' },
                { id: 'pro', label: 'Pro', sub: '5 members · ₹299/mo', color: '#6366f1' },
                { id: 'premium', label: 'Premium', sub: 'Unlimited · ₹599/mo', color: '#f59e0b' },
              ].map(p => (
                <div key={p.id} className="bg-white/70 rounded-xl p-2.5 border border-white shadow-sm">
                  <div className="text-xs font-bold" style={{ color: p.color }}>{p.label}</div>
                  <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setPhase(2)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">← Back</button>
            <button
              type="button"
              onClick={handleSelectPlan}
              disabled={loading}
              className="flex-[2] py-3 bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>🏠 Choose Plan &amp; Create Kitchen</>}
            </button>
          </div>
        </div>
      )}

      {/* Plan modal */}
      <SubscriptionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        fromSignup={true}
        onPlanSelected={handlePlanSelected}
      />
    </div>
  );
}

/* ─── Page Shell ─── */
export default function AdminAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname.includes('register');
  return (
    <AuthSplitLayout role="admin">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Welcome Admin</h1>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-8 w-fit border border-gray-200">
          <button onClick={() => navigate('/admin/login')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${!isRegister ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Sign In
          </button>
          <button onClick={() => navigate('/admin/register')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${isRegister ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Register
          </button>
        </div>

        {!isRegister ? <AdminLoginForm /> : <AdminRegisterForm />}

        {!isRegister ? (
          <Link to="/admin/register" className="text-green-600 font-bold hover:underline block text-center mt-6 text-xs">Create your kitchen space →</Link>
        ) : (
          <Link to="/admin/login" className="text-green-600 font-bold hover:underline block text-center mt-6 text-xs">Sign in as Admin →</Link>
        )}
      </div>
    </AuthSplitLayout>
  );
}
