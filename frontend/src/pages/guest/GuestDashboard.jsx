import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, BookOpen, Compass, Package, Users, Activity } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function GuestDashboard() {
  return (
    <DashboardLayout title="Observer Workspace" subtitle="Guest view-only kitchen connection">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-mesh opacity-[0.25] pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center shadow-glow-sm-accent">
              <Eye className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Guest Workspace</h1>
              <p className="text-xs text-light-muted">View shared stocks, explore recipe cards, and collaborate passively.</p>
            </div>
          </div>
          <span className="badge-accent px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
            Guest Observer
          </span>
        </motion.div>

        {/* View Only Mode Info */}
        <div className="glass rounded-2xl p-4 border-glass bg-accent-700/5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div className="text-xs text-light-muted leading-relaxed">
            <span className="font-bold text-light">Security Clearance Active:</span> You are viewing this kitchen workspace as a Guest. Stock updates and item editing can only be performed by members and admins.
          </div>
        </div>

        {/* Guest Core Overview widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Quick Stats overview */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" /> Kitchen Ecosystem
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="glass rounded-xl p-4 border-glass">
                <p className="text-[10px] uppercase font-bold text-light-muted">Pantry Stock</p>
                <h4 className="text-2xl font-extrabold text-gradient-primary mt-1">24 Active</h4>
              </div>
              <div className="glass rounded-xl p-4 border-glass">
                <p className="text-[10px] uppercase font-bold text-light-muted">Alert Level</p>
                <h4 className="text-2xl font-extrabold text-accent-400 mt-1">Nominal</h4>
              </div>
            </div>
          </div>

          {/* Recipes Book preview */}
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-sage-400" /> Curated Recipes
              </h3>
              <p className="text-xs text-light-muted leading-relaxed">
                Explore the custom library designed for this household's active supply status.
              </p>
            </div>
            <button className="btn-glass text-xs py-2 px-4 rounded-xl self-start mt-4 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Open Explorer
            </button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
