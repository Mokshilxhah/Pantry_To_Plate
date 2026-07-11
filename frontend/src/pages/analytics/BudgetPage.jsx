import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import {
  BarChart3, Plus, Trash2, Edit3, X, Check, AlertTriangle,
  IndianRupee, Settings2, PieChart, TrendingUp
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

const CATEGORIES = [
  'Fruits/Vegetables',
  'Dairy',
  'Grains',
  'Wheat and Flours Type',
  'Spices',
  'Snacks and Beverages',
  'Basic Needs',
  'Other'
];

const CAT_COLORS = {
  'Fruits/Vegetables': '#4ade80',
  'Dairy': '#60a5fa',
  'Grains': '#a78bfa',
  'Wheat and Flours Type': '#eab308',
  'Spices': '#fb923c',
  'Snacks and Beverages': '#a855f7',
  'Basic Needs': '#f43f5e',
  'Other': '#94a3b8',
};

function DonutChart({ segments, size = 180, thickness = 38 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.length === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={thickness} />
      ) : (
        segments.map((seg, i) => {
          const ratio   = seg.value / total;
          const dashArr = ratio * circumference;
          const dashOff = circumference - cumulative * circumference;
          cumulative += ratio;
          return (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth={thickness}
              strokeDasharray={`${dashArr} ${circumference - dashArr}`}
              strokeDashoffset={dashOff}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 0.5s ease' }}
            />
          );
        })
      )}
    </svg>
  );
}

