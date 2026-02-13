import React, { useEffect, useRef } from "react";
import { BadgeCheck, Scan, Gift, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const containerRef = useRef(null);

  const steps = [
    {
      id: "01",
      title: "Look for Logo",
      subtitle: "First Step",
      description:
        "Spot the Assured Rewards logo on any premium partner product.",
      icon: <BadgeCheck size={22} className="text-white" />,
      color: "#059669",
      glow: "rgba(129, 204, 42, 0.3)",
    },
    {
      id: "02",
      title: "Scratch & Scan",
      subtitle: "Second Step",
      description:
        "Gently scratch the hidden area and scan with our app securely.",
      icon: <Scan size={22} className="text-white" />,
      color: "#34d399",
      glow: "rgba(52, 211, 153, 0.3)",
    },
    {
      id: "03",
      title: "Get Rewards",
      subtitle: "Final Step",
      description:
        "Verify authentication and enjoy your vCash rewards instantly.",
      icon: <Gift size={22} className="text-white" />,
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.3)",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".how-step-icon", {
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.3,
          from: "start",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white dark:bg-zinc-900 rounded-[32px] p-6 lg:p-8 transition-all duration-500 overflow-hidden shadow-2xl shadow-black/3 dark:shadow-black/20"
      style={{ border: "1px solid rgba(0,0,0,0.05)" }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-primary/10">
            <Sparkles size={10} className="text-primary-strong" />
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-primary-strong uppercase">
            Simple Guide
          </span>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          How it Works?
        </h2>
      </div>

      <div className="relative space-y-4">
        <div className="absolute left-7 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-primary/20 z-0" />

        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="how-step-card relative z-10 group"
            style={{ opacity: 1, visibility: "visible" }}
          >
            <div
              className="flex items-start gap-5 p-5 rounded-3xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/4 transition-all duration-300"
              style={{ opacity: 1, visibility: "visible" }}
            >
              <div className="relative shrink-0">
                <div
                  className="how-step-icon w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}, ${idx === 2 ? "#047857" : "#5a9620"})`,
                    boxShadow: `0 8px 20px ${step.glow}`,
                  }}
                >
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 text-[10px] font-black flex items-center justify-center shadow-md border border-zinc-100 dark:border-zinc-800 z-20">
                  {step.id}
                </div>
              </div>

              <div className="flex-1 pt-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-primary-strong/80 mb-0.5">
                  {step.subtitle}
                </div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1.5 leading-tight">
                  {step.title}
                </h3>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
          Easy to earn <Sparkles size={12} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
