import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, Download, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { getVendorRedemptions, getVendorCampaigns } from "../../lib/api";

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd MMM yyyy, p");
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Redemptions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View QR redemption data</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => loadRedemptions(pagination.page)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={exportToCsv}
                        disabled={!redemptions.length}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Campaign</label>
                        <select
                            value={filters.campaignId}
                            onChange={(e) => handleFilterChange("campaignId", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        >
                            <option value="">All Campaigns</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        Apply
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">QR Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : redemptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No redemptions found
                                    </td>
                                </tr>
                            ) : (
                                redemptions.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(r.createdAt)}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-violet-600 dark:text-violet-400">...{r.qr?.hash || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">₹{Number(r.amount).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.campaign?.title || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.customer?.name || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{r.customer?.phone || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700/50">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadRedemptions(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-white" />
                            </button>
                            <button
                                onClick={() => loadRedemptions(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorRedemptions;
