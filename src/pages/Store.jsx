import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Box,
  Gift,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { getPublicStoreData, getWalletSummary, redeemStoreProduct } from "../lib/api";
import { useAuth } from "../lib/auth";
import { resolvePublicAssetUrl } from "../lib/apiClient";

const FALLBACK_TABS = [
  { id: "vouchers", label: "Vouchers" },
  { id: "products", label: "Products" },
];

const CATEGORY_STYLES = {
  Popular: "from-emerald-600 to-teal-500",
  Shopping: "from-blue-600 to-indigo-500",
  Food: "from-amber-500 to-orange-500",
  Travel: "from-cyan-500 to-sky-600",
  Entertainment: "from-fuchsia-500 to-pink-600",
};

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getItemAmount = (item) => {
  const amount = Number(item?.amount ?? item?.points);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const formatInr = (value) => {
  const amount = Number(value);
  const normalized = Number.isFinite(amount) ? amount : 0;
  return `INR ${INR_FORMATTER.format(normalized)}`;
};

const VoucherCard = ({ item }) => {
<<<<<<< HEAD
  const gradient =
    CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";
=======
  const gradient = CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";
  const amount = getItemAmount(item);
>>>>>>> 8dc8f5f198b1ad2c0e64210afaed64266a07181a

  return (
    <article className="group rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:shadow-xl transition-all duration-300">
      <div
        className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/75 font-semibold">
              Voucher
            </p>
            <h3 className="text-xl font-bold leading-tight mt-1 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-white/80 mt-1 truncate">
              {item.tagline || "Exclusive redemption partner"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <TicketPercent size={18} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Value</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {item.value || "INR 0"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatInr(amount)} required
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold transition-transform group-hover:scale-[1.03]"
        >
          Use Voucher <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
};

<<<<<<< HEAD
const ProductCard = ({ item }) => {
  const gradient =
    CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";
=======
const ProductCard = ({ item, isAuthenticated, walletBalance, isRedeeming, onRedeem }) => {
  const gradient = CATEGORY_STYLES[item.category] || "from-slate-700 to-slate-500";
  const imageSrc = resolvePublicAssetUrl(item.image || item.imageUrl || "");
  const amount = getItemAmount(item);
  const stockValue = Number(item?.stock);
  const isOutOfStock = Number.isFinite(stockValue) && stockValue <= 0;
  const hasEnoughBalance = amount > 0 && walletBalance >= amount;

  let actionLabel = "Redeem";
  if (isRedeeming) actionLabel = "Processing...";
  else if (!isAuthenticated) actionLabel = "Login to Redeem";
  else if (isOutOfStock) actionLabel = "Out of Stock";
  else if (!hasEnoughBalance) actionLabel = "Low Wallet";

  const disableRedeem =
    isRedeeming || !isAuthenticated || amount <= 0 || isOutOfStock || !hasEnoughBalance;
>>>>>>> 8dc8f5f198b1ad2c0e64210afaed64266a07181a

  return (
    <article className="group rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-[11px] text-white backdrop-blur-md">
          <Box size={13} />
          Product
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {item.name}
            </h3>
            {item.brand && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.brand}
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[2.5rem]">
              {item.description || "Premium reward product from our store."}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-600 dark:text-slate-200 shrink-0">
            <ShoppingBag size={16} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Required
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatInr(amount)}
            </p>
            {item.value && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.value}
              </p>
            )}
            {Number.isFinite(stockValue) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Stock: {stockValue}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={disableRedeem}
            onClick={() => onRedeem(item)}
            className="inline-flex items-center gap-1 rounded-full bg-primary hover:bg-primary-strong text-white px-4 py-2 text-xs font-semibold transition-transform group-hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLabel} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};

const Store = () => {
  const { authToken, isAuthenticated } = useAuth();
  const [storeData, setStoreData] = useState({
    tabs: [],
    categories: [],
    vouchers: [],
    products: [],
  });
  const [activeTab, setActiveTab] = useState("vouchers");
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
          tabs: data?.tabs || [],
          categories: data?.categories || [],
          vouchers: data?.vouchers || [],
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

  const tabs = storeData.tabs.length ? storeData.tabs : FALLBACK_TABS;
  const categories = storeData.categories.length
    ? storeData.categories
    : ["Popular"];

  useEffect(() => {
    const isValid = tabs.some((tab) => tab.id === activeTab);
    if (!isValid && tabs.length) setActiveTab(tabs[0].id);
  }, [activeTab, tabs]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory(categories[0]);
  }, [activeCategory, categories]);

  const list =
    activeTab === "products" ? storeData.products : storeData.vouchers;

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-primary">
                <Sparkles size={12} /> Rewards Exchange
              </p>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
                Vouchers and products worth your cashback
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                Redeem instantly from curated partners and trending products.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <BadgeDollarSign size={15} className="text-primary" />
              {list.length} options
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-3 py-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mode
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-1">
                {activeTab}
              </p>
            </div>
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
<<<<<<< HEAD
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Points pool
              </p>
=======
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Required Pool</p>
>>>>>>> 8dc8f5f198b1ad2c0e64210afaed64266a07181a
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {formatInr(totalAmount)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-3 py-3 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                <Wallet size={12} />
                Wallet
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {isAuthenticated
                  ? isWalletLoading
                    ? "Loading..."
                    : formatInr(walletBalance)
                  : "Sign in"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-1 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl text-sm font-semibold transition-all duration-200 py-2.5 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/35"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
          {activeItems.map((item) =>
            activeTab === "vouchers" ? (
              <VoucherCard key={item.id} item={item} />
            ) : (
              <ProductCard
                key={item.id}
                item={item}
                isAuthenticated={isAuthenticated}
                walletBalance={walletBalance}
                isRedeeming={redeemingProductId === item.id}
                onRedeem={handleRedeemProduct}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Store;
