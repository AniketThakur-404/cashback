import React, { useEffect, useRef } from "react";
import { BadgeCheck, ScanLine, Gift } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: BadgeCheck,
    label: "Look for Logo",
    sub: "Spot the Assured Rewards logo on any premium partner product.",
  },
  {
    icon: ScanLine,
    label: "Scratch & Scan",
    sub: "Gently scratch the hidden area and scan with our app securely.",
  },
  {
    icon: Gift,
    label: "Get Rewards",
    sub: "Verify authentication and enjoy your wallet rewards instantly.",
  },
];

// SVG dashed arrow pointing right
const DashedArrow = () => (
  <svg
    width="38"
    height="18"
    viewBox="0 0 38 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0 mx-1"
  >
    <path
      d="M2 9 Q10 9 18 9 Q26 9 34 9"
      stroke="#059669"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="3 4"
    />
    <path
      d="M30 4.5 L36 9 L30 13.5"
      stroke="#059669"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HowItWorks = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-step-card", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5"
      style={{
        boxShadow:
          "0 4px 24px -6px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Title */}
      <h2 className="text-center text-[17px] font-black text-zinc-900 dark:text-white tracking-tight mb-5">
        How{" "}
        <span
          style={{
            background: "linear-gradient(90deg,#059669,#0d9488)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Assured Rewards
        </span>{" "}
        Works?
      </h2>

      {/* Step row */}
      <div className="flex items-start justify-between gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;
          return (
            <React.Fragment key={i}>
              {/* Card */}
              <div className="hiw-step-card flex flex-col items-center gap-2.5 flex-1 min-w-0">
                {/* Icon box */}
                <div
                  className="w-[62px] h-[62px] rounded-[18px] flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(5,150,105,0.07)",
                    border: "1.5px solid rgba(5,150,105,0.15)",
                  }}
                >
                  <Icon size={26} style={{ color: "#059669" }} strokeWidth={1.7} />
                </div>

                {/* Label */}
                <div className="text-center px-1">
                  <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 leading-snug">
                    {step.label}
                  </p>
                  {step.sub && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
                      {step.sub}
                    </p>
                  )}
                </div>
              </div>

              {/* Dashed arrow between steps */}
              {!isLast && (
                <div className="flex items-center justify-center pt-[22px] shrink-0">
                  <DashedArrow />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorks;
