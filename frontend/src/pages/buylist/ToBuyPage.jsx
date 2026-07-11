import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import shoppingService from '../../services/shoppingService';
import { 
  Plus, 
  Trash2, 
  X, 
  Check,
  Loader2,
  Calendar,
  Layers,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  History,
  RotateCcw
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

export default function ToBuyPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const toast = useToastStore.getState();

  // Manual Add Form state
  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    unit: 'kg',
    urgency: 'normal' // 'normal' | 'urgent'
  });

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [resolvingItem, setResolvingItem] = useState(null);
  const [restockForm, setRestockForm] = useState({
    addToPantry: true,
    category: 'Vegetables',
    expiryDate: ''
  });

  const fetchItems = async () => {
    try {
      const data = await shoppingService.getItems(token);
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shopping list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  // Handle manual input change
  const setVal = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter an item name.');

    try {
      const newItem = await shoppingService.addItem(token, {
        name: form.name.trim(),
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        urgency: form.urgency
      });
      setForm({ name: '', quantity: '1', unit: 'kg', urgency: 'normal' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Check off action - opens modal
  const handleCheckOff = (item) => {
    setResolvingItem(item);
    
    // Auto-select category based on common names if possible
    let defaultCat = 'Fruits/Vegetables';
    const nameLower = item.name.toLowerCase();
    if (nameLower.includes('milk') || nameLower.includes('egg') || nameLower.includes('cheese') || nameLower.includes('paneer') || nameLower.includes('yogurt') || nameLower.includes('butter') || nameLower.includes('curd')) {
      defaultCat = 'Dairy';
    } else if (nameLower.includes('wheat') || nameLower.includes('flour') || nameLower.includes('atta') || nameLower.includes('suji') || nameLower.includes('maida')) {
      defaultCat = 'Wheat and Flours Type';
    } else if (nameLower.includes('rice') || nameLower.includes('grain') || nameLower.includes('oats') || nameLower.includes('dal') || nameLower.includes('pulse')) {
      defaultCat = 'Grains';
    } else if (nameLower.includes('ginger') || nameLower.includes('garlic') || nameLower.includes('spices') || nameLower.includes('masala') || nameLower.includes('chili') || nameLower.includes('salt') || nameLower.includes('turmeric') || nameLower.includes('cardamom')) {
      defaultCat = 'Spices';
    } else if (nameLower.includes('snack') || nameLower.includes('beverage') || nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('juice') || nameLower.includes('cola') || nameLower.includes('chips') || nameLower.includes('biscuit')) {
      defaultCat = 'Snacks and Beverages';
    } else if (nameLower.includes('sugar') || nameLower.includes('oil') || nameLower.includes('soap') || nameLower.includes('shampoo') || nameLower.includes('paste')) {
      defaultCat = 'Basic Needs';
    } else if (nameLower.includes('chicken') || nameLower.includes('meat') || nameLower.includes('fish') || nameLower.includes('pork') || nameLower.includes('beef')) {
      defaultCat = 'Other';
    }

    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7); // 7 days from now

    setRestockForm({
      addToPantry: true,
      category: defaultCat,
      expiryDate: defaultExpiry.toISOString().split('T')[0]
    });
    
    setShowRestockModal(true);
  };

  const submitResolve = async () => {
    if (!resolvingItem) return;

    try {
      await shoppingService.updateItem(token, resolvingItem.id, {
        isBought: true,
        addToPantry: restockForm.addToPantry,
        expiryDate: restockForm.expiryDate,
        category: restockForm.category
      });
      
      toast.success(
        restockForm.addToPantry 
          ? `Bought & restocked ${resolvingItem.name} into Pantry!` 
          : `Checked off ${resolvingItem.name} from list.`
      );
      
      setShowRestockModal(false);
      setResolvingItem(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Undo bought item
  const handleUndoBought = async (item) => {
    try {
      await shoppingService.updateItem(token, item.id, { isBought: false });
      toast.success(`Restored ${item.name} back to buy list.`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id, name) => {
    try {
      await shoppingService.deleteItem(token, id, name);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Active items
  const activeItems = items.filter(i => !i.isBought);
  const urgentItems = activeItems.filter(i => i.urgency === 'urgent');
  const normalItems = activeItems.filter(i => i.urgency === 'normal');

  // Bought items history
  const boughtItems = items.filter(i => i.isBought);

  if (loading) {
    return (
      <DashboardLayout title="Shopping List" subtitle="Household supply list and grocery organizer">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Retrieving kitchen supply list...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Supply List" subtitle="Household grocery list and automatic pantry restocker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Add Item Form, Urgent Column, Normal Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* MANUAL ADD FORM (Styled matching sketch layout) */}
            <div className="clean-card-dark rounded-2xl p-5 relative overflow-hidden">
              <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-300" /> Add Items
              </h3>
              
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Item Name */}
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Add items</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paneer, Butter"
                    value={form.name} 
                    onChange={setVal('name')}
                    className="w-full px-3.5 py-2 border border-white/20 rounded-xl text-xs text-white bg-white/10 placeholder-stone-400 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Quantity</label>
                    <input 
                      type="number" 
                      step="any"
                      min="0.1"
                      placeholder="Qty" 
                      value={form.quantity} 
                      onChange={setVal('quantity')}
                      className="w-full px-3 py-2 border border-white/20 rounded-xl text-xs text-white bg-white/10 outline-none focus:border-white/40 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Unit</label>
                    <select
                      value={form.unit}
                      onChange={setVal('unit')}
                      className="w-full px-3 py-2 border border-white/20 rounded-xl text-xs text-white bg-white/10 outline-none focus:border-white/40 transition-all"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="pcs">pcs</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>

                {/* Urgent / Normal */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Urgent / normal</label>
                  <div className="flex gap-4 items-center h-[38px] bg-white/10 border border-white/20 rounded-xl px-4">
                    <label className="flex items-center gap-1.5 text-xs text-stone-300 font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="urgency" 
                        value="normal" 
                        checked={form.urgency === 'normal'} 
                        onChange={setVal('urgency')}
                        className="text-orange-500 focus:ring-0 focus:ring-offset-0"
                      />
                      Normal
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-stone-300 font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="urgency" 
                        value="urgent" 
                        checked={form.urgency === 'urgent'} 
                        onChange={setVal('urgency')}
                        className="text-orange-500 focus:ring-0 focus:ring-offset-0"
                      />
                      Urgent
                    </label>
                  </div>
                </div>

                {/* Add Button */}
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1 h-[38px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* SPLIT LISTS: URGENT vs NORMAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Urgent Needs Column */}
              <div className="clean-card-green-inner rounded-2xl p-5 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between border-b border-red-50 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-emerald-800" /> Urgent Needs
                  </h3>
                  <span className="text-[10px] bg-white/30 text-emerald-950 font-bold px-2.5 py-0.5 rounded-full">
                    {urgentItems.length} Items
                  </span>
                </div>

                {urgentItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No urgent needs</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Everything is fully stocked!</p>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {urgentItems.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-50 bg-red-50/5 hover:bg-red-50/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleCheckOff(item)}
                            className="w-5 h-5 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-emerald-950">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                              {item.quantity} {item.unit} {item.pantryItemId && '• Auto-populated'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Normal Needs Column */}
              <div className="clean-card-purple-inner rounded-2xl p-5 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-indigo-700" /> Later Staples
                  </h3>
                  <span className="text-[10px] bg-white/30 text-indigo-900 font-bold px-2.5 py-0.5 rounded-full">
                    {normalItems.length} Items
                  </span>
                </div>

                {normalItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-2">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No general items</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">List is currently clear.</p>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {normalItems.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200/80 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleCheckOff(item)}
                            className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                              {item.quantity} {item.unit} {item.pantryItemId && '• Auto-populated'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Purchased History (Already Bought) */}
          <div className="lg:col-span-4">
            <div className="clean-card-dark rounded-2xl p-5 flex flex-col h-full justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <History className="w-4.5 h-4.5 text-stone-400" />
                    <h3 className="text-sm font-bold text-white">Already Bought</h3>
                  </div>
                  <span className="text-[9px] bg-white/15 text-stone-300 font-bold px-2 py-0.5 rounded-full">
                    History
                  </span>
                </div>

                {boughtItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-xs font-medium text-stone-300">No items bought today.</p>
                    <p className="text-[9px] mt-0.5 text-stone-400">Checked items will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {boughtItems.slice(0, 8).map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10 text-stone-300"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-bold line-through text-stone-400">{item.name}</p>
                          <p className="text-[9px] text-stone-500 font-bold mt-0.5">{item.quantity} {item.unit}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => handleUndoBought(item)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all border border-slate-200/50 cursor-pointer"
                            title="Undo buy status"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all border border-slate-200/50 cursor-pointer"
                            title="Remove completely"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-white/10 pt-4 flex justify-center">
                <span className="text-[10px] font-bold text-stone-400">Supply List auto-sync</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* RESTOCK PANTRY OPTIONAL MODAL */}
      {showRestockModal && resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-orange-500" /> Restock Pantry Shelf?
              </h3>
              <button 
                onClick={() => { setShowRestockModal(false); setResolvingItem(null); }}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                You checked off <strong className="text-slate-800 font-bold">{resolvingItem.name}</strong> ({resolvingItem.quantity} {resolvingItem.unit}). 
                Would you like to automatically restock this back into your Pantry inventory?
              </p>

              {/* Add check box toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50/20 border border-orange-100 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={restockForm.addToPantry}
                  onChange={e => setRestockForm(prev => ({ ...prev, addToPantry: e.target.checked }))}
                  className="rounded text-orange-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5"
                />
                <span className="text-xs font-bold text-slate-700">Yes, update/create pantry record</span>
              </label>

              {/* Expanded details if checked */}
              {restockForm.addToPantry && (
                <div className="space-y-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 duration-255">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pantry Category</label>
                    <select
                      value={restockForm.category}
                      onChange={e => setRestockForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none focus:border-orange-500 transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Expected Expiry Date</label>
                    <input 
                      type="date"
                      min={todayStr}
                      value={restockForm.expiryDate}
                      onChange={e => setRestockForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button 
                onClick={() => { setShowRestockModal(false); setResolvingItem(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={submitResolve}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              >
                Resolve Item
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

