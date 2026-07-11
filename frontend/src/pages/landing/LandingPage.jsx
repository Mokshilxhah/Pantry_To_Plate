import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, ArrowRight, Sparkles, Users, Brain,
  BarChart3, Camera, Star, CheckCircle,
  MessageCircle, ChevronDown, Menu, X, Send,
  Bell, Heart, Shield, Zap, TrendingDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "The AI suggestion tool is magic. I toggle what's in my fridge and get a chef-quality meal in 15 minutes.", author: "Marcus Vance", role: "Software Engineer, Seattle WA", avatar: "👨‍💻", stars: 5 },
  { quote: "No more duplicate milk cartons! My kids actually vote on recipes through the chat polls. Life-changing.", author: "The Rodriguez Family", role: "Family of 5, Chicago IL", avatar: "👨‍👩‍👧‍👦", stars: 5 },
  { quote: "The expiry alerts are a lifesaver. I used to forget yogurt in the back of the fridge — now I get a ping and a smoothie recipe!", author: "Emily Watson", role: "Fitness Coach, Denver CO", avatar: "🧘‍♀️", stars: 5 },
  { quote: "We saved $150 in our first month. Scanning grocery receipts and seeing exactly what we need to use is incredible.", author: "Sarah Jenkins", role: "Mother of 3, Austin TX", avatar: "👩‍💼", stars: 5 },
  { quote: "Finally an app that understands family chaos. The shared shopping list updates in real-time for everyone.", author: "Tom & Lisa Park", role: "Couple, Portland OR", avatar: "💑", stars: 5 },
  { quote: "I reduced my food waste by over 40% in just two months. The analytics dashboard really opened my eyes.", author: "Derek Okonkwo", role: "Chef & Foodie, New York NY", avatar: "👨‍🍳", stars: 5 },
  { quote: "Perfect for meal prep! I set dietary preferences and it only suggests recipes matching my macros. Brilliant.", author: "Priya Sharma", role: "Nutritionist, Boston MA", avatar: "🥗", stars: 5 },
  { quote: "The barcode scanner is instant. My pantry catalog went from 0 to 80 items in under 5 minutes.", author: "James Whitfield", role: "College Student, LA CA", avatar: "🎓", stars: 5 },
];

const FAQS = [
  { question: "How does the AI suggest recipes?", answer: "Our AI analyzes active ingredients in your virtual pantry, checks your dietary preferences, and cross-references them with thousands of recipes to suggest the best, fastest, and lowest-waste options instantly." },
  { question: "How do I scan items into my pantry?", answer: "Scan barcodes with your smartphone camera or snap a photo of a grocery receipt. Our OCR engine automatically extracts food items, estimates shelf-life, and adds them to your kitchen database." },
  { question: "Can my entire family share the same kitchen database?", answer: "Yes! With Family and Pro plans, invite family members to your kitchen. Everyone gets live pantry access, shared shopping lists, expiry alerts, and dinner chat polls." },
  { question: "Will the app alert me before food goes bad?", answer: "Absolutely. Configure alert triggers (e.g., 2 days before milk expires). The app sends push notifications and flags items in your 'Expiring Soon' filter so nothing gets wasted." },
  { question: "Is there a contract or credit card required to start?", answer: "No! Start on our free Solo Starter plan with zero credit card required. Upgrade anytime when you're ready for the full family experience." },
];

const PLAYGROUND_RECIPES = {
  "chicken,pasta,cream": { title: "Creamy Tuscan Garlic Chicken Pasta", time: "20 mins", calories: "480 kcal", desc: "Seared chicken in velvety cream sauce with garlic and penne.", emoji: "🍝" },
  "tomato,cheese,pasta": { title: "Classic Caprese Mozzarella Pasta", time: "15 mins", calories: "390 kcal", desc: "Hot pasta with burst cherry tomatoes, mozzarella, and basil.", emoji: "🍅" },
  "chicken,spinach,cream": { title: "Tuscan Creamy Chicken & Spinach", time: "25 mins", calories: "430 kcal", desc: "Keto-friendly skillet with pan-cooked chicken in garlic-parmesan cream.", emoji: "🍗" },
  "spinach,tomato,pasta": { title: "Tuscan Garden Tomato & Spinach Pasta", time: "18 mins", calories: "320 kcal", desc: "Baby spinach wilted in olive oil, garlic, and crushed tomatoes over spaghetti.", emoji: "🥬" },
  "chicken,tomato,cheese": { title: "Baked Tomato Herb Caprese Chicken", time: "22 mins", calories: "360 kcal", desc: "Chicken topped with marinara, fresh tomatoes, and melted mozzarella.", emoji: "🧀" },
  "tomato,cheese": { title: "Fresh Caprese Plate with Basil Oil", time: "5 mins", calories: "180 kcal", desc: "Zero cooking. Ripe tomatoes and mozzarella drizzled with olive oil.", emoji: "🥗" },
};

