import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen,
  Calendar, MessageSquare, Bell, LogOut, Menu, X,
  Sparkles, ChevronRight, Users, BarChart3, CreditCard, Globe, Lock, ChefHat
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import SubscriptionModal from '../common/SubscriptionModal';

// Navigation items based on role
const getNavItems = (role) => {
  const base = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: role === 'admin' ? '/dashboard' : '/member-dashboard', roles: ['admin', 'member'] },
    { icon: Package,         label: 'Pantry Space',  path: '/pantry',        roles: ['admin', 'member'] },
    {icon: ShoppingCart,    label: 'Supply List',   path: '/shopping-list', roles: ['admin', 'member'] },
    {icon: MessageSquare,   label: 'Family Chat',   path: '/chat',          roles: ['admin', 'member'] },
    {icon: Bell,            label: 'Alert Center',  path: '/alerts',        roles: ['admin', 'member'] },
    {icon: BarChart3,       label: 'Budget',        path: '/budget',        roles: ['admin'] },
  ];

  const adminOnly = [
    { icon: BookOpen,     label: 'Recipe Book',   path: '/recipes',      roles: ['admin'] },
    { icon: Sparkles,     label: 'AI Generator',  path: '/ai-recipe-generator', roles: ['admin'] },
    { icon: Calendar,     label: 'Meal Planner',  path: '/meal-planner', roles: ['admin'] },
    { icon: CreditCard,   label: 'Billing',       path: '/billing',      roles: ['admin'] },
  ];

  return [...base, ...adminOnly].filter(item => item.roles.includes(role));
};

