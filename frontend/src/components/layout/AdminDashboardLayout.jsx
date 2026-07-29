import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen,
  Calendar, MessageSquare, Bell, LogOut, Menu, X,
  Sparkles, ChevronRight, Users, BarChart3, ChefHat
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Pantry', path: '/pantry' },
  { icon: Sparkles, label: 'AI Chef', path: '/ai-recipe-generator' },
  { icon: ShoppingCart, label: 'Shopping', path: '/shopping-list' },
  { icon: BookOpen, label: 'Recipes', path: '/recipes' },
  { icon: Calendar, label: 'Meal Planner', path: '/meal-planner' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function AdminDashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : 'A';

  return (
    <div className="min-h-screen flex bg-base text-light font-sans">
      {/* Sidebar - Desktop */}
      <aside className="flex max-lg:hidden flex-col w-64 h-screen sticky top-0 bg-surface/50 backdrop-blur-xl border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-2 rounded-xl flex items-center justify-center shadow-md shadow-[#E8956D]/15">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">Pantry to Plate</div>
              <div className="text-xs text-primary-400">Admin Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {ADMIN_NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-primary text-white shadow-glow-primary'
                    : 'text-light-muted hover:bg-white/5 hover:text-light'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 glass rounded-xl mb-3">
            <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center font-bold text-white text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.full_name}</div>
              <div className="text-xs text-light-muted truncate">Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-error/20 bg-error/5 hover:bg-error/15 text-error text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-50 bg-surface border-r border-white/10 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-2 rounded-xl flex items-center justify-center shadow-md shadow-[#E8956D]/15">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">PantrytoPlate</div>
                    <div className="text-xs text-primary-400">Admin</div>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {ADMIN_NAV.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-primary text-white'
                          : 'text-light-muted hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-surface/30 backdrop-blur-xl border-b border-white/10">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex max-md:hidden items-center gap-2 text-sm">
                <span className="text-light-muted">Admin</span>
                <ChevronRight className="w-4 h-4 text-light-muted" />
                <span className="font-bold">{title || 'Dashboard'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/alerts" className="p-2 rounded-xl glass hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-400" />
              </Link>
              <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center font-bold text-white text-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
