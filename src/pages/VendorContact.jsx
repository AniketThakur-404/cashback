import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Store,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Headphones,
  ArrowUpRight,
  ChevronRight,
  QrCode,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import VendorNavbar from "../components/VendorNavbar";
import { useSEO } from "../hooks/useSEO";
import { useToast } from "../components/ui/ToastContext";

const VendorContact = () => {
  useSEO(
    "Vendor Support & Partner Contact | Assured Rewards Merchant Desk",
    "Contact the Assured Rewards merchant support team. Get direct help with store registration, QR cashback campaigns, settlement inquiries, POS stands, and enterprise retail partnerships."
  );

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    storeCategory: "Retail & General Store",
    outletCount: "1 Store",
    inquiryType: "Onboarding & Registration",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const APP_NAME = "Assured Rewards";
  const SUPPORT_PHONE = "+91 83689 26325";
  const SUPPORT_EMAIL = "vendor.support@assuredrewards.in";
  const PARTNERSHIP_EMAIL = "partnerships@assuredrewards.in";
  const OFFICE_ADDRESS =
    "D-6/1, Pocket D, Okhla Phase II, Okhla Industrial Estate, New Delhi, Delhi 110020";
  const MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=D-6%2F1+Pocket+D+Okhla+Phase+II+Okhla+Industrial+Estate+New+Delhi+Delhi+110020";

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    success("Copied to Clipboard", `${fieldName} has been copied.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toastError("Validation Error", "Please provide your Store / Business Name.");
      return;
    }
    if (!formData.contactPerson.trim()) {
      toastError("Validation Error", "Please provide your Contact Person Name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toastError("Validation Error", "Please provide a valid Business Email Address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      toastError("Validation Error", "Please provide a valid Phone / WhatsApp Number.");
      return;
    }
    if (!formData.message.trim()) {
      toastError("Validation Error", "Please describe your inquiry or requirements.");
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable dispatch & generate merchant ticket ID
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketNum = `AR-VEN-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        ticketId: ticketNum,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        submittedAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      success(
        "Inquiry Received!",
        `Your merchant support request #${ticketNum} has been logged. Our partner manager will contact you shortly.`
      );
    }, 1200);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      storeCategory: "Retail & General Store",
      outletCount: "1 Store",
      inquiryType: "Onboarding & Registration",
      message: "",
    });
  };

  const quickFaqs = [
    {
      q: "How fast can my store launch its first cashback campaign?",
      a: "Instant! Once registered, you can create a campaign in under 2 minutes from your dashboard, print or display your unique QR standee, and start rewarding walk-in customers immediately.",
    },
    {
      q: "How do I request official physical QR standees for our billing counters?",
      a: "You can select 'Physical QR Standee & Marketing Kit' in the contact form or contact your assigned partner manager. We ship high-grade acrylic counter standees and promotional stickers directly to your store.",
    },
    {
      q: "How do customer redemptions and wallet settlements work?",
      a: "Customer cashbacks and vendor campaign wallets are reconciled seamlessly. You maintain full visibility of every scan, repeat visit metric, and financial settlement in real-time from your vendor portal.",
    },
    {
      q: "Can I manage multiple branch outlets under a single brand account?",
      a: "Yes. Our enterprise multi-store system allows centralized campaign controls with branch-level QR assignment and separate or aggregated analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <VendorNavbar />

      {/* Hero Header Section */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 left-10 w-96 h-96 bg-teal-100/50 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.4] mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-black uppercase tracking-[0.2em] shadow-xs"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Merchant Support & Partner Desk</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]"
            >
              Let's Scale Your Store's <br className="hidden sm:inline" />
              <span className="text-emerald-600">Customer Loyalty</span> Together.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Whether you need assistance with campaign setup, counter standees,
              payout settlements, or multi-outlet retail integrations — our dedicated
              partner success team is standing by.
            </motion.p>

            {/* SLA Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-slate-600"
            >
              <div className="flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Response SLA: Under 2 Hours</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>500+ Active Retail Partners</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>7 Days / Week POS Hotline</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 relative z-20 pb-20">
        {/* Contact Channel Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Card 1: Phone */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Direct Merchant Hotline
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-1">
                {SUPPORT_PHONE}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mon - Sat: 9:00 AM – 7:00 PM IST for quick phone & WhatsApp support.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
              >
                <span>Call Now</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(SUPPORT_PHONE, "Phone Number")}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title="Copy phone"
              >
                {copiedField === "Phone Number" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Merchant Support Email */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Partner Support Queue
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1 mb-1 truncate" title={SUPPORT_EMAIL}>
                {SUPPORT_EMAIL}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                For campaign help, payout queries & store account management.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Vendor%20Support%20Request`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
              >
                <span>Send Email</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(SUPPORT_EMAIL, "Support Email")}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title="Copy email"
              >
                {copiedField === "Support Email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Partnerships / Enterprise */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col justify-between hover:border-purple-300 hover:shadow-lg transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Retail Chains & Enterprise
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1 mb-1 truncate" title={PARTNERSHIP_EMAIL}>
                {PARTNERSHIP_EMAIL}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Custom co-marketing, multi-store brands & POS API integrations.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${PARTNERSHIP_EMAIL}?subject=Enterprise%20Merchant%20Partnership`}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5"
              >
                <span>Partner With Us</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(PARTNERSHIP_EMAIL, "Partnership Email")}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title="Copy email"
              >
                {copiedField === "Partnership Email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Card 4: Office Hub */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col justify-between hover:border-amber-300 hover:shadow-lg transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Merchant Operations Hub
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 mb-1 line-clamp-2">
                Okhla Phase II, New Delhi
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                D-6/1, Pocket D, Okhla Industrial Estate, Delhi 110020
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1.5"
              >
                <span>View On Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(OFFICE_ADDRESS, "Office Address")}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title="Copy address"
              >
                {copiedField === "Office Address" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form + Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form / Submitted State (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50">
            <AnimatePresence mode="wait">
              {submittedTicket ? (
                /* Success Screen */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Inquiry Logged Successfully
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                      Thank You, {submittedTicket.businessName}!
                    </h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Your request has been routed to our merchant operations desk.
                      A dedicated partner manager will contact you within 2 business hours.
                    </p>
                  </div>

                  {/* Ticket Receipt Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-400 font-sans font-bold uppercase tracking-wider text-[10px]">
                        Reference Ticket ID
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        {submittedTicket.ticketId}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-sans">
                      <span className="text-slate-400">Store / Business:</span>
                      <span className="font-semibold text-slate-800">
                        {submittedTicket.businessName}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-sans">
                      <span className="text-slate-400">Inquiry Type:</span>
                      <span className="font-semibold text-slate-800">
                        {submittedTicket.inquiryType}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-sans">
                      <span className="text-slate-400">Submitted At:</span>
                      <span className="text-slate-700">{submittedTicket.submittedAt}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/vendor-dashboard")}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      Open Vendor Dashboard
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Contact Form */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Send Merchant Message</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      How Can We Support Your Business?
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Fill in the details below and we will get back to you with personalized assistance.
                    </p>
                  </div>

                  {/* Business & Person Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Store / Business Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          placeholder="e.g. Blue Heavens Cafe / Style Hub"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Contact Person Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Business Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="owner@yourbrand.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Outlets Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Store Industry / Category
                      </label>
                      <select
                        name="storeCategory"
                        value={formData.storeCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option>Retail & General Store</option>
                        <option>Cafe / Restaurant / Food & Beverages</option>
                        <option>Fashion, Apparel & Footwear</option>
                        <option>Electronics & Mobile Accessories</option>
                        <option>Salon, Spa & Beauty Wellness</option>
                        <option>Grocery & Supermarket</option>
                        <option>Pharmacy & Healthcare</option>
                        <option>Fitness & Gym</option>
                        <option>Other Category</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Number of Outlets / Stores
                      </label>
                      <select
                        name="outletCount"
                        value={formData.outletCount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option>1 Store (Single Outlet)</option>
                        <option>2 - 5 Outlets</option>
                        <option>6 - 20 Outlets</option>
                        <option>20+ Outlets (Large Chain / Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  {/* Inquiry Nature */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nature of Inquiry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option>Onboarding & Store Registration Help</option>
                      <option>Campaign Configuration & Reward Rules</option>
                      <option>Physical QR Standees & Marketing Kit Request</option>
                      <option>Settlements, Invoicing & Wallet Payouts</option>
                      <option>POS Scanner & Technical Support</option>
                      <option>Multi-Outlet Franchise / Enterprise Partnership</option>
                      <option>General Feedback / Other Inquiry</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Describe Your Requirement or Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please share details about your query, campaign goals, or any issues you are facing..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                      required
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 group cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Logging Merchant Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry to Merchant Desk</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Quick Self-Serve & Office Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-7 shadow-xl shadow-slate-900/10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight font-admin-heading">
                    Instant Self-Serve Portals
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Fast track your access without waiting
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/brand-registration")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">
                        New Store? Register Now
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Takes less than 2 minutes to create account
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/vendor-dashboard")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-sm font-bold text-white">
                        Active Merchant Dashboard
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Manage campaigns, download QR, view payouts
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/vendor/faqs")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-sm font-bold text-white">
                        Vendor Knowledge & FAQs
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Common questions, campaign guides & tutorials
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Merchant Help Highlights */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Common Merchant Inquiries</span>
              </div>

              <div className="space-y-3.5">
                {quickFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <h4 className="text-xs font-bold text-slate-800">
                      {faq.q}
                    </h4>
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/vendor/faqs"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>Explore all Vendor FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">
                    Business Support Hours
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Fast response during store operation windows
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monday – Saturday:</span>
                  <span className="font-bold text-slate-800">9:00 AM – 7:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sunday & Holidays:</span>
                  <span className="font-bold text-slate-800">Email & POS Scan Hotline Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-12 border-b border-slate-200/50">
            <div className="space-y-4 text-center md:text-left">
              <div className="text-3xl font-black text-slate-900 tracking-tighter font-admin-heading">
                Assured<span className="text-emerald-600">Rewards</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Powering the next generation of loyalty.
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10 text-[11px] font-black uppercase tracking-widest text-slate-500">
              {[
                { label: "Login", path: "/vendor-dashboard" },
                { label: "Privacy Policy", path: "/vendor/privacy" },
                { label: "Terms of Service", path: "/vendor/terms" },
                { label: "FAQs", path: "/vendor/faqs" },
                { label: "Contact", path: "/vendor/contact" },
              ].map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className={`transition-colors cursor-pointer ${
                    link.path === "/vendor/contact"
                      ? "text-emerald-600 font-extrabold"
                      : "hover:text-emerald-600"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
              © 2026 {APP_NAME}. Built for scale.
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              Secure • Reliable • Seamless
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorContact;
