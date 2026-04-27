import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "../ui";
import { updatePostpaidCampaignBatches } from "../../lib/api";
import { ConfirmModal } from "../ui/ConfirmModal";

const normalizeAmount = (value) => {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Number(numeric.toFixed(2));
};

const formatAmount = (value) => normalizeAmount(value).toFixed(2);

const parseQuantity = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

const createBatchRow = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2, 10),
  quantity: "",
  amount: "",
  redeemedQrs: 0,
  isPersisted: false,
  ...overrides,
});

const formatBatchRange = (start, quantity) => {
  if (
    !Number.isFinite(start) ||
    start < 0 ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return "No QRs selected";
  }

  const rangeStart = start + 1;
  const rangeEnd = start + quantity;
  return rangeStart === rangeEnd
    ? `QR ${rangeStart}`
    : `QRs ${rangeStart}-${rangeEnd}`;
};

const serializeBatchRows = (rows) =>
  JSON.stringify(
    rows
      .filter((row) => row.quantityValue > 0 && normalizeAmount(row.amount) > 0)
      .map((row) => ({
        id: row.id,
        quantity: row.quantityValue,
        cashbackAmount: normalizeAmount(row.amount),
      })),
  );

const BatchCard = ({
  batch,
  canRemove,
  canDownload,
  isSaving,
  remainingForRow,
  onChange,
  onDelete,
  onDownload,
}) => {
  const dirtyLabel = batch.isPersisted && batch.isDirty ? "Edited" : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Background Accent */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start justify-between">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-400">
            <QrCode size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h4 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                Batch {batch.batchNumber}
              </h4>
              {batch.isPersisted && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  Saved
                </span>
              )}
              {dirtyLabel && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-amber-600 dark:text-amber-400">
                  <Pencil size={12} />
                  {dirtyLabel}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
              Range: {formatBatchRange(batch.start, batch.quantityValue)}
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          {canDownload && typeof onDownload === "function" && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-xs font-black text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400 active:scale-95 shadow-sm"
            >
              <Download size={16} />
              Download
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-500/20 disabled:opacity-50 active:scale-95 shadow-sm"
              title="Remove batch"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Integrated Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-4">
        <div className="bg-white p-3 dark:bg-zinc-900">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            QR Range
          </p>
          <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
            {formatBatchRange(batch.start, batch.quantityValue)}
          </p>
        </div>
        <div className="bg-white p-3 dark:bg-zinc-900">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Quantity
          </p>
          <p className="text-xs font-black text-gray-900 dark:text-gray-100">
            {batch.quantityValue || 0} QRs
          </p>
        </div>
        <div className="bg-white p-3 dark:bg-zinc-900">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-1">
            Redeemed
          </p>
          <p className="text-xs font-black text-amber-500">
            {batch.redeemedQrs || 0}
          </p>
        </div>
        <div className="bg-white p-3 dark:bg-zinc-900">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80 mb-1">
            Cashback
          </p>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            ₹{formatAmount(batch.amount)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
            QR Quantity
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={Math.max(remainingForRow, 0)}
              inputMode="numeric"
              value={batch.quantity}
              onChange={(event) =>
                onChange(
                  batch.id,
                  "quantity",
                  event.target.value.replace(/[^\d]/g, ""),
                )
              }
              placeholder={`Max ${remainingForRow}`}
              disabled={isSaving}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-gray-100 dark:focus:bg-zinc-800"
            />
          </div>
        </div>        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
            Cashback (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={batch.amount}
              onChange={(event) =>
                onChange(batch.id, "amount", event.target.value)
              }
              placeholder="0.00"
              disabled={isSaving}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-gray-100 dark:focus:bg-zinc-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PostpaidSheetManager = React.memo(
  ({
    campaign,
    totalQrs: totalQrsProp,
    token,
    loadCampaigns,
    onDownloadQr,
  }) => {
    const { success, error: toastError } = useToast();
    const [batchRows, setBatchRows] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [batchPendingDelete, setBatchPendingDelete] = useState(null);

    const normalizedAllocations = useMemo(() => {
      if (!Array.isArray(campaign?.allocations)) return [];
      return campaign.allocations
        .map((allocation) => ({
          ...allocation,
          quantity: parseQuantity(allocation?.quantity),
          cashbackAmount: normalizeAmount(allocation?.cashbackAmount),
        }))
        .filter((allocation) => allocation.quantity > 0);
    }, [campaign?.allocations]);

    const totalQrs = useMemo(
      () => totalQrsProp || campaign?.totalQrCount || 0,
      [totalQrsProp, campaign?.totalQrCount],
    );

    const persistedBatches = useMemo(
      () =>
        normalizedAllocations
          .filter((allocation) => allocation.cashbackAmount > 0)
          .map((allocation) => ({
            id: allocation.id || Math.random().toString(36).slice(2, 10),
            quantity: String(allocation.quantity),
            amount: formatAmount(allocation.cashbackAmount),
            redeemedQrs:
              allocation.redeemedQrs || allocation.redeemedCount || 0,
            isPersisted: true,
          })),
      [normalizedAllocations],
    );

    useEffect(() => {
      const initialRows = persistedBatches.length
        ? persistedBatches
        : [createBatchRow()];

      setBatchRows(initialRows);
    }, [campaign?.id, persistedBatches]);

    const getRowViews = (rows) => {
      let cursor = 0;

      const serverMap = new Map(
        persistedBatches.map((batch) => [
          batch.id,
          {
            quantity: parseQuantity(batch.quantity),
            amount: normalizeAmount(batch.amount),
          },
        ]),
      );

      return rows.map((row, index) => {
        const quantityValue = parseQuantity(row.quantity);
        const amountValue = normalizeAmount(row.amount);
        const start = cursor;
        if (quantityValue > 0) {
          cursor += quantityValue;
        }

        const persistedSnapshot = serverMap.get(row.id);
        const isDirty = Boolean(
          row.isPersisted &&
          persistedSnapshot &&
          (persistedSnapshot.quantity !== quantityValue ||
            persistedSnapshot.amount !== amountValue),
        );

        return {
          ...row,
          batchNumber: index + 1,
          quantityValue,
          amountValue,
          start,
          isDirty,
        };
      });
    };

    const rowViews = useMemo(
      () => getRowViews(batchRows),
      [batchRows, persistedBatches],
    );

    const savedSignature = useMemo(() => {
      let cursor = 0;
      const normalizedRows = persistedBatches.map((row) => {
        const quantityValue = parseQuantity(row.quantity);
        const next = {
          id: row.id,
          quantityValue,
          amount: row.amount,
          start: cursor,
        };
        cursor += quantityValue;
        return next;
      });

      return serializeBatchRows(normalizedRows);
    }, [persistedBatches]);

    const currentSignature = useMemo(
      () => serializeBatchRows(rowViews),
      [rowViews],
    );
    const hasUnsavedChanges = currentSignature !== savedSignature;

    const totalAssignedPreview = useMemo(
      () => rowViews.reduce((sum, row) => sum + row.quantityValue, 0),
      [rowViews],
    );

    const remainingQty = Math.max(0, totalQrs - totalAssignedPreview);

    const totalIncrementPreview = useMemo(
      () =>
        rowViews.reduce(
          (sum, row) => sum + row.quantityValue * normalizeAmount(row.amount),
          0,
        ),
      [rowViews],
    );

    const handleChangeRow = (id, field, value) => {
      setBatchRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    };

    const getNextRowsAfterDelete = (rows, id) => {
      const nextRows = rows.filter((row) => row.id !== id);
      return nextRows.length > 0 ? nextRows : [createBatchRow()];
    };

    const handleAddRow = () => {
      if (remainingQty <= 0) return;
      setBatchRows((prev) => [...prev, createBatchRow()]);
    };

    const persistBatchRows = async (
      rows,
      {
        allowEmpty = false,
        successTitle = "Batches updated",
        successMessage,
      } = {},
    ) => {
      if (isSaving) return;

      const nextRowViews = getRowViews(rows);
      const hasPartialInput = nextRowViews.some((row) => {
        const hasQuantity = row.quantity !== "";
        const hasAmount = row.amount !== "";
        return hasQuantity !== hasAmount;
      });

      if (hasPartialInput) {
        toastError(
          "Incomplete batch",
          "Enter both quantity and cashback amount for each batch row.",
        );
        return;
      }

      const positiveRows = nextRowViews.filter(
        (row) => row.quantityValue > 0 && row.amountValue > 0,
      );

      if (!positiveRows.length && !allowEmpty) {
        toastError(
          "No batch added",
          "Add at least one valid batch before saving.",
        );
        return;
      }

      const assignedQty = nextRowViews.reduce(
        (sum, row) => sum + row.quantityValue,
        0,
      );

      if (assignedQty > totalQrs) {
        toastError(
          "Quantity exceeded",
          `Batch quantity exceeds campaign inventory. Only ${totalQrs} QRs are available.`,
        );
        return;
      }

      setIsSaving(true);
      try {
        const response = await updatePostpaidCampaignBatches(
          token,
          campaign.id,
          positiveRows.map((row) => ({
            id: row.id,
            quantity: row.quantityValue,
            cashbackAmount: row.amountValue,
          })),
        );

        success(
          successTitle,
          successMessage ||
            response?.message ||
            (positiveRows.length
              ? "Postpaid batches updated successfully."
              : "Postpaid batches cleared successfully."),
        );
        setBatchRows(rows);
        setBatchPendingDelete(null);
        await loadCampaigns(token);
        return true;
      } catch (error) {
        toastError(
          "Save failed",
          error.message || "Failed to update postpaid batches.",
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const handleApply = async () => {
      await persistBatchRows(batchRows);
    };

    const handleConfirmDelete = async () => {
      if (!batchPendingDelete) return;

      const nextRows = getNextRowsAfterDelete(batchRows, batchPendingDelete.id);

      if (!batchPendingDelete.isPersisted) {
        setBatchRows(nextRows);
        setBatchPendingDelete(null);
        return;
      }

      await persistBatchRows(nextRows, {
        allowEmpty: true,
        successTitle: "Batch removed",
        successMessage: `Batch ${batchPendingDelete.batchNumber} removed successfully.`,
      });
    };

    if (totalQrs <= 0) return null;

    return (
      <div className="mt-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/30 px-6 py-5 dark:border-zinc-800/50 dark:bg-zinc-800/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-400">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                Assign Cashback by Batch
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Configure your QR campaigns in batches. <br className="hidden sm:block" />
                Edit quantity and cashback values below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {remainingQty}
              </p>
              <p className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/60 uppercase">
                QRs Left
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Recharge Batches
              </p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                  {totalAssignedPreview} / {totalQrs} Assigned
                </p>
                {hasUnsavedChanges && (
                  <p className="flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-tight text-amber-600 dark:text-amber-400">
                    <RefreshCw size={10} className="animate-spin-slow" />
                    Unsaved Changes
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {rowViews.map((row, index) => {
              const reservedBefore = rowViews
                .slice(0, index)
                .reduce((sum, item) => sum + item.quantityValue, 0);
              const remainingForRow = Math.max(0, totalQrs - reservedBefore);

              return (
                <BatchCard
                  key={row.id}
                  batch={row}
                  canRemove={rowViews.length > 1}
                  canDownload={
                    row.isPersisted &&
                    !hasUnsavedChanges &&
                    row.quantityValue > 0 &&
                    typeof onDownloadQr === "function"
                  }
                  isSaving={isSaving}
                  remainingForRow={remainingForRow}
                  onChange={handleChangeRow}
                  onDelete={() => setBatchPendingDelete(row)}
                  onDownload={() =>
                    onDownloadQr(campaign, {
                      offset: row.start,
                      limit: row.quantityValue,
                      onlyRecharged: true,
                      statusLabel: `Batch ${row.batchNumber}`,
                    })
                  }
                />
              );
            })}
          </div>

          {remainingQty > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/30 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/20 dark:text-gray-500 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Add Another Batch
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 border-t border-gray-100 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Total Cashback
              </p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                INR {formatAmount(totalIncrementPreview)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleApply}
              disabled={isSaving || !hasUnsavedChanges}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        <ConfirmModal
          isOpen={!!batchPendingDelete}
          onClose={() => setBatchPendingDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Remove batch?"
          message={
            batchPendingDelete
              ? `Remove Batch ${batchPendingDelete.batchNumber}? This will update the saved batch layout immediately.`
              : ""
          }
          confirmText="Remove"
          cancelText="Keep"
          type="danger"
          loading={isSaving}
        />
      </div>
    );
  },
);

export default PostpaidSheetManager;
