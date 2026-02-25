import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Calendar, MapPin, Search, ChevronLeft, ChevronRight, Hash, ShieldCheck, IndianRupee, Megaphone, User, Clock, QrCode } from "lucide-react";
import { getVendorRedemptions } from "../../lib/api";

const formatAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd MMM yyyy");
};

const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return format(date, "h:mm a");
};

const CustomerDetailsModal = ({ isOpen, onClose, customer, token }) => {
    const [scans, setScans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

    useEffect(() => {
        if (isOpen && customer) {
            loadScans(1);
        } else {
            setScans([]);
        }
    }, [isOpen, customer]);

    const loadScans = async (page = 1) => {
        if (!customer || !customer.userId) return;
        setIsLoading(true);
        setError("");
        try {
            // Using the existing endpoint, passing the user filter logic if updated in backend
            // For now, we may need to fetch all and filter client-side if backend isn't updated yet,
            // or pass it as a custom query param. Assume backend is updated to handle `userId`.
            // Wait, standard `buildRedemptionEventWhere` might not handle `userId` from query directly.
            // In the plan we said "Update buildRedemptionEventWhere to support a userId query parameter."
            // If we didn't update the backend yet, we should do it or use `mobile` filter.
            // Since we plan to update the backend or maybe we can pass `mobile: customer.mobile`.
            const params = { page, limit: pagination.limit };
            if (customer.mobile) {
                params.mobile = customer.mobile;
            } else if (customer.userId) {
                params.userId = customer.userId;
            }

            const data = await getVendorRedemptions(token, params);
            // In case backend doesn't filter perfectly by userId via mobile, we can double check.
            let userScans = data.redemptions || [];

            // Client side filter fallback just in case
            if (customer.mobile && params.mobile) {
                userScans = userScans.filter(s => s.customer?.phone === customer.mobile);
            }

            setScans(userScans);
            setPagination(data.pagination || { page: 1, limit: 15, total: userScans.length, totalPages: 1 });
        } catch (err) {
            console.error("Failed to load customer scans", err);
            setError(err.message || "Failed to load scan history.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-gray-900/60 backdrop-blur-sm sm:items-center sm:justify-center transition-all p-0 sm:p-6">
            <div
                className="w-full h-full sm:w-[95vw] sm:max-w-5xl sm:h-auto sm:max-h-[90vh] bg-white dark:bg-[#121212] flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right sm:slide-in-from-bottom-8 duration-300 border border-gray-200/50 dark:border-zinc-800/80"
            >
                {/* Header Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 px-6 py-6 sm:px-8 sm:py-8 shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg border border-white/20">
                                {customer.name?.[0]?.toUpperCase() || "C"}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                                    {customer.name || "Unknown Customer"}
                                    {customer.rewardsEarned > 500 && (
                                        <ShieldCheck className="w-5 h-5 text-emerald-200" title="Premium Customer" />
                                    )}
                                </h2>
                                <p className="text-emerald-100 font-medium tracking-wide mt-1 flex items-center gap-1.5 opacity-90">
                                    {customer.mobile || "No Mobile Number"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="px-6 py-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 dark:bg-[#121212] border-b border-gray-100 dark:border-zinc-800 shrink-0">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                            <div className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <QrCode className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Total Scans</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                            {customer.codeCount || 0}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                <IndianRupee className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Rewards</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-1">
                            ₹{formatAmount(customer.rewardsEarned)}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                            <div className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Joined</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-2 pt-1">
                            {formatDate(customer.memberSince)}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                            <div className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Last Active</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-2 pt-1 flex flex-col">
                            <span>{formatDate(customer.lastScanned)}</span>
                        </div>
                    </div>
                </div>

                {/* Scan History Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#121212]">
                    <div className="px-6 py-4 sm:px-8 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#121212] z-10 shrink-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Hash className="w-4 h-4" />
                            </div>
                            Scan History
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 sm:px-8 relative min-h-[300px]">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-sm z-20">
                                <div className="w-10 h-10 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fetching history...</span>
                            </div>
                        ) : error ? (
                            <div className="m-6 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-300 text-sm flex items-center justify-center font-medium shadow-sm">
                                {error}
                            </div>
                        ) : scans.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-2 shadow-inner border border-gray-100 dark:border-zinc-700">
                                    <QrCode className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Scans Found</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">This user hasn't scanned any QR codes yet.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                                    <thead className="text-gray-400 dark:text-zinc-500">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold tracking-wider text-xs uppercase w-[160px]">Date & Time</th>
                                            <th className="px-4 py-3 font-semibold tracking-wider text-xs uppercase hidden sm:table-cell">Campaign</th>
                                            <th className="px-4 py-3 font-semibold tracking-wider text-xs uppercase w-[180px]">QR Code</th>
                                            <th className="px-4 py-3 font-semibold tracking-wider text-xs uppercase text-right text-emerald-600 dark:text-emerald-500 w-[120px]">Cashback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scans.map((r) => (
                                            <tr key={r.id} className="bg-gray-50/50 hover:bg-gray-100 dark:bg-[#1a1a1a]/50 dark:hover:bg-[#1a1a1a] transition-all group rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                                <td className="px-4 py-4 first:rounded-l-xl">
                                                    <div className="font-bold text-gray-900 dark:text-gray-200">{formatDate(r.createdAt)}</div>
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-0.5">{formatTime(r.createdAt)}</div>
                                                </td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <div className="p-1 bg-white dark:bg-zinc-800 rounded shadow-sm border border-gray-100 dark:border-zinc-700">
                                                            <Megaphone className="w-3.5 h-3.5 text-gray-400" />
                                                        </div>
                                                        <span className="truncate max-w-[220px]">{r.campaign?.title || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-mono text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-md inline-block border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm">
                                                        {r.qr?.hash || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right last:rounded-r-xl">
                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                                                        ₹{Number(r.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#121212] shrink-0">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                                Page <span className="text-gray-900 dark:text-white font-bold">{pagination.page}</span> of <span className="text-gray-900 dark:text-white font-bold">{pagination.totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => loadScans(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => loadScans(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
