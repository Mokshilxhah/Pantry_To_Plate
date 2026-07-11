import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Gift, Loader2, Shield, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { useAuthStore, getStorageKey } from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import './SubscriptionModal.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Free forever',
    icon: Gift,
    color: '#6b7280',
    members: 2,
    membersLabel: '2 members',
    features: ['5 Default Recipes', 'Basic Pantry', 'Shopping List', 'Family Chat', 'Alert Center'],
    locked: ['Recipe Book', 'Meal Planner', 'Budget Analytics', 'AI Suggestions'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceLabel: '₹299/month',
    icon: Zap,
    color: '#6366f1',
    members: 5,
    membersLabel: 'Up to 5 members',
    features: ['Everything in Free', '10+ Default Recipes', 'Recipe Book', 'Meal Planner', 'Budget Analytics'],
    locked: ['AI Suggestions'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    priceLabel: '₹599/month',
    icon: Crown,
    color: '#f59e0b',
    members: -1,
    membersLabel: 'Unlimited members',
    features: ['Everything in Pro', '20+ Default Recipes', 'AI Suggestions', 'Priority Support', 'Custom Categories'],
    locked: [],
  },
];

// Fake Razorpay-style payment modal
function RazorpayModal({ plan, onSuccess, onCancel }) {
  const [phase, setPhase] = useState('select'); // select | processing | done
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [progress, setProgress] = useState(0);
  const toast = useToastStore.getState();

  const handlePay = () => {
    setPhase('processing');
    let pct = 0;
    const interval = setInterval(() => {
      pct += 1;
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setPhase('done');
        toast.success(`Payment of ₹${plan.price} processed! (Demo) Welcome to ${plan.name}!`);
        setTimeout(() => onSuccess(), 1500);
      }
    }, 95); // ~9.5 seconds
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="razorpay-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="razorpay-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Razorpay Header */}
        <div className="rzp-header">
          <div className="rzp-logo">
            <div className="rzp-logo-icon">⚡</div>
            <div>
              <div className="rzp-brand">Razorpay</div>
              <div className="rzp-merchant">PantryToPlate Kitchen OS</div>
            </div>
          </div>
          <div className="rzp-amount">
            <div className="rzp-amount-label">Amount to pay</div>
            <div className="rzp-amount-value">₹{plan.price}</div>
          </div>
        </div>

        {phase === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rzp-body">
            {/* Payment Method Tabs */}
            <div className="rzp-methods">
              {[
                { id: 'card', icon: CreditCard, label: 'Card' },
                { id: 'upi',  icon: Smartphone,  label: 'UPI' },
                { id: 'nb',   icon: Building2,   label: 'Net Banking' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`rzp-method-tab ${selectedMethod === m.id ? 'active' : ''}`}
                >
                  <m.icon size={16} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Card fields (visual only) */}
            {selectedMethod === 'card' && (
              <div className="rzp-fields">
                <div className="rzp-field">
                  <label>Card Number</label>
                  <input type="text" defaultValue="4111 1111 1111 1111" className="rzp-input" readOnly />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="rzp-field">
                    <label>Expiry</label>
                    <input type="text" defaultValue="12/28" className="rzp-input" readOnly />
                  </div>
                  <div className="rzp-field">
                    <label>CVV</label>
                    <input type="password" defaultValue="123" className="rzp-input" readOnly />
                  </div>
                </div>
                <div className="rzp-field">
                  <label>Name on Card</label>
                  <input type="text" defaultValue="Demo User" className="rzp-input" readOnly />
                </div>
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div className="rzp-fields">
                <div className="rzp-field">
                  <label>UPI ID</label>
                  <input type="text" defaultValue="demo@paytm" className="rzp-input" readOnly />
                </div>
              </div>
            )}

            {selectedMethod === 'nb' && (
              <div className="rzp-fields">
                <div className="rzp-field">
                  <label>Select Bank</label>
                  <select className="rzp-input" defaultValue="sbi">
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                  </select>
                </div>
              </div>
            )}

            <div className="rzp-secure">
              <Shield size={12} /> 256-bit SSL secured · This is a demo payment
            </div>

            <button onClick={handlePay} className="rzp-pay-btn">
              Pay ₹{plan.price} →
            </button>
            <button onClick={onCancel} className="rzp-cancel-btn">Cancel</button>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rzp-processing">
            <div className="rzp-processing-icon">
              <Loader2 size={40} className="animate-spin" color="#6366f1" />
            </div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we verify your payment securely.</p>
            <div className="rzp-progress-bar">
              <motion.div
                className="rzp-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="rzp-progress-label">{Math.round(progress)}%</div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rzp-success">
            <div className="rzp-success-icon">
              <Check size={40} color="white" />
            </div>
            <h3>Payment Successful!</h3>
            <p>₹{plan.price} paid · {plan.name} plan activated</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function SubscriptionModal({ isOpen, onClose, fromSignup = false, onPlanSelected }) {
  const { plan: currentPlan, memberLimit, token, updatePlan } = useAuthStore();
  const [payingPlan, setPayingPlan] = useState(null);
  const [selectedForSignup, setSelectedForSignup] = useState('free');
  const toast = useToastStore.getState();

  const handleUpgrade = (plan) => {
    if (plan.id === currentPlan && !fromSignup) {
      toast.warning(`You're already on the ${plan.name} plan.`);
      return;
    }
    if (plan.price === 0) {
      // Free plan — no payment needed
      handlePlanSuccess(plan);
      return;
    }
    setPayingPlan(plan);
  };

  const handlePlanSuccess = async (plan) => {
    setPayingPlan(null);
    const memberLimitMap = { free: 2, pro: 5, premium: -1 };
    const newLimit = memberLimitMap[plan.id] || 2;

    // Call backend API to persist the upgrade in database
    if (token) {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${API_BASE}/auth/subscription/upgrade/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ plan_name: plan.id })
        });
        if (!res.ok) {
          const errData = await res.json();
          console.error('Upgrade failed:', errData);
        }
      } catch (err) {
        console.error('Network error during subscription upgrade:', err);
      }
    }

    updatePlan(plan.id, newLimit);

    // Dynamic Invoice persistence
    const key = getStorageKey('invoices');
    const saved = localStorage.getItem(key);
    let currentInvoices = [];
    if (saved) {
      try {
        currentInvoices = JSON.parse(saved);
      } catch (e) {}
    }
    const newInvoice = {
      id: `INV-0${currentInvoices.length + 10}`,
      date: new Date().toISOString().split('T')[0],
      plan: plan.name,
      amount: plan.price === 0 ? '₹0' : `₹${plan.price}`,
      status: plan.price === 0 ? 'N/A' : 'Paid'
    };
    currentInvoices.push(newInvoice);
    localStorage.setItem(key, JSON.stringify(currentInvoices));

    if (fromSignup && onPlanSelected) {
      onPlanSelected(plan.id, newLimit);
    } else {
      toast.success(`Upgraded to ${plan.name} plan! Member limit: ${newLimit === -1 ? 'Unlimited' : newLimit}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  // ── Subscription plan chooser ── portaled to body to bypass any layout clip
  const subscriptionPortal = !payingPlan ? createPortal(
    <AnimatePresence>
      <motion.div
        className="subscription-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
        style={{ zIndex: 9998 }}
      >
        <motion.div
          className="subscription-modal"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ position: 'relative', zIndex: 9999 }}
        >
          <button className="modal-close" onClick={onClose}><X size={20} /></button>

          <div className="modal-header">
            <h1>{fromSignup ? 'Choose Your Plan' : 'Upgrade Your Plan'}</h1>
            <p>{fromSignup ? 'Select the plan that fits your household.' : 'Unlock more members and features for your kitchen.'}</p>
          </div>

          <div className="plans-grid">
            {PLANS.map(plan => {
              const Icon = plan.icon;
              const isCurrent = !fromSignup && currentPlan === plan.id;
              const isSelected = fromSignup && selectedForSignup === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  className={`plan-card ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => fromSignup && setSelectedForSignup(plan.id)}
                >
                  {plan.popular && <div className="popular-badge">Most Popular</div>}
                  <div className="plan-header">
                    <div className="plan-icon" style={{ color: plan.color, background: `${plan.color}18` }}>
                      <Icon size={22} />
                    </div>
                    <h3 className="plan-name">{plan.name}</h3>
                    {isCurrent && <span className="current-badge">Current</span>}
                  </div>

                  <div className="plan-price" style={{ color: plan.color }}>
                    {plan.priceLabel}
                  </div>

                  <div className="plan-members">
                    <Users16 /> {plan.membersLabel}
                  </div>

                  <ul className="plan-features">
                    {plan.features.map(f => (
                      <li key={f} className="enabled"><Check size={14} /><span>{f}</span></li>
                    ))}
                    {plan.locked.map(f => (
                      <li key={f} className="disabled"><X size={14} /><span>{f}</span></li>
                    ))}
                  </ul>

                  {fromSignup ? (
                    <button
                      className={`upgrade-button ${isSelected ? 'selected-btn' : ''}`}
                      style={isSelected ? { background: plan.color } : {}}
                      onClick={() => { setSelectedForSignup(plan.id); handleUpgrade(plan); }}
                    >
                      {plan.price === 0 ? 'Select Free' : `Select ${plan.name}`}
                    </button>
                  ) : (
                    !isCurrent && (
                      <button
                        className="upgrade-button"
                        onClick={() => handleUpgrade(plan)}
                        style={{ background: plan.color }}
                      >
                        Upgrade to {plan.name}
                      </button>
                    )
                  )}
                  {isCurrent && <div className="current-button">Current Plan ✓</div>}
                </motion.div>
              );
            })}
          </div>

          <div className="modal-footer">
            <p className="footer-note">💳 Demo payment — no real charges. Powered by Razorpay (simulation).</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  // ── Razorpay payment form ── separate portal at z-index 99999, always on top
  const razorpayPortal = (
    <AnimatePresence>
      {payingPlan && (
        <RazorpayModal
          plan={payingPlan}
          onSuccess={() => handlePlanSuccess(payingPlan)}
          onCancel={() => { setPayingPlan(null); toast.info('Payment cancelled.'); }}
        />
      )}
    </AnimatePresence>
  );

  return (
    <>
      {subscriptionPortal}
      {razorpayPortal}
    </>
  );
}

// Mini icon inline
function Users16() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
