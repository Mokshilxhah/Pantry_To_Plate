import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  ShoppingCart, 
  ChevronRight,
  Loader2,
  MessageSquare
} from 'lucide-react';
import useToastStore from '../../store/toastStore';
import chatService from '../../services/chatService';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
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

    const fetchMessages = async () => {
      try {
        const msgs = await chatService.getMessages(token);
        // Take the latest 3 messages
        setMessages(msgs.slice(-3).reverse());
      } catch (err) {
        console.error('Error fetching chat messages for member:', err);
      }
    };

    if (token) {
      fetchDashboardData();
      fetchMessages();
    }
  }, [token, toast]);

  if (loading) {
    return (
      <DashboardLayout title="Member Portal" subtitle="One glance overview of your kitchen">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
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
    topAlert: null,
    todayMenu: { breakfast: 'None planned', lunch: 'None planned', dinner: 'None planned' },
    familyMembers: [],
    buyListCount: 0
  };

  return (
    <DashboardLayout title="Member Portal" subtitle={`Collaborating in ${user?.kitchen_name || 'your workspace'}`}>
      <div className="-mx-4 -my-6 px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Notification banner if critical alert exists */}
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
          
          {/* LEFT COLUMN: Stats (2x2 Grid) -> Open Pantry -> Chat Snippet -> Family Members */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 2x2 Stats Bento Grid */}
            <div className="grid grid-cols-2 gap-5">
              
              {/* Stat 1: Total Items */}
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

              {/* Stat 2: Expiring Items */}
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

              {/* Stat 3: Low Stocks */}
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

              {/* Stat 4: Buy List Items */}
              <div className="bg-[#EEF2FF] border border-indigo-100 text-indigo-900 rounded-3xl p-4.5 flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-extrabold tracking-tight text-indigo-900">{stats.buyListCount} Items</span>
                    <h3 className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider mt-0.5">Needed in Buy List</h3>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-white/50 text-indigo-900 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4.5 h-4.5 text-indigo-900" />
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
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Open Pantry Space &amp; Inventory</h4>
                <p className="text-slate-400 text-xs mt-0.5">Review what items are currently in stock or check expiry warnings</p>
              </div>
              <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4.5 h-4.5 text-white" />
              </div>
            </button>

            {/* Family Chat Snippet */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Discussion</h4>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">Family Chat Room</p>
                </div>
                <button 
                  onClick={() => navigate('/chat')}
                  className="py-2 px-3.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all shadow cursor-pointer text-white"
                >
                  Open Chat
                </button>
              </div>

              {/* Chat snippet */}
              <div className="space-y-3 max-h-[160px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">No messages yet. Send a note to the family!</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="flex gap-2.5 items-start text-xs">
                      <div className="w-6 h-6 rounded-full bg-gradient-accent text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                        {m.sender_name ? m.sender_name.charAt(0) : 'U'}
                      </div>
                      <div className="bg-stone-50 border border-slate-100 rounded-2xl px-3.5 py-2 flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-slate-700">{m.sender_name || 'Member'}</span>
                          <span className="text-[8px] text-slate-400 font-semibold">{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <p className="text-slate-500 truncate">{m.message_type === 'poll' ? `📊 Poll: ${m.poll_question}` : m.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Family members Card */}
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
              
              <div className="flex justify-end pt-1">
                <button 
                  onClick={() => navigate('/settings/profile')}
                  className="text-[10px] font-extrabold text-orange-650 hover:text-orange-855 flex items-center transition-colors group cursor-pointer"
                >
                  View Household Members <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Today's Menu Timeline */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Today's Menu Card using the vertical timeline structure */}
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
                <div className="w-full py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] font-semibold text-gray-400 flex items-center justify-center gap-1.5 select-none cursor-not-allowed">
                  🍽️ Meal Planner (Admin Configured)
                </div>
              </div>
            </div>

            {/* Pantry Freshness Gauge Card */}
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


