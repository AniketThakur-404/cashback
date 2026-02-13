import React, { useEffect, useMemo, useState } from "react";
import { X, Wallet, ArrowDownUp } from "lucide-react";
import { getAdminTransactionsFiltered } from "../../lib/api";

const formatAmount = (value) => {
  if (value === undefined || value === null) return "0.00";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const getStatusClasses = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["active", "success", "processed", "completed", "paid", "shipped"].includes(normalized)) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (["pending"].includes(normalized)) {
    return "text-amber-600 dark:text-amber-400";
  }
  if (["paused", "inactive"].includes(normalized)) {
    return "text-yellow-600 dark:text-yellow-400";
  }
  if (["rejected", "blocked", "failed", "expired"].includes(normalized)) {
    return "text-rose-600 dark:text-rose-400";
  }
  return "text-slate-500 dark:text-slate-400";
};

const UserWalletModal = ({ user, token, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id || !token) return;
      setLoading(true);
      setError("");
      try {
        const data = await getAdminTransactionsFiltered(token, {
          userId: user.id,
          limit: 50,
        });
        setTransactions(data?.transactions || []);
      } catch (err) {
        setError(err.message || "Unable to load wallet history.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user?.id, token]);

  const computedBalance = useMemo(() => {
    if (!transactions.length) return 0;
    return transactions.reduce((sum, tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === "credit") return sum + amount;
      if (tx.type === "debit") return sum - amount;
      return sum;
    }, 0);
  }, [transactions]);

  const walletBalance =
    user?.Wallet?.balance !== undefined && user?.Wallet?.balance !== null
      ? Number(user.Wallet.balance)
      : computedBalance;

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-[#0f0f11] border border-slate-200/60 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Wallet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.name || user.email || "Customer"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Wallet size={14} /> Current Balance
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                INR {formatAmount(walletBalance)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Wallet ID: {user?.Wallet?.id || "-"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ArrowDownUp size={14} /> Recent Activity
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {transactions.length} txns
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Last 50 transactions</div>
            </div>
          </div>

          {loading && <div className="text-sm text-slate-500">Loading wallet history...</div>}
          {error && <div className="text-sm text-rose-500">{error}</div>}

          {!loading && transactions.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-slate-200/70 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{tx.type}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {(tx.category || "-").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {tx.type === "debit" ? "-" : "+"}INR {formatAmount(tx.amount)}
                      </td>
                      <td className={`px-4 py-3 ${getStatusClasses(tx.status)}`}>{tx.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !transactions.length && !error && (
            <div className="text-sm text-slate-500">No wallet transactions found for this user.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWalletModal;
