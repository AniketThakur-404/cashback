import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, Download, Search, ChevronLeft, ChevronRight, RefreshCw, Calendar, Hash, IndianRupee, Megaphone, User, Phone } from "lucide-react";
import { getVendorRedemptions, getVendorCampaigns } from "../../lib/api";

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

const VendorRedemptions = ({ token }) => {
    const [redemptions, setRedemptions] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [filters, setFilters] = useState({
        campaignId: "",
        startDate: "",
        endDate: ""
    });

    const loadCampaigns = async () => {
        try {
            const data = await getVendorCampaigns(token);
            const list = Array.isArray(data) ? data : data?.campaigns || [];
            setCampaigns(list);
        } catch (err) {
            console.error("Failed to load campaigns", err);
        }
    };

    const loadRedemptions = async (page = 1) => {
        setIsLoading(true);
        setError("");
        try {
            const params = { page, limit: pagination.limit };
            if (filters.campaignId) params.campaignId = filters.campaignId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const data = await getVendorRedemptions(token, params);
            setRedemptions(data.redemptions || []);
            setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        } catch (err) {
            setError(err.message || "Failed to load redemptions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadCampaigns();
            loadRedemptions();
        }
    }, [token]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        loadRedemptions(1);
    };

    const exportToCsv = () => {
        if (!redemptions.length) return;
        const headers = ["Date", "QR Code", "Amount", "Campaign", "Customer", "Phone"];
        const rows = redemptions.map(r => [
            formatDate(r.createdAt),
            r.qr?.hash || "-",
            r.amount,
            r.campaign?.title || "-",
            r.customer?.name || "-",
            r.customer?.phone || "-"
        ]);
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `redemptions_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                        <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Redemptions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {pagination.total > 0 ? `${pagination.total} total scans` : "Track and manage your customer QR redemptions"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => loadRedemptions(pagination.page)}
                        className="px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all flex items-center gap-2 font-medium shadow-sm dark:shadow-none"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={exportToCsv}
                        disabled={!redemptions.length}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm dark:shadow-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</label>
                        <select
                            value={filters.campaignId}
                            onChange={(e) => handleFilterChange("campaignId", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                        >
                            <option value="">All Campaigns</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={handleApplyFilters}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Search className="w-4 h-4" />
                        Apply
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm dark:shadow-none">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Loading redemptions...</span>
                    </div>
                ) : redemptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-2">
                            <Users className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No redemptions found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results</p>
                    </div>
                ) : (
                    <>
                        {/* Table Layout */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left table-fixed min-w-[800px]">
                                <thead className="bg-gray-50/80 dark:bg-[#171717]/80 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold tracking-wide w-[120px] sm:w-[140px]">Date</th>
                                        <th className="px-4 py-3 font-semibold tracking-wide w-[150px] sm:w-[180px]">QR Code</th>
                                        <th className="px-4 py-3 font-semibold tracking-wide">Customer</th>
                                        <th className="px-4 py-3 font-semibold tracking-wide hidden sm:table-cell">Campaign</th>
                                        <th className="px-4 py-3 font-semibold tracking-wide w-[90px] sm:w-[110px] text-right text-emerald-600 dark:text-emerald-500">Cashback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                                    {redemptions.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group">
                                            {/* Date */}
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                <div className="text-xs font-medium">{formatDate(r.createdAt)}</div>
                                                <div className="text-[11px] text-gray-400">{formatTime(r.createdAt)}</div>
                                            </td>

                                            {/* QR Code */}
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-500/20 break-all leading-relaxed">
                                                    {r.qr?.hash || "-"}
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {r.customer?.name?.[0]?.toUpperCase() || "C"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate text-xs sm:text-sm">{r.customer?.name || "Unknown"}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs truncate">{r.customer?.phone || "-"}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Campaign (Hidden on very small screens) */}
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                                    <Megaphone className="w-3 h-3 shrink-0 text-gray-400" />
                                                    <span className="truncate max-w-[150px] lg:max-w-xs">{r.campaign?.title || "-"}</span>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                    ₹{Number(r.amount).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/50 dark:bg-[#141414] border-t border-gray-100 dark:border-zinc-800">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Page <span className="text-gray-900 dark:text-white">{pagination.page}</span> of <span className="text-gray-900 dark:text-white">{pagination.totalPages}</span>
                                    <span className="hidden sm:inline text-gray-400 dark:text-gray-500"> ({pagination.total} total)</span>
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => loadRedemptions(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    </button>
                                    <button
                                        onClick={() => loadRedemptions(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VendorRedemptions;
