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
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-32">
      {/* Header section with gallery */}
      <div className={`w-full relative group ${gradient}`}>
        <button 
          onClick={() => navigate("/store")} 
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        {imageList.length > 0 ? (
          <>
            <div id="image-gallery" className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth">
              {imageList.map((img, idx) => (
                <div key={idx} className="w-full h-72 shrink-0 snap-center relative">
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
                  className="absolute top-1/2 left-4 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:bg-black/60 transition-colors shadow-lg"
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
                  className="absolute top-1/2 right-4 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:bg-black/60 transition-colors shadow-lg"
                >
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-72 flex items-center justify-center relative">
            <ShoppingBag className="text-white/20 w-20 h-20" />
          </div>
        )}
        
        {/* Pagination dots if multiple images */}
        {imageList.length > 1 && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-1.5 z-10">
            {imageList.map((_, idx) => (
              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50" />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
          <div className="px-2.5 py-0.5 rounded bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest inline-block mb-3 shadow-sm">
            {product.category || "General"}
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1.5 drop-shadow-sm">
              <Sparkles size={14} strokeWidth={3} /> {product.brand}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-slate-200/60 dark:border-white/5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">About this reward</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              {product.description || "No description provided. This is a premium reward from our catalog."}
            </p>
          </section>
        </div>

        <div className="pb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/60 dark:border-white/5 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-linear-to-br ${gradient} rounded-full blur-3xl opacity-10 dark:opacity-20`} />
            
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                    Required Points
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatPoints(amount).replace(' Points', '')}
                    </span>
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500">Pts</span>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Your Balance
                    </p>
                    <p className={`text-base font-black ${hasEnoughBalance ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {POINTS_FORMATTER.format(walletBalance)} Pts
                    </p>
                  </div>
                )}
              </div>

              {Number.isFinite(stockValue) && (
                <div className={`mb-8 px-4 py-3.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 ${
                    stockValue < 5
                      ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400"
                      : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400"
                  }`}>
                  <div className="relative flex h-2 w-2">
                    {stockValue > 0 && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stockValue < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${stockValue > 0 ? (stockValue < 5 ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-400'}`}></span>
                  </div>
                  {stockValue > 0 ? `${stockValue} AVAILABLE IN STOCK` : "SOLD OUT"}
                </div>
              )}
              
              <button
                type="button"
                disabled={disableRedeem}
                onClick={handleRedeem}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${buttonStyle}`}
              >
                {actionLabel}
                {(!disableRedeem && isAuthenticated) && <ArrowRight size={18} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemProductInfo;
