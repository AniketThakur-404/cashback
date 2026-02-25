import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDashboard } from "../lib/api";
import {
  AUTH_TOKEN_KEY,
  clearAuthToken,
  popPostLoginRedirect,
  useAuth,
  storeAuthToken,
} from "../lib/auth";
import WalletAuth from "../components/wallet/WalletAuth";
import RedeemCard from "../components/wallet/RedeemCard";
import WithdrawCard from "../components/wallet/WithdrawCard";
import WalletActionModal from "../components/wallet/WalletActionModal";
import {
  ArrowUpRight,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";

// Helper to format currency
const formatAmount = (value) => {
  if (value === undefined || value === null) return "0.00";
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric.toFixed(2);
  return String(value);
};

const normalizeTxType = (value) => String(value || "").toUpperCase();

const Wallet = () => {
  const navigate = useNavigate();
  const { authToken: token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null); // 'withdraw' | 'redeem' | null

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    } else {
      setDashboard(null);
    }
  }, [token]);

  const loadDashboard = async (authToken) => {
    if (!authToken) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await getUserDashboard(authToken);
      setDashboard(data);
    } catch (err) {
      if (err.status === 401) {
        handleSignOut();
      }
      setError(err.message || "Unable to load wallet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (newToken) => {
    storeAuthToken(newToken);
    const redirectTarget = popPostLoginRedirect();
    if (redirectTarget) {
      navigate(redirectTarget);
    }
  };

  const handleSignOut = () => {
    clearAuthToken();
    setDashboard(null);
  };

  const handleActionSuccess = () => {
    loadDashboard(token);
    setActiveModal(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-4 flex items-center justify-center transition-colors duration-300">
        <WalletAuth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const balance = dashboard?.wallet?.balance || 0;
  const transactions = dashboard?.recentTransactions || [];
  const lastQrCredit = transactions.find(
    (tx) =>
      normalizeTxType(tx.type) === "CREDIT" &&
      String(tx.category || "").toLowerCase() === "cashback_payout",
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-32 transition-colors duration-300 font-admin-body">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            My Wallet
          </h1>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1. Main Wallet Card (Theme Primary) */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-primary shadow-xl shadow-primary/20 text-primary-foreground p-6 pb-4 min-h-[180px] flex flex-col justify-between">
          {/* Background Decor */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-sm font-medium text-white/90 mb-1 opacity-90">
              Cashback Wallet
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">
                Rs {formatAmount(balance)}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10 w-full sm:w-fit">
              <ShieldCheck size={16} className="text-white" />
              <span className="text-[11px] font-medium text-white/90">
                Powered by UPI & Net Banking - Secure transfers
              </span>
            </div>
          </div>
        </div>

        {/* Latest QR Credit */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
            Latest QR credit
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            Rs {formatAmount(lastQrCredit?.amount || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {lastQrCredit?.createdAt
              ? `Credited on ${new Date(lastQrCredit.createdAt).toLocaleDateString()}`
              : "No QR credits yet"}
          </div>
        </div>

        {/* 2. Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveModal("withdraw")}
            className="flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground py-5 px-4 rounded-2xl shadow-md hover:bg-primary-strong transition-colors active:scale-95 duration-200"
          >
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center mb-1">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">Transfer to Bank</span>
          </button>

          <button
            onClick={() => navigate("/gift-cards")}
            className="flex flex-col items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-800 text-white py-5 px-4 rounded-2xl shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors active:scale-95 duration-200"
          >
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center mb-1">
              <ShoppingBag size={18} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">Redeem in Store</span>
          </button>
        </div>

        {/* 3. Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                Recent Activity
              </h2>
            </div>
            <button className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>

          {isLoading && !transactions.length ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <span className="text-xs">No transactions yet</span>
            </div>
          ) : (
            <div className="space-y-5">
              {transactions.map((tx) => {
                const isCredit = normalizeTxType(tx.type) === "CREDIT";
                return (
                  <div key={tx.id} className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {tx.description ||
                          (isCredit ? "Cashback Received" : "Withdrawal")}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {/* Date formatting could be improved with date-fns if available, using basic JS for now */}
                        {new Date(tx.createdAt).toLocaleDateString() ===
                        new Date().toLocaleDateString()
                          ? "Today"
                          : "Yesterday"}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-bold ${isCredit ? "text-primary" : "text-gray-900 dark:text-white"}`}
                    >
                      {isCredit ? "+" : "-"} Rs{" "}
                      {Math.floor(Number(tx.amount || 0))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <WalletActionModal
          isOpen={activeModal === "withdraw"}
          onClose={() => setActiveModal(null)}
          title="Withdraw Funds"
        >
          <WithdrawCard
            token={token}
            balance={balance}
            onWithdrawSuccess={handleActionSuccess}
          />
        </WalletActionModal>

        <WalletActionModal
          isOpen={activeModal === "redeem"}
          onClose={() => setActiveModal(null)}
          title="Redeem Gift Card"
        >
          <RedeemCard token={token} onRedeemSuccess={handleActionSuccess} />
        </WalletActionModal>
      </div>
    </div>
  );
};

export default Wallet;
