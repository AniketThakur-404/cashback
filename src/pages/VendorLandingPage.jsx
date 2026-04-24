import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  QrCode,
  RefreshCw,
  BarChart3,
  Zap,
  TrendingUp,
  CheckCircle2,
  Settings2,
  Wallet,
  BarChart2,
  PieChart,
  Activity,
  CreditCard,
  Quote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VendorNavbar from "../components/VendorNavbar";
// import whyCashbackHero from "../assets/why-cashback-hero.png";
const ScrollContent = () => {
  const [idx, setIdx] = React.useState(0);

  const states = [
    {
      number: "1",
      label: "Set Cashback",
      sub: "Create your campaign and decide how much cashback you want to offer.",
      color: "#10b981",
      tag: "STEP 01",
    },
    {
      number: "2",
      label: "Customer Scans",
      sub: "Customer purchases, scans the QR code, and receives instant cashback.",
      color: "#3b82f6",
      tag: "STEP 02",
    },
    {
      number: "3",
      label: "Cashback Credited",
      sub: "Cashback is credited instantly, giving them a strong reason to return.",
      color: "#a855f7",
      tag: "STEP 03",
    },
  ];

  // Auto-change every 3 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % states.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [states.length]);

  return (
    <div className="relative w-full py-4 bg-transparent">
      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Connection Line from Top */}
        <div className="h-6 w-[2px] bg-linear-to-b from-slate-200 via-slate-300 to-transparent dashed-line mb-4" />

        <div className="relative max-w-4xl mx-auto w-full flex items-center justify-center pt-4 min-h-[300px]">
          {/* The Arc SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto overflow-visible"
            >
              {/* Base Dashed Arc */}
              <path
                d="M 100,450 A 400,400 0 0 1 900,450"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeDasharray="12 12"
                className="opacity-40"
              />

              {/* Animated Progress Arc */}
              <motion.path
                d="M 100,450 A 400,400 0 0 1 900,450"
                fill="none"
                stroke={states[idx].color}
                strokeWidth="6"
                strokeLinecap="round"
                animate={{ pathLength: (idx + 1) / states.length }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
          </div>

          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center justify-center mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="text-[80px] md:text-[120px] font-black tracking-tighter leading-none mb-4 transition-colors duration-500"
                  style={{ color: states[idx].color }}
                >
                  {states[idx].number}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                    {states[idx].label}
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed px-6">
                    {states[idx].sub}
                  </p>
                </motion.div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-3 mt-12 pointer-events-auto">
                  {states.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className="group relative flex items-center justify-center w-8 h-8 focus:outline-none"
                    >
                      <motion.div
                        animate={{
                          scale: i === idx ? 1.4 : 1,
                          backgroundColor:
                            i === idx ? states[idx].color : "#cbd5e1",
                        }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline:
      "border border-input hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-12 px-8 rounded-md text-lg",
    icon: "h-10 w-10",
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const VendorLandingPage = () => {
  const [hoveredLogo, setHoveredLogo] = useState(null);
  const [isRupee, setIsRupee] = useState(false);
  const navigate = useNavigate();
  const APP_NAME = "Assured Rewards";

  const logos = [
    "FMCG",
    "Cosmetics",
    "Electronics",
    "Electrical",
    "Ply Board & Laminates",
    "Electric Appliances",
    "Paint Industry",
    "Petro Products",
    "Clothing / Garments",
    "Wellness products",
    "Confectionery",
    "Dairy Products",
    "Cattle Feed",
    "Bathroom / Kitchen Fittings",
    "Auto Spare Parts",
    "Aromatics Industry",
  ];

  const brandImages = Array.from({ length: 12 }, (_, i) => i + 1);

  const benefits = [
    {
      icon: QrCode,
      title: "Zero Friction",
      description:
        "Every unique QR confirms a genuine product and credits cashback instantly.",
    },
    {
      icon: RefreshCw,
      title: "Automatic Retention",
      description:
        "Set campaign budgets and let expiring cashback phrases prompt repeat visits.",
    },
    {
      icon: BarChart3,
      title: "Real Insights",
      description: "Know who your best customers are instantly.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Set Cashback",
      description:
        "Create your campaign and decide how much cashback you want to offer.",
      icon: Settings2,
      color: "emerald",
    },
    {
      number: "02",
      title: "Customer Scans",
      description:
        "Customer purchases, scans the QR code, and receives instant cashback.",
      icon: QrCode,
      color: "blue",
    },
    {
      number: "03",
      title: "Cashback Credited",
      description:
        "Cashback is credited instantly, giving them a strong reason to return.",
      icon: Wallet,
      color: "purple",
    },
  ];

  const stats = [
    {
      number: "30%",
      label: "Increase in Repeat Visits",
    },
    {
      number: "2x",
      label: "Higher Customer Lifetime Value",
    },
    {
      number: "0",
      label: "Tech Hardware Required",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-admin-body text-base">
      <VendorNavbar />

      <section className="relative pt-20 pb-20 overflow-hidden bg-white">
        {/* Advanced Background Design */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute top-0 left-0 right-0 h-[800px] opacity-40"
            style={{
              background: `
                radial-gradient(at 0% 0%, hsla(160, 84%, 93%, 1) 0px, transparent 50%),
                radial-gradient(at 50% 0%, hsla(180, 80%, 95%, 1) 0px, transparent 50%),
                radial-gradient(at 100% 0%, hsla(200, 70%, 94%, 1) 0px, transparent 50%)
              `,
            }}
          />

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Abstract Soft Shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-600 text-xs font-extrabold uppercase tracking-[0.15em] mb-10 shadow-sm backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              NEWLY LAUNCHED PLATFORM
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.02] tracking-tight mb-8 font-admin-heading"
            >
              Grow Your Business <br className="hidden md:block" />
              <span className="text-emerald-600">
                with Every Customer Visit
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
            >
              Launch your own customer loyalty program with QR-based cashback
              rewards. Scale your business effortlessly — without apps, cards,
              or complicated systems.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24"
            >
              <Button
                size="xl"
                className="bg-slate-900 hover:bg-black text-white px-12 h-16 rounded-2xl text-lg font-bold shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 group"
                onClick={() => navigate("/brand-registration")}
              >
                Start Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="bg-white/40 backdrop-blur-md border-slate-200 text-slate-700 px-12 h-16 rounded-2xl text-lg font-bold hover:bg-white/60 transition-all"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] mr-3">
                  ▶
                </span>
                Watch Demo
              </Button>
            </motion.div>

            {/* Visual Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl mx-auto"
            >
              {/* Glass Container */}
              <div className="relative z-20 bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/50 p-8 md:p-12 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.1)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                  {/* Metric 1 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Total Rewards
                      </p>
                      <Activity className="w-4 h-4 text-emerald-500/50" />
                    </div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                      {isRupee ? "₹48.2k" : "$580"}
                    </h3>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> +12.4%
                    </div>
                    <div className="h-16 w-full pt-4 opacity-50">
                      <svg
                        className="w-full h-full text-emerald-500"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d="M0 35 Q 20 10, 40 25 T 80 5 T 100 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="space-y-3 md:border-l md:border-slate-200/50 md:pl-12">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Active Users
                      </p>
                      <PieChart className="w-4 h-4 text-blue-500/50" />
                    </div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                      1,284
                    </h3>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> +8.2%
                    </div>
                    <div className="h-16 w-full pt-4 opacity-50">
                      <svg
                        className="w-full h-full text-blue-500"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d="M0 30 Q 30 35, 50 15 T 80 25 T 100 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="space-y-3 md:border-l md:border-slate-200/50 md:pl-12">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Repeat Rate
                      </p>
                      <BarChart2 className="w-4 h-4 text-purple-500/50" />
                    </div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                      42%
                    </h3>
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xs bg-purple-50 w-fit px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> +15.0%
                    </div>
                    <div className="h-16 w-full pt-4 opacity-50">
                      <svg
                        className="w-full h-full text-purple-500"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d="M0 38 Q 25 30, 50 35 T 75 10 T 100 5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Elements */}
              {/* Avg Spend Card */}
              <motion.div
                animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-44 bottom-12 z-30 hidden lg:block"
              >
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-52">
                  <p className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest">
                    Average Spend
                  </p>
                  <div className="flex items-end gap-2.5 h-16">
                    <div className="w-3.5 bg-emerald-50 rounded-t-lg h-8" />
                    <div className="w-3.5 bg-emerald-100 rounded-t-lg h-12" />
                    <div className="w-3.5 bg-emerald-300 rounded-t-lg h-10" />
                    <div className="w-3.5 bg-emerald-500 rounded-t-lg h-20" />
                    <div className="w-3.5 bg-emerald-600 rounded-t-lg h-14" />
                  </div>
                  <div className="mt-5 flex justify-between text-[9px] text-slate-400 font-black tracking-tighter">
                    <span>JAN</span>
                    <span>JUN</span>
                  </div>
                </div>
              </motion.div>

              {/* Wallet Badge */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -left-8 -top-8 z-30 hidden lg:block"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 text-white border-4 border-white">
                  <Wallet className="w-8 h-8" />
                </div>
              </motion.div>

              {/* Live Balance Card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -right-24 top-20 z-30 hidden lg:block"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-7 shadow-2xl border border-white/50 w-64 text-left">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-xl shadow-blue-500/30">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                    Total Balance
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {isRupee ? "₹" : "$"}*,***.50
                  </p>
                </div>
              </motion.div>

              {/* Currency Pill (Compact) */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                whileHover={{ scale: 1.02 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="absolute -right-8 -bottom-8 z-30 hidden md:block"
              >
                <div className="bg-white rounded-full pl-1.5 pr-6 py-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-50 shadow-inner">
                    {isRupee ? "IN" : "US"}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">
                        Currency
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setIsRupee(false)}
                          className={`text-[9px] font-black transition-all ${!isRupee ? "text-slate-900" : "text-slate-300 hover:text-slate-400"}`}
                        >
                          USD
                        </button>
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                        <button
                          onClick={() => setIsRupee(true)}
                          className={`text-[9px] font-black transition-all ${isRupee ? "text-slate-900" : "text-slate-300 hover:text-slate-400"}`}
                        >
                          INR
                        </button>
                      </div>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-100 mx-1" />

                    <div className="flex flex-col items-start">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                        Rate
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isRupee ? "INR_VAL" : "USD_VAL"}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="text-sm font-black text-slate-900 tracking-tight"
                        >
                          {isRupee ? "₹72.50" : "0.87"}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Trusted Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-20 flex flex-wrap items-center justify-center gap-10 text-sm text-slate-400 font-bold uppercase tracking-widest"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                14 day free trial
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Improved Marquee Section */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Trusted by 500+ Businesses
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-admin-heading">
              Powering Loyalty Across Industries
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              From local favorites to national brands, we help businesses grow
              with data-driven rewards.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Refined Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex flex-col gap-8">
            {/* Marquee Row 1 */}
            <div className="flex overflow-hidden group">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-6 px-6 py-4">
                {[...logos, ...logos].map((logo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center px-10 py-5 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group/tag cursor-default"
                  >
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover/tag:text-emerald-600 transition-colors">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Marquee Row 2 (Reverse) */}
            <div className="flex overflow-hidden group">
                    <div className="animate-marquee-reverse whitespace-nowrap flex items-center gap-12 py-8 min-h-[160px]">
                      {[...brandImages, ...brandImages, ...brandImages].map(
                        (num, idx) => {
                          const isWhiteLogo = [5, 6, 10, 11].includes(num);
                          const primarySrc = `/brand/${num}.avif`;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-center min-w-[280px]"
                            >
                              <img
                                src={primarySrc}
                                alt={`Brand ${num}`}
                                className={`w-64 h-32 object-contain transition-all duration-500 ${isWhiteLogo ? "brightness-0 opacity-80" : "opacity-100"}`}
                                onError={(e) => {
                                  if (e.target.src.includes("/brand/")) {
                                    e.target.src = `/${num}.avif`;
                                  }
                                }}
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved Problem/Solution Section (SaaS style with new content) */}
      <section className="pt-16 pb-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Large Heading / Quote Style */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-12">
            <div className="space-y-4 max-w-4xl">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-medium text-slate-900 tracking-tight leading-[1.1]"
              >
                Still struggling to get <br />
                <span className="text-emerald-600 font-normal italic">
                  repeat customers?
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl"
              >
                Here’s a <span className="text-emerald-600">smarter way</span>{" "}
                to retain customers and grow your business.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-right hidden md:block pb-1"
            >
              <p className="text-xs font-black text-slate-900 mb-0.5">
                Assured Rewards
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Growth Operating System
              </p>
            </motion.div>
          </div>

          {/* The Card Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Problem Column (L: 3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-10 lg:pr-8">
              {[
                {
                  t: "The Retention Gap",
                  d: "Customers visit once and don't return, leaving money on the table.",
                },
                {
                  t: "Margin Pressure",
                  d: "Discounts reduce margins but don't build loyalty or lasting value.",
                },
                {
                  t: "Data Blindness",
                  d: "Hard to track which customers are coming back and why.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-bold text-slate-900">{item.t}</h4>
                  <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                    {item.d}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Metric Card (M: 4 cols) - Track customer activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4 bg-slate-50/50 rounded-[3rem] p-8 lg:p-10 flex flex-col justify-between min-h-[340px] relative group"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="space-y-1.5 relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-loose">
                  Real-time Insights
                </p>
                <p className="text-[12px] font-medium text-slate-400 leading-relaxed">
                  Track customer activity and repeat visits in real time with
                  our intelligent analytics dashboard.
                </p>
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-6xl font-medium text-slate-900 tracking-tighter leading-none">
                  500+
                </h3>
                <div className="flex items-center gap-2.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" /> Verified Growth Rate
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 relative group overflow-hidden rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)]"
            >
              {/* Background Layers */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-emerald-500/10 z-0 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

              <div className="relative z-10 p-8 lg:p-10 h-full flex flex-col justify-between bg-white/40 backdrop-blur-3xl border-none min-h-[340px]">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Instant Rewards
                    </p>
                    <h3 className="text-3xl font-medium text-slate-900 tracking-tighter">
                      ₹3,12,918.50
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-[180px]">
                      Reward every purchase with instant cashback credited
                      directly to their digital wallet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white shadow-sm cursor-pointer hover:bg-white transition-colors">
                    <span className="text-xs">🇮🇳</span>
                    <span className="text-[9px] font-black text-slate-900">
                      INR
                    </span>
                  </div>
                </div>

                <div className="mt-12 flex flex-col space-y-6">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Smarter Campaigns
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-xs">
                      Easily create and manage campaigns from one dashboard to
                      drive repeat visits effortlessly.
                    </p>
                  </div>

                  <div className="flex justify-between items-end gap-5">
                    <div className="flex -space-x-2.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-[2px] border-white overflow-hidden bg-white shadow-lg transition-transform hover:scale-110 hover:z-20 cursor-pointer flex items-center justify-center p-1"
                        >
                          <img
                            src={`/brand/${i}.avif`}
                            alt="Brand Logo"
                            className={`w-full h-full object-contain ${i === 4 ? "brightness-0 opacity-80" : ""}`}
                            onError={(e) => {
                              if (e.target.src.includes("/brand/")) {
                                e.target.src = `/${i}.avif`;
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      className="!bg-slate-900 hover:!bg-black !text-white !h-12 !px-6 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest !shadow-xl !shadow-slate-900/20 transition-all hover:scale-[1.02]"
                      onClick={() => navigate("/brand-registration")}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Redesigned Vendor Advantage Section (Premium Content Update) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Header & Quote */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em]">
                Vendor Advantage
              </div>
              <h3 className="text-5xl md:text-7xl font-black tracking-tight font-admin-heading bg-linear-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent">
                WHY VENDORS LOVE <br className="hidden md:block" />
                <span className="text-emerald-600 uppercase">
                  Assured Rewards.
                </span>
              </h3>

              <div className="relative">
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                  Simple to run. Easy to manage.{" "}
                  <br className="hidden md:block" />
                  Built to increase repeat customers.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Metric Stats Grid (3 cards to match content) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Easy Setup",
                value: "3 MIN",
                desc: "Create and launch cashback campaigns in minutes without any technical complexity.",
                icon: Zap,
                highlight: false,
              },
              {
                label: "Repeat Visits",
                value: "80%",
                desc: "Cashback rewards encourage customers to return and purchase again consistently.",
                icon: RefreshCw,
                highlight: true,
              },
              {
                label: "Real-time Tracking",
                value: "LIVE",
                desc: "Monitor scans, rewards, and customer behavior from one simple dashboard.",
                icon: Activity,
                highlight: false,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative group p-8 lg:p-10 rounded-[2.5rem] transition-all duration-700 overflow-hidden ${
                  stat.highlight
                    ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30"
                    : "bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl"
                }`}
              >
                {/* Decorative Mesh background for highlighted card */}
                {stat.highlight && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
                        backgroundSize: "15px 15px",
                      }}
                    />
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col justify-start gap-6 min-h-[120px]">
                  <div className="flex justify-start items-start">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                        stat.highlight
                          ? "bg-white/20 text-white"
                          : "bg-white shadow-sm text-emerald-600"
                      }`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p
                      className={`text-[15px] font-black uppercase tracking-widest ${stat.highlight ? "text-emerald-100" : "text-slate-900"}`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`text-[16px] font-medium leading-relaxed ${stat.highlight ? "text-emerald-50/70" : "text-slate-400"}`}
                    >
                      {stat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Multi-State Arc Metric Section */}
      <section
        className="pt-20 pb-24 bg-white relative overflow-hidden"
        id="how-it-works"
      >
        {/* Subtle Background Elements */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Section Header */}
          <div className="text-center mb-0">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              HOW IT <span className="text-emerald-600">WORKS.</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium mt-4">
              Simple for you. Seamless for your customers.
            </p>
          </div>

          {/* The Arc & Dynamic Content */}
          <div className="relative max-w-5xl mx-auto">
            <ScrollContent />
          </div>
        </div>
      </section>

      {/* Improved Impact Section */}
      <section
        id="resources"
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <div className="grid lg:grid-cols-4 gap-16 items-center">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em]">
                Real Business Impact
              </h2>
              <p className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Proven results that drive{" "}
                <span className="text-emerald-500">sustainable growth.</span>
              </p>
              <p className="text-slate-500 font-medium leading-relaxed">
                Our platform delivers measurable improvements in customer
                retention and sales volume.
              </p>
            </div>

            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-10">
              {[
                {
                  number: "30%",
                  label: "Increase in Repeat Visits",
                  sub: "Verified platform data",
                },
                {
                  number: "2X",
                  label: "Higher Customer LTV",
                  sub: "Customer lifetime value",
                },
                {
                  number: "0",
                  label: "Extra Hardware Needed",
                  sub: "Cloud-native solution",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50/50 border border-slate-100 rounded-[3rem] p-12 flex flex-col items-center lg:items-start group hover:bg-white hover:shadow-[0_40px_100px_rgba(0,0,0,0.06)] transition-all duration-500"
                >
                  <span className="text-6xl font-black text-emerald-600 tracking-tighter mb-5 font-admin-heading group-hover:scale-110 transition-transform">
                    {stat.number}
                  </span>
                  <span className="text-base font-bold text-slate-900 uppercase tracking-widest mb-2">
                    {stat.label}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.sub}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Improved Versatile Solutions Section */}
      <section
        id="features"
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-24 max-w-4xl text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                Targeted Solutions
              </div>
              <h3 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight font-admin-heading mb-10 leading-[1.05]">
                Built for businesses <br />
                <span className="text-emerald-600">that want to scale.</span>
              </h3>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Whether you're a local cafe or a national brand, we give you the
                tools to drive more sales and build lasting customer loyalty.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "For Retail Stores",
                desc: "Turn everyday purchases into instant cashback rewards and bring customers back regularly.",
                icon: QrCode,
                accent: "emerald",
              },
              {
                title: "For Brands",
                desc: "Add QR codes to your products and offer cashback on purchase to drive engagement and repeat buying.",
                icon: Zap,
                accent: "blue",
              },
              {
                title: "For Growing Businesses",
                desc: "Manage multiple campaigns, track performance, and scale your rewards system with ease.",
                icon: TrendingUp,
                accent: "purple",
              },
            ].map((solution, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-slate-50/50 rounded-[3.5rem] p-12 border border-slate-100 hover:bg-white hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-3 flex flex-col items-start"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform duration-700 ${
                    solution.accent === "emerald"
                      ? "bg-emerald-100/50"
                      : solution.accent === "blue"
                        ? "bg-blue-100/50"
                        : "bg-purple-100/50"
                  }`}
                >
                  <solution.icon
                    className={`w-8 h-8 ${
                      solution.accent === "emerald"
                        ? "text-emerald-600"
                        : solution.accent === "blue"
                          ? "text-blue-600"
                          : "text-purple-600"
                    }`}
                  />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {solution.title}
                </h4>
                <p className="text-slate-500 leading-relaxed font-medium text-lg mb-10">
                  {solution.desc}
                </p>
                <div className="mt-auto">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer">
                    Learn more{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Cashback Works Section */}
      {/* Redesigned Why Cashback Works Section (White Aesthetic) */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle Embossed Grid Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none grid grid-cols-6 md:grid-cols-12 gap-4 p-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[2rem] border-slate-100 border-2 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.02),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                  Why Cashback <br />
                  Works <span className="text-emerald-600 italic">Better.</span>
                </h3>
              </motion.div>

              <div className="space-y-8">
                {[
                  "Instant rewards create immediate excitement",
                  "Customers remember value, not just products",
                  "Rewards build habit, and habit drives repeat business",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Zap className="w-6 h-6 fill-current text-emerald-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                      {text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Content: Premium Image Asset */}
            <div className="relative h-[450px] flex items-center justify-center">
              <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 20 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                  className="relative z-10 w-full h-full flex items-center justify-center perspective-1000"
                >
                  <img
                    src="/Gif.gif"
                    alt="Why Cashback Works"
                    className="h-[650px] min-w-[300px] w-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-1000 z-10"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved Testimonial Section */}
      <section className="py-32 bg-slate-50/50 relative overflow-hidden border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <svg
            className="w-16 h-16 opacity-20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H13.017V21H14.017ZM6.017 21L6.017 18C6.017 16.8954 6.91243 16 8.017 16H11.017C11.5693 16 12.017 15.5523 12.017 15V9C12.017 8.44772 11.5693 8 11.017 8H8.017C7.46472 8 7.017 8.44772 7.017 9V12C7.017 12.5523 6.56929 13 6.017 13H5.017V21H6.017Z" />
          </svg>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-16 max-w-4xl tracking-tight italic"
          >
            “Since using Assured Rewards, our sales increased because customers
            keep coming back to use their cashback.”
          </motion.h2>

          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
              SO
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-2 text-center">
                Store Owner
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Retail / Café Industry
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved Final CTA Section */}
      <section id="pricing" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-linear-to-br from-emerald-500 to-emerald-700 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_60px_120px_-20px_rgba(16,185,129,0.3)]"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />

            <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95] font-admin-heading">
                Ready to Grow Your <br />
                <span className="text-gray-800">Business?</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
                Join 500+ businesses already using cashback rewards to increase
                repeat customers and sales volume.
              </p>

              <div className="flex flex-col items-center gap-12">
                <Button
                  size="lg"
                  className="!bg-black hover:!bg-slate-900 text-white font-black px-16 py-10 text-2xl rounded-3xl gap-4 w-full sm:w-auto shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                  onClick={() => navigate("/brand-registration")}
                >
                  Register Your Store Now
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </Button>

                <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
                  <span>Start in Minutes</span>
                  <span>No Setup Cost</span>
                  <span>Free Trial Available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Improved Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="space-y-4 text-center md:text-left">
              <div className="text-3xl font-black text-slate-900 tracking-tighter font-admin-heading">
                Assured<span className="text-emerald-600">Rewards</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Powering the next generation of loyalty.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-[11px] font-black uppercase tracking-widest text-slate-500">
              {[
                { label: "Login", path: "/vendor-dashboard" },
                { label: "Privacy Policy", path: "/vendor/privacy" },
                { label: "Terms of Service", path: "/vendor/terms" },
                { label: "Contact", href: "mailto:contact@assuredrewards.com" },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href || "#"}
                  onClick={(e) => {
                    if (link.path) {
                      e.preventDefault();
                      navigate(link.path);
                    }
                  }}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              © 2024 {APP_NAME}. Built for scale.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorLandingPage;
