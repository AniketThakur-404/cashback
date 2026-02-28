import React, { useEffect, useRef } from "react";
import { ScanLine, Gift, QrCode } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: QrCode,
    label: "Look for QR",
    sub: "Spot Assured Rewards QR on partner products.",
  },
  {
    icon: ScanLine,
    label: "Scratch & Scan",
    sub: "Gently scratch the hidden area and scan.",
  },
  {
    icon: Gift,
    label: "Get Rewards",
    sub: "Verify instantly and earn wallet rewards.",
  },
];

const HowItWorks = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-step-item", {
        x: -15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">
          How It Works
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
      </div>

      <div className="relative pl-3">
        {/* Connecting Line */}
        <div className="absolute top-4 bottom-4 left-[23px] w-px border-l-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 z-0"></div>

        <div className="space-y-4 relative z-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="hiw-step-item flex items-start gap-4">
                <div className="w-[22px] h-[22px] rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-white dark:border-zinc-900 flex items-center justify-center shrink-0 mt-0.5 relative z-10 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex-1 border border-zinc-100 dark:border-zinc-800 transition-colors hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                      {step.label}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                      {step.sub}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
