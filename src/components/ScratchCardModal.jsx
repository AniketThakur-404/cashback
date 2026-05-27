import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import AuthImage from "./AuthImage";

const ScratchCardModal = ({
  product,
  onClose,
  onScratchComplete,
  isProcessing,
  processingError,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedPercent, setRevealedPercent] = useState(0);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 320;
    canvas.height = rect.height || 320;

    // Draw Holographic Luxury Green Metallic Scratch Layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#a7f3d0");   // Light Emerald/Mint
    gradient.addColorStop(0.25, "#10b981"); // Vibrant Emerald
    gradient.addColorStop(0.5, "#059669");  // Mid Emerald
    gradient.addColorStop(0.75, "#34d399"); // Mint Green
    gradient.addColorStop(1, "#065f46");    // Deep Emerald Forest
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw premium sparkle dot overlay pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < canvas.width; i += 15) {
      for (let j = 0; j < canvas.height; j += 15) {
        ctx.beginPath();
        ctx.arc(i + 7.5, j + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add Sparkle icon placeholder in center
    ctx.font = "bold 17px sans-serif";
    ctx.fillStyle = "#064e3b"; // Deep forest green
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ SCRATCH TO REVEAL ✨", canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#065f46";
    ctx.fillText("Swipe or drag your finger here", canvas.width / 2, canvas.height / 2 + 15);
  }, []);

  // Handle Scratch logic
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    // Check if it's a touch event
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    // Mouse event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const draw = (e) => {
    if (!isDrawing || isScratched) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 24, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;
    
    // Step through pixels to calculate transparent area
    for (let i = 0; i < pixels.length; i += 4 * 16) {
      if (pixels[i + 3] === 0) {
        transparentCount++;
      }
    }
    
    const totalSampledPixels = pixels.length / (4 * 16);
    const percentage = (transparentCount / totalSampledPixels) * 100;
    
    setRevealedPercent(Math.min(Math.round(percentage * 2), 100));

    if (percentage > 35 && !isScratched) {
      setIsScratched(true);
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    // Beautiful Confetti burst!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
    });
    
    // Call the success callback
    setTimeout(() => {
      onScratchComplete();
    }, 1200);
  };

  const handleStart = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[35px] overflow-hidden shadow-2xl relative border border-slate-100 dark:border-white/10"
      >
        {/* Header */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="text-center mb-4 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
              <Gift size={11} strokeWidth={3} /> Redeem Reward
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-2.5">
              Redeem: {product.name}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
              Required: {product.amount || product.points} Points
            </p>
          </div>

          {/* Interactive Scratcher Wrapper */}
          <div
            ref={containerRef}
            className="relative w-72 h-72 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-950 shadow-inner border border-slate-200/50 dark:border-white/5 flex items-center justify-center select-none"
          >
            {/* The revealed content beneath */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-md mb-4 bg-white dark:bg-zinc-900 flex items-center justify-center">
                <AuthImage
                  src={product.image || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                REVEALED!
              </h4>
              <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 mt-1 max-w-[200px] truncate">
                {product.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Claims: {product.amount} Pts
              </p>
            </div>

            {/* Canvas Scratcher Overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleStart}
              onMouseMove={draw}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={draw}
              onTouchEnd={handleEnd}
              className={`absolute inset-0 w-full h-full cursor-crosshair touch-none transition-opacity duration-500 ${
                isScratched ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />

            {/* Premium processing spinner when saving */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white text-xs font-black uppercase tracking-widest">
                  Processing Order...
                </p>
              </div>
            )}
          </div>

          {/* Helper feedback text */}
          <div className="mt-4 w-full">
            {processingError ? (
              <div className="text-center text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-xl">
                {processingError}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScratchCardModal;
