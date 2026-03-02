import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  ShoppingBag,
  Sparkles,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPublicStoreData,
  getWalletSummary,
  redeemStoreProduct,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import { resolvePublicAssetUrl } from "../lib/apiClient";

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

const ProductCard = ({
  item,
  isAuthenticated,
  walletBalance,
  isRedeeming,
  onRedeem,
}) => {
  const gradient =
    CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";

  const rawImage = item.image || item.imageUrl;
  const hasValidImage =
    rawImage && rawImage !== "null" && rawImage !== "undefined";
  const imageSrc = hasValidImage ? resolvePublicAssetUrl(rawImage) : "";
  const [imgError, setImgError] = useState(false);
  const amount = getItemAmount(item);
  const stockValue = Number(item?.stock);
  const isOutOfStock = Number.isFinite(stockValue) && stockValue <= 0;
  const hasEnoughBalance = amount > 0 && walletBalance >= amount;

  let actionLabel = "Redeem";
  let buttonStyle =
    "bg-primary hover:bg-primary-strong text-white shadow-lg shadow-primary/20";

  if (isRedeeming) {
    actionLabel = "Processing...";
    buttonStyle = "bg-primary/70 text-white cursor-wait";
  } else if (!isAuthenticated) {
    actionLabel = "Login";
    buttonStyle =
      "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400";
  } else if (isOutOfStock) {
    actionLabel = "Out of Stock";
    buttonStyle =
      "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed";
  } else if (!hasEnoughBalance) {
    actionLabel = "Low Balance";
    buttonStyle =
      "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-800/20";
  }

  const disableRedeem =
    isRedeeming ||
    !isAuthenticated ||
    amount <= 0 ||
    isOutOfStock ||
    !hasEnoughBalance;

  return (
    <article className="group flex flex-col h-full rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300">
      <div
        className={`h-28 sm:h-40 relative overflow-hidden bg-linear-to-br ${gradient}`}
      >
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={item.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="text-white/20 w-10 h-10 sm:w-14 sm:h-14" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-md border border-white/10 text-[12px] font-medium text-white uppercase tracking-wider shadow-sm">
          {item.category || "General"}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="mb-2">
          {item.brand && (
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <Sparkles size={10} strokeWidth={3} /> {item.brand}
            </p>
          )}
          <h3
            className="text-[18px] font-black text-slate-900 dark:text-white leading-tight line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-normal">
            {item.description || "Premium reward for loyal members."}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
              Required
            </span>
            <div className="text-[15px] font-black text-slate-900 dark:text-white leading-none">
              {formatPoints(amount)}
            </div>
          </div>

          {Number.isFinite(stockValue) && (
            <div
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${
                stockValue < 5
                  ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400"
                  : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400"
              }`}
            >
              {stockValue > 0 ? `${stockValue} LEFT` : "SOLD OUT"}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disableRedeem}
          onClick={() => onRedeem(item)}
          className={`w-full mt-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.96] shadow-md ${buttonStyle}`}
        >
          {actionLabel}
          {!disableRedeem && <ArrowRight size={14} strokeWidth={3} />}
        </button>
      </div>
    </article>
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

  const handleRedeemProduct = async (item) => {
    if (!isAuthenticated || !authToken) {
      setRedeemError("Sign in to redeem products.");
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

    setRedeemingProductId(productId);
    setRedeemError("");
    try {
      const data = await redeemStoreProduct(authToken, productId);
      const nextBalance = Number(data?.wallet?.balance);
      setWalletBalance(Number.isFinite(nextBalance) ? nextBalance : 0);

      setLastRedeemedProduct(item);
      setShowSuccessModal(true);

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
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-lg">
        <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1 text-[14px] uppercase tracking-[0.18em] font-medium text-primary">
                <Sparkles size={12} /> Rewards Exchange
              </p>
              <h1 className="text-2xl font-medium text-slate-900 dark:text-white mt-1">
                Redeem Your Cashback
              </h1>
              <p className="text-[16px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                1 Point = INR 1
              </p>
            </div>

            <div
              className={`flex items-center gap-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1.5 pr-4 shadow-sm ${!isAuthenticated ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
              onClick={() => {
                if (!isAuthenticated) navigate("/profile");
              }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[14px] uppercase font-medium text-slate-400 dark:text-slate-500 tracking-wide">
                  Your Balance
                </p>
                <p className="text-[16px] font-medium text-slate-900 dark:text-white">
                  {isAuthenticated
                    ? isWalletLoading
                      ? "..."
                      : formatPoints(walletBalance)
                    : "Sign in"}
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
        <div className="mt-6 grid grid-cols-2 gap-3">
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
      </AnimatePresence>
    </div>
  );
};

export default Store;
