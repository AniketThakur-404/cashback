import React from "react";
import { Gift, Sparkles, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const GiftCards = () => {
  return (
    <div className="bg-primary/5 dark:bg-zinc-950 min-h-full flex flex-col items-center justify-center px-6 py-20 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-primary/20 relative z-10">
            <Gift size={48} className="text-primary animate-pulse" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-primary/30 rounded-full pointer-events-none"
          />
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Store Coming Soon
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10">
          The <span className="text-primary font-bold">Rewards Store</span> is
          under development. New vouchers and product redemptions are launching
          soon.
        </p>

        <div className="flex items-center gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/70 dark:border-zinc-800 shadow-sm">
          <Rocket size={20} className="text-primary" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Launching Soon
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftCards;
