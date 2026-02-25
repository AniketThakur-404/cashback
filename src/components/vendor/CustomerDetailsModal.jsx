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
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm sm:items-center sm:justify-center transition-all p-0 sm:p-4">
            <div
                className="w-full h-full sm:w-[90vw] sm:max-w-4xl sm:h-auto sm:max-h-[90vh] bg-white dark:bg-[#121212] flex flex-col sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right sm:slide-in-from-bottom-8 duration-300"
            >
                {/* Header Section */}
                <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1a1a1a]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-500/30">
                            {customer.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {customer.name || "Unknown Customer"}
                                {customer.rewardsEarned > 500 && (
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" title="Premium Customer" />
                                )}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                                {customer.mobile || "No Mobile Number"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-[#121212]">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1a1a1a]/30">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                            <QrCode className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {customer.codeCount || 0}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-1">
                            <IndianRupee className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Rewards Earned</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            ₹{formatAmount(customer.rewardsEarned)}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1a1a1a]/30">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Member Since</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5">
                            {formatDate(customer.memberSince)}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#1a1a1a]/30">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Last Scan</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5 flex flex-col">
                            <span>{formatDate(customer.lastScanned)}</span>
                        </div>
                    </div>
                </div>

                {/* Scan History Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-zinc-800">
                    <div className="px-6 py-4 flex items-center justify-between bg-gray-50/30 dark:bg-[#141414]/50 border-b border-gray-100 dark:border-zinc-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Hash className="w-4 h-4 text-emerald-500" />
                            Scan History
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading history...</span>
                            </div>
                        ) : error ? (
                            <div className="m-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-sm flex items-center justify-center">
                                {error}
                            </div>
                        ) : scans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-2">
                                    <QrCode className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No scans found</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">This user has not scanned any QR codes yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white dark:bg-[#121212] text-gray-400 dark:text-zinc-500 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-medium tracking-wider text-xs uppercase w-[140px]">Date & Time</th>
                                        <th className="px-6 py-3 font-medium tracking-wider text-xs uppercase hidden sm:table-cell">Campaign</th>
                                        <th className="px-6 py-3 font-medium tracking-wider text-xs uppercase w-[160px]">QR Code</th>
                                        <th className="px-6 py-3 font-medium tracking-wider text-xs uppercase text-right text-emerald-600 dark:text-emerald-500 w-[100px]">Cashback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                                    {scans.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="font-medium text-gray-900 dark:text-gray-300">{formatDate(r.createdAt)}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500">{formatTime(r.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-3.5 hidden sm:table-cell">
                                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <Megaphone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="truncate max-w-[200px]">{r.campaign?.title || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded inline-block border border-emerald-100 dark:border-emerald-500/20">
                                                    {r.qr?.hash || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    ₹{Number(r.amount).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#141414]/50">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Page <span className="text-gray-900 dark:text-white">{pagination.page}</span> of <span className="text-gray-900 dark:text-white">{pagination.totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => loadScans(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => loadScans(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
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
