import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UploadCloud, FileSpreadsheet, Image, ClipboardList,
  Plus, Trash2, Check, Loader2, AlertTriangle, ChevronRight, RefreshCw
} from 'lucide-react';
import './BulkImportModal.css';

const CATS = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Proteins', 'Condiments', 'Other'];

// ── Simple CSV/text parser ─────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];

  // Detect if first line is header
  const firstLower = lines[0].toLowerCase();
  const hasHeader = firstLower.includes('name') || firstLower.includes('item') || firstLower.includes('category');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    // Support comma, tab, semicolon separators
    const parts = line.split(/,|\t|;/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    const name = parts[0] || `Item ${idx + 1}`;
    const qty  = parseFloat(parts[1]) || 1;
    const unit = parts[2] || 'kg';
    const cat  = CATS.find(c => c.toLowerCase() === (parts[3] || '').toLowerCase()) || 'Other';
    const expiry = parts[4] || '';

    return {
      name,
      quantity: qty,
      unit,
      category: cat,
      expiry_date: expiry ? `${expiry}T00:00:00` : null,
      storage_location: 'shelf',
      brand: '',
      notes: 'Bulk imported',
      is_essential: false,
    };
  }).filter(it => it.name.trim());
}

// ── Simple text list parser (one item per line) ───────────────────────────────
function parseTextList(text) {
  return text.trim().split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1)
    .map(name => ({
      name,
      quantity: 1,
      unit: 'kg',
      category: 'Other',
      expiry_date: null,
      storage_location: 'shelf',
      brand: '',
      notes: 'Bulk imported',
      is_essential: false,
    }));
}

// ── Mock image OCR result (demo) ──────────────────────────────────────────────
const DEMO_OCR_RESULTS = [
  { name: 'Milk', quantity: 2, unit: 'litre', category: 'Dairy' },
  { name: 'Bread', quantity: 1, unit: 'loaf', category: 'Grains' },
  { name: 'Eggs', quantity: 1, unit: 'dozen', category: 'Dairy' },
  { name: 'Tomato', quantity: 0.5, unit: 'kg', category: 'Vegetables' },
  { name: 'Spinach/Palak', quantity: 0.3, unit: 'kg', category: 'Vegetables' },
  { name: 'Cheddar Cheese', quantity: 0.2, unit: 'kg', category: 'Dairy' },
];

const TABS = [
  { id: 'csv',   label: 'CSV / Excel', icon: FileSpreadsheet, color: '#10b981' },
  { id: 'text',  label: 'Text List',   icon: ClipboardList,   color: '#6366f1' },
  { id: 'image', label: 'Scan / Photo',icon: Image,           color: '#f59e0b' },
];