const STEPS = [
  { num: 1, title: "Scan & Catalog", desc: "Snap grocery receipts or scan barcodes to auto-build your pantry.", icon: "📷", preview: { label: "STEP 1: SCAN Grocery Receipt", body: "Upload Photo of Receipt", sub: "Drag & drop photo or snap live", note: "Automatically reads item names, quantity, and approximate expiries." } },
  { num: 2, title: "Receive Freshness Alerts", desc: "Get notified days before key ingredients spoil to prevent waste.", icon: "🔔", preview: { label: "STEP 2: Freshness Alerts", body: "🥛 Organic Milk — Expiring in 2 hours", sub: "Alert sent to all family members", note: "Configurable notification timing per ingredient type." } },
  { num: 3, title: "Pick AI Recipes", desc: "Instantly match available ingredients with custom chef suggestions.", icon: "🧠", preview: { label: "STEP 3: AI Recipe Match", body: "Creamy Tuscan Garlic Chicken Pasta", sub: "95% ingredient match from your pantry", note: "AI cross-references 10,000+ chef-designed recipes instantly." } },
  { num: 4, title: "Sync Shared Table", desc: "Share lists, chat on dinner polls, and coordinate family meal runs.", icon: "👨‍👩‍👧‍👦", preview: { label: "STEP 4: Sync Family Table", body: "Mom added 3 items to shopping list", sub: "Dad voted: 'Let's do pasta tonight!'", note: "Real-time sync across all family devices instantly." } },
];

