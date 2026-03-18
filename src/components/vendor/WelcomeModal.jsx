import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  X,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export const WelcomeModal = ({
  isOpen,
  onClose,
  onCreateCampaign,
  brandName = "",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-[900px] min-h-[500px] bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* Left Side: Green Graphic Area */}
          <div
            className="hidden md:flex flex-col w-[35%] p-10 text-white relative shrink-0 justify-center items-center"
            style={{ backgroundColor: "#0f9d58" }}
          >
            <div className="flex flex-col items-center text-center space-y-6 max-w-xs">
              {/* Rocket Box Element */}
              <div className="w-[100px] h-[100px] rounded-[24px] border border-white/40 flex items-center justify-center mb-2 shadow-sm">
                <Rocket size={50} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[28px] font-bold leading-[1.15] tracking-tight">
                Welcome to Assured
                <br />
                Rewards!
              </h3>
              <p className="text-white/95 text-[16px] leading-relaxed font-normal">
                You're just a few clicks away
                <br />
                from launching your first
                <br />
                cashback campaign.
              </p>
            </div>
          </div>

          {/* Right Side: Content Area */}
          <div className="w-full md:w-[65%] p-10 md:p-12 relative bg-white flex flex-col justify-between">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <div className="pt-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f9f4] text-[#0f9d58] rounded-full text-[13px] font-medium mb-8">
                <Sparkles size={16} strokeWidth={2} />
                <span>Quick Start Guide</span>
              </div>

              {/* Title */}
              <h2 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">
                Let’s get your brand out there, {brandName || "Partner"}!
              </h2>

              {/* Description */}
              <p className="text-gray-500 text-[16px] mb-10 leading-[1.6] max-w-md">
                Grow your customer base and boost retention with interactive
                cashback campaigns. Here's how it works:
              </p>

              {/* List */}
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start gap-5">
                  <div className="w-[52px] h-[52px] rounded-[18px] bg-[#fff5eb] flex items-center justify-center shrink-0 border border-[#ffedd5]">
                    <Target
                      size={24}
                      className="text-[#f97316]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="pt-1 flex-1">
                    <h4 className="text-[17px] font-semibold text-gray-900 mb-1.5 leading-none">
                      Create a Campaign
                    </h4>
                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-sm">
                      Set your budget and reward criteria. Choose from digital
                      vouchers or printed scratch cards.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-5">
                  <div className="w-[52px] h-[52px] rounded-[18px] bg-[#eff6ff] flex items-center justify-center shrink-0 border border-[#dbeafe]">
                    <BarChart3
                      size={24}
                      className="text-[#3b82f6]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="pt-1 flex-1">
                    <h4 className="text-[17px] font-semibold text-gray-900 mb-1.5 leading-none">
                      Track Performance
                    </h4>
                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-sm">
                      Monitor scans, redemptions, and user engagement in
                      real-time from this dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-12 flex justify-end items-center gap-6">
              <button
                onClick={onClose}
                className="text-[#4b5563] hover:text-[#111827] font-medium text-[15px] px-2 py-2 transition-colors"
              >
                Explore First
              </button>
              <button
                onClick={() => {
                  onCreateCampaign();
                  // Note: onClose logic and localStorage is handled in the parent VendorDashboard
                }}
                className="bg-[#0f9d58] hover:bg-[#0c854a] text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] transition-colors flex items-center gap-2 shadow-[0_4px_14px_rgba(15,157,88,0.25)] hover:shadow-[0_6px_20px_rgba(15,157,88,0.3)]"
              >
                Create First Campaign
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
