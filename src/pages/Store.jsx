import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Gift, ShoppingBag, Sparkles, Wallet } from "lucide-react";
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

const ProductCard = ({
  item,
  isAuthenticated,
  walletBalance,
  isRedeeming,
  onRedeem,
}) => {
  const gradient = CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";
  const rawImage = item.image || item.imageUrl;
  const hasValidImage = rawImage && rawImage !== "null" && rawImage !== "undefined";
  const imageSrc = hasValidImage ? resolvePublicAssetUrl(rawImage) : "";
  const [imgError, setImgError] = useState(false);
  const amount = getItemAmount(item);
  const stockValue = Number(item?.stock);
  const isOutOfStock = Number.isFinite(stockValue) && stockValue <= 0;
  const hasEnoughBalance = amount > 0 && walletBalance >= amount;

  let actionLabel = "Redeem Now";
  let buttonStyle =
    "bg-primary hover:bg-primary-strong text-white shadow-lg shadow-primary/20";

  if (isRedeeming) {
    actionLabel = "Processing...";
    buttonStyle = "bg-primary/70 text-white cursor-wait";
  } else if (!isAuthenticated) {
    actionLabel = "Login to Redeem";
    buttonStyle =
      "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400";
  } else if (isOutOfStock) {
    actionLabel = "Out of Stock";
    buttonStyle =
      "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed";
  } else if (!hasEnoughBalance) {
    actionLabel = "Insufficient Balance";
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
    <article className="group flex flex-col h-full rounded-[24px] bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      <div className={`h-48 relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={item.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="text-white/20 w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
          {item.category || "General"}
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <div className="mb-2">
          {item.brand && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1">
              <Sparkles size={10} /> {item.brand}
            </p>
          )}
          <h3
            className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-12"
            title={item.name}
          >
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {item.description ||
              "Premium reward product exclusively available for our loyal members."}
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-slate-50 dark:border-white/5 pt-3 mt-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Required
            </p>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatPoints(amount)}
            </div>
          </div>

          {Number.isFinite(stockValue) && (
            <div
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
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
          className={`w-full mt-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${buttonStyle}`}
        >
          {actionLabel}
          {!disableRedeem && <ArrowRight size={16} />}
        </button>
      </div>
    </article>
  );
};

const Store = () => {
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
  const [redeemStatus, setRedeemStatus] = useState("");
  const [redeemError, setRedeemError] = useState("");

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

  const totalAmount = useMemo(
    () =>
      list.reduce((sum, item) => {
        const amount = getItemAmount(item);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0),
    [list],
  );

  const handleRedeemProduct = async (item) => {
    if (!isAuthenticated || !authToken) {
      setRedeemError("Sign in to redeem products.");
      setRedeemStatus("");
      return;
    }

    const productId = String(item?.id || "").trim();
    if (!productId) {
      setRedeemError("Product is unavailable.");
      setRedeemStatus("");
      return;
    }

    const amount = getItemAmount(item);
    if (amount <= 0) {
      setRedeemError("This product has invalid pricing.");
      setRedeemStatus("");
      return;
    }

    if (walletBalance < amount) {
      setRedeemError("Insufficient wallet balance.");
      setRedeemStatus("");
      return;
    }

    setRedeemingProductId(productId);
    setRedeemError("");
    setRedeemStatus("");
    try {
      const data = await redeemStoreProduct(authToken, productId);
      const nextBalance = Number(data?.wallet?.balance);
      setWalletBalance(Number.isFinite(nextBalance) ? nextBalance : 0);
      setRedeemStatus(data?.message || "Product redeemed successfully.");

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
              <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-bold text-primary">
                <Sparkles size={12} /> Rewards Exchange
              </p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Redeem Your Cashback
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                1 Point = INR 1
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-1.5 pr-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                  Your Balance
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAuthenticated
                    ? isWalletLoading
                      ? "..."
                      : formatPoints(walletBalance)
                    : "Sign in"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-3 py-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Category
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {activeCategory}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-3 py-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visible
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {activeItems.length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-3 py-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Required Pool
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {formatPoints(totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition duration-200 ${
                  activeCategory === category
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 bg-white/70 dark:bg-white/5"
                }`}
              >
                {category}
              </button>
            ))}
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
      {redeemStatus && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {redeemStatus}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
    </div>
  );
};

export default Store;
