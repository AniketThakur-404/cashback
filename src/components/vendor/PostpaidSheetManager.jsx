import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../ui";
import {
  QrCode,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  CheckSquare,
  Square,
  Search,
  X,
} from "lucide-react";
import { assignSheetCashback } from "../../lib/api";
import { toRoman } from "../../lib/vendorUtils";

const SHEET_OVERRIDES_STORAGE_KEY = "postpaid_sheet_overrides_v1";
const SHEET_SELECTION_MODES = {
  SINGLE: "single",
  MULTIPLE: "multiple",
  ALL: "all",
};

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
    window.localStorage.setItem(SHEET_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  } catch (_err) {
    // Ignore storage failures and keep in-memory behavior.
  }
};

const PostpaidSheetManager = React.memo(
  ({
    campaign,
    token,
    loadCampaigns,
  }) => {
    const { success, error: toastError } = useToast();
    const [assigningSheet, setAssigningSheet] = useState(null);
    const [sheetIndex, setSheetIndex] = useState(0);
    const [multiSheetIndexes, setMultiSheetIndexes] = useState([]);
    const [selectionMode, setSelectionMode] = useState(
      SHEET_SELECTION_MODES.SINGLE,
    );
    const [cashbackAmount, setCashbackAmount] = useState("");
    const [sheetOverrides, setSheetOverrides] = useState({});
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [sheetSearch, setSheetSearch] = useState("");
    const selectorRef = useRef(null);

    useEffect(() => {
      setSheetOverrides(readStoredOverrides(campaign.id));
      setSheetIndex(0);
      setMultiSheetIndexes([]);
      setSelectionMode(SHEET_SELECTION_MODES.SINGLE);
      setCashbackAmount("");
      setSheetSearch("");
      setIsSelectorOpen(false);
    }, [campaign.id]);

    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (!selectorRef.current) return;
        if (!selectorRef.current.contains(event.target)) {
          setIsSelectorOpen(false);
        }
      };
      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setIsSelectorOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleEscape);
      };
    }, []);

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

      const sheetCount = Math.ceil(totalQrs / 25);
      return Array.from({ length: sheetCount }, (_, i) => ({
        index: i,
        label: toRoman(i + 1),
        qrCount: Math.min(25, totalQrs - i * 25),
        amount: normalizeAmount(
          Number.isFinite(sheetOverrides[i]) ? sheetOverrides[i] : 0,
        ),
      }));
    }, [campaign.sheets, totalQrs, sheetOverrides]);

    useEffect(() => {
      if (!sheets.length) return;
      const validIndexes = new Set(sheets.map((s) => s.index));
      if (!validIndexes.has(sheetIndex)) {
        setSheetIndex(sheets[0].index);
      }
      setMultiSheetIndexes((prev) => prev.filter((idx) => validIndexes.has(idx)));
    }, [sheets, sheetIndex]);

    const selectedSheet = useMemo(
      () => sheets.find((s) => s.index === sheetIndex),
      [sheets, sheetIndex],
    );

    const filteredSheets = useMemo(() => {
      const term = sheetSearch.trim().toLowerCase();
      if (!term) return sheets;
      return sheets.filter((sheet) => {
        const label = `sheet ${sheet.label}`.toLowerCase();
        const qrCount = String(sheet.qrCount || "");
        const amount = formatAmount(sheet.amount);
        return (
          label.includes(term) ||
          qrCount.includes(term) ||
          amount.includes(term)
        );
      });
    }, [sheets, sheetSearch]);

    const effectiveSheetIndexes = useMemo(() => {
      if (!sheets.length) return [];
      if (selectionMode === SHEET_SELECTION_MODES.ALL) {
        return sheets.map((sheet) => sheet.index);
      }
      if (selectionMode === SHEET_SELECTION_MODES.MULTIPLE) {
        return multiSheetIndexes;
      }
      return [sheetIndex];
    }, [sheets, selectionMode, multiSheetIndexes, sheetIndex]);

    const selectedSheets = useMemo(
      () => sheets.filter((sheet) => effectiveSheetIndexes.includes(sheet.index)),
      [sheets, effectiveSheetIndexes],
    );

    const allMultiSelected =
      sheets.length > 0 && multiSheetIndexes.length === sheets.length;
    const hasAnyMultiSelected = multiSheetIndexes.length > 0;

        const selectorLabel = useMemo(() => {
      if (!selectedSheets.length) return "Select sheet";
      if (selectionMode === SHEET_SELECTION_MODES.ALL) {
        return `All Sheets (${sheets.length})`;
      }
      if (selectionMode === SHEET_SELECTION_MODES.MULTIPLE) {
        return selectedSheets.length === 1
          ? `Sheet ${selectedSheets[0].label} (${selectedSheets[0].qrCount} QRs) | INR ${formatAmount(selectedSheets[0].amount)}`
          : `${selectedSheets.length} Sheets selected`;
      }
      return `Sheet ${selectedSheets[0].label} (${selectedSheets[0].qrCount} QRs) | INR ${formatAmount(selectedSheets[0].amount)}`;
    }, [selectedSheets, selectionMode, sheets.length]);

    const handleModeChange = (mode) => {
      setSelectionMode(mode);
      if (mode === SHEET_SELECTION_MODES.SINGLE) {
        const fallbackIndex =
          multiSheetIndexes[0] ??
          selectedSheets[0]?.index ??
          sheetIndex ??
          sheets[0]?.index ??
          0;
        setSheetIndex(fallbackIndex);
      }
      if (mode === SHEET_SELECTION_MODES.MULTIPLE) {
        if (!multiSheetIndexes.length && Number.isFinite(sheetIndex)) {
          setMultiSheetIndexes([sheetIndex]);
        }
      }
      if (mode === SHEET_SELECTION_MODES.ALL) {
        setMultiSheetIndexes(sheets.map((sheet) => sheet.index));
      }
    };

    const handleToggleMultiSheet = (index) => {
      setMultiSheetIndexes((prev) => {
        if (prev.includes(index)) {
          return prev.filter((value) => value !== index);
        }
        return [...prev, index].sort((a, b) => a - b);
      });
    };

    const handleToggleAllMultiSheets = () => {
      setMultiSheetIndexes(sheets.map((sheet) => sheet.index));
    };

    const handleClearMultiSheetSelection = () => {
      setMultiSheetIndexes([]);
    };

    const handleClearAllSheetSelection = () => {
      setSelectionMode(SHEET_SELECTION_MODES.MULTIPLE);
      setMultiSheetIndexes([]);
    };

    const selectedQrCount = useMemo(
      () =>
        selectedSheets.reduce(
          (sum, sheet) => sum + (Number(sheet.qrCount) || 0),
          0,
        ),
      [selectedSheets],
    );

    const enteredAmountNormalized = normalizeAmount(cashbackAmount || 0);
    const totalIncrementPreview = normalizeAmount(
      enteredAmountNormalized * selectedQrCount,
    );

    const handleAssign = async () => {
      if (!cashbackAmount || assigningSheet) return;

      const enteredAmount = Number.parseFloat(cashbackAmount);
      if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
        toastError("Error", "Enter a valid cashback amount greater than 0.");
        return;
      }

      if (!effectiveSheetIndexes.length) {
        toastError("Error", "Select at least one sheet.");
        return;
      }

      const targets = effectiveSheetIndexes
        .map((idx) => {
          const targetSheet = sheets.find((sheet) => sheet.index === idx);
          if (!targetSheet) return null;
          const currentAmount = normalizeAmount(targetSheet.amount);
          const targetAmount = Number((currentAmount + enteredAmount).toFixed(2));
          return {
            index: idx,
            label: targetSheet.label || toRoman(idx + 1),
            targetAmount,
          };
        })
        .filter(Boolean);

      if (!targets.length) {
        toastError("Error", "No valid sheets selected.");
        return;
      }

      setAssigningSheet(campaign.id);
      try {
        let lastMessage = "";
        for (const target of targets) {
          const result = await assignSheetCashback(token, campaign.id, {
            sheetIndex: target.index,
            cashbackAmount: target.targetAmount,
          });
          lastMessage = result?.message || lastMessage;
        }

        success("Success", lastMessage || "Sheet cashback updated successfully.");

        setCashbackAmount("");
        setSheetOverrides((prev) => {
          const next = { ...prev };
          targets.forEach((target) => {
            next[target.index] = target.targetAmount;
          });
          writeStoredOverrides(campaign.id, next);
          return next;
        });
        setSheetSearch("");
        setIsSelectorOpen(false);

        await loadCampaigns(token);
      } catch (err) {
        toastError("Error", err.message || "Failed to update sheet.");
      } finally {
        setAssigningSheet(null);
      }
    };

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

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-6 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block pl-1">
                Select Target Sheet
              </label>
              <div ref={selectorRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen((prev) => !prev)}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all hover:bg-white dark:hover:bg-zinc-800 font-sans flex items-center justify-between gap-3"
                >
                  <span className="truncate">{selectorLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isSelectorOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSelectorOpen && (
                  <div className="absolute z-[120] mt-2 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
                        {[
                          {
                            key: SHEET_SELECTION_MODES.SINGLE,
                            label: "Single",
                          },
                          {
                            key: SHEET_SELECTION_MODES.MULTIPLE,
                            label: "Multiple",
                          },
                          {
                            key: SHEET_SELECTION_MODES.ALL,
                            label: "All",
                          },
                        ].map((mode) => (
                          <button
                            key={mode.key}
                            type="button"
                            onClick={() => handleModeChange(mode.key)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              selectionMode === mode.key
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={sheetSearch}
                          onChange={(e) => setSheetSearch(e.target.value)}
                          placeholder="Search sheet, QR count, amount..."
                          className="w-full h-9 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900/60 pl-9 pr-8 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        />
                        {sheetSearch ? (
                          <button
                            type="button"
                            onClick={() => setSheetSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {(selectionMode === SHEET_SELECTION_MODES.MULTIPLE ||
                      selectionMode === SHEET_SELECTION_MODES.ALL) && (
                      <div className="w-full px-3 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleAllMultiSheets}
                          disabled={allMultiSelected}
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={
                            selectionMode === SHEET_SELECTION_MODES.ALL
                              ? handleClearAllSheetSelection
                              : handleClearMultiSheetSelection
                          }
                          disabled={
                            selectionMode === SHEET_SELECTION_MODES.ALL
                              ? !sheets.length
                              : !hasAnyMultiSelected
                          }
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Square className="w-4 h-4 text-gray-400" />
                          Unselect all
                        </button>
                      </div>
                    )}

                    {selectionMode === SHEET_SELECTION_MODES.ALL ? (
                      <div className="px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/40">
                        All sheets selected automatically.
                      </div>
                    ) : null}

                    <div className="max-h-72 overflow-y-auto p-1">
                      {filteredSheets.length ? filteredSheets.map((sheet) => {
                        const isSelected = effectiveSheetIndexes.includes(sheet.index);
                        return (
                          <button
                            key={sheet.index}
                            type="button"
                            onClick={() => {
                              if (selectionMode === SHEET_SELECTION_MODES.SINGLE) {
                                setSheetIndex(sheet.index);
                                setIsSelectorOpen(false);
                                return;
                              }
                              if (selectionMode === SHEET_SELECTION_MODES.ALL) {
                                const remainingIndexes = sheets
                                  .map((item) => item.index)
                                  .filter((idx) => idx !== sheet.index);
                                setSelectionMode(SHEET_SELECTION_MODES.MULTIPLE);
                                setMultiSheetIndexes(remainingIndexes);
                                return;
                              }
                              handleToggleMultiSheet(sheet.index);
                            }}
                            className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
                              isSelected
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2 min-w-0">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 shrink-0 text-gray-400" />
                              )}
                              <span className="truncate text-sm font-medium">
                                Sheet {sheet.label} ({sheet.qrCount} QRs)
                              </span>
                            </span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                              INR {formatAmount(sheet.amount)}
                            </span>
                          </button>
                        );
                      }) : (
                        <div className="px-3 py-6 text-xs text-center text-gray-500 dark:text-gray-400">
                          No sheets match your search.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 min-h-[16px]">
                {selectionMode === SHEET_SELECTION_MODES.SINGLE
                  ? `Selected: Sheet ${selectedSheet?.label || toRoman(sheetIndex + 1)}`
                  : `${effectiveSheetIndexes.length} sheet(s) selected | ${selectedQrCount} QRs`}
              </p>
            </div>

            <div className="sm:col-span-3 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block pl-1">
                Cashback (INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={cashbackAmount}
                  onChange={(e) => setCashbackAmount(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 px-4 text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-gray-400 hover:bg-white dark:hover:bg-zinc-800 font-sans"
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 min-h-[32px]">
                Add per-sheet amount. Estimated total increment: INR{" "}
                {formatAmount(totalIncrementPreview)}.
              </p>
            </div>

            <div className="sm:col-span-3 space-y-2">
              <label className="text-[10px] font-bold text-transparent select-none uppercase tracking-wider block pl-1">
                Action
              </label>
              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  assigningSheet === campaign.id ||
                  !cashbackAmount ||
                  !effectiveSheetIndexes.length
                }
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {assigningSheet === campaign.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {selectionMode === SHEET_SELECTION_MODES.SINGLE
                      ? "Save Changes"
                      : `Apply to ${effectiveSheetIndexes.length} Sheets`}
                    <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 min-h-[32px]">
                Applies to {effectiveSheetIndexes.length || 0} selected sheet(s).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default PostpaidSheetManager;

