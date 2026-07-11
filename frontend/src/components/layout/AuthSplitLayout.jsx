import React from 'react';
import { ChefHat, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

function AuthRightPanel({ role = 'admin' }) {
  const CONFIGS = {
    admin: {
      title: 'Manage your kitchen like never before',
      subtitle: 'Full control — pantry stock, to buy list, chat, meal planner, recipe book, and analytics.',
      icon: '🍳',
      accent: '#22c55e', // Green-500
      glowColor: 'rgba(34, 197, 94, 0.15)',
    },
    member: {
      title: 'Stay connected to your family kitchen',
      subtitle: 'View live pantry stock, update shopping lists, and chat with household members.',
      icon: '👨‍👩‍👧',
      accent: '#f59e0b', // Amber-500
      glowColor: 'rgba(245, 158, 11, 0.15)',
    },
  };

  const cfg = CONFIGS[role] || CONFIGS.admin;

  return (
    <div className="flex max-lg:hidden flex-col justify-between h-full bg-[#080d1a] relative overflow-hidden p-12 text-white w-full">
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} 
      />

      {/* Decorative Glow Blobs */}
      <div 
        className="absolute -top-10 -right-10 w-80 h-80 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"
        style={{ background: cfg.accent }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: cfg.accent }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 bg-gradient-to-br from-[#E8956D] to-[#B5522A]"
        >
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-lg tracking-wider text-white">
          Pantry<span className="text-[#E8956D]">to</span>Plate
        </span>
      </div>

      {/* Elegant Vector SVG Floating Mockup Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
          <div 
            className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px 0 ${cfg.glowColor}`
            }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow" />
              <span className="text-[11px] text-white/40 ml-auto font-mono">live_preview.json</span>
            </div>

            {/* Simulated Live Interface */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white/10" 
                  style={{ background: `rgba(255, 255, 255, 0.07)` }}
                >
                  {cfg.icon}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-32 rounded-full" style={{ background: cfg.accent }} />
                  <div className="h-2 w-20 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Progress bars / Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Stock', pct: '85%', val: '92' },
                  { label: 'Alerts', pct: '15%', val: '02' },
                  { label: 'Active', pct: '100%', val: '04' }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl p-4 bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 mb-1">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: cfg.accent }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* List items */}
              <div className="space-y-2.5">
                {[
                  { w: '90%', color: cfg.accent },
                  { w: '70%', color: 'rgba(255, 255, 255, 0.3)' },
                  { w: '50%', color: 'rgba(255, 255, 255, 0.15)' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <div className="h-2 rounded-full flex-1" style={{ width: item.w, backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copy */}
      <div className="relative z-10">
        <h2 className="text-2xl font-extrabold leading-snug tracking-tight mb-2">
          {cfg.title}
        </h2>
      </div>
    </div>
  );
}

export default function AuthSplitLayout({ role = 'admin', children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left panel (Form) */}
      <div className="flex-1 lg:w-[60%] lg:max-w-[60%] bg-white flex flex-col justify-center px-8 py-12 sm:px-16 md:px-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Top Logo link (Mobile brand) */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-1.5 rounded-xl flex items-center justify-center shadow-md transition-all group-hover:scale-105">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-sm tracking-wide">
              Pantry<span className="text-[#E8956D]">to</span>Plate
            </span>
          </Link>

          {/* Render children inside */}
          {children}
        </div>
      </div>

      {/* Right panel (Aesthetics/Vector) */}
      <div className="flex max-lg:hidden lg:w-[40%] lg:max-w-[40%] h-screen sticky top-0">
        <AuthRightPanel role={role} />
      </div>
    </div>
  );
}
