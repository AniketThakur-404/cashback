import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../ui";
import {
  QrCode,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  CheckSquare,
  Square,
  CircleOff,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import { assignSheetCashback } from "../../lib/api";
import { toRoman } from "../../lib/vendorUtils";
import { resolvePostpaidSheetSize } from "../../lib/postpaidSheet";

const SHEET_OVERRIDES_STORAGE_KEY = "postpaid_sheet_overrides_v1";

const normalizeAmount = (value) => {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Number(numeric.toFixed(2));
};

const formatAmount = (value) => normalizeAmount(value).toFixed(2);

const readStoredOverrides = (campaignId) => {
  if (!campaignId || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SHEET_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const campaignMap = parsed?.[campaignId];
    return campaignMap && typeof campaignMap === "object" ? campaignMap : {};
  } catch {
    return {};
  }
};

const writeStoredOverrides = (campaignId, nextMap) => {
  if (!campaignId || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SHEET_OVERRIDES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = parsed && typeof parsed === "object" ? parsed : {};
    next[campaignId] = nextMap;
    window.localStorage.setItem(
      SHEET_OVERRIDES_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Ignore storage failures and keep in-memory behavior.
  }
};

const AllocationBlock = ({
  sheets,
  selectableSheetIndexes,
  selectedIndexes,
  onSelectionChange,
  amount,
  onAmountChange,
  onDelete,
  isOnlyOne,
  allSelectedAcrossBlocks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const clickOut = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sheets;
    return sheets.filter((s) => {
      const label = `sheet ${s.label}`.toLowerCase();
      return label.includes(term) || String(s.qrCount).includes(term);
    });
  }, [sheets, search]);

  const label = useMemo(() => {
    if (!selectedIndexes.length) return "Select sheet(s)";
    if (selectedIndexes.length === 1) {
      const s = sheets.find((item) => item.index === selectedIndexes[0]);
      return `Sheet ${s?.label || toRoman(selectedIndexes[0] + 1)} (${s?.qrCount} QRs)`;
    }
    return `${selectedIndexes.length} Sheets selected`;
  }, [selectedIndexes, sheets]);

  const availableSheetIndexes = useMemo(
    () =>
      selectableSheetIndexes.filter(
        (idx) =>
          selectedIndexes.includes(idx) || !allSelectedAcrossBlocks.includes(idx),
      ),
    [selectableSheetIndexes, selectedIndexes, allSelectedAcrossBlocks],
  );

  const allSelected =
    availableSheetIndexes.length > 0 &&
    availableSheetIndexes.every((idx) => selectedIndexes.includes(idx));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start p-4 rounded-xl bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/60 relative group animate-in fade-in slide-in-from-top-2 duration-300">
      {!isOnlyOne && (
        <button
          onClick={onDelete}
          className="absolute -right-2 -top-2 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Sheet Selector */}
      <div className="sm:col-span-6 space-y-2">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block pl-1">
          Target Sheets
        </label>
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-3"
          >
            <span className="truncate">{label}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-120 mt-2 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sheets..."
                    className="w-full h-9 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/60 pl-9 pr-8 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="w-full px-3 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectionChange(availableSheetIndexes)}
                  disabled={allSelected || !availableSheetIndexes.length}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => onSelectionChange([])}
                  disabled={!selectedIndexes.length}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5 text-gray-400" />
                  Unselect all
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {filtered.map((s) => {
                  const isSelectedLocally = selectedIndexes.includes(s.index);
                  const isSelectedElsewhere =
                    !isSelectedLocally &&
                    allSelectedAcrossBlocks.includes(s.index);
                  const qrCount = Number(s.qrCount) || 0;
                  const updatableCount = Number.isFinite(Number(s.updatableCount))
                    ? Number(s.updatableCount)
                    : qrCount;
                  const redeemedCount = Number.isFinite(Number(s.redeemedCount))
                    ? Number(s.redeemedCount)
                    : 0;
                  const isFullyRedeemed = qrCount > 0 && updatableCount <= 0 && redeemedCount >= qrCount;
                  return (
                    <button
                      key={s.index}
                      type="button"
                      disabled={isSelectedElsewhere}
                      onClick={() => {
                        const next = isSelectedLocally
                          ? selectedIndexes.filter((i) => i !== s.index)
                          : [...selectedIndexes, s.index].sort((a, b) => a - b);
                        onSelectionChange(next);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
                        isSelectedLocally
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : isSelectedElsewhere
                            ? "opacity-50 cursor-not-allowed grayscale"
                            : isFullyRedeemed
                              ? "bg-amber-50/70 dark:bg-amber-900/15 hover:bg-amber-100/70 dark:hover:bg-amber-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        {isFullyRedeemed ? (
                          <CircleOff className="w-4 h-3.5 text-amber-500" />
                        ) : isSelectedLocally ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="truncate text-sm font-medium">
                          Sheet {s.label} ({s.qrCount} QRs)
                        </span>
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {isSelectedElsewhere
                          ? "In other group"
                          : isFullyRedeemed
                            ? "All redeemed"
                            : `INR ${formatAmount(s.amount)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="sm:col-span-6 space-y-2">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block pl-1">
          Cashback (INR)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
          />
        </div>
      </div>
    </div>
  );
};

const PostpaidSheetManager = React.memo(
  ({ campaign, token, loadCampaigns }) => {
    const { success, error: toastError } = useToast();
    const [assigningSheet, setAssigningSheet] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [sheetOverrides, setSheetOverrides] = useState({});

    useEffect(() => {
      setSheetOverrides(readStoredOverrides(campaign.id));
      setAllocations([
        {
          id: Math.random().toString(36).substr(2, 9),
          amount: "",
          selectedIndexes: [],
        },
      ]);
    }, [campaign.id]);

    const totalQrs = useMemo(() => {
      if (!campaign.allocations) return 0;
      return campaign.allocations.reduce(
        (sum, acc) => sum + (acc.quantity || 0),
        0,
      );
    }, [campaign.allocations]);

    const sheets = useMemo(() => {
      if (campaign.sheets && campaign.sheets.length > 0) {
        return campaign.sheets.map((s) => ({
          ...s,
          qrCount: s.count,
          amount: normalizeAmount(
            Number.isFinite(sheetOverrides[s.index])
              ? sheetOverrides[s.index]
              : s.amount,
          ),
        }));
      }
      const qrsPerSheet =
        Number.parseInt(campaign?.qrsPerSheet, 10) > 0
          ? Number.parseInt(campaign.qrsPerSheet, 10)
          : resolvePostpaidSheetSize(totalQrs);
      const sheetCount = Math.ceil(totalQrs / qrsPerSheet);
      return Array.from({ length: sheetCount }, (_, i) => ({
        index: i,
        label: toRoman(i + 1),
        qrCount: Math.min(qrsPerSheet, totalQrs - i * qrsPerSheet),
        amount: normalizeAmount(
          Number.isFinite(sheetOverrides[i]) ? sheetOverrides[i] : 0,
        ),
      }));
    }, [campaign.sheets, campaign.qrsPerSheet, totalQrs, sheetOverrides]);

    const selectableSheetIndexes = useMemo(
      () => sheets.map((s) => s.index),
      [sheets],
    );

    const handleAddAllocation = () => {
      setAllocations([
        ...allocations,
        {
          id: Math.random().toString(36).substr(2, 9),
          amount: "",
          selectedIndexes: [],
        },
      ]);
    };

    const handleRemoveAllocation = (id) => {
      if (allocations.length > 1) {
        setAllocations(allocations.filter((a) => a.id !== id));
      }
    };

    const handleUpdateAllocation = (id, updates) => {
      setAllocations(
        allocations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    };

    const totalIncrementPreview = useMemo(() => {
      return allocations.reduce((sum, a) => {
        const amt = normalizeAmount(a.amount);
        const qrCount = sheets
          .filter((s) => a.selectedIndexes.includes(s.index))
          .reduce((q, s) => {
            const updatableCount = Number.isFinite(Number(s.updatableCount))
              ? Number(s.updatableCount)
              : Number(s.qrCount || 0);
            return q + Math.max(0, updatableCount);
          }, 0);
        return sum + amt * qrCount;
      }, 0);
    }, [allocations, sheets]);

    const selectedCount = useMemo(
      () => new Set(allocations.flatMap((a) => a.selectedIndexes)).size,
      [allocations],
    );

    const handleAssign = async () => {
      if (assigningSheet) return;

      const validAllocations = allocations.filter(
        (a) => a.selectedIndexes.length > 0 && normalizeAmount(a.amount) > 0,
      );

      if (!validAllocations.length) {
        toastError(
          "Error",
          "Please select sheets and specify amount for at least one allocation.",
        );
        return;
      }

      // Check for overlaps
      const allSelected = [];
      for (const a of validAllocations) {
        for (const idx of a.selectedIndexes) {
          if (allSelected.includes(idx)) {
            toastError(
              "Error",
              `Sheet ${toRoman(idx + 1)} is selected in multiple allocations.`,
            );
            return;
          }
          allSelected.push(idx);
        }
      }

      setAssigningSheet(campaign.id);
      try {
        let totalUpdated = 0;
        let totalRedeemedUnchanged = 0;
        const noChangeMessages = [];
        const nextOverrides = { ...sheetOverrides };

        for (const a of validAllocations) {
          const targetAmount = normalizeAmount(a.amount);
          for (const idx of a.selectedIndexes) {
            const result = await assignSheetCashback(token, campaign.id, {
              sheetIndex: idx,
              cashbackAmount: targetAmount,
            });
            const updatedCount = Number(result?.updated_qr_count ?? result?.updated ?? 0);
            const redeemedUnchanged = Number(result?.unchanged_redeemed_count ?? 0);

            totalUpdated += Math.max(0, updatedCount);
            totalRedeemedUnchanged += Math.max(0, redeemedUnchanged);

            if (updatedCount > 0) {
              nextOverrides[idx] = targetAmount;
            } else if (result?.message) {
              noChangeMessages.push(result.message);
            }
          }
        }

        if (totalUpdated > 0) {
          success(
            "Success",
            `Updated ${totalUpdated} QR(s). Redeemed unchanged: ${totalRedeemedUnchanged}.`,
          );
        } else {
          toastError(
            "No changes",
            noChangeMessages[0] ||
              "Selected sheets had no updatable QR codes.",
          );
        }

        setSheetOverrides(nextOverrides);
        writeStoredOverrides(campaign.id, nextOverrides);
        setAllocations([
          {
            id: Math.random().toString(36).substr(2, 9),
            amount: "",
            selectedIndexes: [],
          },
        ]);
        await loadCampaigns(token);
      } catch (err) {
        toastError("Error", err.message || "Failed to update sheets.");
      } finally {
        setAssigningSheet(null);
      }
    };

    const allSelectedAcrossBlocks = useMemo(
      () => allocations.flatMap((a) => a.selectedIndexes),
      [allocations],
    );
    if (sheets.length === 0) return null;

    return (
      <div className="mt-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Assign Cashback by Sheet
            </span>
          </div>
          <div className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700">
            {sheets.length} Sheets
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-4">
            {allocations.map((a) => (
              <AllocationBlock
                key={a.id}
                sheets={sheets}
                selectableSheetIndexes={selectableSheetIndexes}
                selectedIndexes={a.selectedIndexes}
                allSelectedAcrossBlocks={allSelectedAcrossBlocks}
                onSelectionChange={(next) =>
                  handleUpdateAllocation(a.id, { selectedIndexes: next })
                }
                amount={a.amount}
                onAmountChange={(val) =>
                  handleUpdateAllocation(a.id, { amount: val })
                }
                onDelete={() => handleRemoveAllocation(a.id)}
                isOnlyOne={allocations.length === 1}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 border-t border-gray-50 dark:border-zinc-800/50">
            <button
              onClick={handleAddAllocation}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-all active:scale-[0.98] group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Add another allocation
            </button>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  Est. Total Increment
                </p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  INR {formatAmount(totalIncrementPreview)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAssign}
                disabled={assigningSheet === campaign.id || selectedCount === 0}
                className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {assigningSheet === campaign.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Apply All Allocations
                    <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #10b981;
          }
        `,
          }}
        />
      </div>
    );
  },
);

export default PostpaidSheetManager;
