import React, { useState, useRef, useEffect } from "react";
import {
    Calendar,
    Search,
    Filter,
    X,
    ChevronDown,
    Download,
    RotateCcw,
    SlidersHorizontal,
    MapPin,
    Phone,
    Tag,
    Package,
} from "lucide-react";

const AdvancedFilters = ({
    filters,
    setFilters,
    onApply,
    campaigns = [],
    products = [],
    showExport = false,
    onExport,
    variant = "customers", // "customers" | "locations"
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const filterRef = useRef(null);

    const hasActiveFilters =
        filters.dateFrom ||
        filters.dateTo ||
        filters.campaignId ||
        filters.city ||
        filters.state ||
        filters.mobile ||
        filters.productId;

    const activeFilterCount = [
        filters.dateFrom || filters.dateTo,
        filters.campaignId,
        filters.city || filters.state,
        filters.mobile,
        filters.productId,
    ].filter(Boolean).length;

    const handleReset = () => {
        setFilters((prev) => ({
            ...prev,
            dateFrom: "",
            dateTo: "",
            campaignId: "",
            city: "",
            state: "",
            mobile: "",
            productId: "",
        }));
        setTimeout(() => onApply?.(), 50);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onApply?.();
        }
    };

    const inputClass =
        "w-full px-3 py-2.5 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none";

    const selectClass =
        "w-full px-3 py-2.5 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none appearance-none cursor-pointer";

    const labelClass =
        "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5";

    return (
        <div
            ref={filterRef}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm dark:shadow-none overflow-hidden transition-all"
        >
            {/* Compact Filter Bar - Always Visible */}
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                {/* Search / Mobile Quick Input */}
                {variant === "customers" && (
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by mobile..."
                            value={filters.mobile}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, mobile: e.target.value }))
                            }
                            onKeyDown={handleKeyDown}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                        />
                    </div>
                )}

                {/* City Quick Input */}
                <div className="relative flex-1 min-w-[150px] max-w-xs">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by city..."
                        value={filters.city}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, city: e.target.value }))
                        }
                        onKeyDown={handleKeyDown}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${isExpanded || hasActiveFilters
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700"
                            }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={onApply}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Apply
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl text-xs font-medium transition-all hover:bg-gray-100 dark:hover:bg-zinc-800"
                            title="Clear all filters"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    )}

                    {showExport && onExport && (
                        <button
                            type="button"
                            onClick={onExport}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Filters Panel */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3">
                        {/* Date From */}
                        <div>
                            <label className={labelClass}>
                                <Calendar className="w-3 h-3" />
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        dateFrom: e.target.value,
                                    }))
                                }
                                className={inputClass}
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className={labelClass}>
                                <Calendar className="w-3 h-3" />
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                                }
                                className={inputClass}
                            />
                        </div>

                        {/* Campaign */}
                        <div>
                            <label className={labelClass}>
                                <Tag className="w-3 h-3" />
                                Campaign
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.campaignId}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            campaignId: e.target.value,
                                        }))
                                    }
                                    className={selectClass}
                                >
                                    <option value="">All Campaigns</option>
                                    {campaigns.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Product */}
                        {products.length > 0 && (
                            <div>
                                <label className={labelClass}>
                                    <Package className="w-3 h-3" />
                                    Product
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.productId}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                productId: e.target.value,
                                            }))
                                        }
                                        className={selectClass}
                                    >
                                        <option value="">All Products</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* State */}
                        <div>
                            <label className={labelClass}>
                                <MapPin className="w-3 h-3" />
                                State
                            </label>
                            <input
                                type="text"
                                placeholder="Enter state..."
                                value={filters.state}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, state: e.target.value }))
                                }
                                onKeyDown={handleKeyDown}
                                className={inputClass}
                            />
                        </div>

                        {/* Mobile - only in customers variant */}
                        {variant === "customers" && (
                            <div>
                                <label className={labelClass}>
                                    <Phone className="w-3 h-3" />
                                    Mobile
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search mobile..."
                                    value={filters.mobile}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, mobile: e.target.value }))
                                    }
                                    onKeyDown={handleKeyDown}
                                    className={inputClass}
                                />
                            </div>
                        )}

                        {/* City */}
                        <div>
                            <label className={labelClass}>
                                <MapPin className="w-3 h-3" />
                                City
                            </label>
                            <input
                                type="text"
                                placeholder="Enter city..."
                                value={filters.city}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, city: e.target.value }))
                                }
                                onKeyDown={handleKeyDown}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filters.dateFrom && (
                                <FilterChip
                                    label={`From: ${filters.dateFrom}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, dateFrom: "" }))
                                    }
                                />
                            )}
                            {filters.dateTo && (
                                <FilterChip
                                    label={`To: ${filters.dateTo}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, dateTo: "" }))
                                    }
                                />
                            )}
                            {filters.campaignId && (
                                <FilterChip
                                    label={`Campaign: ${campaigns.find((c) => c.id === filters.campaignId)?.title || filters.campaignId}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, campaignId: "" }))
                                    }
                                />
                            )}
                            {filters.productId && (
                                <FilterChip
                                    label={`Product: ${products.find((p) => p.id === filters.productId)?.title || filters.productId}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, productId: "" }))
                                    }
                                />
                            )}
                            {filters.city && (
                                <FilterChip
                                    label={`City: ${filters.city}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, city: "" }))
                                    }
                                />
                            )}
                            {filters.state && (
                                <FilterChip
                                    label={`State: ${filters.state}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, state: "" }))
                                    }
                                />
                            )}
                            {filters.mobile && (
                                <FilterChip
                                    label={`Mobile: ${filters.mobile}`}
                                    onClear={() =>
                                        setFilters((prev) => ({ ...prev, mobile: "" }))
                                    }
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FilterChip = ({ label, onClear }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium rounded-lg border border-emerald-200 dark:border-emerald-500/20">
        {label}
        <button
            type="button"
            onClick={onClear}
            className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
        >
            <X className="w-3 h-3" />
        </button>
    </span>
);

export default AdvancedFilters;
