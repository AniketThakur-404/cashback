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
    "Coffee House",
    "TechStore",
    "Fashion Plus",
    "Dine & Co",
    "Beverly Hub",
  ];

  const benefits = [
    {
      icon: QrCode,
      title: "Zero Friction",
      description: "Customers just scan and pay. No apps to download.",
    },
    {
      icon: RefreshCw,
      title: "Automatic Retention",
      description: "Bring them back with expiring cashback offers.",
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
      description: "Define your cashback % (e.g. 5%)",
    },
    {
      number: 2,
      title: "Customer Scans",
      description: "Customer scans QR & pays",
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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {APP_NAME}
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Pricing
            </a>
          </div>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            onClick={() => navigate("/vendor-dashboard")}
          >
            Login
          </Button>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight text-balance">
                Turn One Time Shoppers into Loyal Regulars.
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed text-balance max-w-lg">
                Automatic cashback rewards that bring customers back without the
                complexity of loyalty cards or apps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 font-semibold shadow-lg shadow-emerald-700/20"
                  onClick={() => navigate("/brand-registration")}
                >
                  Start For Free
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

            <div className="relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-amber-500/10 rounded-3xl blur-2xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:scale-[1.02] transition-transform duration-500 ease-out">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
                      <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                        Cashback Received
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        +₹50.00
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <p className="text-base text-gray-600">
                    Your cashback is ready! Come back and use it on your next
                    purchase at{" "}
                    <span className="font-bold text-gray-900">
                      Coffee House
                    </span>
                    .
                  </p>
                  <button className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]">
                    View Wallet
                  </button>
                </div>

                <div className="absolute -top-6 -right-6 bg-white p-3 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">
                      💰 Just Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-10 font-medium">
            Trusted by 500+ Businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {logos.map((logo, idx) => (
              <div
                key={idx}
                className={`px-6 py-3 rounded-full border border-gray-200 transition-all cursor-default ${
                  hoveredLogo === idx
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm scale-105"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                onMouseEnter={() => setHoveredLogo(idx)}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <p className="font-bold text-lg whitespace-nowrap">{logo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
              Why Vendors Love Us
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Build lasting relationships with your customers without the
              technical headache.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Simple for you, seamless for your customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative px-4">
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-1 bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-200 rounded-full"></div>

            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white border-2 border-transparent hover:border-emerald-100 rounded-[2rem] p-8 text-center transition-colors duration-300">
                  <div className="w-20 h-20 bg-white border-4 border-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-8 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-balance">
            Real Impact for Your Business
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-10 text-center border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-center gap-3 mb-4 text-emerald-300">
                  <p className="text-6xl md:text-7xl font-extrabold text-white tracking-tighter">
                    📈 {stat.number}
                  </p>
                </div>
                <p className="text-white/80 text-lg font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-amber-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border-none shadow-xl shadow-amber-900/5 rounded-3xl p-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg text-white">
              <span className="text-4xl font-serif leading-none mt-2">"</span>
            </div>
            <div className="flex justify-center gap-1 mb-6 mt-6">
              <span className="text-amber-400 text-2xl">⭐⭐⭐⭐⭐</span>
            </div>
            <blockquote className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 italic text-balance leading-tight tracking-tight">
              "Since using this platform, my Tuesday sales have doubled because
              people come back to use their cashback."
            </blockquote>
            <div>
              <p className="text-xl font-bold text-gray-900">Sarah Chen</p>
              <p className="text-emerald-600 font-medium">
                Owner, Coffee House
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-gray-900 tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="text-2xl text-gray-500 mb-12 max-w-2xl mx-auto">
            Join 500+ businesses that are already seeing results.
          </p>
          <Button
            size="lg"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-10 py-8 text-xl rounded-2xl gap-3 w-full sm:w-auto shadow-2xl shadow-emerald-700/30 transition-transform active:scale-95"
            onClick={() => navigate("/brand-registration")}
          >
            Register Your Store Now
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-emerald-800 tracking-tight">
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
              <a href="#" className="hover:text-emerald-600 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-emerald-600 transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-emerald-600 transition">
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