const BENTO_ITEMS = [
  { name: "🥛 Organic Milk", days: "2 hours", status: "expired" },
  { name: "🥑 Haas Avocado", days: "1 day", status: "expiry" },
  { name: "🍗 Chicken Breast", days: "3 days", status: "fresh" },
  { name: "🥬 Baby Spinach", days: "4 days", status: "fresh" },
  { name: "🍞 Sourdough Bread", days: "Expired", status: "expired" },
  { name: "🍅 Fresh Tomatoes", days: "2 days", status: "fresh" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusClsDark = (s) => {
  if (s === "expired") return "bg-red-500/15 text-red-400 border border-red-500/25";
  if (s === "expiry") return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25";
  return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
};

const statusClsLight = (s) => {
  if (s === "expired") return "bg-red-50 text-red-600 border border-red-200";
  if (s === "expiry") return "bg-yellow-50 text-yellow-600 border border-yellow-200";
  return "bg-emerald-50 text-emerald-600 border border-emerald-200";
};

// Section backgrounds — alternating for contrast
const SEC = {
  dark:  "bg-[#0B0B10]",
  mid:   "bg-[#0F0F18]",
  alt:   "bg-[#0D0D15]",
};

// ─── TESTIMONIAL MARQUEE ─────────────────────────────────────────────────────
function TestimonialMarquee() {
  const items = [...TESTIMONIALS, ...TESTIMONIALS]; // duplicate for seamless loop
  return (
    <div className="relative overflow-hidden w-full">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0B10] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0B10] to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: "marquee 40s linear infinite",
        }}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className="w-72 flex-shrink-0 bg-[#13131F] border border-white/6 rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex gap-0.5">
              {[...Array(t.stars)].map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-[12px] text-white/65 italic leading-relaxed flex-1">"{t.quote}"</p>
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-base">{t.avatar}</div>
              <div>
                <div className="text-[11px] font-bold text-white">{t.author}</div>
                <div className="text-[10px] text-white/35">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Hero
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [heroPantry, setHeroPantry] = useState([
    { name: "🥛 Organic Whole Milk", expiry: "Expiring in 2 hours", status: "expired" },
    { name: "🥑 Haas Avocado", expiry: "Expiring in 1 day", status: "expiry" },
    { name: "🍞 Sourdough Bread", expiry: "Expiring in 3 days", status: "fresh" },
  ]);

  // Features
  const [bentoTab, setBentoTab] = useState("all");

  // Steps
  const [activeStep, setActiveStep] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState([
    { sender: "Mom", text: "What should we cook? Fridge is full of random stuff.", avatar: "👩", isBot: false },
    { sender: "Pantry Bot", text: "💡 Try 'Tuscan Chicken & Spinach' — uses 2 expiring items!", avatar: "🤖", isBot: true },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Playground
  const [selected, setSelected] = useState([]);

  // Pricing
  const [monthly, setMonthly] = useState(true);

  // FAQ
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleScan = () => {
    if (scanning || scanDone) return;
    setScanning(true);
    setTimeout(() => {
      setHeroPantry(p => [{ name: "🐟 Fresh Salmon Fillet", expiry: "Expiring in 4 days", status: "fresh" }, ...p]);
      setScanning(false);
      setScanDone(true);
    }, 2000);
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(p => [...p, { sender: "You", text: chatInput, avatar: "🍳", isBot: false }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(p => [...p, { sender: "Pantry Bot", text: "📝 Shopping list updated for everyone!", avatar: "🤖", isBot: true }]);
    }, 900);
  };

  const toggleIng = (n) => setSelected(p => p.includes(n) ? p.filter(i => i !== n) : [...p, n]);

  const getRecipe = () => {
    if (selected.length === 0) return { title: "Select ingredients on the left!", desc: "Choose 2+ ingredients to see what the AI creates instantly.", time: "--", calories: "--", emoji: "🧑‍🍳" };
    if (selected.length === 1) return { title: "Add one more ingredient!", desc: "AI needs at least 2 ingredients to generate a full recipe card.", time: "--", calories: "--", emoji: "💡" };
    const key = [...selected].sort().join(",");
    if (PLAYGROUND_RECIPES[key]) return PLAYGROUND_RECIPES[key];
    const found = Object.keys(PLAYGROUND_RECIPES).find(k => k.split(",").every(p => selected.includes(p)));
    if (found) return PLAYGROUND_RECIPES[found];
    return { title: "Pantry Stir-Fry Feast", time: "12 mins", calories: `${180 + selected.length * 40} kcal`, desc: "Quick pantry stir-fry with your selected ingredients — sautéed in olive oil with garlic. Healthy, fast, zero waste!", emoji: "🔥" };
  };

  const recipe = getRecipe();
  const filteredBento = BENTO_ITEMS.filter(i => {
    if (bentoTab === "expiring") return i.status !== "fresh";
    if (bentoTab === "fresh") return i.status === "fresh";
    return true;
  });

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      {/* ── Global marquee keyframe ── */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marqueeSlow { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>

    <div className="min-h-screen bg-[#0B0B10] text-white font-sans overflow-x-hidden selection:bg-[#E8956D]/25">

      {/* Background glows (fixed, subtle) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E8956D]/5 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#8B8FFF]/4 blur-[100px]" />
      </div>

      {/* ═══════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-5xl"
      >
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300" style={{ background: navScrolled ? 'rgba(11,11,16,0.96)' : 'rgba(19,19,26,0.88)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-1.5 rounded-lg shadow-md shadow-[#E8956D]/20 group-hover:scale-105 transition-transform">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-extrabold tracking-tight text-white">
              Pantry<span className="text-[#E8956D]">to</span>Plate
            </span>
          </a>

          {/* Desktop nav links — always rendered, hidden only below md */}
          <div className="max-md:hidden flex items-center gap-7">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#E8956D'}
                onMouseLeave={e => e.target.style.color = '#ffffff'}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 relative" ref={dropdownRef}>
            <button
              onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white text-[12px] font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#E8956D]/20 hover:shadow-[#E8956D]/35 hover:scale-[1.02] transition-all cursor-pointer select-none border-none"
            >
              Sign In / Register <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${authDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition-colors" aria-label="Menu">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {authDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#13131F] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 backdrop-blur-xl"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-[9px] font-extrabold text-[#E8956D] uppercase tracking-wider px-2 mb-1.5">Sign In</div>
                      <div className="space-y-1">
                        <Link
                          to="/admin/login"
                          onClick={() => setAuthDropdownOpen(false)}
                          className="flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-xl transition-all"
                        >
                          <span>Kitchen Admin (Owner)</span>
                          <span className="text-[9px] bg-[#E8956D]/15 text-[#E8956D] px-1.5 py-0.5 rounded">Admin</span>
                        </Link>
                        <Link
                          to="/member/login"
                          onClick={() => setAuthDropdownOpen(false)}
                          className="flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-xl transition-all"
                        >
                          <span>Family Member</span>
                          <span className="text-[9px] bg-[#8B8FFF]/15 text-[#8B8FFF] px-1.5 py-0.5 rounded">Member</span>
                        </Link>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <div className="text-[9px] font-extrabold text-[#8B8FFF] uppercase tracking-wider px-2 mb-1.5">Register</div>
                      <div className="space-y-1">
                        <Link
                          to="/admin/register"
                          onClick={() => setAuthDropdownOpen(false)}
                          className="flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-xl transition-all"
                        >
                          <span>Register Admin Kitchen</span>
                          <span className="text-[9px] bg-[#E8956D]/15 text-[#E8956D] px-1.5 py-0.5 rounded">Admin</span>
                        </Link>
                        <Link
                          to="/member/register"
                          onClick={() => setAuthDropdownOpen(false)}
                          className="flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-xl transition-all"
                        >
                          <span>Join Family Kitchen</span>
                          <span className="text-[9px] bg-[#8B8FFF]/15 text-[#8B8FFF] px-1.5 py-0.5 rounded">Member</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 bg-[#13131A]/97 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col gap-2"
            >
              {navLinks.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-white/65 hover:text-[#E8956D] py-1.5 border-b border-white/5 transition-colors">{l.label}</a>
              ))}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5">
                <div className="text-[10px] font-extrabold text-[#E8956D] uppercase tracking-wider">Admin Portal</div>
                <div className="flex gap-2">
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl bg-white/5 border border-white/10 text-white">Admin Login</Link>
                  <Link to="/admin/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white">Admin Reg</Link>
                </div>
                
                <div className="text-[10px] font-extrabold text-[#8B8FFF] uppercase tracking-wider mt-1">Family Portal</div>
                <div className="flex gap-2">
                  <Link to="/member/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl bg-white/5 border border-white/10 text-white">Member Login</Link>
                  <Link to="/member/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl bg-gradient-to-r from-[#8B8FFF] to-[#6A6EFF] text-white">Member Reg</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════
          HERO — bg-[#0B0B10] (darkest)
      ═══════════════════════════════════════════════════ */}
      <section className={`relative z-10 ${SEC.dark} min-h-screen flex items-center pt-32 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6`}>
        <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
              <span className="text-white block">No more,</span>
              <span className="block">
                <span className="text-[#E8956D]">What to Cook </span>
                <span className="text-[#9B9EFF]">Today</span>
                <span className="text-white"> ?</span>
              </span>
            </h1>
            <p className="text-[#A0A0B5] text-xs sm:text-sm leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Transform your kitchen with a smart, collaborative AI manager. Track food freshness automatically, receive expiry alerts, share shopping lists, and get tailored chef-designed recipes based on what's in your fridge.
            </p>

            {/* Direct Portal CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-lg">
              {/* Admin Portal Card */}
              <div className="bg-[#13131F]/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-left hover:border-[#E8956D]/50 hover:shadow-[0_0_20px_rgba(232,149,109,0.15)] transition-all duration-300 transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#E8956D] uppercase tracking-wider mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8956D]" /> Owner / Admin
                  </div>
                  <p className="text-[11.5px] text-[#A0A0B5] leading-relaxed mb-4">Create a kitchen hub, invite family, scan receipts, & plan meals.</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/admin/login" className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white text-[12px] font-bold rounded-xl transition-all duration-200 active:scale-[0.97]">Login</Link>
                  <Link to="/admin/register" className="flex-1 text-center py-2.5 bg-gradient-to-r from-[#E8956D] to-[#C96B35] hover:brightness-110 text-white text-[12px] font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#E8956D]/20 active:scale-[0.97]">Register</Link>
                </div>
              </div>

              {/* Member Portal Card */}
              <div className="bg-[#13131F]/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-left hover:border-[#8B8FFF]/50 hover:shadow-[0_0_20px_rgba(139,143,255,0.15)] transition-all duration-300 transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#8B8FFF] uppercase tracking-wider mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B8FFF]" /> Family Member
                  </div>
                  <p className="text-[11.5px] text-[#A0A0B5] leading-relaxed mb-4">Join an existing family kitchen, sync shopping lists, & vote on meals.</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/member/login" className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white text-[12px] font-bold rounded-xl transition-all duration-200 active:scale-[0.97]">Login</Link>
                  <Link to="/member/register" className="flex-1 text-center py-2.5 bg-gradient-to-r from-[#8B8FFF] to-[#6A6EFF] hover:brightness-110 text-white text-[12px] font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#8B8FFF]/20 active:scale-[0.97]">Register</Link>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 w-full mb-10 lg:mb-0">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {["👩", "👨‍💻", "👩‍🍳", "🧑"].map((a, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[#1C1C28] border-2 border-[#0B0B10] flex items-center justify-center text-xs shadow">{a}</div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-white">10,000+</div>
                  <div className="text-[11px] text-white/40">Kitchens Managed</div>
                </div>
              </div>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  <span className="font-bold text-white text-xs ml-1">4.9/5</span>
                </div>
                <div className="text-[11px] text-white/40">Verified family rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right — Dashboard mockup */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="relative flex justify-center lg:justify-end">

            {/* Floating alert */}
            <div className="absolute -top-2 right-2 sm:right-4 bg-[#1A1A28] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xl z-20 backdrop-blur-sm">
              <div className="w-4 h-4 rounded-full bg-yellow-400/15 flex items-center justify-center"><Bell className="w-2.5 h-2.5 text-yellow-400" /></div>
              <div><div className="text-[10px] font-bold text-white">Alert: Milk Expiring</div><div className="text-[9px] text-white/40">Use in next 2 hours.</div></div>
            </div>

            {/* Floating savings */}
            <div className="absolute -bottom-3 left-2 bg-[#0E2018] border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl z-20">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <div><div className="text-[11px] font-bold text-emerald-400">40% Saved</div><div className="text-[9px] text-emerald-400/55">Monthly food waste cut</div></div>
            </div>

            {/* Card */}
            <div className="w-full max-w-[420px] bg-[#13131F] border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/5">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Kitchen Dashboard</span>
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-xs">👤</div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#E8956D]/15 flex items-center justify-center"><span className="text-xs">📦</span></div>
                    <span className="text-[12px] font-bold text-white">Live Virtual Pantry</span>
                  </div>
                  <button onClick={handleScan} disabled={scanning} className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${scanDone ? "border-white/8 text-white/25 cursor-default" : "border-[#8B8FFF]/35 text-[#A8ABFF] bg-[#8B8FFF]/8 hover:bg-[#8B8FFF]/18"}`}>
                    <Camera className="w-2.5 h-2.5" />{scanning ? "Scanning..." : scanDone ? "Done ✓" : "Scan Receipt"}
                  </button>
                </div>

                {scanning && <div className="h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />}

                <div className="space-y-1.5">
                  <AnimatePresence>
                    {heroPantry.map((item, i) => (
                      <motion.div key={item.name} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/3 border border-white/4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === "expired" ? "bg-red-400" : item.status === "expiry" ? "bg-yellow-400" : "bg-emerald-400"}`} />
                          <span className="text-[11px] font-semibold text-white">{item.name}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${statusClsDark(item.status)}`}>{item.expiry}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#8B8FFF]/6 border border-[#8B8FFF]/12">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#8B8FFF]/15 flex items-center justify-center text-sm">🧑‍🍳</div>
                    <div><div className="text-[10px] font-bold text-white">AI Suggestion Ready</div><div className="text-[9px] text-white/40">Match recipes using expiring items.</div></div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><ArrowRight className="w-2.5 h-2.5 text-white/50" /></div>
                </div>

                {scanDone && (
                  <button onClick={() => { setScanDone(false); setHeroPantry([{ name: "🥛 Organic Whole Milk", expiry: "Expiring in 2 hours", status: "expired" }, { name: "🥑 Haas Avocado", expiry: "Expiring in 1 day", status: "expiry" }, { name: "🍞 Sourdough Bread", expiry: "Expiring in 3 days", status: "fresh" }]); }} className="text-[9px] text-white/25 hover:text-white/50 transition-colors w-full text-right bg-transparent border-none cursor-pointer">↺ Reset mock</button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES BENTO — bg-[#0F0F18] (mid, lighter)
      ═══════════════════════════════════════════════════ */}
            <section id="features" className="relative z-10 bg-[#EFF2F6] py-16 px-4 sm:px-6 border-y border-slate-300">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-slate-200/80 border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 select-none">
              <Shield className="w-2.5 h-2.5 text-slate-600" />Key Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug">
              Everything you need to run a<br />
              <span className="text-[#E8956D] font-extrabold">smart, collaborative kitchen</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">Say goodbye to messy refrigerators and endless debates over what to eat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 — Active Pantry */}
            <div className="bg-white border border-slate-250/90 rounded-2xl p-5 flex flex-col gap-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:border-slate-350 transition-all duration-300">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-200"><span className="text-base select-none">📋</span></div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">Active Pantry Tracking</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">Filter and audit items dynamically</div>
                  </div>
                </div>
                <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[9px] font-bold gap-0.5 select-none">
                  {["All", "Expiring", "Fresh"].map(t => (
                    <button key={t} onClick={() => setBentoTab(t.toLowerCase())} className={`px-2.5 py-0.5 rounded capitalize transition-all cursor-pointer ${bentoTab === t.toLowerCase() ? "bg-[#E8956D] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredBento.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    <span className="text-[11px] font-bold text-slate-700 truncate mr-1">{item.name}</span>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${statusClsLight(item.status)}`}>{item.days}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] pt-3 border-t border-slate-150 font-bold">
                <span className="text-slate-400 font-medium">Supports notification alerts & barcode integration</span>
                <a href="#how-it-works" className="text-[#E8956D] font-extrabold hover:underline">Learn More ↗</a>
              </div>
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-4">
              {/* Card 2 — AI Cook */}
              <div className="bg-white border border-slate-250/90 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:border-slate-350 transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-200"><Brain className="w-4.5 h-4.5 text-[#E8956D]" /></div>
                <div>
                  <div className="text-[13px] font-bold text-slate-800 mb-1">1-Click AI Cook</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Match available ingredients with healthy custom recipes. Let the algorithm formulate meals that save expiring products.</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 select-none">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-slate-500 font-bold">Ingredients matching: 95%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-gradient-to-r from-[#E8956D] to-[#7DC4A0] rounded-full" />
                  </div>
                </div>
                <a href="#playground" className="text-[#8B8FFF] text-[10px] font-bold hover:underline">Explore culinary engine ↗</a>
              </div>

              {/* Card 3 — Family Hub */}
              <div className="bg-white border border-slate-250/90 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:border-slate-350 transition-all duration-300 flex-1">
                <div className="w-8 h-8 rounded-xl bg-[#7DC4A0]/10 flex items-center justify-center border border-[#7DC4A0]/30"><MessageCircle className="w-4.5 h-4.5 text-[#7DC4A0]" /></div>
                <div>
                  <div className="text-[13px] font-bold text-slate-800 mb-1">Shared Family Hub</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Real-time sync. Chat messages, list items, dinner polls, and coordinated grocery runs.</p>
                </div>
                <div className="bg-slate-100/60 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-1.5 text-[10px]">
                    <span className="select-none">👩</span>
                    <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm"><span className="text-slate-700 font-bold">What should we cook for dinner?</span></div>
                  </div>
                  <div className="flex items-start gap-1.5 text-[10px]">
                    <span className="select-none">🤖</span>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1 shadow-sm"><span className="text-orange-700 font-bold">💡 Try Tuscan Chicken — uses 2 expiring items!</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 — Analytics (full width) */}
            <div className="md:col-span-2 bg-white border border-slate-250/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100"><BarChart3 className="w-5 h-5 text-[#E8956D]" /></div>
                  <div>
                    <div className="text-[14px] font-bold text-slate-800">Smart Kitchen Analytics</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">Real-time savings curve & optimization trends</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="bg-red-50 border border-red-100 text-red-650 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Waste: -42%</span>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-650 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Savings: +₹2,450</span>
                </div>
              </div>

              {/* Rich SVG Line/Area Graph */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 relative">
                  {/* SVG Chart */}
                  <svg viewBox="0 0 400 120" className="w-full h-32 overflow-visible select-none">
                    <defs>
                      <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8956D" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#E8956D" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {/* Waste Area */}
                    <path d="M 0,20 Q 100,45 200,65 T 400,95 L 400,120 L 0,120 Z" fill="url(#wasteGrad)" />
                    {/* Savings Area */}
                    <path d="M 0,110 Q 100,90 200,75 T 400,30 L 400,120 L 0,120 Z" fill="url(#saveGrad)" />
                    
                    {/* Waste Curve */}
                    <path d="M 0,20 Q 100,45 200,65 T 400,95" fill="none" stroke="#E8956D" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Savings Curve */}
                    <path d="M 0,110 Q 100,90 200,75 T 400,30" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Data Nodes */}
                    <circle cx="200" cy="65" r="4" fill="#E8956D" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="200" cy="75" r="4" fill="#10B981" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="400" cy="30" r="4" fill="#10B981" stroke="#ffffff" strokeWidth="1.5" />
                    
                    {/* Labels */}
                    <text x="5" y="15" fill="#E8956D" className="text-[8px] font-extrabold">Food Waste</text>
                    <text x="5" y="118" fill="#10B981" className="text-[8px] font-extrabold">Monthly Savings</text>
                  </svg>
                  
                  {/* Months labels footer */}
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1 mt-2">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May (Current)</span>
                  </div>
                </div>

                {/* Right side stats trackers */}
                <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
                  <div>
                    <div className="flex justify-between text-[10.5px] font-bold mb-1">
                      <span className="text-slate-500">Fresh Vegetables</span>
                      <span className="text-emerald-600">82% Used</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10.5px] font-bold mb-1">
                      <span className="text-slate-500">Dairy & Staples</span>
                      <span className="text-orange-500">65% Used</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10.5px] font-bold mb-1">
                      <span className="text-slate-500">Meat & Seafood</span>
                      <span className="text-[#8B8FFF]">90% Used</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B8FFF] rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] border-t border-slate-150 mt-5 pt-3 font-bold">
                <span className="text-slate-400 font-medium">Calculated based on pantry audit and meal scheduler logs</span>
                <span className="text-[#E8956D] font-extrabold hover:underline cursor-pointer">Open Full Dashboard ↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS — bg-[#0B0B10] (dark)
      ═══════════════════════════════════════════════════ */}
      <section id="how-it-works" className={`relative z-10 ${SEC.dark} py-16 px-4 sm:px-6 border-t border-white/4`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-[#7DC4A0]/10 border border-[#7DC4A0]/22 text-[#7DC4A0] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Zap className="w-2.5 h-2.5" />Interactive Walkthrough
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Whip up meals in <span className="text-[#E8956D]">4</span> <span className="text-[#7DC4A0]">simple steps</span>
            </h2>
            <p className="text-[#A0A0B5] text-sm max-w-md mx-auto">No complex manuals. Designed for the fast flow of family daily activities.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <button key={i} onClick={() => setActiveStep(i)} className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${activeStep === i ? "bg-[#1A1A28] border-[#E8956D]/25 shadow-lg" : "bg-[#13131F]/50 border-white/4 hover:border-white/12"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 transition-all ${activeStep === i ? "bg-gradient-to-br from-[#E8956D] to-[#C96B35] text-white shadow-md shadow-[#E8956D]/25" : "bg-white/6 text-white/35"}`}>{step.num}</div>
                    <div>
                      <div className={`font-bold text-[13px] mb-0.5 transition-colors ${activeStep === i ? "text-white" : "text-white/50"}`}>{step.title}</div>
                      <div className={`text-[11px] leading-relaxed transition-colors ${activeStep === i ? "text-white/55" : "text-white/28"}`}>{step.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeStep} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="bg-[#13131F] border border-white/6 rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#E8956D] tracking-widest uppercase">{STEPS[activeStep].preview.label}</span>
                  <span className="text-xl">{STEPS[activeStep].icon}</span>
                </div>

                {activeStep === 0 && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-white/8 rounded-xl p-6 flex flex-col items-center gap-2 bg-white/1.5">
                      <Camera className="w-7 h-7 text-white/20" />
                      <div className="text-sm font-bold text-white/50">Upload Photo of Receipt</div>
                      <div className="text-[11px] text-white/25">Drag & drop photo or snap live</div>
                    </div>
                    <div className="bg-[#E8956D]/6 border border-[#E8956D]/18 rounded-xl px-3.5 py-2.5">
                      <p className="text-[11px] text-[#E8956D]/75">{STEPS[0].preview.note}</p>
                    </div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <div className="bg-red-500/6 border border-red-500/15 rounded-xl p-3.5 flex items-center gap-3">
                      <Bell className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div><div className="text-[12px] font-bold text-red-300">{STEPS[1].preview.body}</div><div className="text-[10px] text-red-400/55">{STEPS[1].preview.sub}</div></div>
                    </div>
                    <div className="bg-[#7DC4A0]/6 border border-[#7DC4A0]/18 rounded-xl px-3.5 py-2.5"><p className="text-[11px] text-[#7DC4A0]/75">{STEPS[1].preview.note}</p></div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="space-y-3">
                    <div className="bg-[#8B8FFF]/6 border border-[#8B8FFF]/15 rounded-xl p-3.5 flex items-center gap-3">
                      <span className="text-2xl">🍝</span>
                      <div><div className="text-[12px] font-bold text-[#A8ABFF]">{STEPS[2].preview.body}</div><div className="text-[10px] text-[#8B8FFF]/55">{STEPS[2].preview.sub}</div></div>
                    </div>
                    <div className="bg-[#E8956D]/6 border border-[#E8956D]/18 rounded-xl px-3.5 py-2.5"><p className="text-[11px] text-[#E8956D]/75">{STEPS[2].preview.note}</p></div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="space-y-3">
                    <div className="bg-[#7DC4A0]/6 border border-[#7DC4A0]/15 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-[#7DC4A0]"><span>📋</span>{STEPS[3].preview.body}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[#7DC4A0]"><span>🗳️</span>{STEPS[3].preview.sub}</div>
                    </div>
                    <div className="bg-[#8B8FFF]/6 border border-[#8B8FFF]/18 rounded-xl px-3.5 py-2.5"><p className="text-[11px] text-[#A8ABFF]/75">{STEPS[3].preview.note}</p></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          AI PLAYGROUND — bg-[#0F0F18] (mid)
      ═══════════════════════════════════════════════════ */}
            <section id="playground" className="relative z-10 bg-[#EFF2F6] py-16 px-4 sm:px-6 border-y border-slate-300">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-slate-200/80 border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 select-none">
              <Sparkles className="w-2.5 h-2.5 text-[#E8956D]" />Live Playground
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug">
              Try the <span className="text-[#E8956D] font-extrabold">AI</span> <span className="text-[#9B9EFF]">Recipe Suggester</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">Toggle ingredients from our mock virtual refrigerator and watch the AI instantly compile chef-designed recipes.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 items-stretch">
            {/* Fridge */}
            <div className="bg-white border border-slate-250/90 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-slate-350 transition-all duration-300">
              <div><div className="text-[13px] font-bold text-slate-800 mb-0.5">Virtual Refrigerator</div><div className="text-[11px] text-slate-400 font-bold">Select ingredients to toss into the pot:</div></div>
              <div className="grid grid-cols-2 gap-2 select-none">
                {[
                  { name: "chicken", label: "🍗 Chicken Breast" },
                  { name: "tomato", label: "🍅 Fresh Tomatoes" },
                  { name: "cheese", label: "🧀 Mozzarella" },
                  { name: "pasta", label: "🍝 Dry Pasta" },
                  { name: "spinach", label: "🥬 Baby Spinach" },
                  { name: "cream", label: "🥛 Heavy Cream" },
                ].map((ing) => {
                  const sel = selected.includes(ing.name);
                  return (
                    <button key={ing.name} onClick={() => toggleIng(ing.name)} className={`flex items-center justify-between p-3 rounded-xl border text-[12px] font-bold text-left transition-all cursor-pointer ${sel ? "bg-[#E8956D]/15 border-[#E8956D]/50 text-[#C96B35]" : "bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"}`}>
                      {ing.label}
                      {sel && <CheckCircle className="w-3.5 h-3.5 text-[#E8956D] flex-shrink-0 animate-in zoom-in-50 duration-150" />}
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && <button onClick={() => setSelected([])} className="text-[10px] text-slate-400 hover:text-slate-700 font-extrabold text-right transition-colors bg-transparent border-none cursor-pointer">✕ Clear all</button>}
            </div>

            {/* Recipe */}
            <div className="bg-white border border-slate-250/90 rounded-2xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-slate-350 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4 select-none">
                  <div className="flex items-center gap-2"><span>🧑‍🍳</span><span className="text-[10px] font-bold text-[#8B8FFF] tracking-widest uppercase">Recipe Suggestion</span></div>
                  <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-bold">
                    {recipe.time !== "--" && <span>⏱ {recipe.time}</span>}
                    {recipe.calories !== "--" && <span>🔥 {recipe.calories}</span>}
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={recipe.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    <div className="text-2xl mb-2">{recipe.emoji}</div>
                    <h3 className="text-[16px] font-extrabold text-slate-800 mb-2 leading-snug">{recipe.title}</h3>
                    <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{recipe.desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-150 font-bold">
                <div className="text-[11px] text-slate-500">Calories: <span className="text-slate-800 font-black">{recipe.calories}</span></div>
                {selected.length >= 2 && (
                  <Link to="/register" className="flex items-center gap-1.5 bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white text-[11px] font-bold px-3.5 py-2 rounded-xl shadow-md hover:scale-[1.03] transition-all">
                    View Directions <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS MARQUEE — bg-[#0B0B10] (dark)
      ═══════════════════════════════════════════════════ */}
      <section id="testimonials" className={`relative z-10 ${SEC.dark} py-16 border-t border-white/4 overflow-hidden`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-[#7DC4A0]/10 border border-[#7DC4A0]/22 text-[#7DC4A0] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Heart className="w-2.5 h-2.5" />Kitchen Stories
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Loved by families cooking<br />
              <span className="text-[#E8956D]">smarter, </span>
              <span className="text-[#C47EAE]">cleaner, </span>
              <span className="text-[#7DC4A0]">and cheaper</span>
            </h2>
          </div>
        </div>

        {/* Row 1 — left to right */}
        <div className="mb-3">
          <TestimonialMarquee />
        </div>
        {/* Row 2 — right to left (reversed) */}
        <div className="relative overflow-hidden w-full">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0B10] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0B10] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-4" style={{ width: "max-content", animation: "marqueeSlow 50s linear infinite" }}>
            {[...TESTIMONIALS].reverse().concat([...TESTIMONIALS].reverse()).map((t, i) => (
              <div key={i} className="w-72 flex-shrink-0 bg-[#13131F] border border-white/6 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex gap-0.5">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-[12px] text-white/65 italic leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-sm">{t.avatar}</div>
                  <div><div className="text-[11px] font-bold text-white">{t.author}</div><div className="text-[10px] text-white/30">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRICING — bg-[#0F0F18] (mid)
      ═══════════════════════════════════════════════════ */}
            <section id="pricing" className="relative z-10 bg-[#EFF2F6] py-16 px-4 sm:px-6 border-y border-slate-300">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-4 select-none">
              Choose the Perfect Plan for{" "}
              <span className="text-[#E8956D] font-extrabold">your home</span>
            </h2>
            <div className="inline-flex items-center bg-slate-200/80 border border-slate-300 p-1 rounded-xl gap-1 select-none">
              <button onClick={() => setMonthly(true)} className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${monthly ? "bg-[#E8956D] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}>Monthly</button>
              <button onClick={() => setMonthly(false)} className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${!monthly ? "bg-[#E8956D] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}>
                Annually <span className="bg-[#7DC4A0] text-emerald-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {[
              { name: "Free Starter", desc: "Ideal to organize a single refrigerator.", price: 0, features: ["5 Predefined Default Recipes", "Up to 50 active pantry items", "Standard AI recipe matchmaking", "Up to 2 family members", "OCR barcode scanner", "Email support"], cta: "Start Free", popular: false },
              { name: "Pro Family", desc: "Synchronize shopping tasks across the house.", price: monthly ? 299 : 239, features: ["10+ Default Recipes Included", "Unlimited pantry list catalog", "Prioritized recipe matchmaking", "Up to 5 family members synced", "Instant receipt snapping OCR", "Automated shared shopping lists", "Family message chat & polls"], cta: "Try Free Trial", popular: true },
              { name: "Premium Pro", desc: "Advanced nutrition analytics & custom plans.", price: monthly ? 599 : 479, features: ["20+ Default Recipes Included", "Everything in Pro Family", "5+ family members (Unlimited)", "Personalized dietary metrics", "Waste analytics insights", "Smart home integration", "Priority phone & chat support"], cta: "Unlock Pro Level", popular: false },
            ].map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-2xl p-5 flex flex-col gap-4 border transition-all duration-300 ${plan.popular ? "border-[#E8956D] border-2 shadow-lg shadow-[#E8956D]/5 md:-mt-2 md:mb-2" : "border-slate-250/90 hover:border-slate-350 shadow-sm"}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white text-[9px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wide shadow-lg select-none">Most Popular Choice</div>
                )}
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-800 mb-0.5">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 pb-3.5 border-b border-slate-100">
                  <span className="text-3xl font-extrabold text-slate-900">₹{plan.price}</span>
                  <span className="text-[11px] text-slate-400 font-bold">/month</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                      <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-[#E8956D]" : "text-slate-400"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full py-2.5 rounded-xl text-[12px] font-bold text-center transition-all block ${plan.popular ? "bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white shadow-md shadow-[#E8956D]/20 hover:shadow-[#E8956D]/35 hover:scale-[1.02]" : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FAQ — bg-[#0B0B10] (dark)
      ═══════════════════════════════════════════════════ */}
      <section id="faq" className={`relative z-10 ${SEC.dark} py-16 px-4 sm:px-6 border-t border-white/4`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-[#7DC4A0]/10 border border-[#7DC4A0]/22 text-[#7DC4A0] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Shield className="w-2.5 h-2.5" />Frequent Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Got questions? We've got <span className="text-[#E8956D]">answers</span>
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="bg-[#13131F] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer bg-transparent border-none outline-none">
                    <span className="text-[13px] font-semibold text-white">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-white/35 transition-transform duration-200 flex-shrink-0 ml-3 ${open ? "rotate-180 text-[#E8956D]" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="px-5 pb-4 text-[12px] text-white/50 leading-relaxed border-t border-white/5 pt-3">{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA CARD — bg-[#0F0F18] (mid)
      ═══════════════════════════════════════════════════ */}
      <section className={`relative z-10 ${SEC.mid} px-4 sm:px-6 py-14 border-t border-white/4`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#13131F] border border-white/7 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8956D]/4 to-[#8B8FFF]/4 pointer-events-none rounded-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8956D] to-[#C96B35] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#E8956D]/25">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Ready to transform your home kitchen?</h2>
              <p className="text-[#A0A0B5] text-sm mb-7 max-w-sm mx-auto leading-relaxed">Join thousands of families cooking delicious, low-stress, zero-waste dinners. Start on our free plan today.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E8956D] to-[#C96B35] text-white text-[13px] font-bold px-7 py-3 rounded-xl shadow-xl shadow-[#E8956D]/25 hover:shadow-[#E8956D]/45 hover:scale-[1.03] active:scale-[0.98] transition-all group">
                  Start Free Account <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <div className="flex gap-2">
                  <Link to="/admin/register" className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-bold px-5 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Admin Register
                  </Link>
                  <Link to="/member/register" className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-bold px-5 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Member Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER — darkest bg
      ═══════════════════════════════════════════════════ */}
      <footer className="relative z-10 bg-[#07070C] border-t border-white/4 px-4 sm:px-6 pt-12 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/4">
            <div className="sm:col-span-2 md:col-span-1">
              <a href="#" className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-[#E8956D] to-[#B5522A] p-1.5 rounded-lg"><ChefHat className="w-4 h-4 text-white" /></div>
                <span className="text-[14px] font-bold text-white">PantrytoPlate</span>
              </a>
              <p className="text-[11px] text-white/35 leading-relaxed max-w-[200px]">A premium, family-first kitchen intelligence platform. Minimize food waste with AI.</p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Product</h4>
              <div className="space-y-2 text-[12px] text-white/38">
                {["Features", "AI Playground", "Pricing Details", "Mobile App PWA"].map(l => (
                  <a key={l} href="#" className="block hover:text-[#E8956D] transition-colors">{l}</a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Kitchen Portals</h4>
              <div className="space-y-2 text-[12px] text-white/38">
                <Link to="/admin/login" className="block hover:text-[#E8956D] transition-colors">Admin Sign In</Link>
                <Link to="/member/login" className="block hover:text-[#E8956D] transition-colors">Member Sign In</Link>
                <Link to="/register" className="block hover:text-[#E8956D] transition-colors">Register Admin</Link>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Subscribe to Newsletter</h4>
              <p className="text-[11px] text-white/35 mb-3">Get monthly kitchen tips, recipes, and updates.</p>
              {emailSent ? (
                <div className="bg-[#7DC4A0]/8 border border-[#7DC4A0]/18 rounded-xl px-3 py-2.5 text-[11px] font-bold text-[#7DC4A0] text-center">✓ Subscribed!</div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setEmailSent(true); }} className="flex gap-1.5">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter email address" className="flex-1 min-w-0 bg-white/4 border border-white/8 rounded-xl px-2.5 py-2 text-[11px] text-white placeholder-white/20 outline-none focus:border-[#E8956D]/45 transition-colors" />
                  <button type="submit" className="bg-white/6 border border-white/8 text-white text-[11px] font-bold px-3 py-2 rounded-xl hover:bg-[#E8956D] hover:border-[#E8956D] transition-all cursor-pointer whitespace-nowrap">Join</button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 gap-3">
            <span className="text-[11px] text-white/22">© 2026 PantrytoPlate. Crafted with <Heart className="w-2.5 h-2.5 text-red-400 inline animate-pulse" /> for healthy homes. All rights reserved.</span>
            <div className="flex items-center gap-4 text-[11px] text-white/22">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie settings</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
    </>
  );
}
