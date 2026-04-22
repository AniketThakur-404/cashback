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
} from "lucide-react";
import VendorNavbar from "../components/VendorNavbar";

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
      number: 1,
      title: "Set Cashback",
      description: "Configure cashback value and expiry for each campaign.",
    },
    {
      number: 2,
      title: "Customer Scans",
      description:
        "Customer scans the QR on your pack and pays any way they want.",
    },
    {
      number: 3,
      title: "They Return",
      description: "Cashback credits for next visit",
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

      <section className="bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider animate-fade-in">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Newly Launched Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight text-balance font-admin-heading">
                Grow Your <br />
                Business with <br />
                <span className="text-emerald-600">
                  Every Customer <br />
                  Visit
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed text-balance max-w-xl">
                Launch your own customer loyalty program with QR-based cashback
                rewards. Let customers scan, earn instantly, and come back again
                — without apps, cards, or complicated systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 font-semibold shadow-lg shadow-emerald-700/20"
                  onClick={() => navigate("/brand-registration")}
                >
                  Start Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 font-semibold bg-white/50"
                >
                  ⏯ Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No
                  credit card required
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14 day
                  free trial
                </span>
              </div>
            </div>

            <div className="relative group perspective-2000">
              {/* Dynamic Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-400/20 rounded-full blur-[120px] group-hover:bg-emerald-400/30 transition-colors duration-1000"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-amber-400/15 rounded-full blur-[100px] group-hover:bg-amber-400/25 transition-colors duration-1000 delay-100"></div>

              <div className="relative bg-white/60 backdrop-blur-xl border border-white/60 rounded-[3rem] p-3 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] hover:shadow-[0_48px_120px_-25px_rgba(0,0,0,0.18)] transition-all duration-700 hover:-rotate-1">
                <div className="overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100">
                  <img
                    src="/Gif.gif"
                    alt="Platform Demo"
                    className="w-full h-auto object-cover transform scale-105 hover:scale-100 transition-transform duration-1000 ease-in-out"
                  />
                </div>

                <div className="absolute -top-10 -left-10 bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 animate-float hidden lg:block delay-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Redemptions
                      </p>
                      <p className="text-xl font-black text-gray-900">
                        Instant
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-gray-100 bg-slate-50 relative overflow-hidden group/section">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-50/50 rounded-full blur-[120px] -z-10 opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-50/50 rounded-full blur-[120px] -z-10 opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-admin-heading">
              Trusted by Growing Businesses
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
              Powering loyalty across diverse sectors and industries.
            </p>
          </div>
        </div>

        <div className="relative pb-6">
          {/* Marquee Fading Mask */}
          <div className="absolute inset-y-0 left-0 w-40 bg-linear-to-r from-slate-50 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-40 bg-linear-to-l from-slate-50 to-transparent z-10"></div>

          <div className="flex overflow-x-hidden group">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-20 px-6">
              {[...logos, ...logos].map((logo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center flex-none"
                >
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] hover:text-slate-600 transition-colors cursor-default">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            {/* Left Box (Problem) */}
            <div className="space-y-8 lg:pr-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-admin-heading">
                Still struggling to get
                <br />
                repeat customers?
              </h2>

              <ul className="space-y-6">
                {[
                  "Customers visit once and never return",
                  "Discounts reduce margins but don't build loyalty",
                  "Loyalty apps are complicated and rarely used",
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <span className="text-red-500 text-base">
                        <svg
                          className="w-4 h-4 text-red-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    </div>
                    <span className="text-base sm:text-lg text-slate-600 font-medium">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Box (Solution) */}
            <div className="bg-[#0f9d58] rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-emerald-900/20 relative">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                There's a simpler way.
              </h3>

              <ul className="space-y-6">
                {[
                  "Reward every purchase with instant cashback",
                  "No apps, no cards — just a QR scan",
                  "Turn one-time buyers into repeat customers",
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-white font-medium">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Advantage Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 font-admin-heading">
              Vendor Advantage
            </h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#0B1527] tracking-tight font-admin-heading mb-6">
              Why Vendors Love Assured Rewards
            </h3>
            <p className="text-base sm:text-lg text-slate-500">
              Run powerful reward campaigns without complexity and grow repeat
              sales effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center mb-6">
                01
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">
                Zero Friction
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                No apps. No cards. No setup hassle.
                <br />
                Customers simply scan and earn instant
                <br />
                cashback.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-6">
                02
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">
                Automatic Retention
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Set cashback once and let the system
                <br />
                bring customers back again and again.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 font-bold text-lg flex items-center justify-center mb-6">
                03
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">
                Real Insights
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Track scans, rewards, and repeat
                <br />
                customers in real time from one
                <br />
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Dark Section) */}
      <section className="py-24 bg-[#0B1527] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-admin-heading mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400">
              Simple for you. Seamless for your customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#0f9d58] shadow-[0_0_40px_rgba(15,157,88,0.4)] flex items-center justify-center mb-8">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Set Cashback
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs mx-auto">
                Create your campaign and decide how much
                <br />
                cashback you want to offer.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#2563eb] shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center mb-8">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Customer Scans
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs mx-auto">
                Customer purchases, scans the QR code, and
                <br />
                receives instant cashback.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#a855f7] shadow-[0_0_40px_rgba(168,85,247,0.4)] flex items-center justify-center mb-8">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">They Return</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs mx-auto">
                Customers come back to use their rewards,
                <br />
                increasing repeat visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] font-admin-heading">
              Real Impact On Your Business
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-12 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl md:text-[5.5rem] font-black text-[#0B1527] leading-none mb-6 tracking-tight">
                30%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-[0.1em]">
                Increase In Repeat Visits
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl md:text-[5.5rem] font-black text-[#0B1527] leading-none mb-6 tracking-tight">
                2X
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-[0.1em]">
                Higher Customer LTV
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl md:text-[5.5rem] font-black text-[#0B1527] leading-none mb-6 tracking-tight">
                0
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-[0.1em]">
                Extra Hardware Required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Versatile Solutions Section */}
      <section className="py-24 bg-slate-50/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 max-w-4xl">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">
              VERSATILE SOLUTIONS
            </h2>
            <h3 className="text-4xl md:text-6xl lg:text-[4rem] leading-[1.1] font-extrabold text-[#0B1527] tracking-tight font-admin-heading mb-6 md:whitespace-nowrap">
              Customer Engagement Made Simple
            </h3>
            <p className="text-lg text-slate-500 font-medium max-w-2xl">
              Everything you need to run a complete loyalty and cashback rewards
              system in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-[#0B1527] mb-4">
                For Retail Stores
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Turn everyday purchases into instant
                <br />
                cashback rewards and bring customers
                <br />
                back regularly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-[#0B1527] mb-4">
                For Brands
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Add QR codes to your products and
                <br />
                offer cashback on purchase to drive
                <br />
                engagement and repeat buying.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-[#0B1527] mb-4">
                For Growing Businesses
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Manage multiple campaigns, track
                <br />
                performance, and scale your rewards
                <br />
                system easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-[#0B1527] leading-[1.2] mb-12 max-w-4xl tracking-tight">
            “Since using Assured Rewards, our sales increased because customers
            keep coming back to use their cashback.”
          </h2>

          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
              SO
            </div>
            <div>
              <div className="text-sm font-bold text-[#0B1527] uppercase tracking-widest mb-1">
                STORE OWNER
              </div>
              <div className="text-xs font-bold text-slate-500">
                Retail / Café
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0f9d58] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_24px_48px_-15px_rgba(15,157,88,0.3)]">
            <h2 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
              Ready to Grow Your
              <br />
              Business?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 500+ businesses already using cashback rewards to
              <br />
              increase repeat customers and sales.
            </p>
            <div className="flex flex-col items-center gap-8">
              <Button
                size="lg"
                className="!bg-black hover:!bg-gray-900 text-white font-bold px-12 py-8 text-xl rounded-2xl gap-3 w-full sm:w-auto shadow-2xl transition-transform active:scale-95"
                onClick={() => navigate("/brand-registration")}
              >
                Register Your Store Now →
              </Button>

              <div className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-[0.2em]">
                START IN MINUTES • NO SETUP COST • FREE TRIAL AVAILABLE
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-emerald-800 tracking-tight font-admin-heading">
              {APP_NAME}
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 font-medium">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vendor-dashboard");
                }}
                className="hover:text-emerald-600 transition cursor-pointer"
              >
                Login
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vendor/privacy");
                }}
                className="hover:text-emerald-600 transition cursor-pointer"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vendor/terms");
                }}
                className="hover:text-emerald-600 transition cursor-pointer"
              >
                Terms of Service
              </a>
              <a
                href="mailto:contact@assuredrewards.com"
                className="hover:text-emerald-600 transition cursor-pointer"
              >
                Contact
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorLandingPage;
