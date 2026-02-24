import React, { useEffect } from "react";
import { ChevronLeft, Info, Heart, Award, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-24 md:pb-8 transition-colors duration-300 font-admin-body">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            About Us
          </h1>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary-strong p-6 shadow-lg shadow-primary/20 text-white">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
              <Info size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
            <p className="text-sm text-white/90 leading-relaxed">
              To empower consumers and brands by bridging the gap through trust,
              authentic products, and rewarding interactions.
            </p>
          </div>
          {/* Decorative */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
              <Heart size={20} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                Customer First
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We prioritize your experience above everything else, ensuring
                every interaction brings you value and joy.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                Trusted Authenticity
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Partnering exclusively with verified brands to protect you from
                counterfeits and guarantee quality.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <Award size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                Rewarding Loyalty
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your support matters. We consistently innovate to bring you the
                best cashback, points, and unique brand perks.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
            Version 1.0.0
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            © 2026 AssuredRewards. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
