import React, { useState, useEffect, useRef } from "react";
import {
  Gift,
  FileText,
  ChevronRight,
  Sparkles,
  History,
  Zap,
  TrendingUp,
  Star,
  Wallet,
  Crown,
  ArrowRight,
  Shield,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FallbackImage from "../components/FallbackImage";
import VideoSpotlight from "../components/VideoSpotlight";
import HowItWorks from "../components/HowItWorks";
import { getPublicHome, getUserHomeStats } from "../lib/api";
import { getApiBaseUrl } from "../lib/apiClient";
import { useAuth } from "../lib/auth";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = getApiBaseUrl();

const resolveBrandLogoUrl = (value) => {
  if (!value) return "";
  const source = String(value).trim();
  if (!source) return "";
  if (/^(https?:\/\/|data:|blob:)/i.test(source)) return source;
  const normalized = source.replace(/\\/g, "/");
  const isUploadPath = /^\/?(api\/)?uploads\//i.test(normalized);
  if (isUploadPath) {
    const withLeadingSlash = normalized.startsWith("/")
      ? normalized
      : `/${normalized}`;
    return API_BASE_URL ? `${API_BASE_URL}${withLeadingSlash}` : withLeadingSlash;
  }
  return normalized;
};

/* -- Mock Data -- */
const heroBanners = [
  {
    id: 1,
    title: "Win Gold Coins Daily",
    subtitle: "Scan Heritage Milk Packs",
    gradient: "linear-gradient(135deg, #0f4c2e, #1a7842, #059669)",
    img: "/gold-coin-hero.png",
  },
  {
    id: 2,
    title: "Get Upto INR 1100",
    subtitle: "RL Masala Special Offer",
    gradient: "linear-gradient(135deg, #7c2d12, #c2410c, #fb923c)",
    img: "/masala-hero.png",
  },
];
const defaultOffers = [
  {
    amount: "₹1,100",
    brand: "RL Masala",
    gradient: "linear-gradient(135deg, #f97316, #ef4444, #e11d48)",
    emoji: "🔥",
  },
  {
    amount: "₹1,400",
    brand: "Agrawal's",
    gradient: "linear-gradient(135deg, #475569, #334155, #0f172a)",
    emoji: "✨",
  },
  {
    amount: "₹120",
    brand: "skcop",
    gradient: "linear-gradient(135deg, #10b981, #16a34a, #166534)",
    emoji: "✨",
  },
];

/* -- Hero Carousel -- */
const HeroCarousel = ({ items }) => {
  const banners = items?.length ? items : heroBanners;
  const [cur, setCur] = useState(0);
  const b = banners[cur];

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const t = setInterval(() => setCur((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const goNext = () => {
    if (banners.length <= 1) return;
    setCur((prev) => (prev + 1) % banners.length);
  };

  const goPrev = () => {
    if (banners.length <= 1) return;
    setCur((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleDragEnd = (_event, info) => {
    if (banners.length <= 1) return;
    const swipePower = info.offset.x + info.velocity.x * 0.2;
    if (swipePower <= -55) {
      goNext();
    } else if (swipePower >= 55) {
      goPrev();
    }
  };

  return (
    <div
      className="hero-carousel relative w-full h-[210px] rounded-[28px] overflow-hidden"
      style={{
        boxShadow: "0 20px 50px -12px rgba(0,0,0,0.18)",
        touchAction: "pan-y",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cur}
          drag={banners.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{
            background: b.gradient || "linear-gradient(135deg,#1a7842,#059669)",
          }}
        >
          <div
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <div
            className="absolute bottom-0 -left-8 w-32 h-32 rounded-full blur-2xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <div>
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border mb-3"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Zap size={10} className="text-yellow-300" />
                <span
                  className="text-[9px] font-bold text-white uppercase"
                  style={{ letterSpacing: "0.15em" }}
                >
                  Exclusive
                </span>
              </div>
              <h3
                className="text-[26px] font-black text-white leading-[1.1] max-w-[60%] tracking-tight"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
              >
                {b.title}
              </h3>
              <p
                className="text-[13px] mt-1.5 font-medium"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {b.subtitle}
              </p>
            </div>
            <Link to="/brand-details" className="self-start">
              <div
                className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-[11px] font-bold px-5 py-2.5 rounded-full active:scale-[0.94] transition-transform"
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
              >
                Explore <ArrowRight size={13} />
              </div>
            </Link>
          </div>

          <div className="absolute bottom-3 right-3 w-[120px] h-[120px] opacity-60">
            <FallbackImage
              src={b.img}
              alt="Offer"
              className="w-full h-full object-contain drop-shadow-xl"
              fallback={
                <Sparkles
                  className="w-full h-full"
                  style={{ color: "rgba(255,255,255,0.1)" }}
                />
              }
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] z-30"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <motion.div
          key={`p${cur}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full rounded-full"
          style={{ background: "rgba(255,255,255,0.6)" }}
        />
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-6 flex gap-1.5 z-30">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCur(i)}
            className="rounded-full transition-all duration-300"
            style={{
              height: 5,
              width: i === cur ? 20 : 5,
              background: i === cur ? "#fff" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------------- MAIN HOME ---------------------- */
const Home = () => {
  const { authToken } = useAuth();
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    let live = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await getPublicHome();
        if (authToken) {
          try {
            const s = await getUserHomeStats(authToken);
            if (s && live)
              data.stats = {
                productsOwned: s.productsOwned || 0,
                productsReported: s.productsReported || 0,
                vCashEarned: s.totalEarned || 0,
              };
          } catch (_) {}
        }
        if (live) setHomeData(data);
      } catch (_) {
      } finally {
        if (live) setIsLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [authToken]);

  /* -- GSAP Animations -- */
  useEffect(() => {
    if (isLoading || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-carousel", {
        y: 35,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.from(".scan-cta", {
        scale: 0.7,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.75)",
        delay: 0.3,
      });
      gsap.to(".scan-icon-breathe", {
        scale: 1.08,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".scan-ring-1", {
        rotation: 360,
        duration: 25,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".scan-ring-2", {
        rotation: -360,
        duration: 35,
        repeat: -1,
        ease: "none",
      });
      // Quick actions animation removed for alignment reliability
      // Brand items and offer cards animations removed for visibility reliability
      gsap.to(".offer-shine", {
        x: "300%",
        duration: 2.5,
        repeat: -1,
        repeatDelay: 5,
        ease: "power1.inOut",
        stagger: 0.7,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isLoading]);

  const brands = homeData?.brands || [];
  const banners = homeData?.banners?.length ? homeData.banners : heroBanners;
  const stats = homeData?.stats || {};
  const fmtCash = (v) =>
    !v ? "₹0" : typeof v === "number" ? `₹${v.toFixed(0)}` : v;

  const quickActions = [
    {
      to: "/wallet",
      icon: Wallet,
      label: "Wallet",
      gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
      shadow: "rgba(139,92,246,0.3)",
    },
    {
      to: "/history",
      icon: History,
      label: "History",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      to: "/history",
      icon: Shield,
      label: "Reports",
      gradient: "linear-gradient(135deg,#3b82f6,#4f46e5)",
      shadow: "rgba(59,130,246,0.3)",
    },
    {
      to: "/wallet",
      icon: Gift,
      label: "Rewards",
      gradient: "linear-gradient(135deg,#ec4899,#e11d48)",
      shadow: "rgba(236,72,153,0.3)",
    },
  ];

  const statItems = [
    {
      label: "Owned",
      value: stats.productsOwned || 0,
      color: "#f97316",
      bg: "rgba(249,115,22,0.18)", // Increased opacity
      border: "rgba(249,115,22,0.35)", // Stronger border
    },
    {
      label: "Reported",
      value: stats.productsReported || 0,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)", // Increased opacity
      border: "rgba(239,68,68,0.35)", // Stronger border
    },
    {
      label: "vCash",
      value: fmtCash(stats.vCashEarned),
      color: "#059669",
      bg: "rgba(5,150,105,0.15)", // Increased opacity
      border: "rgba(5,150,105,0.35)", // Stronger border
    },
  ];

  return (
    <div
      ref={pageRef}
      className="min-h-screen font-sans pb-28 transition-colors duration-300 bg-white"
    >
      <div className="px-4 pt-5 space-y-6">
        {/* --- 1 � HERO CAROUSEL --- */}
        {isLoading ? (
          <div
            className="h-[210px] rounded-[28px] animate-pulse"
            style={{ background: "rgba(0,0,0,0.06)" }}
          />
        ) : (
          <HeroCarousel items={banners} />
        )}

        {/* --- 2 � SCAN CTA --- */}
        {!isLoading && (
          <Link to="/scan" className="scan-cta block">
            <div
              className="relative rounded-[28px] p-6 overflow-hidden active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(135deg,#0d1f12,#143d1f,#1a5c2c)",
                boxShadow: "0 12px 36px -8px rgba(5,150,105,0.2)",
              }}
            >
              <div
                className="scan-ring-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
                style={{ border: "1px solid rgba(5,150,105,0.1)" }}
              />
              <div
                className="scan-ring-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full"
                style={{ border: "1px solid rgba(5,150,105,0.05)" }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl"
                style={{ background: "rgba(5,150,105,0.15)" }}
              />

              <div className="relative z-10 flex items-center gap-5">
                <div className="shrink-0">
                  <div className="scan-icon-breathe relative w-[72px] h-[72px]">
                    <div
                      className="absolute inset-0 rounded-2xl blur-sm"
                      style={{ background: "rgba(5,150,105,0.2)" }}
                    />
                    <div
                      className="relative w-full h-full rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg,#059669,#5a9620)",
                        boxShadow: "0 8px 20px rgba(5,150,105,0.3)",
                      }}
                    >
                      <QrCode
                        size={34}
                        className="text-white"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div
                      className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
                      style={{ background: "#059669", opacity: 0.6 }}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ background: "#059669", opacity: 0.6 }}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full"
                      style={{ background: "#059669", opacity: 0.6 }}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full"
                      style={{ background: "#059669", opacity: 0.6 }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">
                    Scan & Earn
                  </h2>
                  <p
                    className="text-[12px] font-medium mt-0.5 flex items-center gap-1"
                    style={{ color: "rgba(5,150,105,0.8)" }}
                  >
                    <Zap size={11} className="text-yellow-400" /> Instant
                    cashback on every scan
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                    style={{
                      boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                    }}
                  >
                    Scan Now <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* --- 3 � QUICK ACTIONS --- */}
        <div className="quick-actions grid grid-cols-4 gap-3 items-end">
          {quickActions.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              className="quick-action active:scale-[0.92] transition-transform"
              style={{ opacity: 1, visibility: "visible", transform: "none" }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                  style={{
                    background: item.gradient,
                    boxShadow: `0 6px 16px ${item.shadow}`,
                  }}
                >
                  <item.icon size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* --- 4 � YOUR ACTIVITY STATS --- */}
        <div
          className="home-activity-section"
          style={{
            opacity: 1,
            display: "block",
            visibility: "visible",
            margin: "24px 0",
          }}
        >
          <div
            className="home-activity-card bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden"
            style={{
              opacity: 1,
              display: "block",
              visibility: "visible",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                height: 4,
                opacity: 1,
                background: "linear-gradient(90deg,#059669,#047857,#059669)",
              }}
            />
            <div className="p-5" style={{ opacity: 1 }}>
              <div
                className="flex items-center gap-2 mb-4"
                style={{ opacity: 1 }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-600"
                  style={{ opacity: 1 }}
                >
                  <Crown size={14} className="text-white" />
                </div>
                <span
                  className="text-[13px] font-black text-zinc-950 dark:text-white uppercase"
                  style={{ letterSpacing: "0.15em", opacity: 1 }}
                >
                  Your Activity
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3" style={{ opacity: 1 }}>
                {statItems.map((s, i) => (
                  <div
                    key={i}
                    className="home-stat-box rounded-2xl p-4 text-center"
                    style={{
                      opacity: 1,
                      background: s.bg,
                      border: `2px solid ${s.border}`,
                    }}
                  >
                    <div
                      className="text-[11px] font-black uppercase mb-1.5"
                      style={{
                        letterSpacing: "0.1em",
                        color: s.color,
                        opacity: 1,
                      }}
                    >
                      {s.label}
                    </div>
                    {isLoading ? (
                      <div
                        className="h-8 rounded-lg animate-pulse mx-auto w-16"
                        style={{ background: "rgba(0,0,0,0.15)", opacity: 1 }}
                      />
                    ) : (
                      <div
                        className="text-[26px] font-black leading-none"
                        style={{
                          opacity: 1,
                          color: s.color,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {s.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- 5 � PARTNER BRANDS --- */}
        <div className="brands-rail">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(5,150,105,0.1)" }}
              >
                <Star size={10} style={{ color: "#059669" }} />
              </div>
              <span
                className="text-[11px] font-bold text-gray-500 uppercase"
                style={{ letterSpacing: "0.12em" }}
              >
                Partner Brands
              </span>
            </div>
            <button
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="text-[10px] font-bold flex items-center gap-0.5"
              style={{ color: "#059669" }}
            >
              {showAllBrands ? "Less" : "All"}{" "}
              <ChevronRight
                size={12}
                className={`transition-transform ${showAllBrands ? "rotate-90" : ""}`}
              />
            </button>
          </div>
          <div
            className={
              showAllBrands
                ? "grid grid-cols-4 gap-4"
                : "flex gap-4 overflow-x-auto pb-2 no-scrollbar"
            }
          >
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-[60px] h-[60px] rounded-2xl animate-pulse shrink-0"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                ))
            ) : brands.length > 0 ? (
              brands.map((b) => (
                <Link
                  key={b.id}
                  to={`/brand-details/${b.id}`}
                  className="brand-item flex flex-col items-center gap-1.5 shrink-0 active:scale-[0.92] transition-transform"
                  style={{
                    opacity: 1,
                    visibility: "visible",
                    transform: "none",
                  }}
                >
                  <div
                    className="w-[60px] h-[60px] rounded-2xl bg-white p-[3px]"
                    style={{
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-white overflow-hidden flex items-center justify-center">
                      <FallbackImage
                        src={resolveBrandLogoUrl(b.logoUrl || b.logo)}
                        alt={b.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 truncate w-14 text-center">
                    {b.name}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-[11px] text-gray-400 italic">
                No brands yet
              </div>
            )}
          </div>
        </div>

        {/* --- 6 � TOP OFFERS --- */}
        <div className="offers-rail">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.1)" }}
            >
              <TrendingUp size={10} style={{ color: "#059669" }} />
            </div>
            <span
              className="text-[11px] font-bold text-gray-500 uppercase"
              style={{ letterSpacing: "0.12em" }}
            >
              Top Offers
            </span>
          </div>
          <div className="flex gap-3.5 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory">
            {defaultOffers.map((o, i) => (
              <div
                key={i}
                className="offer-card min-w-[175px] h-[120px] rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden snap-center active:scale-[0.95] transition-transform"
                style={{
                  background: o.gradient,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  opacity: 1,
                  visibility: "visible",
                  transform: "none",
                }}
              >
                <div
                  className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{o.emoji}</span>
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Get Upto
                    </span>
                  </div>
                  <div
                    className="text-[24px] font-black text-white tracking-tight leading-none"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                  >
                    {o.amount}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-3 py-1 rounded-full text-white"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {o.brand}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  >
                    <ArrowRight size={13} className="text-gray-800" />
                  </div>
                </div>
                <div
                  className="offer-shine absolute inset-y-0 left-0 w-1/4 -translate-x-full"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- 7 � PRODUCT REPORTS --- */}
        <Link
          to="/history"
          className="block active:scale-[0.98] transition-transform"
        >
          <div
            className="bg-white rounded-2xl p-4 flex items-center justify-between"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#4f46e5)",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                }}
              >
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-gray-900">
                  Product Reports
                </div>
                <div className="text-[10px] text-gray-500">
                  {isLoading
                    ? "Loading..."
                    : `${stats.productsReported || 0} reported issues`}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </Link>

        {/* --- 8 � VIDEO SPOTLIGHT --- */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.1)" }}
            >
              <Sparkles size={10} style={{ color: "#059669" }} />
            </div>
            <span
              className="text-[11px] font-bold text-gray-500 uppercase"
              style={{ letterSpacing: "0.12em" }}
            >
              Brand Spotlight
            </span>
          </div>
          <VideoSpotlight />
        </div>

        {/* --- 9 � HOW IT WORKS --- */}
        <div className="mb-6">
          <HowItWorks />
        </div>
      </div>
    </div>
  );
};

export default Home;