export default function DashboardLayout({ children, title }) {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, role, plan, memberLimit, logout } = useAuthStore();
  const toast = useToastStore.getState();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully. See you soon!');
    navigate('/');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'K';

  const NAV = getNavItems(role || 'member');
  const isExpanded = sidebarHovered;

  // Plan badge color
  const planColor = { free: '#6b7280', pro: '#6366f1', premium: '#f59e0b' }[plan] || '#6b7280';
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free';

  return (
    <div className="min-h-screen flex bg-base text-light font-sans relative overflow-hidden">

      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="dot-grid absolute inset-0" />
      </div>

      {/* Synchronized layout spacer for fixed sidebar */}
      <motion.div
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="max-lg:hidden shrink-0"
      />

      <motion.aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="flex max-lg:hidden flex-col h-screen fixed top-0 left-0 z-40 sidebar-dark border-r shrink-0 overflow-hidden select-none"
      >
        <div className="sidebar-glow-line" />

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 overflow-hidden shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-1.5 rounded-lg flex items-center justify-center shadow-md shadow-[#E8956D]/10 shrink-0">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-extrabold tracking-tight text-sm text-white">
                Pantry <span className="text-[#E8956D]">to</span> Plate
              </motion.span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto hide-scrollbar pt-6">
          {NAV.map(item => {
            const active = location.pathname === item.path;
            const isBilling = item.path === '/billing';
            const locked = (plan === 'free' && ['/recipes', '/meal-planner', '/budget', '/ai-recipe-generator'].includes(item.path)) ||
                           (plan === 'pro' && ['/ai-recipe-generator'].includes(item.path));

            const content = (
              <>
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${!isExpanded ? 'scale-110' : ''} ${locked ? 'opacity-50' : ''}`}>
                  <item.icon className="w-4.5 h-4.5" style={isBilling ? { color: planColor } : {}} />
                </div>
                {isExpanded && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex-1 text-xs font-semibold tracking-wide ml-2 ${locked ? 'text-light-muted opacity-50 font-normal' : ''}`}>
                    {item.label}
                    {isBilling && (
                      <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${planColor}20`, color: planColor }}>
                        {planLabel}
                      </span>
                    )}
                  </motion.span>
                )}
                {locked && isExpanded && (
                  <Lock className="w-3.5 h-3.5 text-amber-500/80 shrink-0 ml-1" />
                )}
                {active && isExpanded && !locked && <motion.div layoutId="sidebar-indicator" className="w-1.5 h-1.5 rounded-full bg-primary-400 ml-1" />}
              </>
            );

            if (locked) {
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (role === 'admin') {
                      setShowUpgradeModal(true);
                    } else {
                      toast.error('Subscription changes are restricted to Kitchen Admin accounts.');
                    }
                  }}
                  className={`nav-item flex items-center w-full text-left ${!isExpanded ? 'justify-center px-0' : ''} ${isBilling ? 'border-t border-white/[0.05] mt-2 pt-3' : ''}`}
                  title={!isExpanded ? `${item.label} (Upgrade to unlock)` : 'Upgrade to unlock'}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item flex items-center ${active ? 'active' : ''} ${!isExpanded ? 'justify-center px-0' : ''} ${isBilling ? 'border-t border-white/[0.05] mt-2 pt-3' : ''}`}
                title={!isExpanded ? item.label : undefined}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 rounded-xl p-2 bg-slate-50 border border-slate-100 ${!isExpanded ? 'justify-center p-1' : ''}`}>
            <Link to="/settings/profile" className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-glow-sm-accent cursor-pointer hover:opacity-80 transition-opacity">
                {initials}
              </div>
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-xs font-bold truncate text-light">{user?.full_name || 'Kitchen Master'}</p>
                  <p className="text-[10px] text-light-muted truncate">{user?.kitchen_name || 'Shared Home'}</p>
                </motion.div>
              )}
            </Link>
            {isExpanded && (
              <button onClick={handleLogout} className="text-light-muted hover:text-error transition-colors p-1" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-50 sidebar-dark border-r flex flex-col p-4 shadow-float lg:hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-1.5 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold tracking-tight text-sm text-slate-100">
                    Pantry<span className="text-[#E8956D]">to</span>Plate
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <nav className="flex-1 space-y-2">
                {NAV.map(item => {
                  const active = location.pathname === item.path;
                  const isBilling = item.path === '/billing';
                  const locked = (plan === 'free' && ['/recipes', '/meal-planner', '/budget', '/ai-recipe-generator'].includes(item.path)) ||
                                 (plan === 'pro' && ['/ai-recipe-generator'].includes(item.path));

                  const content = (
                    <>
                      <item.icon className={`w-5 h-5 shrink-0 ${locked ? 'opacity-50' : ''}`} style={isBilling ? { color: planColor } : {}} />
                      <span className={`text-xs font-semibold tracking-wide flex-1 ${locked ? 'text-light-muted opacity-50 font-normal' : ''}`}>
                        {item.label}
                        {isBilling && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${planColor}20`, color: planColor }}>{planLabel}</span>}
                      </span>
                      {locked && <Lock className="w-4 h-4 text-amber-500/80 shrink-0" />}
                    </>
                  );

                  if (locked) {
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          setMobileOpen(false);
                          if (role === 'admin') {
                            setShowUpgradeModal(true);
                          } else {
                            toast.error('Subscription changes are restricted to Kitchen Admin accounts.');
                          }
                        }}
                        className={`nav-item flex items-center w-full gap-3 px-3 py-2.5 rounded-xl ${isBilling ? 'border-t border-white/[0.05] mt-2 pt-3' : ''}`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl ${active ? 'active' : ''} ${isBilling ? 'border-t border-white/[0.05] mt-2 pt-3' : ''}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <Link to="/settings/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl mb-3 hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 bg-gradient-accent rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold truncate text-light">{user?.full_name || 'Kitchen Master'}</p>
                    <p className="text-[10px] text-light-muted truncate">{user?.email}</p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-error/20 bg-error/5 hover:bg-error/15 text-error text-xs font-bold transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 z-10 relative">

        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-surface/30 backdrop-blur-heavy border-b border-slate-100">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Menu className="w-5 h-5 text-light" />
              </button>
              <div className="flex max-md:hidden items-center gap-2 text-xs font-semibold text-light-muted">
                <span>Kitchen Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-light font-bold">{title || 'Dashboard'}</span>
              </div>
            </div>

            {title && <h2 className="md:hidden font-bold text-sm tracking-tight">{title}</h2>}

            <div className="flex items-center gap-3">
              {/* Plan badge in topbar */}
              <span className="hidden sm:inline text-[10px] font-bold px-3 py-1.5 rounded-full border" style={{ background: `${planColor}15`, color: planColor, borderColor: `${planColor}30` }}>
                {planLabel} Plan
              </span>

              {/* Alert Center */}
              <Link to="/alerts" className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors relative" title="Kitchen Alerts">
                <Bell className="w-4.5 h-4.5 text-light-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-400 shadow-glow-sm-primary" />
              </Link>

              {/* Profile initials */}
              <Link to="/settings/profile" className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center font-bold text-xs text-white shadow-glow-sm-accent cursor-pointer border border-slate-200 hover:opacity-90 transition-opacity">
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto clean-dashboard-wrapper">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="h-full">
            {children}
          </motion.div>
        </main>
      </div>

      {/* Subscription Upgrade Modal */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
