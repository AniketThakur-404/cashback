import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../ui";
import {
  QrCode,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  CheckSquare,
  Square,
  Lock,
  Search,
  X,
  Plus,
  Trash2,
  Eye,
  Zap,
} from "lucide-react";
import { assignSheetCashback } from "../../lib/api";
import { toRoman } from "../../lib/vendorUtils";
import { resolvePostpaidSheetSize } from "../../lib/postpaidSheet";

const SHEET_OVERRIDES_STORAGE_KEY = "postpaid_sheet_overrides_v1";
const LOCKED_PREVIEW_COUNT = 4;

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
  } catch (_err) {
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
  } catch (_err) {
    // Ignore storage failures and keep in-memory behavior.
  }
};

/* ── Recharged Sheets Popup Modal ───────────────────────────── */
const RechargedSheetsModal = ({ sheets, onClose }) => {
  const totalBudget = sheets.reduce(
    (sum, s) => sum + normalizeAmount(s.amount) * (s.qrCount || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-500/15">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                All Recharged Sheets
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {sheets.length} sheets · INR {formatAmount(totalBudget)} total
                budget
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {sheets.map((s, i) => (
            <div
              key={s.index}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/60 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-colors group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/60 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                    Sheet {s.label}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {s.qrCount} QR codes
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  INR {formatAmount(s.amount)}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">per QR</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Total Budget Allocated
            </p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              INR {formatAmount(totalBudget)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AllocationBlock = ({
  id,
  sheets,
  unlockedSheetIndexes,
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

  const allSelected =
    unlockedSheetIndexes.length > 0 &&
    unlockedSheetIndexes.every((idx) => selectedIndexes.includes(idx));

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
                  onClick={() => onSelectionChange(unlockedSheetIndexes)}
                  disabled={allSelected || !unlockedSheetIndexes.length}
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
                  const isLocked = normalizeAmount(s.amount || 0) > 0;
                  return (
                    <button
                      key={s.index}
                      type="button"
                      disabled={isLocked || isSelectedElsewhere}
                      onClick={() => {
                        const next = isSelectedLocally
                          ? selectedIndexes.filter((i) => i !== s.index)
                          : [...selectedIndexes, s.index].sort((a, b) => a - b);
                        onSelectionChange(next);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
                        isSelectedLocally
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : isLocked || isSelectedElsewhere
                            ? "opacity-50 cursor-not-allowed grayscale"
                            : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        {isLocked ? (
                          <Lock className="w-4 h-3.5" />
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
                          : isLocked
                            ? "Locked"
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
    const [showRechargedModal, setShowRechargedModal] = useState(false);

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

    const unlockedSheetIndexes = useMemo(
      () =>
        sheets
          .filter((s) => normalizeAmount(s.amount || 0) <= 0)
          .map((s) => s.index),
      [sheets],
    );

    const lockedSheets = useMemo(
      () => sheets.filter((s) => normalizeAmount(s.amount || 0) > 0),
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
          .reduce((q, s) => q + (s.qrCount || 0), 0);
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
        let lastMessage = "";
        const nextOverrides = { ...sheetOverrides };

        for (const a of validAllocations) {
          const targetAmount = normalizeAmount(a.amount);
          for (const idx of a.selectedIndexes) {
            const result = await assignSheetCashback(token, campaign.id, {
              sheetIndex: idx,
              cashbackAmount: targetAmount,
            });
            lastMessage = result?.message || lastMessage;
            nextOverrides[idx] = targetAmount;
          }
        }

        success(
          "Success",
          lastMessage || "Sheet cashback assigned successfully.",
        );

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

    if (sheets.length === 0) return null;

    const allSelectedAcrossBlocks = useMemo(
      () => allocations.flatMap((a) => a.selectedIndexes),
      [allocations],
    );

    const previewLocked = lockedSheets.slice(0, LOCKED_PREVIEW_COUNT);
    const hasMoreLocked = lockedSheets.length > LOCKED_PREVIEW_COUNT;

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
                id={a.id}
                sheets={sheets}
                unlockedSheetIndexes={unlockedSheetIndexes}
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

          {/* ── Recharged Sheets Preview ─────────────────────────── */}
          {lockedSheets.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Recharged Sheets
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    {lockedSheets.length}
                  </span>
                </div>
                {hasMoreLocked && (
                  <button
                    type="button"
                    onClick={() => setShowRechargedModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                  >
                    <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    View All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {previewLocked.map((s) => (
                  <div
                    key={s.index}
                    className="relative p-3 rounded-xl bg-linear-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-zinc-900 border border-emerald-100/80 dark:border-emerald-800/30 group/card hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700/40 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                        Sheet {s.label}
                      </span>
                    </div>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                      INR {formatAmount(s.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {s.qrCount} QRs
                    </p>
                  </div>
                ))}
              </div>

              {hasMoreLocked && (
                <button
                  type="button"
                  onClick={() => setShowRechargedModal(true)}
                  className="w-full mt-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-2 group"
                >
                  <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  View all {lockedSheets.length} recharged sheets
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recharged Sheets Popup */}
        {showRechargedModal && (
          <RechargedSheetsModal
            sheets={lockedSheets}
            onClose={() => setShowRechargedModal(false)}
          />
        )}

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