export default function BulkImportModal({ isOpen, onClose, existingItems = [], onImport }) {
  const [tab, setTab] = useState('csv');
  const [csvText, setCsvText] = useState('');
  const [textList, setTextList] = useState('');
  const [parsed, setParsed] = useState([]); // parsed items ready to review
  const [step, setStep] = useState('input'); // input | review
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const imageInputRef = useRef();

  const reset = () => {
    setParsed([]); setStep('input');
    setCsvText(''); setTextList('');
    setImageFile(null); setImageSrc(null);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── CSV/Excel file upload ──────────────────────────────────────────────────
  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  // ── Image upload / OCR (demo) ─────────────────────────────────────────────
  const handleImageUpload = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleScanImage = () => {
    if (!imageFile && !imageSrc) return;
    setOcrLoading(true);
    // Simulate OCR processing — in production this would call an OCR API
    setTimeout(() => {
      const base = [...DEMO_OCR_RESULTS];
      // Filter out existing
      const filtered = base.filter(
        it => !existingItems.some(ex => ex.name.toLowerCase() === it.name.toLowerCase())
      );
      setParsed(filtered.map(it => ({
        ...it,
        expiry_date: null,
        storage_location: 'fridge',
        brand: '',
        notes: 'Scanned from image',
        is_essential: false,
        _selected: true,
      })));
      setOcrLoading(false);
      setStep('review');
    }, 2200);
  };

  // ── Parse CSV/text and move to review ────────────────────────────────────
  const handleParse = () => {
    let result = [];
    if (tab === 'csv') result = parseCSV(csvText);
    else if (tab === 'text') result = parseTextList(textList);

    if (result.length === 0) return;

    // Mark duplicates
    result = result.map(it => ({
      ...it,
      _selected: !existingItems.some(ex => ex.name.toLowerCase() === it.name.toLowerCase()),
      _isDuplicate: existingItems.some(ex => ex.name.toLowerCase() === it.name.toLowerCase()),
    }));

    setParsed(result);
    setStep('review');
  };

  const toggleSelect = (idx) => {
    setParsed(prev => prev.map((it, i) => i === idx ? { ...it, _selected: !it._selected } : it));
  };

  const removeItem = (idx) => {
    setParsed(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmImport = () => {
    const selected = parsed.filter(it => it._selected && !it._isDuplicate);
    if (selected.length === 0) return;
    const clean = selected.map(({ _selected, _isDuplicate, ...rest }) => rest);
    onImport(clean);
  };

  const selectedCount = parsed.filter(it => it._selected && !it._isDuplicate).length;

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="bim-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bim-modal"
          initial={{ scale: 0.93, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bim-header">
            <div className="bim-header-left">
              <div className="bim-header-icon">
                <UploadCloud size={20} />
              </div>
              <div>
                <h2 className="bim-title">Bulk Import Items</h2>
                <p className="bim-subtitle">Import pantry items from CSV, text list, or a photo</p>
              </div>
            </div>
            <button className="bim-close" onClick={handleClose}><X size={18} /></button>
          </div>

          {/* Tabs */}
          <div className="bim-tabs">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`bim-tab ${tab === t.id ? 'active' : ''}`}
                  style={tab === t.id ? { borderColor: t.color, color: t.color } : {}}
                  onClick={() => { setTab(t.id); setStep('input'); setParsed([]); }}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="bim-body">
            {step === 'input' && (
              <AnimatePresence mode="wait">
                {/* ── CSV Tab ── */}
                {tab === 'csv' && (
                  <motion.div key="csv" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bim-tab-body">
                    <div
                      className={`bim-dropzone ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet size={32} className="bim-drop-icon" />
                      <p className="bim-drop-text">Drag & drop CSV or Excel file here</p>
                      <p className="bim-drop-hint">or click to browse · .csv, .xlsx, .xls, .txt</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt"
                        className="hidden"
                        onChange={e => handleFileUpload(e.target.files[0])}
                      />
                    </div>

                    <div className="bim-divider"><span>or paste CSV data</span></div>

                    <div className="bim-format-hint">
                      <strong>Format:</strong> name, quantity, unit, category, expiry_date (YYYY-MM-DD)<br/>
                      <span>Example: <code>Tomato, 1, kg, Vegetables, 2025-06-20</code></span>
                    </div>

                    <textarea
                      className="bim-textarea"
                      value={csvText}
                      onChange={e => setCsvText(e.target.value)}
                      placeholder={'name,qty,unit,category,expiry\nTomato,1,kg,Vegetables,2025-06-20\nMilk,2,litre,Dairy,2025-06-10\nBasmati Rice,5,kg,Grains,'}
                      rows={7}
                    />

                    <button
                      className="bim-parse-btn"
                      onClick={handleParse}
                      disabled={!csvText.trim()}
                    >
                      <ChevronRight size={16} /> Preview & Import
                    </button>
                  </motion.div>
                )}

                {/* ── Text List Tab ── */}
                {tab === 'text' && (
                  <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bim-tab-body">
                    <div className="bim-format-hint">
                      <strong>Format:</strong> One item name per line. Category & quantity will be auto-detected from the catalog.<br/>
                      <span>Example: <code>Tomato</code>, <code>Milk</code>, <code>Basmati Rice</code></span>
                    </div>
                    <textarea
                      className="bim-textarea"
                      value={textList}
                      onChange={e => setTextList(e.target.value)}
                      placeholder={'Tomato\nMilk\nBasmati Rice\nOnion\nGhee\nSpinach'}
                      rows={10}
                    />
                    <button
                      className="bim-parse-btn"
                      onClick={handleParse}
                      disabled={!textList.trim()}
                    >
                      <ChevronRight size={16} /> Preview & Import
                    </button>
                  </motion.div>
                )}

                {/* ── Image/Scan Tab ── */}
                {tab === 'image' && (
                  <motion.div key="image" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bim-tab-body">
                    {!imageSrc ? (
                      <div
                        className="bim-dropzone"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Image size={40} className="bim-drop-icon" style={{ color: '#f59e0b' }} />
                        <p className="bim-drop-text">Upload a grocery list photo or receipt</p>
                        <p className="bim-drop-hint">JPG, PNG, WEBP — AI will extract items from the image</p>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={e => handleImageUpload(e.target.files[0])}
                        />
                      </div>
                    ) : (
                      <div className="bim-image-preview-area">
                        <img src={imageSrc} alt="Uploaded" className="bim-image-preview" />
                        <button className="bim-reupload" onClick={() => { setImageFile(null); setImageSrc(null); }}>
                          <RefreshCw size={12} /> Change Image
                        </button>
                      </div>
                    )}

                    {imageSrc && (
                      <button
                        className="bim-parse-btn bim-scan-btn"
                        onClick={handleScanImage}
                        disabled={ocrLoading}
                      >
                        {ocrLoading ? (
                          <><Loader2 size={16} className="animate-spin" /> Scanning image…</>
                        ) : (
                          <><Image size={16} /> Extract Items from Image</>
                        )}
                      </button>
                    )}

                    <div className="bim-ai-note">
                      🤖 AI extraction is a demo simulation. In production, this connects to a Vision API (Google Vision / OpenAI) to parse real grocery lists, receipts, or pantry photos.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ── Review Step ── */}
            {step === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bim-review">
                <div className="bim-review-header">
                  <span className="bim-review-count">
                    {parsed.length} items detected · <strong style={{ color: '#10b981' }}>{selectedCount} will be imported</strong>
                  </span>
                  <button className="bim-back-btn" onClick={() => { setStep('input'); setParsed([]); }}>
                    ← Back
                  </button>
                </div>

                <div className="bim-review-list">
                  {parsed.map((item, idx) => (
                    <div
                      key={idx}
                      className={`bim-review-item ${item._isDuplicate ? 'duplicate' : ''} ${item._selected ? 'selected' : 'deselected'}`}
                    >
                      <input
                        type="checkbox"
                        checked={item._selected && !item._isDuplicate}
                        disabled={item._isDuplicate}
                        onChange={() => toggleSelect(idx)}
                        className="bim-checkbox"
                      />
                      <div className="bim-review-name">
                        <span className="bim-item-name">{item.name}</span>
                        <span className="bim-item-meta">{item.quantity} {item.unit} · {item.category}</span>
                      </div>
                      {item._isDuplicate ? (
                        <span className="bim-dup-badge"><AlertTriangle size={10} /> Already in pantry</span>
                      ) : (
                        <button className="bim-remove-btn" onClick={() => removeItem(idx)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bim-review-actions">
                  <button className="bim-cancel-btn" onClick={handleClose}>Cancel</button>
                  <button
                    className="bim-confirm-btn"
                    onClick={handleConfirmImport}
                    disabled={selectedCount === 0}
                  >
                    <Check size={16} /> Import {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
