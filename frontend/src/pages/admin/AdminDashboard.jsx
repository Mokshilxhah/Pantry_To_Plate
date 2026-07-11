import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Coins, 
  Plus, 
  ShoppingCart, 
  Users, 
  Coffee, 
  Sun, 
  Moon, 
  ChevronRight,
  Loader2,
  CalendarDays
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore.getState();

  const getTopAlertConfig = (severity = 'info') => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          wrapperCls: 'bg-red-50/80 border-red-200 shadow-red-100',
          dotCls: 'bg-red-600',
          pingCls: 'bg-red-400',
          badgeText: 'Critical Alert',
          badgeTextCls: 'text-red-750',
          btnCls: 'bg-red-600 hover:bg-red-700 shadow-red-100',
          btnText: 'Fix Alert'
        };
      case 'warning':
      case 'attention':
        return {
          wrapperCls: 'bg-amber-50/80 border-amber-200 shadow-amber-100',
          dotCls: 'bg-amber-500',
          pingCls: 'bg-amber-400',
          badgeText: 'Warning Attention',
          badgeTextCls: 'text-amber-750',
          btnCls: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
          btnText: 'Review Alert'
        };
      case 'info':
      default:
        return {
          wrapperCls: 'bg-blue-50/80 border-blue-200 shadow-blue-100',
          dotCls: 'bg-blue-500',
          pingCls: 'bg-blue-400',
          badgeText: 'Kitchen Notification',
          badgeTextCls: 'text-blue-750',
          btnCls: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
          btnText: 'View Alerts'
        };
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API}/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          toast.error('Failed to load dashboard statistics.');
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        toast.error('Connection to server failed.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, toast]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="One glance overview of your kitchen">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Gathering kitchen details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle case where fetch failed or returned empty
  const stats = data || {
    totalItems: 0,
    expiringItems: 0,
    lowStockItems: 0,
    budget: { limit: 5000, spent: 0 },
    topAlert: null,
    todayMenu: { breakfast: 'None planned', lunch: 'None planned', dinner: 'None planned' },
    familyMembers: [],
    buyListCount: 0
  };

  // Sync budget from local storage
  const uid = user?.id || 'default';
  const expKey = `kitchenOS_budget_expenses_${uid}`;
  const limKey = `kitchenOS_budget_limits_${uid}`;

  let localLimit = 5000;
  let localSpent = 0;

  try {
    const l = localStorage.getItem(limKey);
    const e = localStorage.getItem(expKey);
    if (l) {
      const parsedL = JSON.parse(l);
      localLimit = Object.values(parsedL).reduce((s, v) => s + parseFloat(v || 0), 0);
    } else if (stats.budget) {
      localLimit = stats.budget.limit;
    }
    
    if (e) {
      const parsedE = JSON.parse(e);
      localSpent = parsedE.reduce((s, v) => s + parseFloat(v.amount || 0), 0);
    } else if (stats.budget) {
      localSpent = stats.budget.spent;
    }
  } catch (err) {
    console.error("Error parsing local budget on dashboard:", err);
  }

  const budgetLeft = localLimit - localSpent;
  const budgetPercentage = localLimit > 0 ? Math.min(Math.round((localSpent / localLimit) * 100), 100) : 0;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Invite code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const inviteCode = data?.inviteCode || user?.invite_code || 'SHAR7821';

  return (
    <DashboardLayout title="Dashboard" subtitle={`Managing ${user?.kitchen_name || 'your workspace'}`}>
      <div className="-mx-4 -my-6 px-4 sm:px-6 lg:px-8 py-8">
        
        {stats.topAlert && (() => {
          const config = getTopAlertConfig(stats.topAlert.severity);
          return (
            <div className={`mb-8 border rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse max-w-7xl mx-auto ${config.wrapperCls}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingCls}`}></span>
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${config.dotCls}`}></span>
                </span>
                <div>
                  <p className={`text-[10px] font-black tracking-wider uppercase ${config.badgeTextCls}`}>{config.badgeText}</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">{stats.topAlert.title}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/alerts')} 
                className={`py-2 px-4 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${config.btnCls}`}
              >
                {config.btnText}
              </button>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
          
          {/* LEFT COLUMN: Original structure, size 8/12 */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 2x2 Stats Grid - Highly Visible, Vibrant Accent Fills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="clean-card-dark p-4.5 flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-3xl font-extrabold text-white tracking-tight">{stats.totalItems}</span>
                    <h3 className="text-[9px] font-bold text-stone-300 uppercase tracking-wider mt-0.5">Total Items</h3>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
                    <Package className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

              {/* Stat 2: Expiring Items (Solid Mint Green Card matching reference current balance) */}
              <div className="clean-card-green-inner p-4.5 flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.expiringItems}</span>
                    <h3 className="text-[9px] font-black text-emerald-900 uppercase tracking-wider mt-0.5">Expiry Alerts</h3>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-white/30 text-emerald-950 flex items-center justify-center shrink-0 relative">
                    {stats.expiringItems > 0 && (
                      <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-650"></span>
                      </span>
                    )}
                    <AlertTriangle className="w-4.5 h-4.5 text-emerald-950" />
                  </div>
                </div>
              </div>

              {/* Stat 3: Low Stocks (Solid Amber Card matching fruits category) */}
              <div className="bg-[#FEF7E0] border border-amber-250/40 text-[#B06000] rounded-3xl p-4.5 flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-extrabold tracking-tight text-[#B06000]">{stats.lowStockItems}</span>
                    <h3 className="text-[9px] font-bold text-[#B06000] uppercase tracking-wider mt-0.5 opacity-80">Low Stock</h3>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-white/50 text-[#B06000] flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4.5 h-4.5 text-[#B06000]" />
                  </div>
                </div>
              </div>

              {/* Stat 4: Monthly Budget (Solid Lavender Card matching forecast card) */}
              <div className="clean-card-purple-inner p-4.5 flex flex-col justify-between h-[135px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-indigo-950">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-black text-indigo-950 tracking-tight">₹{budgetLeft > 0 ? budgetLeft : 0} Left</span>
                    <h3 className="text-[9px] font-black text-indigo-900 uppercase tracking-wider mt-0.5">Monthly Budget</h3>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-white/20 text-indigo-900 flex items-center justify-center shrink-0">
                    <Coins className="w-4.5 h-4.5 text-indigo-900" />
                  </div>
                </div>
                
                {/* Thick spent slider track with circular marker node */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-900/10 rounded-full h-2 relative flex items-center mt-1">
                    <div 
                      className="h-full bg-slate-900 rounded-full" 
                      style={{ width: `${budgetPercentage}%` }} 
                    />
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow-sm -translate-x-1/2 transition-all duration-300"
                      style={{ left: `${budgetPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[7px] font-black uppercase text-indigo-900 opacity-75">
                    <span>Spent: {budgetPercentage}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* PRIMARY ACTION - Add Items Button (Compact) */}
            <button 
              onClick={() => navigate('/pantry')} 
              className="w-full bg-white hover:bg-stone-50 border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow transition-all group flex items-center justify-between text-left cursor-pointer"
            >
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Add & Manage Kitchen Inventory</h4>
                <p className="text-slate-400 text-xs mt-0.5">Quickly restock your pantry shelves or review expiring lists</p>
              </div>
              <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4.5 h-4.5 text-white" />
              </div>
            </button>

            {/* Groceries Buy List Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[115px]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buy List</h4>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {stats.buyListCount > 0 ? `${stats.buyListCount} supplies needed` : 'All items in stock'}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/shopping-list')}
                  className="py-2 px-3.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  View Buy List
                </button>
              </div>
            </div>

            {/* Family Members Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Household</h4>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">Members listed</p>
                </div>
                
                {/* Overlapping member circles */}
                <div className="flex -space-x-2 overflow-hidden">
                  {stats.familyMembers.slice(0, 3).map((m, i) => (
                    <div 
                      key={m.id} 
                      className={`w-7.5 h-7.5 rounded-full border-2 border-white flex items-center justify-center font-extrabold text-[10px] text-white shadow-sm shrink-0 bg-gradient-to-br ${i === 0 ? 'from-orange-400 to-amber-500' : i === 1 ? 'from-emerald-400 to-teal-500' : 'from-indigo-400 to-purple-500'}`}
                    >
                      {m.fullName.charAt(0)}
                    </div>
                  ))}
                  {stats.familyMembers.length > 3 && (
                    <div className="w-7.5 h-7.5 rounded-full border-2 border-white bg-slate-200 text-slate-650 flex items-center justify-center font-black text-[9px] shadow-sm shrink-0">
                      +{stats.familyMembers.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Inner capsule showing Invite code */}
              <div 
                onClick={() => handleCopyCode(inviteCode)}
                className="py-2.5 px-4 bg-stone-150/70 rounded-full flex items-center justify-between text-xs text-stone-600 font-extrabold hover:bg-stone-200/50 transition-colors cursor-pointer select-none border border-stone-200/20"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full uppercase font-black">Invite Code</span>
                  <span className="font-mono tracking-wider text-stone-855">{inviteCode}</span>
                </div>
                <div className="text-[10px] text-orange-650 flex items-center gap-0.5 hover:underline font-extrabold">
                  {copied ? 'Copied' : 'Copy'} →
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Today's Menu Timeline, size 4/12 */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Today's Menu Card using the vertical timeline structure from reference forecast */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex flex-col mb-4">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Menu plan</h4>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">Today's menu</p>
                </div>
                
                {/* Vertical Timeline */}
                <div className="flex gap-4 relative py-2 min-h-[220px]">
                  {/* Vertical timeline track line */}
                  <div className="absolute left-[5px] top-6 bottom-6 clean-timeline-track" />
                  
                  <div className="space-y-6 relative z-10 flex flex-col justify-between w-full">
                    {/* Breakfast item */}
                    <div className="flex items-start gap-3">
                      <div className="clean-timeline-dot clean-timeline-dot-active mt-1 shrink-0" />
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Breakfast</p>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[170px] mt-0.5" title={stats.todayMenu.breakfast}>
                          {stats.todayMenu.breakfast}
                        </h4>
                      </div>
                    </div>

                    {/* Lunch item */}
                    <div className="flex items-start gap-3">
                      <div className="clean-timeline-dot mt-1 shrink-0" />
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Lunch</p>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[170px] mt-0.5" title={stats.todayMenu.lunch}>
                          {stats.todayMenu.lunch}
                        </h4>
                      </div>
                    </div>

                    {/* Dinner item */}
                    <div className="flex items-start gap-3">
                      <div className="clean-timeline-dot mt-1 shrink-0" />
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Dinner</p>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[170px] mt-0.5" title={stats.todayMenu.dinner}>
                          {stats.todayMenu.dinner}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <button 
                  onClick={() => navigate('/meals/calendar')}
                  className="text-[10px] font-extrabold text-orange-650 hover:text-orange-855 flex items-center transition-colors group cursor-pointer"
                >
                  Modify menu schedule <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Pantry Freshness Gauge Card (Slightly smaller, fits below Timeline on right column) */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
              {(() => {
                const freshCount = Math.max(0, stats.totalItems - stats.expiringItems);
                const freshPercentage = stats.totalItems > 0 ? Math.round((freshCount / stats.totalItems) * 100) : 100;
                
                return (
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Freshness</h4>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{freshPercentage}% Perfect</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Stored items are fresh</p>
                    </div>
                    
                    {/* SVG Gauge */}
                    <div className="relative w-28 h-14 flex items-end justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <defs>
                          <pattern id="gauge-stripes-small" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(21, 58, 27, 0.2)" strokeWidth="1.5" />
                          </pattern>
                        </defs>
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(21, 58, 27, 0.08)" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gauge-stripes-small)" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={Math.PI * 40}
                          strokeDashoffset={Math.PI * 40 * (1 - freshPercentage / 100)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
