import React, { useMemo, useState } from "react";
import { useToast } from "../ui";
import { QrCode, ChevronRight, CheckCircle2, RefreshCw } from "lucide-react";
import { assignSheetCashback } from "../../lib/api";
import { toRoman } from "../../lib/vendorUtils";

const PostpaidSheetManager = React.memo(
  ({
    campaign,
    token,
    setSheetPaymentData,
    loadCampaigns,
  }) => {
    const { success, error: toastError } = useToast();
    const [assigningSheet, setAssigningSheet] = useState(null);
    const [sheetIndex, setSheetIndex] = useState(0);
    const [cashbackAmount, setCashbackAmount] = useState("");

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
          amount: s.amount,
        }));
      }

      const sheetCount = Math.ceil(totalQrs / 25);
      return Array.from({ length: sheetCount }, (_, i) => ({
        index: i,
        label: toRoman(i + 1),
        qrCount: Math.min(25, totalQrs - i * 25),
        amount: 0,
      }));
    }, [campaign.sheets, totalQrs]);

    const selectedSheet = useMemo(
      () => sheets.find((s) => s.index === sheetIndex),
      [sheets, sheetIndex],
    );

    const isSelectedSheetPaid = Boolean(selectedSheet?.isPaid);
    const selectedSheetRate = Number.parseFloat(selectedSheet?.amount || 0) || 0;
    const selectedSheetCount = Number.parseInt(selectedSheet?.qrCount, 10) || 0;
    const selectedSheetTotal = Number(
      (selectedSheetRate * selectedSheetCount).toFixed(2),
    );

    const handleAssign = async () => {
      if (!cashbackAmount || assigningSheet) return;

      if (isSelectedSheetPaid) {
        toastError("Error", "This sheet is already paid and can't be recharged.");
        return;
      }

      const enteredAmount = Number.parseFloat(cashbackAmount);
      if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
        toastError("Error", "Enter a valid cashback amount greater than 0.");
        return;
      }

      const targetSheet = selectedSheet;
      const qty = targetSheet?.qrCount || 25;
      const currentAmount = Number.parseFloat(targetSheet?.amount || 0) || 0;
      const targetAmount = Number((currentAmount + enteredAmount).toFixed(2));
      const cashbackIncrementTotal = enteredAmount * qty;

      setAssigningSheet(campaign.id);
      try {
        const result = await assignSheetCashback(token, campaign.id, {
          sheetIndex,
          cashbackAmount: targetAmount,
        });

        success(
          "Success",
          result.message || "Sheet updated! Proceeding to payment...",
        );

        setCashbackAmount("");

        setSheetPaymentData({
          campaignId: campaign.id,
          sheetIndex,
          sheetLabel: targetSheet?.label || toRoman(sheetIndex + 1),
          amount: targetAmount,
          count: qty,
          totalCost: cashbackIncrementTotal,
          breakdown: {
            cashback: cashbackIncrementTotal,
            tech: 0,
            voucher: 0,
          },
        });

        loadCampaigns(token);
      } catch (err) {
        toastError("Error", err.message || "Failed to update sheet.");
      } finally {
        setAssigningSheet(null);
      }
    };

    if (sheets.length === 0) return null;

    return (
      <div className="mt-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-all hover:shadow-md">
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

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div
              className={isSelectedSheetPaid ? "sm:col-span-12" : "sm:col-span-6"}
            >
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block pl-1">
                Select Target Sheet
              </label>
              <div className="relative">
                <select
                  value={sheetIndex}
                  onChange={(e) => setSheetIndex(parseInt(e.target.value, 10))}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 px-3 pl-4 pr-8 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:bg-white dark:hover:bg-zinc-800 font-sans"
                >
                  {sheets.map((s) => (
                    <option
                      key={s.index}
                      value={s.index}
                      className="text-gray-900 dark:text-gray-100 py-1"
                    >
                      Sheet {s.label} ({s.qrCount} QRs)
                      {s.amount > 0 ? ` - INR ${s.amount}` : ""}
                      {s.isPaid ? " - Paid" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {!isSelectedSheetPaid && (
              <>
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block pl-1">
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
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={assigningSheet === campaign.id || !cashbackAmount}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    {assigningSheet === campaign.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Save Changes
                        <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {isSelectedSheetPaid && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                      Sheet {selectedSheet?.label || toRoman(sheetIndex + 1)} already paid
                    </p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      INR {selectedSheetRate.toFixed(2)} per QR | {selectedSheetCount} QRs | Total INR {selectedSheetTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-300/80 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/20">
                  Locked
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default PostpaidSheetManager;
