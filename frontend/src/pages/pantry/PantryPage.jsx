import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import pantryService from '../../services/pantryService';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Check,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  UploadCloud,
  FileText,
  QrCode,
  Camera,
  CheckSquare
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

const catColors = {
  'fruits/vegetables': {
    bg: 'bg-emerald-50/40 hover:bg-emerald-100/30 border-emerald-250/50',
    iconBg: 'bg-emerald-100/60',
    iconText: 'text-emerald-600',
    topBorder: 'border-t-4 border-t-emerald-500'
  },
  dairy: {
    bg: 'bg-blue-50/40 hover:bg-blue-100/30 border-blue-250/50',
    iconBg: 'bg-blue-100/60',
    iconText: 'text-blue-600',
    topBorder: 'border-t-4 border-t-blue-500'
  },
  grains: {
    bg: 'bg-yellow-50/40 hover:bg-yellow-100/30 border-yellow-250/50',
    iconBg: 'bg-yellow-100/60',
    iconText: 'text-yellow-600',
    topBorder: 'border-t-4 border-t-yellow-500'
  },
  'wheat and flours type': {
    bg: 'bg-amber-50/40 hover:bg-amber-100/30 border-amber-250/50',
    iconBg: 'bg-amber-100/60',
    iconText: 'text-amber-600',
    topBorder: 'border-t-4 border-t-amber-500'
  },
  spices: {
    bg: 'bg-orange-50/40 hover:bg-orange-100/30 border-orange-250/50',
    iconBg: 'bg-orange-100/60',
    iconText: 'text-orange-600',
    topBorder: 'border-t-4 border-t-orange-500'
  },
  'snacks and beverages': {
    bg: 'bg-purple-50/40 hover:bg-purple-100/30 border-purple-250/50',
    iconBg: 'bg-purple-100/60',
    iconText: 'text-purple-650',
    topBorder: 'border-t-4 border-t-purple-500'
  },
  'basic needs': {
    bg: 'bg-rose-50/40 hover:bg-rose-100/30 border-rose-250/50',
    iconBg: 'bg-rose-100/60',
    iconText: 'text-rose-650',
    topBorder: 'border-t-4 border-t-rose-500'
  },
  other: {
    bg: 'bg-slate-50/40 hover:bg-slate-100/30 border-slate-250/50',
    iconBg: 'bg-slate-100/60',
    iconText: 'text-slate-655',
    topBorder: 'border-t-4 border-t-slate-500'
  }
};

const catImages = {
  'fruits/vegetables': '/fruits_vegetables_cat.png',
  dairy: '/dairy_cat.png',
  grains: '/grains_cat.png',
  'wheat and flours type': '/wheat_flour_cat.png',
  spices: '/spices_cat.png',
  'snacks and beverages': '/snacks_beverages_cat.png',
  'basic needs': '/basic_needs_cat.png',
  other: '/other_cat.png'
};

const STAPLES = [
  { name: 'Wheat Flour (Atta)', category: 'Wheat and Flours Type', unit: 'kg', defaultQty: 5 },
  { name: 'Sugar', category: 'Basic Needs', unit: 'kg', defaultQty: 1 },
  { name: 'Salt', category: 'Basic Needs', unit: 'pack', defaultQty: 1 },
  { name: 'Tomatoes', category: 'Fruits/Vegetables', unit: 'kg', defaultQty: 1 },
  { name: 'Onions', category: 'Fruits/Vegetables', unit: 'kg', defaultQty: 1 },
  { name: 'Potatoes', category: 'Fruits/Vegetables', unit: 'kg', defaultQty: 2 },
  { name: 'Fresh Milk', category: 'Dairy', unit: 'L', defaultQty: 1 },
  { name: 'Eggs', category: 'Dairy', unit: 'pcs', defaultQty: 12 },
  { name: 'Bread', category: 'Basic Needs', unit: 'pcs', defaultQty: 1 },
  { name: 'Tea Powder', category: 'Snacks and Beverages', unit: 'pack', defaultQty: 1 }
];

