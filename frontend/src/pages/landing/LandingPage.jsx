import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat, ArrowRight, Check, ChevronDown, Menu, X,
  Bell, Users, ShoppingCart,
  Calendar, MessageSquare, Shield, Zap, Leaf, RefreshCw,
  CheckCircle2, Star, Package, Brain,
  Share2, Clock, AlertTriangle, Send, UserCheck, Settings, RotateCw, Key, BarChart3, Vote, HelpCircle, Heart
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ── COLOR SYSTEM & TYPOGRAPHY TOKENS ──
const KRAFT = "#E4D5B7"; // Kraft Paper / Counter background
const CARD  = "#FAF9F6"; // Ghost White / Paper stock color
const INK   = "#27187D"; // Persian Indigo Ink
const INKd  = "#1A0F55"; // Deep Indigo Theme
const TERA  = "#C4622D"; // Terracotta Stamp / Accent Ink
const WASHI = "#E8A24D"; // Washi Tape Amber
const SAGE  = "#E2ECE9"; // Soft Sage Theme

const F_HEAD = "'Fraunces', 'Georgia', serif";
const F_BODY = "'Lora', 'Times New Roman', serif";
const F_HAND = "'Caveat', cursive";

// Window width hook for seamless mobile responsiveness
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

// Washi Tape Component
function WashiTape({ color = WASHI, width = 100, angle = -2, style = {} }) {
  return (
    <div style={{
      width, height: 20, background: color, opacity: 0.85,
      transform: `rotate(${angle}deg)`,
      borderRadius: 2,
      clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",
      pointerEvents: "none",
      zIndex: 20,
      ...style
    }} />
  );
}

// Master Recipe Box Frame Wrapper Component
function MasterSectionFrame({ children, rotate = 0, style = {}, dark = false, isMobile = false }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{
        rotate: isMobile ? 0 : (hover ? 0 : rotate),
        y: hover ? -4 : 0,
        boxShadow: hover
          ? (dark ? "0 25px 60px rgba(26,15,85,0.4)" : "0 25px 60px rgba(45,30,15,0.2)")
          : (dark ? "0 14px 40px rgba(26,15,85,0.3)" : "0 14px 36px rgba(45,30,15,0.12)")
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: dark ? INKd : CARD,
        color: dark ? CARD : INK,
        borderRadius: isMobile ? 14 : 20,
        border: dark ? `2.5px solid ${TERA}` : `2.5px solid ${INK}`,
        position: "relative",
        boxShadow: dark ? "4px 4px 0px " + TERA : "5px 5px 0px " + INK,
        padding: isMobile ? "16px 12px 14px" : "44px 40px 40px",
        width: "100%",
        maxWidth: 1040,
        margin: "0 auto",
        maxHeight: isMobile ? "calc(100vh - 84px)" : "none",
        overflowY: isMobile ? "auto" : "visible",
        ...style
      }}
    >
      {/* Corner Washi Tape Accent */}
      {!isMobile && (
        <WashiTape color={dark ? TERA : WASHI} width={120} angle={dark ? 3 : -3} style={{ position: "absolute", top: -11, left: 40 }} />
      )}

      {children}
    </motion.div>
  );
}

