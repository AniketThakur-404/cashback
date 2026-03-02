import React, { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  Package,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getTransactionHistory } from "../lib/api";
import { useAuth } from "../lib/auth";

const formatAmount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const timeline = [
    { status: "Order Placed", date: order.createdAt, done: true, icon: Clock },
    { status: "Processing", date: order.createdAt, done: true, icon: Package },
    {
      status: "Confirmed",
      date: order.createdAt,
      done: true,
      icon: ShieldCheck,
    },
    {
      status: "Success",
      date: order.createdAt,
      done: true,
      icon: CheckCircle2,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800" />
        </div>

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                Order Successful
              </h3>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                Reference: #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 rounded-3xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm shrink-0">
                <ShoppingBag size={20} className="text-emerald-600" />
              </div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                {order.description.replace(/Store redeem: /i, "")}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-black text-emerald-600">
                -{formatAmount(order.amount)}
              </div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Points
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6 px-2">
            {timeline.map((step, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== timeline.length - 1 && (
                  <div className="absolute left-3 top-7 bottom-0 w-[2px] bg-emerald-100 dark:bg-emerald-900/30" />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-10 ${step.done ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}`}
                >
                  <step.icon size={12} />
                </div>
                <div className="flex-1 pb-4">
                  <p
                    className={`text-sm font-black leading-none ${step.done ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
                  >
                    {step.status}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(step.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const txData = await getTransactionHistory(
        { page: 1, limit: 100 },
        authToken,
      );
      const allTx = Array.isArray(txData?.transactions)
        ? txData.transactions
        : [];
      const storeOrders = allTx.filter((tx) =>
        tx.description?.toLowerCase().includes("store redeem"),
      );
      setOrders(storeOrders);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (!authToken) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-zinc-950 p-4 transition-colors">
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sign in to view orders
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
            Your store redemptions are available after login.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-transparent p-4 pb-24 transition-colors duration-300">
      <div className="max-w-md mx-auto space-y-6">
        {/* Banner Section */}
        <div className="relative overflow-hidden p-6 rounded-[32px] bg-zinc-900 text-white shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-black italic">My Orders</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
              Store Redemptions
            </p>
          </div>
          <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-20 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-600 animate-spin" />
            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
              Fetching Orders
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-12 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[24px] bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-zinc-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-none">
              No orders yet
            </h2>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-8 max-w-[200px] uppercase tracking-wider leading-relaxed">
              Start redeeming your rewards to see them listed here.
            </p>
            <button
              onClick={() => navigate("/store")}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
            >
              Go to Store
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((tx) => (
              <motion.div
                key={tx.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOrder(tx)}
                className="group p-5 rounded-[24px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-[15px] font-black text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                    {tx.description.replace(/Store redeem: /i, "")}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Success
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                      {formatDate(tx.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right whitespace-nowrap">
                    <div className="text-[15px] font-black text-rose-600 leading-none">
                      -{formatAmount(tx.amount)}
                    </div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      Points
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