export default function BudgetPage() {
  const { user, token } = useAuthStore();
  const uid    = user?.id || 'default';
  const expKey = `kitchenOS_budget_expenses_${uid}`;
  const limKey = `kitchenOS_budget_limits_${uid}`;

  const [expenses, setExpenses]         = useState([]);
  const [limits, setLimits]             = useState({});
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitForm, setLimitForm]       = useState({});
  const [editId, setEditId]             = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [form, setForm] = useState({
    category: 'Fruits/Vegetables', amount: '', note: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const toast = useToastStore.getState();

  const saveExpenses = (d) => { setExpenses(d); localStorage.setItem(expKey, JSON.stringify(d)); };
  const saveLimits   = (d) => { setLimits(d);   localStorage.setItem(limKey, JSON.stringify(d)); };

  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const e = localStorage.getItem(expKey);
      const l = localStorage.getItem(limKey);
      if (e) setExpenses(JSON.parse(e));
      if (l) setLimits(JSON.parse(l));
    } catch {}

    // 2. Fetch from backend if token is available
    if (token) {
      const loadFromBackend = async () => {
        try {
          const limitsRes = await fetch(`${API}/analytics/budget/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (limitsRes.ok) {
            const data = await limitsRes.json();
            if (data.categories) {
              setLimits(data.categories);
              localStorage.setItem(limKey, JSON.stringify(data.categories));
            }
          }
          
          const expensesRes = await fetch(`${API}/analytics/expenses/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (expensesRes.ok) {
            const data = await expensesRes.json();
            const mapped = data.map(e => ({
              id: e.id,
              category: e.category,
              amount: parseFloat(e.amount).toFixed(2),
              note: e.name,
              date: e.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setExpenses(mapped);
            localStorage.setItem(expKey, JSON.stringify(mapped));
          }
        } catch (err) {
          console.error("Error loading budget data from backend:", err);
        }
      };
      loadFromBackend();
    }
  }, [token, expKey, limKey]);

  const spendingByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c] = 0; });
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + parseFloat(e.amount); });
    return map;
  }, [expenses]);

  const totalSpent  = Object.values(spendingByCategory).reduce((s, v) => s + v, 0);
  const totalBudget = Object.values(limits).reduce((s, v) => s + parseFloat(v || 0), 0);

  const donutSegments = CATEGORIES
    .filter(c => spendingByCategory[c] > 0)
    .map(c => ({ label: c, value: spendingByCategory[c], color: CAT_COLORS[c] }));

  const overBudgetCats = CATEGORIES.filter(c => {
    const lim = parseFloat(limits[c] || 0);
    return lim > 0 && spendingByCategory[c] > lim;
  });

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      toast.error('Please enter a valid expense amount.');
      return;
    }
    const amountVal = parseFloat(form.amount);
    if (amountVal <= 0) {
      toast.error('Amount must be greater than zero.');
      return;
    }

    const tempId = Date.now().toString();
    const newLocalExpense = {
      id: tempId,
      category: form.category,
      amount: amountVal.toFixed(2),
      note: form.note || form.category,
      date: form.date
    };

    saveExpenses([newLocalExpense, ...expenses]);
    setForm({ category: 'Fruits/Vegetables', amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    toast.success('Expense recorded successfully!');

    if (token) {
      try {
        const res = await fetch(`${API}/analytics/expenses/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newLocalExpense.note,
            category: newLocalExpense.category,
            amount: parseFloat(newLocalExpense.amount),
            date: newLocalExpense.date
          })
        });
        if (res.ok) {
          const data = await res.json();
          // Update temp ID with backend ID
          setExpenses(prev => prev.map(exp => exp.id === tempId ? { ...exp, id: data.id } : exp));
          // Save updated expenses to local storage
          const updatedLocal = JSON.parse(localStorage.getItem(expKey) || '[]').map(exp => exp.id === tempId ? { ...exp, id: data.id } : exp);
          localStorage.setItem(expKey, JSON.stringify(updatedLocal));
        }
      } catch (err) {
        console.error("Error saving expense to backend:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    saveExpenses(expenses.filter(e => e.id !== id));
    toast.success('Expense record deleted.');

    if (token) {
      try {
        await fetch(`${API}/analytics/expenses/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Error deleting expense from backend:", err);
      }
    }
  };

  const startEdit = (exp) => { setEditId(exp.id); setEditForm({ ...exp }); };

  const saveEdit = async () => {
    if (!editForm.amount || isNaN(parseFloat(editForm.amount))) {
      toast.error('Please enter a valid expense amount.');
      return;
    }
    
    saveExpenses(expenses.map(e => e.id === editId ? { ...e, ...editForm, amount: parseFloat(editForm.amount).toFixed(2) } : e));
    const targetId = editId;
    setEditId(null);
    toast.success('Expense record updated!');

    if (token) {
      try {
        await fetch(`${API}/analytics/expenses/${targetId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editForm.note,
            category: editForm.category,
            amount: parseFloat(editForm.amount),
            date: editForm.date
          })
        });
      } catch (err) {
        console.error("Error editing expense on backend:", err);
      }
    }
  };

  const handleSaveLimits = async () => { 
    saveLimits(limitForm); 
    setShowLimitModal(false); 
    toast.success('Monthly budget limits updated!');

    if (token) {
      try {
        await fetch(`${API}/analytics/budget/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ categories: limitForm })
        });
      } catch (err) {
        console.error("Error saving limits to backend:", err);
      }
    }
  };
  
  const openLimitModal   = () => { setLimitForm({ ...limits }); setShowLimitModal(true); };

  return (
    <DashboardLayout title="Kitchen Budget" subtitle="Track category spending limits and purchase logs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {overBudgetCats.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200/70 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Budget Exceeded!</p>
              <p className="text-xs text-red-500 mt-0.5">{overBudgetCats.join(', ')} — spending is above your set limits.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">

            <div className="grid grid-cols-3 gap-5">
              <div className="clean-card-dark p-5 flex flex-col h-24 relative overflow-hidden">
                <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-2xl font-extrabold text-white">Rs.{totalSpent.toFixed(0)}</span>
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-wider mt-0.5">Total Spent</p>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-300" /></div>
                </div>
              </div>
              <div className="clean-card-green-inner p-5 flex flex-col h-24">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">Rs.{totalBudget.toFixed(0)}</span>
                    <p className="text-[10px] font-black text-emerald-900 uppercase tracking-wider mt-0.5">Total Budget</p>
                  </div>
                  <div className="p-2.5 bg-white/30 rounded-xl"><BarChart3 className="w-5 h-5 text-emerald-950" /></div>
                </div>
              </div>
              <div className={`rounded-3xl p-5 flex flex-col h-24 border ${totalBudget > 0 && totalSpent > totalBudget ? 'bg-red-50 border-red-200/40' : 'bg-[#FEF7E0] border-amber-200/40'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-2xl font-extrabold ${totalBudget > 0 && totalSpent > totalBudget ? 'text-red-600' : 'text-[#B06000]'}`}>
                      Rs.{Math.max(0, totalBudget - totalSpent).toFixed(0)}
                    </span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${totalBudget > 0 && totalSpent > totalBudget ? 'text-red-500' : 'text-[#B06000]'}`}>
                      {totalBudget > 0 && totalSpent > totalBudget ? 'Over Budget!' : 'Remaining'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white/50 rounded-xl"><IndianRupee className="w-5 h-5 text-[#B06000]" /></div>
                </div>
              </div>
            </div>

            <div className="clean-card-base p-5 border-t-4 border-t-orange-500">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
                <Plus className="w-4 h-4 text-orange-500" /> Add Expense
              </h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-orange-500 transition-all">
                  <span className="px-2 text-xs text-slate-400 font-bold">Rs.</span>
                  <input type="number" min="0" step="any" placeholder="Amount" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="flex-1 py-2 pr-3 text-xs text-slate-800 outline-none bg-transparent" required />
                </div>
                <input type="text" placeholder="Note (e.g. Big Basket)" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all placeholder-slate-400" />
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all" required />
                <button type="submit" className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/60 pb-2.5 mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-orange-500" /> Expense Log
                <span className="ml-auto text-[10px] font-bold text-slate-400">{expenses.length} entries</span>
              </h3>
              {expenses.length === 0 ? (
                <div className="clean-card-base rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <IndianRupee className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No expenses recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first expense using the form above</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {expenses.map(exp => {
                    const catLimit = parseFloat(limits[exp.category] || 0);
                    const catSpent = spendingByCategory[exp.category] || 0;
                    const isOver = catLimit > 0 && catSpent > catLimit;

                    if (editId === exp.id) {
                      return (
                        <div key={exp.id} className="bg-orange-50 border border-orange-200/60 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                          <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-orange-300 rounded-xl text-xs text-slate-800 outline-none bg-white">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-orange-300 rounded-xl text-xs text-slate-800 outline-none" />
                          <input type="text" value={editForm.note} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-orange-300 rounded-xl text-xs text-slate-800 outline-none" />
                          <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-orange-300 rounded-xl text-xs text-slate-800 outline-none" />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="flex-1 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                            <button onClick={() => setEditId(null)} className="py-1.5 px-3 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={exp.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isOver ? 'bg-red-50/70 border-red-200/50' : 'bg-white/80 border-slate-200/50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CAT_COLORS[exp.category] || '#94a3b8' }} />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{exp.category}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{exp.note || 'No note'} · {exp.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isOver && <span className="text-[9px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Over limit</span>}
                          <span className="text-sm font-extrabold text-slate-800">Rs.{exp.amount}</span>
                          <button onClick={() => startEdit(exp)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="clean-card-dark rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 mb-5 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-300" /> Spending by Category
              </h3>
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <DonutChart segments={donutSegments} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-white">Rs.{totalSpent.toFixed(0)}</span>
                    <span className="text-[9px] text-stone-400 font-bold uppercase">Total</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const spent = spendingByCategory[cat] || 0;
                  if (spent === 0) return null;
                  const pct = totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                        <span className="text-[11px] text-stone-300 font-semibold">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-400">{pct}%</span>
                        <span className="text-[11px] text-white font-bold">Rs.{spent.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
                {donutSegments.length === 0 && (
                  <p className="text-center text-stone-500 text-xs py-4">No spending data yet</p>
                )}
              </div>
            </div>

            <div className="clean-card-base rounded-2xl p-5 border-t-4 border-t-emerald-500">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-emerald-600" /> Budget Limits
                </h3>
                <button onClick={openLimitModal}
                  className="text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                  Set Limits
                </button>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const lim   = parseFloat(limits[cat] || 0);
                  const spent = spendingByCategory[cat] || 0;
                  const pct   = lim > 0 ? Math.min(100, (spent / lim) * 100) : 0;
                  const isOver = lim > 0 && spent > lim;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                          <span className="text-[11px] text-slate-700 font-bold">{cat}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOver && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          <span className={`text-[10px] font-bold ${isOver ? 'text-red-500' : 'text-slate-400'}`}>
                            Rs.{spent.toFixed(0)}{lim > 0 ? ` / Rs.${lim}` : ' (no limit)'}
                          </span>
                        </div>
                      </div>
                      {lim > 0 && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-emerald-400'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500" /> Set Category Budgets
              </h3>
              <button onClick={() => setShowLimitModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CAT_COLORS[cat] }} />
                  <label className="text-xs font-bold text-slate-700 w-36 shrink-0">{cat}</label>
                  <div className="flex-1 flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-400 transition-all">
                    <span className="px-2 text-xs text-slate-400 font-bold">Rs.</span>
                    <input type="number" min="0" placeholder="0 = no limit"
                      value={limitForm[cat] || ''}
                      onChange={e => setLimitForm(f => ({ ...f, [cat]: e.target.value }))}
                      className="flex-1 py-2 pr-3 text-xs text-slate-800 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLimitModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveLimits}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer">
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