const FAST_DECOMPOSING_ITEMS = ['milk', 'bread', 'eggs', 'egg', 'paneer', 'chicken', 'fish', 'yogurt', 'curd', 'butter'];

function isFastDecomposing(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return FAST_DECOMPOSING_ITEMS.some(item => lower.includes(item));
}

function checkLowStock(item) {
  const category = (item.category || '').toLowerCase().trim();
  const unit = (item.unit || '').toLowerCase().trim();
  const quantity = parseFloat(item.quantity) || 0;

  if (item.low_stock_threshold !== undefined && item.low_stock_threshold !== null) {
    return quantity < parseFloat(item.low_stock_threshold);
  }

  if (category === 'dairy') {
    if (unit === 'ml') return quantity < 500;
    if (unit === 'l') return quantity < 0.5;
  } else if (category === 'fruits/vegetables' || category === 'fruits' || category === 'vegetables') {
    if (unit === 'g') return quantity < 1000;
    if (unit === 'kg') return quantity < 1.0;
    if (unit === 'pcs') return quantity < 6;
  } else if (category === 'wheat and flours type' || category === 'wheat and flour types' || category === 'grains') {
    if (unit === 'g') return quantity < 1000;
    if (unit === 'kg') return quantity < 1.0;
    if (unit === 'pcs') return quantity < 4;
  } else if (category === 'spices') {
    if (unit === 'pack') return quantity < 1;
    if (unit === 'g') return quantity < 100;
  }

  const defaultThreshold = item.low_stock_threshold || 1.0;
  return quantity < defaultThreshold;
}

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const toast = useToastStore.getState();

  // Add Item form state
  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    unit: 'kg',
    expiryDate: '',
    category: 'Fruits/Vegetables'
  });

  // Modal / Filter state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalFilter, setModalFilter] = useState('All'); 

  // Inline editing state inside modal
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    quantity: 1,
    unit: 'kg',
    expiryDate: '',
    category: 'Fruits/Vegetables'
  });

  // Uploader and QR scanner state
  const [uploading, setUploading] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrResult, setQrResult] = useState(null);

  const fetchItems = async () => {
    try {
      const data = await pantryService.getItems(token);
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve pantry inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  // Telemetry counts
  const totalCount = items.length;

  const today = new Date();
  today.setHours(0,0,0,0);

  const expiringCount = items.filter(item => {
    const expVal = item.expiryDate || item.expiry_date;
    if (!expVal) return false;
    const exp = new Date(expVal);
    exp.setHours(0,0,0,0);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return true; // Expired is also an alert
    if (isFastDecomposing(item.name)) {
      return diffDays <= 2;
    }
    return diffDays <= 1;
  }).length;

  const lowStockCount = items.filter(checkLowStock).length;

  // Form handle change
  const setVal = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Add Item Submit
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.expiryDate) {
      return toast.error('Please fill in all details.');
    }

    // Duplicate Check
    const duplicate = items.find(i => i.name.toLowerCase().trim() === form.name.toLowerCase().trim());
    if (duplicate) {
      toast.error(`"${form.name}" is already in your pantry!`);
      return;
    }

    try {
      await pantryService.addItem(token, {
        name: form.name.trim(),
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        expiryDate: form.expiryDate,
        category: form.category
      });
      setForm({ name: '', quantity: '1', unit: 'kg', expiryDate: '', category: 'Fruits/Vegetables' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Add staple quick-add
  const handleAddStaple = async (staple) => {
    // Duplicate Check
    const duplicate = items.find(i => i.name.toLowerCase().trim() === staple.name.toLowerCase().trim());
    if (duplicate) {
      toast.error(`"${staple.name}" is already in your pantry!`);
      return;
    }

    const expDate = new Date();
    expDate.setDate(today.getDate() + 7); // Default 7 days expiry

    try {
      await pantryService.addItem(token, {
        name: staple.name,
        quantity: staple.defaultQty,
        unit: staple.unit,
        expiryDate: expDate.toISOString().split('T')[0],
        category: staple.category
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Item adjustments in modal
  const handleQtyAdjust = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    if (newQty === 0) {
      if (window.confirm(`Do you want to delete ${item.name} from your pantry?`)) {
        handleDeleteItem(item.id, item.name);
      }
      return;
    }

    try {
      const updated = await pantryService.updateItem(token, item.id, { quantity: newQty });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updated } : i));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id, name) => {
    try {
      await pantryService.deleteItem(token, id, name);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger inline edit mode in modal
  const startEdit = (item) => {
    setEditingItemId(item.id);
    const expVal = item.expiryDate || item.expiry_date || '';
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: expVal ? expVal.split('T')[0] : '',
      category: item.category
    });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const saveEdit = async (id) => {
    try {
      const updated = await pantryService.updateItem(token, id, {
        name: editForm.name,
        quantity: parseFloat(editForm.quantity),
        unit: editForm.unit,
        expiryDate: editForm.expiryDate,
        category: editForm.category
      });
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      setEditingItemId(null);
      toast.success('Pantry item updated!');
    } catch (err) {
      console.error(err);
    }
  };

  // Get item counts for categories
  const getCategoryCount = (catName) => {
    return items.filter(i => (i.category || '').toLowerCase().trim() === catName.toLowerCase().trim()).length;
  };

  // Filter items in modal
  const getFilteredModalItems = () => {
    if (!selectedCategory) return [];

    let filtered = items.filter(i => (i.category || '').toLowerCase().trim() === selectedCategory.toLowerCase().trim());

    // Search filter
    if (modalSearch.trim()) {
      filtered = filtered.filter(i => i.name.toLowerCase().includes(modalSearch.toLowerCase()));
    }

    // Expiry status filter
    if (modalFilter === 'Expired') {
      filtered = filtered.filter(i => {
        const expVal = i.expiryDate || i.expiry_date;
        return expVal && new Date(expVal) < today;
      });
    } else if (modalFilter === 'Expiring') {
      filtered = filtered.filter(i => {
        const expVal = i.expiryDate || i.expiry_date;
        if (!expVal) return false;
        const exp = new Date(expVal);
        exp.setHours(0,0,0,0);
        const diffTime = exp - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return false;
        if (isFastDecomposing(i.name)) return diffDays <= 2;
        return diffDays <= 1;
      });
    } else if (modalFilter === 'Fresh') {
      filtered = filtered.filter(i => {
        const expVal = i.expiryDate || i.expiry_date;
        if (!expVal) return true;
        const exp = new Date(expVal);
        exp.setHours(0,0,0,0);
        const diffTime = exp - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (isFastDecomposing(i.name)) return diffDays > 2;
        return diffDays > 1;
      });
    }

    return filtered;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // File Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await pantryService.uploadFile(token, file);
      if (res.success && res.items) {
        setPreviewItems(res.items);
        setPreviewModalOpen(true);
        toast.success(`Parsed ${res.items.length} items from file! Review them below.`);
      } else {
        toast.error('Failed to parse upload file.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (previewItems.length === 0) return;
    try {
      await pantryService.addBatchItems(token, previewItems);
      setPreviewModalOpen(false);
      setPreviewItems([]);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // QR Simulator scan handler
  const triggerQRScan = () => {
    setQrModalOpen(true);
    setQrScanning(true);
    setQrResult(null);

    setTimeout(() => {
      setQrScanning(false);
      setQrResult([
        { name: 'Fresh Milk', category: 'Dairy', quantity: 1.0, unit: 'L', expiryDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0] },
        { name: 'Eggs (12 Pack)', category: 'Dairy', quantity: 1.0, unit: 'pack', expiryDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0] },
        { name: 'Fresh Tomato', category: 'Fruits/Vegetables', quantity: 1.0, unit: 'kg', expiryDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0] },
        { name: 'Organic Butter', category: 'Dairy', quantity: 1.0, unit: 'pcs', expiryDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0] }
      ]);
      toast.success('Successfully scanned pantry items QR!');
    }, 2500);
  };

  // Save Scanned Items
  const handleSaveScanned = async () => {
    if (!qrResult) return;
    try {
      await pantryService.addBatchItems(token, qrResult);
      setQrModalOpen(false);
      setQrResult(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pantry Space" subtitle="Manage kitchen ingredients and inventory tracker">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Opening pantry gates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pantry Space" subtitle="Real-time kitchen inventory tracking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Telemetry, Quick Add, Categories Grid */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STATS ROW: Responsive column stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              <div className="clean-card-dark p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-28 relative overflow-hidden">
                <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-3xl font-extrabold text-white tracking-tight">{totalCount}</span>
                    <h3 className="text-[10px] font-bold text-stone-300 uppercase tracking-wider mt-1">Total Items</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-emerald-300" />
                  </div>
                </div>
              </div>

              {/* Expiry Alerts */}
              <div className="clean-card-green-inner p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-28">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{expiringCount}</span>
                    <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-wider mt-1">Expiry Alerts</h3>
                  </div>
                  <div className="p-3 bg-white/30 rounded-2xl flex items-center justify-center shrink-0 relative">
                    {expiringCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650"></span>
                      </span>
                    )}
                    <AlertTriangle className="w-5 h-5 text-emerald-950" />
                  </div>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-[#FEF7E0] border border-amber-200/40 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-28">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-extrabold text-[#B06000] tracking-tight">{lowStockCount}</span>
                    <h3 className="text-[10px] font-bold text-[#B06000] uppercase tracking-wider mt-1 opacity-80">Low Stock</h3>
                  </div>
                  <div className="p-3 bg-white/50 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-[#B06000]" />
                  </div>
                </div>
              </div>

            </div>

            {/* QUICK ADD FORM — full-width horizontal row below stats */}
            <div className="clean-card-base p-5 shadow-sm border-t-4 border-t-orange-500">
              <h3 className="text-sm font-bold text-slate-805 flex items-center gap-1.5 mb-4">
                <Plus className="w-4 h-4 text-orange-500" /> Quick Add Item
              </h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    placeholder="Item name (e.g. Milk, Apple)"
                    value={form.name}
                    onChange={setVal('name')}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all placeholder-slate-400 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Qty & Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      placeholder="Qty"
                      value={form.quantity}
                      onChange={setVal('quantity')}
                      className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all placeholder-slate-400 bg-white"
                      required
                    />
                    <select
                      value={form.unit}
                      onChange={setVal('unit')}
                      className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all bg-white"
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
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={setVal('category')}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={form.expiryDate}
                    onChange={setVal('expiryDate')}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Pantry
                </button>
              </form>
            </div>

            {/* Categories Title */}
            <div>
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/60 pb-3 mb-4">
                Pantry Categories
              </h3>
              
              {/* Categories Bento Grid - click to open modal */}
              {/* Categories Bento Grid - 2 columns on mobile, h-28 height */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {CATEGORIES.map(cat => {
                  return (
                    <div
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setModalSearch('');
                        setModalFilter('All');
                      }}
                      className="relative bg-gradient-to-br from-[#0D1527] to-[#070B14] border border-white/10 rounded-[18px] sm:rounded-[22px] p-3.5 sm:p-5 h-28 sm:h-36 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between cursor-pointer group overflow-hidden"
                    >
                      {/* High-visibility transparent background image covering the whole div */}
                      <img 
                        src={catImages[cat.toLowerCase()] || '/other_cat.png'} 
                        alt={cat}
                        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500 z-0 pointer-events-none"
                      />
                      
                      {/* Dark overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent z-0 pointer-events-none" />

                      {/* Category title at the top of the container with drop shadow for readability */}
                      <div className="relative z-10 w-full">
                        <h4 className="text-xs sm:text-lg font-black text-white tracking-tight leading-tight group-hover:text-orange-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] transition-colors">
                          {cat}
                        </h4>
                      </div>

                      {/* Centered view button shown on hover */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                        <button className="py-1.5 px-3 sm:py-2.5 sm:px-5 bg-orange-500 hover:bg-orange-600 border border-orange-450/20 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer">
                          View Shelf
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: staples + upload */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* STAPLES: Rename to "Quick Add Your Pantry" */}
            <div className="clean-card-dark rounded-2xl p-5 shadow-sm flex flex-col justify-between border-t-4 border-t-emerald-400">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4.5 h-4.5 text-emerald-300 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">Quick Add Your Pantry</h3>
                  </div>
                  <span className="text-[9px] bg-white/10 text-stone-300 font-bold px-2 py-0.5 rounded-full">
                    Staples
                  </span>
                </div>

                <p className="text-[10px] text-stone-400 font-medium mb-3 leading-relaxed">
                  Quick-add common kitchen staples directly to your inventory shelf (expires in 7 days).
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {STAPLES.map(staple => (
                    <div
                      key={staple.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{staple.name}</p>
                        <p className="text-[8px] text-stone-400 uppercase tracking-wide font-extrabold mt-0.5 truncate">{staple.category}</p>
                      </div>
                      <button
                        onClick={() => handleAddStaple(staple)}
                        className="py-1 px-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-[9px] font-bold text-white rounded-lg flex items-center gap-0.5 transition-all cursor-pointer shrink-0 ml-2"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UPLOADER & QR SCANNER: Premium Interactive Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-4.5 h-4.5 text-orange-500 animate-bounce" /> Upload & Scan Pantry
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  Bulk restock with bills, receipts, or spreadsheets
                </p>
              </div>

              {/* Drag and Drop Uploader Area */}
              <div className="border-2 border-dashed border-slate-200 hover:border-orange-500/70 rounded-2xl p-5 transition-all duration-300 text-center relative group cursor-pointer bg-slate-50 hover:bg-orange-50/10">
                <input 
                  type="file"
                  onChange={handleFileUpload}
                  accept=".csv,.xls,.xlsx,.pdf,.png,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      <p className="text-[11px] font-bold text-slate-650">Analyzing file content...</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <p className="text-[11px] font-bold text-slate-700">Drag file here or click to upload</p>
                      <p className="text-[9px] text-slate-400 font-medium">Supports Excel, CSV, PDF, and Images</p>
                    </>
                  )}
                </div>
              </div>

              {/* QR scanner button */}
              <button
                onClick={triggerQRScan}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-white" /> Scan Receipt / Item QR
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* IMPORT PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-1.5">
                  <CheckSquare className="w-5 h-5 text-emerald-500" /> Review Imported Items
                </h3>
                <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                  Extracted {previewItems.length} pantry items. Double check before confirming.
                </p>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-450 hover:text-slate-655 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List of items table/form */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {previewItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-slate-150 bg-slate-50/50 items-center justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-1 w-full">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[8px] font-black text-slate-400 uppercase">Item Name</label>
                      <input 
                        type="text"
                        value={item.name}
                        onChange={e => setPreviewItems(prev => prev.map((itemVal, i) => i === idx ? { ...itemVal, name: e.target.value } : itemVal))}
                        className="w-full mt-0.5 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none"
                      />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase">Category</label>
                      <select 
                        value={item.category}
                        onChange={e => setPreviewItems(prev => prev.map((itemVal, i) => i === idx ? { ...itemVal, category: e.target.value } : itemVal))}
                        className="w-full mt-0.5 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Qty */}
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase">Qty</label>
                      <input 
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={e => setPreviewItems(prev => prev.map((itemVal, i) => i === idx ? { ...itemVal, quantity: parseFloat(e.target.value) || 0 } : itemVal))}
                        className="w-full mt-0.5 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none"
                      />
                    </div>
                    {/* Unit */}
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase">Unit</label>
                      <select 
                        value={item.unit}
                        onChange={e => setPreviewItems(prev => prev.map((itemVal, i) => i === idx ? { ...itemVal, unit: e.target.value } : itemVal))}
                        className="w-full mt-0.5 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                      </select>
                    </div>
                    {/* Expiry */}
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase">Expiry Date</label>
                      <input 
                        type="date"
                        min={todayStr}
                        value={item.expiryDate ? item.expiryDate.split('T')[0] : ''}
                        onChange={e => setPreviewItems(prev => prev.map((itemVal, i) => i === idx ? { ...itemVal, expiryDate: e.target.value } : itemVal))}
                        className="w-full mt-0.5 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Delete Item */}
                  <button 
                    onClick={() => setPreviewItems(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 hover:text-red-600 text-slate-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> Confirm & Import to Shelf
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR SCANNER SIMULATOR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <QrCode className="w-4.5 h-4.5 text-orange-500" /> Receipt QR Scanner
                </h3>
                <p className="text-[10px] text-stone-400 font-bold mt-0.5">Scanning bill receipt to auto-import</p>
              </div>
              <button 
                onClick={() => setQrModalOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-450 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-6">
              
              {/* Animated camera window */}
              <div className="w-64 h-64 border-2 border-orange-500 rounded-3xl relative overflow-hidden flex items-center justify-center bg-black shadow-lg shadow-orange-500/10">
                
                {/* Laser beam */}
                {qrScanning && (
                  <div className="absolute left-0 w-full h-[3px] bg-orange-500 top-0 animate-[scanner_2s_ease-in-out_infinite]" />
                )}

                {/* Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

                {qrScanning ? (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-orange-400 animate-pulse" />
                    <p className="text-[10px] tracking-wider font-extrabold text-orange-500 animate-pulse">SCANNING LIVE...</p>
                  </div>
                ) : qrResult ? (
                  <div className="flex flex-col items-center gap-1.5 text-center p-4">
                    <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-[11px] font-bold text-emerald-400 mt-1">SCAN SUCCESSFUL</p>
                    <p className="text-[9px] text-stone-400 font-semibold">{qrResult.length} Items Extracted</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-400">Scanner Ready</p>
                )}
              </div>

              {/* Scanned Items List Preview */}
              {qrResult && (
                <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 max-h-44 overflow-y-auto">
                  <p className="text-[9px] font-extrabold text-stone-400 tracking-wider uppercase border-b border-white/10 pb-1.5 mb-2">Scanned Receipt Items</p>
                  {qrResult.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-stone-300">
                      <span>{item.name}</span>
                      <span className="font-extrabold text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2 justify-end">
              <button 
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              {qrResult && (
                <button 
                  onClick={handleSaveScanned}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  Add Scanned Items
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CATEGORY MODAL POPUP */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-orange-500" /> {selectedCategory} Shelf
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {getCategoryCount(selectedCategory)} items total
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-450 hover:text-slate-655 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Search + Filter chips */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-455 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={`Search in ${selectedCategory}...`}
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 transition-all placeholder-slate-455 bg-white"
                />
              </div>

              {/* Max 4 Filter chips */}
              <div className="flex gap-2">
                {['All', 'Fresh', 'Expiring', 'Expired'].map(filterVal => {
                  const active = modalFilter === filterVal;
                  return (
                    <button
                      key={filterVal}
                      onClick={() => setModalFilter(filterVal)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${active ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {filterVal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Items List */}
            <div className="flex-1 p-5 overflow-y-auto min-h-[30vh]">
              {getFilteredModalItems().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">No items found</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">
                    Use the Add Form on the main screen or staples panel to restock this shelf!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredModalItems().map(item => {
                    const expVal = item.expiryDate || item.expiry_date;
                    const expDate = expVal ? new Date(expVal) : null;
                    const isExpired = expDate && expDate < today;
                    
                    let diffDays = null;
                    if (expDate) {
                      const diffTime = expDate - today;
                      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                    
                    const isExpiring = diffDays !== null && diffDays >= 0 && (
                      isFastDecomposing(item.name) ? diffDays <= 2 : diffDays <= 1
                    );
                    
                    const isCritical = isExpiring && isFastDecomposing(item.name);
                    
                    const statusTag = isExpired 
                      ? { text: 'Expired', bg: 'bg-red-50 text-red-655 border-red-200 font-bold' }
                      : isExpiring 
                        ? isCritical
                          ? { text: 'Critical Expiry', bg: 'bg-red-500 text-white border-red-600 animate-pulse font-bold' }
                          : { text: 'Expiring Soon', bg: 'bg-amber-50 text-amber-655 border-amber-200 font-semibold' }
                        : { text: 'Fresh', bg: 'bg-green-50 text-green-600 border-green-200' };

                    const isEditing = editingItemId === item.id;

                    if (isEditing) {
                      return (
                        <div key={item.id} className="p-4 rounded-xl border border-orange-200 bg-orange-50/10 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Item Name</label>
                              <input 
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full mt-1 px-2.5 py-1.5 border border-slate-205 rounded-lg text-xs bg-white text-slate-805 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Expiry Date</label>
                              <input 
                                type="date"
                                min={todayStr}
                                value={editForm.expiryDate}
                                onChange={e => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                className="w-full mt-1 px-2.5 py-1.5 border border-slate-205 rounded-lg text-xs bg-white text-slate-805 outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Quantity</label>
                              <input 
                                type="number"
                                step="any"
                                value={editForm.quantity}
                                onChange={e => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                                className="w-full mt-1 px-2.5 py-1.5 border border-slate-205 rounded-lg text-xs bg-white text-slate-805 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Unit</label>
                              <select 
                                value={editForm.unit}
                                onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                                className="w-full mt-1 px-2.5 py-1.5 border border-slate-205 rounded-lg text-xs bg-white text-slate-805 outline-none bg-white"
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

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Category</label>
                              <select 
                                value={editForm.category}
                                onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full mt-1 px-2.5 py-1.5 border border-slate-205 rounded-lg text-xs bg-white text-slate-805 outline-none bg-white"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1.5">
                            <button 
                              onClick={cancelEdit}
                              className="px-3 py-1.5 border border-slate-250 rounded-lg text-[10px] font-bold text-slate-605 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => saveEdit(item.id)}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Save Changes
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={item.id} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 gap-3"
                      >
                        {/* Name & Expiry Tag */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${statusTag.bg}`}>
                              {statusTag.text}
                            </span>
                            {checkLowStock(item) && (
                              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border bg-amber-500 text-white border-amber-600 animate-pulse">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Expires: {expVal ? new Date(expVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Expiry'}
                          </p>
                        </div>

                        {/* Adjust qty, edit, delete actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          
                          {/* Qty adjustments */}
                          <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-xl px-2 py-1 gap-2.5">
                            <button 
                              onClick={() => handleQtyAdjust(item, item.unit === 'kg' || item.unit === 'L' ? -0.25 : -1)}
                              className="w-5 h-5 rounded bg-white hover:bg-slate-100 text-slate-550 flex items-center justify-center font-bold text-xs select-none border border-slate-200/20 cursor-pointer shadow-sm"
                            >
                              -
                            </button>
                            <span className="text-xs font-extrabold text-slate-800 min-w-[50px] text-center">
                              {item.quantity} <span className="text-[9px] font-bold text-slate-400">{item.unit}</span>
                            </span>
                            <button 
                              onClick={() => handleQtyAdjust(item, item.unit === 'kg' || item.unit === 'L' ? 0.25 : 1)}
                              className="w-5 h-5 rounded bg-white hover:bg-slate-100 text-slate-550 flex items-center justify-center font-bold text-xs select-none border border-slate-200/20 cursor-pointer shadow-sm"
                            >
                              +
                            </button>
                          </div>

                          {/* Edit / Trash */}
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => startEdit(item)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-orange-600 text-slate-405 rounded-lg transition-all border border-slate-200/10 cursor-pointer"
                              title="Edit item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-655 text-slate-405 rounded-lg transition-all border border-slate-200/10 cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              >
                Close Shelf
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