// ── COMPACT TACTILE CALENDAR FLIP CARD ──
function CalendarFlipCard({ stepNum, title, desc, icon: Icon, isMobile = false, fullWidthMobile = false }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      style={{
        perspective: 1000,
        height: isMobile ? 120 : 220,
        cursor: "pointer",
        gridColumn: (isMobile && fullWidthMobile) ? "1 / -1" : "span 1"
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            borderRadius: isMobile ? 12 : 16,
            border: `2px solid ${INK}`,
            background: CARD,
            boxShadow: "3px 3px 0px " + INK,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ background: INK, padding: isMobile ? "4px 8px" : "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <span style={{ fontFamily: F_HEAD, fontSize: isMobile ? 10 : 13, fontWeight: 900, color: CARD }}>STEP {stepNum}</span>
            <RotateCw style={{ width: isMobile ? 10 : 12, height: isMobile ? 10 : 12, color: WASHI }} />
          </div>

          <div style={{ padding: isMobile ? "4px" : "16px 14px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isMobile ? 4 : 10, textAlign: "center" }}>
            <div style={{ width: isMobile ? 28 : 44, height: isMobile ? 28 : 44, borderRadius: 8, background: KRAFT, border: `1.5px solid ${INK}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon style={{ width: isMobile ? 14 : 22, height: isMobile ? 14 : 22, color: INK }} />
            </div>
            <h3 style={{ fontFamily: F_HEAD, fontSize: isMobile ? 12 : 17, fontWeight: 900, color: INK, margin: 0, lineHeight: 1.1 }}>
              {title}
            </h3>
          </div>

          <div style={{ padding: isMobile ? "2px 4px" : "6px 12px", background: INK + "08", borderTop: `1px dashed ${INK}20`, textAlign: "center" }}>
            <span style={{ fontFamily: F_HEAD, fontSize: isMobile ? 8.5 : 10, fontWeight: 800, color: TERA }}>
              {isMobile ? "Tap to flip ↷" : "Hover to flip page ↷"}
            </span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: isMobile ? 12 : 16,
            border: `2.5px solid ${TERA}`,
            background: INK,
            color: CARD,
            boxShadow: "3px 3px 0px " + TERA,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ background: TERA, padding: isMobile ? "4px 8px" : "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: F_HEAD, fontSize: isMobile ? 9.5 : 12, fontWeight: 900, color: CARD }}>DETAILS</span>
            <CheckCircle2 style={{ width: isMobile ? 10 : 13, height: isMobile ? 10 : 13, color: CARD }} />
          </div>

          <div style={{ padding: isMobile ? "6px 8px" : "18px 16px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <p style={{ fontFamily: F_BODY, fontSize: isMobile ? 10.5 : 13.5, lineHeight: 1.35, color: CARD, margin: 0, fontWeight: 500 }}>
              {desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── COMPACT ICON-ONLY ROLE TILE COMPONENT ──
function IconRoleTile({ title, icon: Icon, isAdmin, isMobile = false }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ y: hover ? -3 : 0, scale: hover ? 1.02 : 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={{
        borderRadius: 12,
        background: CARD,
        border: hover ? `1.5px solid ${isAdmin ? TERA : INK}` : `1px solid ${INK}20`,
        boxShadow: hover ? `0 6px 16px rgba(39,24,125,0.1)` : "0 2px 6px rgba(0,0,0,0.03)",
        padding: isMobile ? "8px 4px" : "12px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 6 : 8,
        textAlign: "center",
        cursor: "pointer"
      }}
    >
      <div style={{
        width: isMobile ? 32 : 38,
        height: isMobile ? 32 : 38,
        borderRadius: 10,
        background: isAdmin ? TERA + "15" : INK + "12",
        color: isAdmin ? TERA : INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Icon style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20 }} strokeWidth={2.2} />
      </div>

      <h4 style={{ fontFamily: F_HEAD, fontSize: isMobile ? 10.5 : 12, fontWeight: 900, color: INK, margin: 0, lineHeight: 1.2 }}>
        {title}
      </h4>
    </motion.div>
  );
}

// Stamped Button Component
function StampedButton({ children, primary = true, to, onClick, style = {} }) {
  const [hover, setHover] = useState(false);

  const inner = (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ scale: hover ? 1.03 : 1 }}
      transition={{ duration: 0.16 }}
      style={{
        padding: "12px 24px",
        borderRadius: 8,
        fontFamily: F_HEAD,
        fontSize: 14,
        fontWeight: 900,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: primary ? INK : CARD,
        color: primary ? CARD : TERA,
        border: primary ? `2px solid ${INK}` : `2px stroke ${TERA}`,
        boxShadow: hover ? "0 8px 22px rgba(39,24,125,0.25)" : "0 4px 12px rgba(39,24,125,0.12)",
        outline: primary ? `2px dashed ${CARD}40` : `2px dashed ${TERA}40`,
        outlineOffset: -5,
        textDecoration: "none",
        ...style
      }}
    >
      {children}
    </motion.div>
  );

  if (to) return <Link to={to} onClick={onClick} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
}

// ── ALL TESTIMONIAL STICKY NOTES POOL ──
const ALL_STICKY_NOTES = [
  // Set A
  [
    { q: "We haven't thrown away expired milk or veggies in 3 months. Morning alerts are fantastic!", who: "Priya & Raj • Mumbai", bg: "#FFF9A6", rotate: -2.5, tapeColor: TERA },
    { q: "The AI Recipe Engine prioritises expiring items first. Dinner planning takes 10 seconds now!", who: "Arun T. • Chennai", bg: "#FFD6E8", rotate: 2, tapeColor: WASHI },
    { q: "Dinner polls stopped our food debates. Everyone votes and the winner gets cooked!", who: "Rodrigues Family • Goa", bg: "#D2F6D4", rotate: -1.5, tapeColor: INK },
    { q: "Adding pantry items with master autocomplete is super fast. Instant shelf-life tags!", who: "Derek & Meera • Hyderabad", bg: "#D0EAFF", rotate: 2.5, tapeColor: TERA },
  ],
  // Set B
  [
    { q: "Saved over ₹2,300 on our monthly grocery bills. Pantry Health score is addictively fun!", who: "Anita & Vikram • Pune", bg: "#FFE5B4", rotate: 2, tapeColor: INK },
    { q: "Assigning shopping tasks to roomies ended duplicate purchases once and for all!", who: "Kavya & Roomies • Bengaluru", bg: "#E2F0D9", rotate: -2, tapeColor: TERA },
    { q: "Dietary filters make Jain & Veg cooking for extended family completely effortless.", who: "Suresh Shah • Ahmedabad", bg: "#FCE4D6", rotate: 1.8, tapeColor: WASHI },
    { q: "The weekly shared meal calendar syncs on every phone in our house automatically!", who: "The Kaplan Family • Delhi", bg: "#E8DAEF", rotate: -2.2, tapeColor: INK },
  ]
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [billing, setBilling] = useState("monthly");
  const [mobilePlanTab, setMobilePlanTab] = useState("pro"); // 'free', 'pro', 'premium'
  const [openFaq, setOpenFaq] = useState(null);
  const [stickySetIdx, setStickySetIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAnimating = useRef(false);
  const touchStart = useRef(0);
  const isMobile = useIsMobile();

  const TOTAL_SECTIONS = 7;

  // 10-Second Sticky Notes Auto Rotation Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setStickySetIdx(prev => (prev + 1) % ALL_STICKY_NOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Quick, Snappy & Efficient Section Flipper Logic
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (isAnimating.current) return;

      if (e.deltaY > 15) {
        if (activeSection < TOTAL_SECTIONS - 1) {
          isAnimating.current = true;
          setActiveSection(prev => prev + 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      } else if (e.deltaY < -15) {
        if (activeSection > 0) {
          isAnimating.current = true;
          setActiveSection(prev => prev - 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (isAnimating.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (activeSection < TOTAL_SECTIONS - 1) {
          isAnimating.current = true;
          setActiveSection(prev => prev + 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (activeSection > 0) {
          isAnimating.current = true;
          setActiveSection(prev => prev - 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      }
    };

    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isAnimating.current) return;
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart.current - touchEnd;
      if (diff > 30) {
        if (activeSection < TOTAL_SECTIONS - 1) {
          isAnimating.current = true;
          setActiveSection(prev => prev + 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      } else if (diff < -30) {
        if (activeSection > 0) {
          isAnimating.current = true;
          setActiveSection(prev => prev - 1);
          setTimeout(() => { isAnimating.current = false; }, 420);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection]);

  const FAQS = [
    { q: "How does the AI recipe engine work?", a: "Your live pantry items are analyzed with closest expiry items flagged as top priority. AI generates 3 customized zero-waste recipes with step-by-step instructions." },
    { q: "How do I add grocery items to my pantry?", a: "Search from our master 500+ food database with instant autocomplete, tag storage locations (Fridge, Freezer, Shelf), and set custom shelf-life." },
    { q: "How does workspace sharing work?", a: "The Kitchen Admin creates a workspace and receives an 8-character invite code. Family members join with the code to access the same live pantry and polls." },
    { q: "What triggers the expiry alerts?", a: "Automated background schedulers scan your inventory daily. Items expiring within 3 days trigger morning notifications for all household members." },
  ];

  const SECTION_TITLES = ["Hero Frame", "5-Calendar Flip", "Role Portals", "Pricing Vault", "Sticky Notes", "FAQ Section", "Footer"];

  const currentStickyNotes = ALL_STICKY_NOTES[stickySetIdx];

  return (
    <div style={{ background: KRAFT, color: INK, fontFamily: F_BODY, height: "100vh", width: "100vw", overflow: "hidden", position: "relative" }}>

      {/* ── SECTION INDEX NAVIGATION DOTS ── */}
      <div style={{ position: "fixed", right: isMobile ? 8 : 24, top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
        {SECTION_TITLES.map((st, i) => (
          <button
            key={i}
            onClick={() => {
              if (isAnimating.current) return;
              isAnimating.current = true;
              setActiveSection(i);
              setTimeout(() => { isAnimating.current = false; }, 420);
            }}
            title={st}
            style={{
              width: activeSection === i ? (isMobile ? 12 : 14) : (isMobile ? 7 : 10),
              height: activeSection === i ? (isMobile ? 12 : 14) : (isMobile ? 7 : 10),
              borderRadius: "50%",
              background: activeSection === i ? TERA : INK + "40",
              border: `2px solid ${CARD}`,
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: activeSection === i ? "0 0 10px " + TERA : "none"
            }}
          />
        ))}
      </div>

      {/* ── HEADER NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90, transition: "all 0.25s ease",
        background: CARD + "FA",
        backdropFilter: "blur(12px)",
        borderBottom: `1px dashed ${INK}25`,
        boxShadow: "0 4px 20px rgba(45,30,15,0.1)",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: isMobile ? "0 14px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection(0); }} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: INK, color: CARD, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-2deg)", boxShadow: "2px 2px 0px " + TERA }}>
              <ChefHat style={{ width: 16, height: 16 }} />
            </div>
            <span style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: isMobile ? 17 : 19, color: INK }}>
              Pantry <span style={{ color: TERA }}>to</span> Plate
            </span>
          </a>

          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {[
                { label: "Overview", idx: 1 },
                { label: "Roles", idx: 2 },
                { label: "Pricing", idx: 3 },
                { label: "Reviews", idx: 4 },
                { label: "FAQ", idx: 5 },
              ].map(l => (
                <button key={l.idx} onClick={() => setActiveSection(l.idx)} style={{ fontFamily: F_HEAD, fontSize: 13, fontWeight: 800, color: activeSection === l.idx ? TERA : INK + "E0", background: "none", border: "none", cursor: "pointer" }}>
                  {l.label}
                </button>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StampedButton primary to="/admin/register" style={{ padding: isMobile ? "6px 12px" : "9px 22px", fontSize: isMobile ? 12 : 13.5 }}>
              Get Started →
            </StampedButton>

            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: INK + "10", border: `1px solid ${INK}30`, borderRadius: 8, padding: 5, color: INK, cursor: "pointer" }}
              >
                {mobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: CARD, borderBottom: `2px solid ${INK}`, overflow: "hidden", padding: "10px 14px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "01. Hero", idx: 0 },
                  { label: "02. Overview", idx: 1 },
                  { label: "03. Roles", idx: 2 },
                  { label: "04. Pricing", idx: 3 },
                  { label: "05. Reviews", idx: 4 },
                  { label: "06. FAQ", idx: 5 },
                  { label: "07. Footer", idx: 6 },
                ].map(l => (
                  <button
                    key={l.idx}
                    onClick={() => {
                      setActiveSection(l.idx);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      fontFamily: F_HEAD, fontSize: 13, fontWeight: 800, textAlign: "left",
                      padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: activeSection === l.idx ? INK : KRAFT + "40",
                      color: activeSection === l.idx ? CARD : INK
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>


      {/* ── FULL-PAGE SECTION FLIPPER ── */}
      <AnimatePresence mode="wait">
        
        {/* SECTION 0: HERO */}
        {activeSection === 0 && (
          <motion.div
            key="section-0"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <MasterSectionFrame rotate={-0.6} isMobile={isMobile}>
              <div style={{ textAlign: "center", maxWidth: 840, margin: "0 auto", padding: isMobile ? "4px 0" : "24px 0" }}>

                <h1 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.7rem, 7vw, 2.3rem)" : "clamp(2.6rem, 5.8vw, 4.6rem)", fontWeight: 900, lineHeight: 1.1, color: INK, marginBottom: isMobile ? 12 : 24 }}>
                  One Kitchen.{" "}
                  <span style={{ position: "relative", display: "inline-block", color: INK }}>
                    One Family.
                    {!isMobile && (
                      <svg style={{ position: "absolute", inset: "-10px -14px", width: "calc(100% + 28px)", height: "calc(100% + 20px)", overflow: "visible", pointerEvents: "none" }} viewBox="0 0 220 80">
                        <path
                          d="M 10 40 C 20 10, 180 5, 205 35 C 220 60, 40 75, 15 50 C 5 35, 100 15, 195 25"
                          fill="none" stroke={TERA} strokeWidth="3.5" strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>{" "}
                  Zero Guesswork.
                </h1>

                <p style={{ fontFamily: F_BODY, fontSize: isMobile ? 13.5 : 18, lineHeight: 1.55, color: INK + "D0", maxWidth: 640, margin: "0 auto 20px", fontStyle: "italic" }}>
                  Pantry to Plate keeps every ingredient organized, alerts your household before food spoils, and lets AI decide tonight's dinner — all inside one shared workspace.
                </p>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <StampedButton primary to="/admin/register" style={{ padding: isMobile ? "10px 18px" : "14px 32px", fontSize: 13.5, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
                    Start Your Kitchen →
                  </StampedButton>
                  <StampedButton primary={false} onClick={() => setActiveSection(1)} style={{ padding: isMobile ? "10px 18px" : "14px 28px", fontSize: 13.5, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
                    See Overview
                  </StampedButton>
                </div>
              </div>
            </MasterSectionFrame>
          </motion.div>
        )}

        {/* SECTION 1: WHAT IS PANTRY TO PLATE — COMPACT 5-CALENDAR FLIP */}
        {activeSection === 1 && (
          <motion.div
            key="section-1"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <MasterSectionFrame rotate={0.6} isMobile={isMobile}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 10 : 32 }}>
                <h2 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.3rem, 4.5vw, 1.8rem)" : "clamp(2rem, 3.8vw, 3.2rem)", fontWeight: 900, color: INK, margin: 0 }}>
                  What is Pantry to Plate?
                </h2>
                <p style={{ fontFamily: F_HAND, fontSize: isMobile ? 15 : 21, color: TERA, margin: "2px 0 0", fontWeight: 700 }}>
                  {isMobile ? "Tap any card to flip for details!" : "Hover any calendar page to flip for details!"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? 8 : 14 }}>
                <CalendarFlipCard stepNum="01" title="Register" icon={Shield} isMobile={isMobile} desc="Sign up your household in 10s and get a unique family code." />
                <CalendarFlipCard stepNum="02" title="Load Pantry" icon={Package} isMobile={isMobile} desc="Add grocery items with master 500+ database autocomplete." />
                <CalendarFlipCard stepNum="03" title="Plan Meals" icon={Brain} isMobile={isMobile} desc="AI reads expiring items and suggests 3 zero-waste dinners." />
                <CalendarFlipCard stepNum="04" title="Share Family" icon={Users} isMobile={isMobile} desc="Family votes on dinner and missing items auto-add to buy list." />
                <CalendarFlipCard stepNum="05" title="Zero Waste" icon={ChefHat} isMobile={isMobile} fullWidthMobile={true} desc="Cook delicious meals with items you own and cut waste to zero." />
              </div>
            </MasterSectionFrame>
          </motion.div>
        )}

        {/* SECTION 2: COMPACT HOUSEHOLD ROLES */}
        {activeSection === 2 && (
          <motion.div
            key="section-2"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <MasterSectionFrame rotate={-0.4} isMobile={isMobile}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 12 : 20 }}>
                <span style={{ fontFamily: F_HEAD, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: TERA }}>
                  HOUSEHOLD PORTALS
                </span>
                <h2 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.3rem, 4.2vw, 1.8rem)" : "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 900, color: INK, marginTop: 2, margin: 0 }}>
                  Admin & Family Member Portals
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 20 }}>

                {/* Left Portal: Kitchen Admin */}
                <div style={{
                  borderRadius: 14,
                  background: "#FFFBF7",
                  border: `2px solid ${TERA}`,
                  boxShadow: "3px 3px 0px " + TERA,
                  padding: isMobile ? "10px" : "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 8
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, borderBottom: `1px dashed ${TERA}40`, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: INK, color: CARD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield style={{ width: 14, height: 14 }} />
                      </div>
                      <div>
                        <span style={{ fontFamily: F_HEAD, fontSize: 8, fontWeight: 900, color: TERA, letterSpacing: "0.08em" }}>STAFF PORTAL</span>
                        <h3 style={{ fontFamily: F_HEAD, fontSize: 13.5, fontWeight: 900, color: INK, margin: 0 }}>Kitchen Admin</h3>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      <IconRoleTile title="Household Setup" icon={Key} isAdmin={true} isMobile={isMobile} />
                      <IconRoleTile title="Storage Rules" icon={Settings} isAdmin={true} isMobile={isMobile} />
                      <IconRoleTile title="Health Score" icon={BarChart3} isAdmin={true} isMobile={isMobile} />
                    </div>
                  </div>

                  <StampedButton primary to="/admin/register" style={{ width: "100%", justifyContent: "center", padding: "7px 10px", fontSize: 11.5 }}>
                    Create Kitchen →
                  </StampedButton>
                </div>

                {/* Right Portal: Family Member */}
                <div style={{
                  borderRadius: 14,
                  background: CARD,
                  border: `2px solid ${INK}`,
                  boxShadow: "3px 3px 0px " + INK,
                  padding: isMobile ? "10px" : "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 8
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, borderBottom: `1px dashed ${INK}30`, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: TERA, color: CARD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Users style={{ width: 14, height: 14 }} />
                      </div>
                      <div>
                        <span style={{ fontFamily: F_HEAD, fontSize: 8, fontWeight: 900, color: INK + "80", letterSpacing: "0.08em" }}>MEMBER PORTAL</span>
                        <h3 style={{ fontFamily: F_HEAD, fontSize: 13.5, fontWeight: 900, color: INK, margin: 0 }}>Family Member</h3>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      <IconRoleTile title="Dinner Polls" icon={Vote} isAdmin={false} isMobile={isMobile} />
                      <IconRoleTile title="Grocery List" icon={ShoppingCart} isAdmin={false} isMobile={isMobile} />
                      <IconRoleTile title="Family Chat" icon={MessageSquare} isAdmin={false} isMobile={isMobile} />
                    </div>
                  </div>

                  <StampedButton primary={false} to="/member/register" style={{ width: "100%", justifyContent: "center", padding: "7px 10px", fontSize: 11.5 }}>
                    Join Kitchen →
                  </StampedButton>
                </div>

              </div>
            </MasterSectionFrame>
          </motion.div>
        )}

        {/* SECTION 3: PRICING (MOBILE TABS / DESKTOP 3-COLUMNS) */}
        {activeSection === 3 && (
          <motion.div
            key="section-3"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, background: INKd, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <div style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 10 : 28 }}>
                <span style={{ fontFamily: F_HEAD, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: TERA }}>
                  SUBSCRIPTION VAULT
                </span>
                <h2 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.3rem, 4.5vw, 1.8rem)" : "clamp(2rem, 3.8vw, 3.2rem)", fontWeight: 900, color: CARD, marginTop: 2, marginBottom: isMobile ? 6 : 14 }}>
                  Simple, Fair Plans
                </h2>

                <div style={{ display: "inline-flex", gap: 4, padding: 3, border: `2px solid ${CARD}40`, borderRadius: 8, background: CARD + "10", marginBottom: isMobile ? 10 : 0 }}>
                  {["monthly", "annual"].map(b => (
                    <button key={b} onClick={() => setBilling(b)}
                      style={{
                        padding: "5px 12px", fontFamily: F_HEAD, fontSize: 10.5, fontWeight: 900, borderRadius: 6, border: "none", cursor: "pointer",
                        background: billing === b ? TERA : "transparent",
                        color: CARD,
                      }}>
                      {b === "monthly" ? "MONTHLY" : "ANNUAL (20% OFF)"}
                    </button>
                  ))}
                </div>

                {/* Mobile Plan Selector Tabs */}
                {isMobile && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 4 }}>
                    {[
                      { id: "free", label: "Starter (₹0)" },
                      { id: "pro", label: "Pro ★ Popular" },
                      { id: "premium", label: "Premium" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setMobilePlanTab(tab.id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontFamily: F_HEAD,
                          fontSize: 11,
                          fontWeight: 900,
                          border: `1.5px solid ${mobilePlanTab === tab.id ? TERA : CARD + "40"}`,
                          background: mobilePlanTab === tab.id ? TERA : CARD + "15",
                          color: CARD,
                          cursor: "pointer"
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsive Pricing Container */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 10 : 20 }}>
                
                {/* Free Kitchen Card */}
                {(!isMobile || mobilePlanTab === "free") && (
                  <div style={{ borderRadius: 14, padding: isMobile ? 14 : 28, background: CARD, border: `2px solid ${CARD}` }}>
                    <span style={{ fontFamily: F_HEAD, fontSize: 10, fontWeight: 900, color: INK + "80" }}>STARTER</span>
                    <h3 style={{ fontFamily: F_HEAD, fontSize: 17, fontWeight: 900, color: INK, marginTop: 2, marginBottom: 2 }}>Free Kitchen</h3>
                    <p style={{ fontFamily: F_HEAD, fontSize: 24, fontWeight: 900, color: INK, margin: "0 0 10px" }}>₹0</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 11.5 }}>
                      <div>✓ 50 Pantry Items</div>
                      <div>✓ 2 Household Members</div>
                      <div>✓ Basic Expiry Alerts</div>
                      <div>✓ Manual Item Entry</div>
                    </div>

                    <StampedButton primary={false} to="/admin/register" style={{ width: "100%", justifyContent: "center", padding: "7px 10px", fontSize: 11.5 }}>
                      Start Free →
                    </StampedButton>
                  </div>
                )}

                {/* Family Pro Card */}
                {(!isMobile || mobilePlanTab === "pro") && (
                  <div style={{ borderRadius: 14, padding: isMobile ? 14 : 28, border: `3px solid ${TERA}`, background: "#FFFBF7", boxShadow: "0 15px 40px rgba(196,98,45,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: F_HEAD, fontSize: 9.5, fontWeight: 900, color: TERA }}>RECOMMENDED</span>
                      <span style={{ background: TERA, color: CARD, padding: "2px 6px", borderRadius: 4, fontSize: 8.5, fontFamily: F_HEAD, fontWeight: 900 }}>MOST LOVED ★</span>
                    </div>
                    <h3 style={{ fontFamily: F_HEAD, fontSize: 17, fontWeight: 900, color: INK, marginTop: 2, marginBottom: 2 }}>Family Pro</h3>
                    <p style={{ fontFamily: F_HEAD, fontSize: 24, fontWeight: 900, color: INK, margin: "0 0 10px" }}>
                      ₹{billing === "monthly" ? "299" : "239"} <span style={{ fontSize: 11, color: INK + "70" }}>/ mo</span>
                    </p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 11.5 }}>
                      <div>✓ 250 Pantry Items</div>
                      <div>✓ 5 Household Members</div>
                      <div>✓ AI Recipe Engine</div>
                      <div>✓ Dinner Polls & Calendar</div>
                    </div>

                    <StampedButton primary to="/admin/register" style={{ width: "100%", justifyContent: "center", padding: "7px 10px", fontSize: 11.5 }}>
                      Start 14-Day Trial →
                    </StampedButton>
                  </div>
                )}

                {/* Premium Chef Card */}
                {(!isMobile || mobilePlanTab === "premium") && (
                  <div style={{ borderRadius: 14, padding: isMobile ? 14 : 28, background: CARD, border: `2px solid ${CARD}` }}>
                    <span style={{ fontFamily: F_HEAD, fontSize: 10, fontWeight: 900, color: INK + "80" }}>UNLIMITED</span>
                    <h3 style={{ fontFamily: F_HEAD, fontSize: 17, fontWeight: 900, color: INK, marginTop: 2, marginBottom: 2 }}>Premium Chef</h3>
                    <p style={{ fontFamily: F_HEAD, fontSize: 24, fontWeight: 900, color: INK, margin: "0 0 10px" }}>
                      ₹{billing === "monthly" ? "599" : "479"} <span style={{ fontSize: 11, color: INK + "70" }}>/ mo</span>
                    </p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 11.5 }}>
                      <div>✓ Unlimited Pantry & Members</div>
                      <div>✓ Multi-Zone Storage Rules</div>
                      <div>✓ Waste Analytics Dashboard</div>
                    </div>

                    <StampedButton primary={false} to="/admin/register" style={{ width: "100%", justifyContent: "center", padding: "7px 10px", fontSize: 11.5 }}>
                      Get Premium →
                    </StampedButton>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 4: TESTIMONIALS WITH AUTOMATIC 10-SECOND ROTATING STICKY NOTES */}
        {activeSection === 4 && (
          <motion.div
            key="section-4"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <MasterSectionFrame rotate={0.3} isMobile={isMobile}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 12 : 28 }}>
                <h2 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.3rem, 4.5vw, 1.8rem)" : "clamp(2rem, 3.8vw, 3.2rem)", fontWeight: 900, color: INK, margin: 0 }}>
                  Notes Left on the Fridge
                </h2>
              </div>

              <div style={{ minHeight: isMobile ? 180 : 250, position: "relative" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stickySetIdx}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 16 }}
                  >
                    {currentStickyNotes.map((rev, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.04, rotate: 0, zIndex: 30 }}
                        transition={{ duration: 0.16 }}
                        style={{
                          position: "relative",
                          borderRadius: 12,
                          background: rev.bg,
                          border: `2px solid ${INK}`,
                          boxShadow: "3px 3px 0px " + INK,
                          padding: isMobile ? "10px 8px 8px" : "24px 18px 16px",
                          transform: `rotate(${isMobile ? rev.rotate * 0.5 : rev.rotate}deg)`,
                          aspectRatio: "1 / 1",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          cursor: "pointer"
                        }}
                      >
                        <WashiTape color={rev.tapeColor} width={isMobile ? 50 : 80} angle={rev.rotate > 0 ? -3 : 3} style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)" }} />

                        <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                          {[...Array(5)].map((_, s) => (
                            <Star key={s} style={{ width: isMobile ? 9 : 12, height: isMobile ? 9 : 12, color: TERA, fill: TERA }} />
                          ))}
                        </div>

                        <p style={{ fontFamily: F_HAND, fontSize: isMobile ? 13.5 : 20, lineHeight: 1.25, color: INK, margin: 0, fontWeight: 700 }}>
                          "{rev.q}"
                        </p>

                        <div style={{ borderTop: `1px stroke ${INK}30`, paddingTop: 4, textAlign: "right" }}>
                          <span style={{ fontFamily: F_HEAD, fontSize: isMobile ? 8.5 : 11, fontWeight: 900, color: TERA }}>
                            — {rev.who}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div style={{ marginTop: isMobile ? 10 : 24, display: "flex", justifyContent: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {ALL_STICKY_NOTES.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setStickySetIdx(dotIdx)}
                      style={{
                        width: stickySetIdx === dotIdx ? 20 : 7,
                        height: 7,
                        borderRadius: 4,
                        background: stickySetIdx === dotIdx ? TERA : INK + "30",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease"
                      }}
                    />
                  ))}
                </div>
              </div>
            </MasterSectionFrame>
          </motion.div>
        )}

        {/* SECTION 5: FAQ SECTION */}
        {activeSection === 5 && (
          <motion.div
            key="section-5"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px" }}
          >
            <MasterSectionFrame rotate={-0.3} isMobile={isMobile}>
              <div style={{ textAlign: "center", marginBottom: isMobile ? 12 : 28 }}>
                <span style={{ fontFamily: F_HEAD, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: TERA }}>
                  FREQUENTLY ASKED QUESTIONS
                </span>
                <h2 style={{ fontFamily: F_HEAD, fontSize: isMobile ? "clamp(1.3rem, 4.5vw, 1.8rem)" : "clamp(2rem, 3.8vw, 3.2rem)", fontWeight: 900, color: INK, marginTop: 2 }}>
                  Got Questions?
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 14 }}>
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        borderRadius: 12,
                        background: CARD,
                        border: `2px solid ${INK}`,
                        boxShadow: isOpen ? "3px 3px 0px " + TERA : "2px 2px 0px " + INK,
                        padding: isMobile ? "10px 12px" : "16px 20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <HelpCircle style={{ width: 15, height: 15, color: TERA, flexShrink: 0 }} />
                          <h3 style={{ fontFamily: F_HEAD, fontSize: isMobile ? 12.5 : 15.5, fontWeight: 900, color: INK, margin: 0 }}>
                            {faq.q}
                          </h3>
                        </div>
                        <ChevronDown style={{ width: 14, height: 14, color: INK, transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "none" }} />
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: "hidden" }}
                          >
                            <p style={{ fontFamily: F_BODY, fontSize: isMobile ? 11.5 : 13.5, lineHeight: 1.5, color: INK + "D0", marginTop: 6, marginBottom: 0, paddingTop: 6, borderTop: `1px stroke ${INK}20` }}>
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </MasterSectionFrame>
          </motion.div>
        )}

        {/* SECTION 6: HIGH-END CRAFTED FOOTER */}
        {activeSection === 6 && (
          <motion.div
            key="section-6"
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, background: INKd, color: CARD, display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "66px 10px 14px" : "80px 24px 40px", overflowY: isMobile ? "auto" : "hidden" }}
          >
            <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", borderRadius: isMobile ? 14 : 24, border: `2.5px solid ${TERA}`, padding: isMobile ? "20px 14px" : "48px 40px", background: CARD + "08", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2.2fr 1fr 1.8fr", gap: isMobile ? 16 : 40, paddingBottom: isMobile ? 14 : 36, borderBottom: `1px dashed ${CARD}30` }}>
                
                {/* Brand Identity */}
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", border: `2px solid ${TERA}`, borderRadius: 8, background: CARD, color: INK, marginBottom: 10, boxShadow: "2px 2px 0px " + TERA }}>
                    <ChefHat style={{ width: 16, height: 16, color: TERA }} />
                    <span style={{ fontFamily: F_HEAD, fontSize: 16, fontWeight: 900, color: INK }}>
                      Pantry<span style={{ color: TERA }}>to</span>Plate
                    </span>
                  </div>
                  <p style={{ fontFamily: F_BODY, fontSize: 12, lineHeight: 1.5, color: CARD + "C0", maxWidth: 300, margin: 0 }}>
                    An AI-powered zero-waste family kitchen operating system. Keep your pantry in sync, eliminate food waste, and plan dinner together.
                  </p>
                </div>

                {/* Newsletter Box */}
                <div>
                  <h4 style={{ fontFamily: F_HEAD, fontSize: 10.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: TERA, marginBottom: 8 }}>
                    Zero-Waste Kitchen Tips
                  </h4>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="email" placeholder="family@kitchen.com"
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: `1.5px solid ${CARD}40`, background: CARD + "12", color: CARD, fontFamily: F_BODY, fontSize: 11.5, outline: "none" }} />
                    <button style={{ padding: "7px 12px", borderRadius: 6, background: TERA, color: CARD, border: `1.5px solid ${TERA}`, fontFamily: F_HEAD, fontWeight: 900, cursor: "pointer", fontSize: 11.5, boxShadow: "2px 2px 0px " + CARD }}>
                      Join
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright & Handcrafted Note */}
              <div style={{ paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: F_HEAD, fontSize: 10.5, color: CARD + "70" }}>
                  © 2026 Pantry to Plate. All rights reserved.
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F_HAND, fontSize: isMobile ? 14 : 19, color: TERA, fontWeight: 700 }}>
                  <span>Crafted for warm family kitchens everywhere</span>
                  <Heart style={{ width: 12, height: 12, color: TERA, fill: TERA }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
