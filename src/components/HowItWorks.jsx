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
      subtitle: "STEP ONE",
      description:
        "Spot the Assured Rewards logo on any premium partner product.",
      icon: <BadgeCheck size={24} className="text-white" />,
      color: "from-emerald-500 to-emerald-700",
      glow: "rgba(16, 185, 129, 0.3)",
    },
    {
      id: "02",
      title: "Scratch & Scan",
      subtitle: "STEP TWO",
      description:
        "Gently scratch the hidden area and scan with our app securely.",
      icon: <Scan size={24} className="text-white" />,
      color: "from-teal-400 to-teal-600",
      glow: "rgba(20, 184, 166, 0.3)",
    },
    {
      id: "03",
      title: "Get Rewards",
      subtitle: "STEP THREE",
      description:
        "Verify authentication and enjoy your vCash rewards instantly.",
      icon: <Gift size={24} className="text-white" />,
      color: "from-green-500 to-emerald-800",
      glow: "rgba(5, 150, 105, 0.3)",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate line progress
      gsap.from(".timeline-line", {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top 80%",
          end: "bottom 80%",
          scrub: 1,
        },
      });

      // Animate steps
      gsap.from(".step-card", {
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top 85%",
        },
      });

      // Breathing icons
      gsap.to(".step-icon-inner", {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white dark:bg-zinc-900 rounded-[40px] p-8 lg:p-10 overflow-hidden shadow-2xl border border-black/5 dark:border-white/5"
    >
      {/* Background Ornaments */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="mb-12 relative z-10 text-left">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-primary/10">
            <Sparkles size={12} className="text-primary-strong animate-pulse" />
          </div>
          <span className="text-[11px] font-black tracking-[0.3em] text-primary-strong uppercase">
            User Guide
          </span>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          How Assured Rewards <br />{" "}
          <span className="text-primary">Works?</span>
        </h2>
      </div>

      {/* Timeline Container */}
      <div className="timeline-container relative pl-4 sm:pl-8 space-y-12">
        {/* The Animated Line */}
        <div className="absolute left-[44px] sm:left-[64px] top-[28px] bottom-[32px] w-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="timeline-line w-full h-full bg-gradient-to-b from-primary/80 to-primary-strong shadow-[0_0_15px_rgba(5,150,105,0.4)]" />
        </div>

        {steps.map((step, idx) => (
          <div
            key={idx}
            className="step-card relative flex items-start gap-6 sm:gap-10 group text-left"
          >
            {/* Step Icon Wrapper */}
            <div className="relative shrink-0 z-10">
              <div
                className={`step-icon-inner w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center relative bg-gradient-to-br ${step.color} shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                style={{
                  boxShadow: `0 10px 25px ${step.glow}`,
                }}
              >
                {step.icon}

                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-900 dark:text-white shadow-lg border border-zinc-100 dark:border-zinc-700">
                  {step.id}
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-6 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/10 mb-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {step.subtitle}
                </span>
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-[13px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Badge */}
      <div className="mt-8 flex flex-col items-center gap-4 relative z-10">
        <div className="h-[2px] w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-[12px] font-black text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 transition-all shadow-sm group cursor-default">
          Everything is secure{" "}
          <Sparkles
            size={14}
            className="text-primary-strong group-hover:animate-spin"
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
