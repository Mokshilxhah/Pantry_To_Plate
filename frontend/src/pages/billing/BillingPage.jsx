import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Gift, Check, X, Receipt, Calendar, Download, ShieldCheck, CreditCard, Sparkles, Users, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SubscriptionModal from '../../components/common/SubscriptionModal';
import { useAuthStore, getStorageKey } from '../../store/authStore';
import useToastStore from '../../store/toastStore';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, priceLabel: 'Free forever',
    icon: Gift, color: '#78716C', members: 2, membersLabel: '2 members',
    features: ['5 Predefined Default Recipes', 'Basic Pantry Tracking', 'Collaborative Shopping List', 'Family Chat Hub', 'Basic Expiry Alerts'],
    locked: ['Recipe Book Library', '3-Course Meal Planner', 'Kitchen Budget Analytics', 'AI Recipe Suggestions'],
  },
  {
    id: 'pro', name: 'Pro', price: 299, priceLabel: '₹299/month',
    icon: Zap, color: '#4A4DAF', members: 5, membersLabel: 'Up to 5 members',
    features: ['Everything in Free', '10+ Default Recipes Included', 'Access to Recipe Book', '3-Course Meal Planner', 'Kitchen Budget Analytics'],
    locked: ['AI Recipe Suggestions'],
    popular: true,
  },
  {
    id: 'premium', name: 'Premium', price: 599, priceLabel: '₹599/month',
    icon: Crown, color: '#A0452A', members: -1, membersLabel: 'Unlimited members',
    features: ['Everything in Pro', '20+ Default Recipes Included', 'AI Recipe Suggestions', 'Priority Chat Support', 'Custom Food Categories'],
    locked: [],
  },
];

const PLAN_RANK = { free: 0, pro: 1, premium: 2 };

export default function BillingPage() {
  const { plan: currentPlan, memberLimit, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const toast = useToastStore.getState();

  const activePlan = PLANS.find(p => p.id === currentPlan) || PLANS[0];
  const ActiveIcon = activePlan.icon;

  // Returns true only if targetPlan is a strictly higher tier than current
  const canUpgradeTo = (planId) => PLAN_RANK[planId] > PLAN_RANK[currentPlan || 'free'];
  const isDowngrade  = (planId) => PLAN_RANK[planId] < PLAN_RANK[currentPlan || 'free'];

  const loadInvoices = () => {
    if (!user) return;
    const key = getStorageKey('invoices');
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // Generate initial dynamic list matching current plan
    const initialList = [
      { id: 'INV-001', date: '2026-03-01', plan: 'Free', amount: '₹0', status: 'N/A' }
    ];
    if (currentPlan === 'pro') {
      initialList.push({ id: 'INV-002', date: '2026-04-01', plan: 'Pro', amount: '₹299', status: 'Paid' });
    } else if (currentPlan === 'premium') {
      initialList.push({ id: 'INV-002', date: '2026-04-01', plan: 'Pro', amount: '₹299', status: 'Paid' });
      initialList.push({ id: 'INV-003', date: '2026-05-01', plan: 'Premium', amount: '₹599', status: 'Paid' });
    }

    setInvoices(initialList);
    localStorage.setItem(key, JSON.stringify(initialList));
  };

  useEffect(() => {
    loadInvoices();
  }, [currentPlan, showModal]);

  const handleDownload = (inv) => {
    toast.info(`Generating receipt for ${inv.id}...`);
    
    const invoiceContent = `
=============================================
             PANTRY TO PLATE RECEIPT
=============================================
Invoice Number: ${inv.id}
Date:           ${inv.date}
Plan:           ${inv.plan} Subscription
Amount Paid:    ${inv.amount} INR
Status:         ${inv.status}
Payment Method: Demo Card / Payment Gateway
=============================================
Thank you for using Pantry to Plate!
If you have any questions, contact support.
=============================================
`;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pantry_to_plate_invoice_${inv.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Invoice ${inv.id} downloaded successfully!`);
  };

  return (
    <DashboardLayout title="Billing & Subscriptions">
      <div className="max-w-5xl mx-auto space-y-8 pb-8">
        
        {/* Hero Card */}
        <div className="clean-card-dark rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl">
              <CreditCard className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Billing & Subscriptions</h2>
              <p className="text-stone-300 text-xs md:text-sm mt-1 font-medium">Manage plan tiers, household limits, and invoices</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Current Subscription */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-extrabold">01</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscription</h3>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="clean-card-base p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 text-left">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-100" 
              >
                <ActiveIcon size={26} style={{ color: activePlan.color }} />
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Active Status</span>
                <h2 className="text-xl font-extrabold mt-1 text-slate-900 flex items-center gap-2">
                  <span>{activePlan.name} Plan</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Allows {activePlan.membersLabel} · Rate: {activePlan.priceLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Members Registered</span>
                <span className="text-base font-extrabold text-slate-900">
                  {memberLimit === -1 ? '∞' : memberLimit} slots
                </span>
              </div>
              
              {currentPlan !== 'premium' ? (
                <button 
                  onClick={() => setShowModal(true)} 
                  className="px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Upgrade Subscription</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Maximum Plan Tier</span>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: Upgrade/Switch Plan */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-indigo-500/10 text-indigo-600 text-[10px] font-extrabold">02</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Compare & Upgrade Plans</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrent = currentPlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -3 }}
                  className={`clean-card-base p-5 shadow-sm text-left flex flex-col justify-between relative transition-all ${
                    isCurrent ? 'ring-2 ring-orange-400' : ''
                  }`}
                >
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-extrabold uppercase px-3 py-1 rounded-full text-white bg-orange-500 shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50">
                        <PlanIcon size={20} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{plan.name}</div>
                        <div className="text-xs text-slate-500 font-bold">{plan.priceLabel}</div>
                      </div>
                      {isCurrent && (
                        <span className="ml-auto text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-emerald-600 font-bold mb-4 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{plan.membersLabel} allowed</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-[11px] text-slate-655 font-semibold leading-relaxed">
                          <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.locked.map(f => (
                        <li key={f} className="flex items-start gap-2 text-[11px] text-slate-300 font-semibold leading-relaxed">
                          <X size={14} className="text-slate-300 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Plan Action Button */}
                  {isCurrent ? (
                    <div
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-center border"
                      style={{ color: plan.color, background: `${plan.color}05`, borderColor: `${plan.color}20` }}
                    >
                      Active Plan ✓
                    </div>
                  ) : canUpgradeTo(plan.id) ? (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                      style={{ background: plan.color }}
                    >
                      Upgrade to {plan.name}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none">
                      <Lock className="w-3 h-3" />
                      {isDowngrade(plan.id) ? 'Cannot downgrade' : 'Not available'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Invoice History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold">03</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Billing & Payment History</h3>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="clean-card-base p-5 shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Invoice ID', 'Billing Date', 'Subscribed Plan', 'Amount', 'Payment Status', ''].map(h => (
                      <th key={h} className="pb-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-600">{inv.id}</td>
                      <td className="py-3.5 px-3 text-xs text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{inv.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs font-bold text-slate-900">{inv.plan}</td>
                      <td className="py-3.5 px-3 text-xs font-bold text-slate-900">{inv.amount}</td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          inv.status === 'Paid' ? 'bg-[#7DC4A0]/10 text-[#7DC4A0]' : 'bg-slate-100 text-slate-400'
                        }`}>{inv.status}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button 
                          onClick={() => handleDownload(inv)} 
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Download size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Demo transactions — no actual charges are processed.</span>
            </div>
          </motion.div>
        </section>

      </div>
      <SubscriptionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </DashboardLayout>
  );
}
