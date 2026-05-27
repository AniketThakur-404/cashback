import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  ShoppingBag,
  Sparkles,
  Wallet,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPublicStoreData,
  getWalletSummary,
  redeemStoreProduct,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import { resolvePublicAssetUrl } from "../lib/apiClient";
import AuthImage from "../components/AuthImage";
import ScratchCardModal from "../components/ScratchCardModal";

const CATEGORY_STYLES = {
  Popular: "from-emerald-600 to-teal-500",
  Shopping: "from-blue-600 to-indigo-500",
  Food: "from-amber-500 to-orange-500",
  Travel: "from-cyan-500 to-sky-600",
  Entertainment: "from-fuchsia-500 to-pink-600",
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



const RedemptionSuccessModal = ({
  product,
  balance,
  onClose,
  onViewOrders,
}) => {
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 200,
              delay: 0.2,
            }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </motion.div>

          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            Order Placed!
          </h3>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 mb-6">
            Successfully Redeemed
          </p>

          <div className="w-full p-4 rounded-3xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm shrink-0">
              <ShoppingBag size={24} className="text-emerald-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                {product.name}
              </p>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">
                Balance: {balance.toFixed(2)} Pts
              </p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={onViewOrders}
              className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              View My Orders
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Keep Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CATEGORY_COLORS = {
  Popular: { bg: "bg-emerald-500", text: "text-white", circle: "bg-emerald-100 dark:bg-emerald-900/30" },
  Shopping: { bg: "bg-blue-500", text: "text-white", circle: "bg-blue-100 dark:bg-blue-900/30" },
  Food: { bg: "bg-amber-500", text: "text-white", circle: "bg-amber-100 dark:bg-amber-900/30" },
  Travel: { bg: "bg-cyan-500", text: "text-white", circle: "bg-cyan-100 dark:bg-cyan-900/30" },
  Entertainment: { bg: "bg-fuchsia-500", text: "text-white", circle: "bg-fuchsia-100 dark:bg-fuchsia-900/30" },
  Electronics: { bg: "bg-indigo-500", text: "text-white", circle: "bg-indigo-100 dark:bg-indigo-900/30" },
  Fashion: { bg: "bg-rose-500", text: "text-white", circle: "bg-rose-100 dark:bg-rose-900/30" },
};

const ProductCard = ({
  item,
  isAuthenticated,
  walletBalance,
  isRedeeming,
  onRedeem,
}) => {
  const navigate = useNavigate();

  const rawImage = item.image || item.imageUrl;
  const hasValidImage =
    rawImage && rawImage !== "null" && rawImage !== "undefined";
  const imageSrc = hasValidImage ? resolvePublicAssetUrl(rawImage) : "";
  const [imgError, setImgError] = useState(false);
  const amount = getItemAmount(item);
  const stockValue = Number(item?.stock);
  const isOutOfStock = Number.isFinite(stockValue) && stockValue <= 0;
  const hasEnoughBalance = amount > 0 && walletBalance >= amount;

  const catColors = CATEGORY_COLORS[item.category] || { bg: "bg-slate-500", text: "text-white", circle: "bg-slate-100 dark:bg-slate-800" };

  let actionLabel = "REDEEM";
  let buttonStyle =
    "bg-primary hover:bg-primary-strong text-white shadow-lg shadow-primary/20";

  if (isRedeeming) {
    actionLabel = "Processing...";
    buttonStyle = "bg-primary/70 text-white cursor-wait";
  } else if (!isAuthenticated) {
    actionLabel = "LOGIN";
    buttonStyle =
      "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300";
  } else if (isOutOfStock) {
    actionLabel = "OUT OF STOCK";
    buttonStyle =
      "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed";
  } else if (!hasEnoughBalance) {
    actionLabel = "LOW BALANCE";
    buttonStyle =
      "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-800/20";
  }

  const disableRedeem =
    isRedeeming ||
    amount <= 0 ||
    (isAuthenticated && (isOutOfStock || !hasEnoughBalance));

  return (
    <div 
      onClick={() => navigate(`/store/product/${item.id}`)}
      className="cursor-pointer flex flex-col h-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image Area — clean light background */}
      <div className="relative h-28 sm:h-40 bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center overflow-hidden">
        {/* Soft colored circle behind image — only when image exists */}
        {imageSrc && !imgError && (
          <div className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full ${catColors.circle} opacity-60`} />
        )}
        
        {imageSrc && !imgError ? (
          <AuthImage
            src={imageSrc}
            alt={item.name}
            className="relative z-10 h-[85%] w-[85%] object-contain drop-shadow-lg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <ShoppingBag className="text-slate-300 dark:text-zinc-600 w-10 h-10" />
          </div>
        )}

        {/* Category badge */}
        <div className={`absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full ${catColors.bg} ${catColors.text} text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
          {item.category || "General"}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 px-3.5 pt-3 pb-4 flex flex-col">
        <div className="mb-2">
          {item.brand && (
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
              <Sparkles size={10} strokeWidth={3} /> {item.brand}
            </p>
          )}
          <h3
            className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-normal">
            {item.description || "Premium reward for loyal members."}
          </p>
        </div>

        {/* Points & Stock */}
        <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-dashed border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
              Required
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-none">
              {formatPoints(amount)}
            </div>
          </div>

          {Number.isFinite(stockValue) && (
            <div
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stockValue > 0
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              }`}
            >
              {stockValue > 0 ? `${stockValue} LEFT` : "SOLD OUT"}
            </div>
          )}
        </div>

        {/* Redeem button */}
        <button
          type="button"
          disabled={disableRedeem}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              navigate("/signin");
            } else {
              onRedeem(item);
            }
          }}
          className={`w-full mt-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.96] ${buttonStyle}`}
        >
          {actionLabel}
          {(!disableRedeem && isAuthenticated) && <ArrowRight size={14} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

const Store = () => {
  const navigate = useNavigate();
  const { authToken, isAuthenticated } = useAuth();
  const [storeData, setStoreData] = useState({
    categories: [],
    products: [],
  });
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [redeemingProductId, setRedeemingProductId] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRedeemedProduct, setLastRedeemedProduct] = useState(null);
  const [scratchProduct, setScratchProduct] = useState(null);

  useEffect(() => {
    let live = true;

    const loadStoreData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const data = await getPublicStoreData();
        if (!live) return;
        setStoreData({
          categories: data?.categories || [],
          products: data?.products || [],
        });
      } catch (err) {
        if (!live) return;
        setLoadError(err.message || "Unable to load store data.");
      } finally {
        if (live) setIsLoading(false);
      }
    };

    loadStoreData();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;

    const loadWallet = async () => {
      if (!isAuthenticated || !authToken) {
        setWalletBalance(0);
        setWalletError("");
        setIsWalletLoading(false);
        return;
      }

      setIsWalletLoading(true);
      setWalletError("");
      try {
        const data = await getWalletSummary(authToken);
        if (!live) return;
        const numericBalance = Number(data?.wallet?.balance);
        setWalletBalance(Number.isFinite(numericBalance) ? numericBalance : 0);
      } catch (err) {
        if (!live) return;
        setWalletError(err.message || "Unable to load wallet balance.");
      } finally {
        if (live) setIsWalletLoading(false);
      }
    };

    loadWallet();
    return () => {
      live = false;
    };
  }, [authToken, isAuthenticated]);

  const categories = storeData.categories.length
    ? storeData.categories
    : ["Popular"];

  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory(categories[0]);
  }, [activeCategory, categories]);

  const list = storeData.products;

  const activeItems = useMemo(() => {
    if (activeCategory === "Popular") return list;
    return list.filter((item) => item.category === activeCategory);
  }, [activeCategory, list]);

  const handleRedeemProduct = (item) => {
    if (!isAuthenticated || !authToken) {
      setRedeemError("Login to redeem products.");
      return;
    }

    const productId = String(item?.id || "").trim();
    if (!productId) {
      setRedeemError("Product is unavailable.");
      return;
    }

    const amount = getItemAmount(item);
    if (amount <= 0) {
      setRedeemError("This product has invalid pricing.");
      return;
    }

    if (walletBalance < amount) {
      setRedeemError("Insufficient wallet balance.");
      return;
    }

    setRedeemError("");
    setScratchProduct(item);
  };

  const processRedemption = async (item) => {
    const productId = String(item?.id || "").trim();
    setRedeemingProductId(productId);
    setRedeemError("");
    try {
      const data = await redeemStoreProduct(authToken, productId);
      const nextBalance = Number(data?.wallet?.balance);
      setWalletBalance(Number.isFinite(nextBalance) ? nextBalance : 0);

      setLastRedeemedProduct(item);
      setShowSuccessModal(true);
      setScratchProduct(null); // Close modal on success

      setStoreData((prev) => ({
        ...prev,
        products: (prev.products || []).map((entry) => {
          if (entry?.id !== item?.id) return entry;
          const stockValue = Number(entry?.stock);
          if (Number.isFinite(stockValue) && stockValue > 0) {
            return { ...entry, stock: stockValue - 1 };
          }
          return entry;
        }),
      }));
    } catch (err) {
      setRedeemError(err.message || "Unable to redeem this product.");
    } finally {
      setRedeemingProductId("");
    }
  };

  return (
    <div className="px-4 py-5 pb-8">
      <div 
        className="relative overflow-hidden rounded-[30px] border border-slate-200/70 dark:border-white/10 p-5 pr-8 md:pr-12 shadow-lg bg-center"
        style={{ backgroundImage: 'url(/rewards-hero-bg.png)', backgroundSize: '112% 112%' }}
      >

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col items-start">
              <p className="inline-flex items-center gap-1 text-[14px] uppercase tracking-[0.18em] font-medium text-primary whitespace-nowrap">
                <Sparkles size={12} /> Rewards Exchange
              </p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Redeem Your<br /><span className="text-primary">Cashback</span>
              </h1>
              <p className="text-[16px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                1 Point = INR 1
              </p>
            </div>

            <div
              className={`flex items-center gap-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1.5 pr-4 shadow-sm shrink-0 ${!isAuthenticated ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
              style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => {
                if (!isAuthenticated) navigate("/signin");
              }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[14px] uppercase font-medium text-slate-400 dark:text-slate-500 tracking-wide whitespace-nowrap">
                  Your Balance
                </p>
                <p className="text-[16px] font-medium text-slate-900 dark:text-white whitespace-nowrap">
                  {isAuthenticated
                    ? isWalletLoading
                      ? "..."
                      : formatPoints(walletBalance)
                    : "Login"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {loadError}
        </div>
      )}
      {walletError && isAuthenticated && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {walletError}
        </div>
      )}
      {redeemError && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {redeemError}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-44 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : activeItems.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-8 text-center">
          <Gift size={24} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            No items available in this category yet.
          </p>
        </div>
      ) : (
        <div id="store-product-grid" className="mt-6 grid grid-cols-2 gap-3">
          {activeItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              isAuthenticated={isAuthenticated}
              walletBalance={walletBalance}
              isRedeeming={redeemingProductId === item.id}
              onRedeem={handleRedeemProduct}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSuccessModal && (
          <RedemptionSuccessModal
            product={lastRedeemedProduct}
            balance={walletBalance}
            onClose={() => setShowSuccessModal(false)}
            onViewOrders={() => navigate("/orders")}
          />
        )}
        {scratchProduct && (
          <ScratchCardModal
            product={scratchProduct}
            onClose={() => {
              setScratchProduct(null);
              setRedeemError("");
            }}
            onScratchComplete={() => processRedemption(scratchProduct)}
            isProcessing={redeemingProductId === scratchProduct.id}
            processingError={redeemError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
