import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicStoreData, getWalletSummary, redeemStoreProduct } from "../lib/api";
import { resolvePublicAssetUrl } from "../lib/apiClient";
import AuthImage from "../components/AuthImage";
import { Sparkles, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";

const CATEGORY_STYLES = {
  Popular: "from-emerald-600 to-teal-500",
  Shopping: "from-blue-600 to-indigo-500",
  Food: "from-amber-500 to-orange-500",
  Entertainment: "from-purple-600 to-pink-500",
  Travel: "from-sky-500 to-blue-600",
  Electronics: "from-zinc-600 to-slate-800",
  Fashion: "from-rose-500 to-red-600",
};

const POINTS_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const getItemAmount = (item) => {
  const amount = Number(item?.amount ?? item?.points);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const formatPoints = (value) => {
  const amount = Number(value);
  const normalized = Number.isFinite(amount) ? amount : 0;
  return `${POINTS_FORMATTER.format(normalized)} Points`;
};

const RedeemProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    let live = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getPublicStoreData();
        const found = (data?.products || []).find(p => p.id === id);
        if (!live) return;
        if (!found) {
          setError("Product not found");
        } else {
          setProduct(found);
        }
      } catch (err) {
        if (live) setError(err.message || "Failed to load product.");
      } finally {
        if (live) setIsLoading(false);
      }
    };
    loadData();
    return () => { live = false; };
  }, [id]);

  useEffect(() => {
    let live = true;
    const loadWallet = async () => {
      if (!isAuthenticated || !authToken) return;
      try {
        const data = await getWalletSummary(authToken);
        if (!live) return;
        const numericBalance = Number(data?.wallet?.balance);
        setWalletBalance(Number.isFinite(numericBalance) ? numericBalance : 0);
      } catch (err) {
        // ignore
      }
    };
    loadWallet();
    return () => { live = false; };
  }, [isAuthenticated, authToken]);

  const handleRedeem = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    try {
      setIsRedeeming(true);
      await redeemStoreProduct(authToken, product.id);
      navigate("/orders", { state: { success: true, product } });
    } catch (err) {
      alert(err.message || "Failed to redeem product.");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-black">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Product Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{error || "The product you're looking for doesn't exist."}</p>
        <button onClick={() => navigate("/store")} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
          Back to Store
        </button>
      </div>
    );
  }

  const rawImage = product.image || product.imageUrl;
  let parsedImages = product.images;
  if (typeof parsedImages === 'string') {
    try { parsedImages = JSON.parse(parsedImages); } catch (e) {}
  }
  
  let imageList = Array.isArray(parsedImages) && parsedImages.length > 0 
    ? parsedImages 
    : [];
    
  if (imageList.length === 0 && rawImage) {
    imageList = [rawImage];
  } else if (imageList.length > 0 && rawImage && !imageList.includes(rawImage)) {
    imageList = [rawImage, ...imageList];
  }
  
  imageList = imageList.filter(i => i && i !== "null" && i !== "undefined");
  const amount = getItemAmount(product);
  const stockValue = Number(product?.stock);
  const isOutOfStock = Number.isFinite(stockValue) && stockValue <= 0;
  const hasEnoughBalance = amount > 0 && walletBalance >= amount;
  const gradient = CATEGORY_STYLES[product.category] || "from-slate-700 to-slate-500";

  let actionLabel = "Redeem";
  let buttonStyle = "bg-primary hover:bg-primary-strong text-white shadow-xl shadow-primary/20";
  
  if (isRedeeming) {
    actionLabel = "Processing...";
    buttonStyle = "bg-primary/70 text-white cursor-wait";
  } else if (!isAuthenticated) {
    actionLabel = "Login to Redeem";
    buttonStyle = "bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 shadow-xl";
  } else if (isOutOfStock) {
    actionLabel = "Out of Stock";
    buttonStyle = "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed";
  } else if (!hasEnoughBalance) {
    actionLabel = "Low Balance";
    buttonStyle = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800/50";
  }

  const disableRedeem = isRedeeming || amount <= 0 || (isAuthenticated && (isOutOfStock || !hasEnoughBalance));

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-32 transition-colors duration-300">
      {/* Header section with gallery */}
      <div className="w-full relative group overflow-hidden bg-[#f4f7fb] dark:bg-[#0c0c0e] shadow-xs">
        {imageList.length > 0 ? (
          <>
            <div
              id="image-gallery"
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth h-96"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                if (width > 0) {
                  setActiveImageIdx(Math.round(scrollLeft / width));
                }
              }}
            >
              {imageList.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0 snap-center relative flex items-center justify-center">
                  <AuthImage 
                    src={resolvePublicAssetUrl(img)} 
                    alt={`${product.name} - ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
            {imageList.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const gallery = document.getElementById('image-gallery');
                    if (gallery) {
                      gallery.scrollBy({ left: -gallery.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="absolute top-1/2 left-4 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/5 hover:bg-black/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ArrowLeft size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const gallery = document.getElementById('image-gallery');
                    if (gallery) {
                      gallery.scrollBy({ left: gallery.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="absolute top-1/2 right-4 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/5 hover:bg-black/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-96 flex items-center justify-center relative">
            <ShoppingBag className="text-slate-300 dark:text-zinc-800 w-24 h-24" />
          </div>
        )}
        
        {/* Pagination dots */}
        {imageList.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 z-30">
            {imageList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const gallery = document.getElementById('image-gallery');
                  if (gallery) {
                    gallery.scrollTo({
                      left: idx * gallery.clientWidth,
                      behavior: 'smooth'
                    });
                    setActiveImageIdx(idx);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeImageIdx 
                    ? "bg-slate-800 dark:bg-white w-5 shadow-xs" 
                    : "bg-slate-400/40 dark:bg-white/30 w-2 hover:bg-slate-400/70"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Small drag handle at the bottom center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-slate-300/80 dark:bg-zinc-800" />
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-md mx-auto">
        {/* Title, Rating, Points */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-sm text-slate-400 line-through decoration-slate-300 dark:decoration-zinc-600">
                {POINTS_FORMATTER.format(Math.ceil(amount * 1.1))} Points
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                10% OFF
              </span>
            </div>
            <span className="text-2xl font-extrabold text-[#2563eb] dark:text-[#60a5fa] tracking-tight">
              {formatPoints(amount)}
            </span>
          </div>
        </div>


        {/* Specifications Table */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Specification</h3>
          <div className="rounded-2xl border border-slate-100 dark:border-zinc-850 overflow-hidden text-sm">
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
              <div className="px-4 py-3 text-slate-400 font-medium bg-slate-50/50 dark:bg-zinc-900/10">Model</div>
              <div className="px-4 py-3 col-span-2 text-slate-700 dark:text-slate-300 font-medium">{product.name}</div>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
              <div className="px-4 py-3 text-slate-400 font-medium bg-slate-50/50 dark:bg-zinc-900/10">Brand</div>
              <div className="px-4 py-3 col-span-2 text-slate-700 dark:text-slate-300 font-medium">{product.brand || "Apple"}</div>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
              <div className="px-4 py-3 text-slate-400 font-medium bg-slate-50/50 dark:bg-zinc-900/10">Category</div>
              <div className="px-4 py-3 col-span-2 text-slate-700 dark:text-slate-300 font-medium">{product.category || "Electronics"}</div>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
              <div className="px-4 py-3 text-slate-400 font-medium bg-slate-50/50 dark:bg-zinc-900/10">Required</div>
              <div className="px-4 py-3 col-span-2 text-slate-700 dark:text-slate-300 font-medium">{formatPoints(amount)}</div>
            </div>
            <div className="grid grid-cols-3 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
              <div className="px-4 py-3 text-slate-400 font-medium bg-slate-50/50 dark:bg-zinc-900/10">Stock status</div>
              <div className="px-4 py-3 col-span-2 text-slate-700 dark:text-slate-300 font-medium">
                {product.stock !== null ? `${product.stock} available` : "In stock"}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">About this reward</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            {product.description || "No description provided. This is a premium reward from our catalog."}
          </p>
        </div>

        {/* Wallet Balance display & Redeem button */}
        <div className="pb-8 pt-4 border-t border-slate-100 dark:border-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Your Balance
                </p>
                <p className={`text-base font-black ${hasEnoughBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {POINTS_FORMATTER.format(walletBalance)} Pts
                </p>
              </div>
              {Number.isFinite(stockValue) && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  stockValue > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                }`}>
                  {stockValue > 0 ? "IN STOCK" : "SOLD OUT"}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={disableRedeem}
              onClick={handleRedeem}
              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${buttonStyle}`}
            >
              {actionLabel}
              {(!disableRedeem && isAuthenticated) && <ArrowRight size={16} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemProductInfo;
