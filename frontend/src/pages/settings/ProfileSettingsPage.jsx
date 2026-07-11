import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  Lock, 
  Shield, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  Sparkles,
  Building,
  KeyRound
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const DIET_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'nonveg', label: 'Non-Vegetarian' },
  { value: 'jain', label: 'Jain' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggitarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'diabetic', label: 'Diabetic' }
];

const COMMON_ALLERGIES = ['Nut', 'Dairy', 'Gluten', 'Soy', 'Shellfish'];

export default function ProfileSettingsPage() {
  const { token, updateUser } = useAuthStore();
  const toast = useToastStore.getState();

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    role: '',
    kitchen_name: '',
    invite_code: '',
    subscription_plan: 'free',
    diet_type: [],
    allergies: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const [customAllergy, setCustomAllergy] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/auth/profile/update/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setProfile({
          full_name: result.user.full_name || '',
          email: result.user.email || '',
          role: result.user.role || '',
          kitchen_name: result.user.kitchen_name || '',
          invite_code: result.user.invite_code || '',
          subscription_plan: result.user.subscription_plan || 'free',
          diet_type: result.user.diet_type || [],
          allergies: result.user.allergies || []
        });
      } else {
        toast.error('Failed to load profile details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profile.full_name.trim()) {
      return toast.error('Full Name is required.');
    }
    
    if (isAdmin && !otpCode) {
      setSaving(true);
      try {
        const res = await fetch(`${API}/auth/profile/request-otp/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          toast.success('OTP sent to your email! (Dev Mock OTP: ' + data.otp + ')');
          setShowOtpModal(true);
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to generate OTP.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to request OTP verification.');
      } finally {
        setSaving(false);
      }
      return;
    }
    
    setSaving(true);
    setOtpLoading(true);
    try {
      const res = await fetch(`${API}/auth/profile/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name.trim(),
          kitchen_name: profile.kitchen_name.trim(),
          diet_type: profile.diet_type,
          allergies: profile.allergies,
          otp: otpCode
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        updateUser(result.user);
        toast.success('Preferences and profile saved successfully!');
        setShowOtpModal(false);
        setOtpCode('');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to update preferences.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving profile.');
    } finally {
      setSaving(false);
      setOtpLoading(false);
    }
  };

  const handleDietToggle = (val) => {
    setProfile(prev => {
      const existing = prev.diet_type || [];
      const updated = existing.includes(val)
        ? existing.filter(v => v !== val)
        : [...existing, val];
      return { ...prev, diet_type: updated };
    });
  };

  const handleAllergyToggle = (val) => {
    setProfile(prev => {
      const existing = prev.allergies || [];
      const updated = existing.includes(val)
        ? existing.filter(v => v !== val)
        : [...existing, val];
      return { ...prev, allergies: updated };
    });
  };

  const handleAddCustomAllergy = (e) => {
    e.preventDefault();
    const val = customAllergy.trim();
    if (!val) return;
    
    if (profile.allergies.some(a => a.toLowerCase() === val.toLowerCase())) {
      toast.warning('Allergy option already listed.');
      return;
    }
    
    setProfile(prev => ({ ...prev, allergies: [...prev.allergies, val] }));
    setCustomAllergy('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all password fields.');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    
    setPwdSaving(true);
    try {
      const res = await fetch(`${API}/auth/password/change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });
      
      if (res.ok) {
        toast.success('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Old password incorrect or invalid change.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error changing password.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile & Preferences" subtitle="Manage dietary requirements, restrictions, and account details">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Opening registry card...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = profile.role === 'admin';

  return (
    <DashboardLayout title="Profile &amp; Preferences" subtitle="Manage dietary requirements, restrictions, and account details">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Section 1: Account Profile Details */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
              <div className="p-2.5 bg-slate-50 text-slate-800 rounded-2xl"><User className="w-5 h-5" /></div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Account Credentials</h3>
                <p className="text-[11px] text-slate-400 font-bold">Standard kitchen identity profile info</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={profile.full_name} 
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full text-sm border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-slate-400 bg-stone-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full text-sm border border-slate-200/80 rounded-2xl p-3 bg-stone-100/50 text-stone-500 font-medium cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Role</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200/50 rounded-2xl">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 capitalize">{profile.role}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kitchen Workspace</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile.kitchen_name} 
                    onChange={e => setProfile({ ...profile, kitchen_name: e.target.value })}
                    disabled={!isAdmin}
                    placeholder="Kitchen name"
                    className={`w-full text-sm border border-slate-200 rounded-2xl p-3 pr-10 focus:outline-none focus:border-slate-400 ${!isAdmin ? 'bg-stone-100/50 text-stone-500 cursor-not-allowed' : 'bg-stone-50/20'}`}
                  />
                  <Building className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-amber-50/40 border border-amber-200/50 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Subscription Membership</h5>
                    <p className="text-base font-extrabold text-slate-800 capitalize mt-1">{profile.subscription_plan} Plan</p>
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold mt-2">Modify or upgrade details in Billings tab</p>
                </div>

                <div className="p-4 bg-indigo-50/40 border border-indigo-200/50 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Household Invitation Code</h5>
                    <p className="text-base font-mono font-extrabold tracking-wide text-slate-850 mt-1">{profile.invite_code || 'SHAR7821'}</p>
                  </div>
                  <p className="text-[10px] text-indigo-600 font-bold mt-2">Provide this token to members to join your workspace</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Dietary Preferences & Allergy Profiles */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-2xl"><Sparkles className="w-5 h-5" /></div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Dietary Profile</h3>
                <p className="text-[11px] text-emerald-700 font-bold">Restrict AI recipes and ingredients mapping based on exclusions</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Diet Types</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIET_OPTIONS.map(opt => {
                  const selected = (profile.diet_type || []).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleDietToggle(opt.value)}
                      className={`p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        selected 
                          ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800 shadow-sm shadow-emerald-50' 
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {selected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Allergies &amp; Health Concerns</h4>

              {/* Multi checkboxes for common ones */}
              <div className="flex flex-wrap gap-2.5">
                {COMMON_ALLERGIES.map(alg => {
                  const selected = (profile.allergies || []).includes(alg);
                  return (
                    <button
                      key={alg}
                      type="button"
                      onClick={() => handleAllergyToggle(alg)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        selected
                          ? 'bg-red-50/40 border-red-300 text-red-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-stone-50'
                      }`}
                    >
                      {alg} Allergy
                    </button>
                  );
                })}
              </div>

              {/* List of custom additions with delete tag option */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Custom Excluded Item / Allergy</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={e => setCustomAllergy(e.target.value)}
                    placeholder="e.g. Mushroom, Peanut, Honey"
                    className="max-w-xs text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-slate-400 bg-stone-50/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Render active non-common ones as tags */}
                {profile.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.allergies
                      .filter(a => !COMMON_ALLERGIES.includes(a))
                      .map(a => (
                        <span key={a} className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-stone-50 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                          {a}
                          <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, allergies: prev.allergies.filter(item => item !== a) }))}
                            className="text-stone-400 hover:text-stone-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Footer submit action inside the first form */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Section 3: Password Update Section */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm mt-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
            <div className="p-2.5 bg-slate-50 text-slate-800 rounded-2xl"><KeyRound className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Change Password</h3>
              <p className="text-[11px] text-slate-400 font-bold">Ensure security by updating your account credentials</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-slate-400 bg-stone-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full text-sm border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-slate-400 bg-stone-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Retype password"
                  className="w-full text-sm border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-slate-400 bg-stone-50/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={pwdSaving}
                className="py-2.5 px-6 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {pwdSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Shield className="w-5 h-5 animate-pulse" /></div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Admin OTP Verification</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Enter the 6-digit OTP code sent to your mail</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OTP Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-orange-400 bg-stone-50/20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowOtpModal(false); setOtpCode(''); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSaveProfile()}
                disabled={otpLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <span>Verify &amp; Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
