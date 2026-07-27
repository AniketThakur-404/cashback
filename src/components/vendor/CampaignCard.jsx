import React, { useState } from "react";
import {
  Download,
  FileText,
  Eye,
  Ban,
  Edit2,
  LoaderCircle,
  Archive,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../ui";
import {
  updateVendorCampaign,
  getVendorInvoices,
  downloadVendorInvoicePdf,
} from "../../lib/api";
import {
  formatAmount,
  formatShortDate,
  parseNumericValue,
  buildAllocationGroups,
} from "../../lib/vendorUtils";
import PostpaidSheetManager from "./PostpaidSheetManager";

const CampaignCard = React.memo(
  ({
    campaign,
    campaignStats,
    token,
    onDownloadQr,
    onViewDetails,
    onDelete,
    deletingCampaignId,
    isDownloadingPdf,
    onStartBulkExport,
    campaignExportJob,
    isStartingBulkExportId,
    onDownloadReadyExport,
    loadCampaigns,
  }) => {
    const { success, error: toastError } = useToast();
    const [editingDates, setEditingDates] = useState(false);
    const [dateForm, setDateForm] = useState({
      startDate: campaign.startDate
        ? new Date(campaign.startDate).toISOString().slice(0, 10)
        : "",
      endDate: campaign.endDate
        ? new Date(campaign.endDate).toISOString().slice(0, 10)
        : "",
    });
    const [savingDates, setSavingDates] = useState(false);

    // --- Campaign Calculations ---
    const allocationGroups = buildAllocationGroups(campaign.allocations);
    const totalQty = allocationGroups.reduce(
      (sum, group) => sum + group.quantity,
      0,
    );
    const fallbackBudget = allocationGroups.reduce(
      (sum, group) => sum + group.totalBudget,
      0,
    );

    const totalBudget = parseNumericValue(
      campaign.subtotal,
      parseNumericValue(campaign.totalBudget, fallbackBudget),
    );

    const statsTotal = Number(campaignStats.totalQRsOrdered);
    const statsRedeemed = Number(campaignStats.totalUsersJoined);
    const fundedPostpaidQty = Array.isArray(campaign.allocations)
      ? campaign.allocations.reduce((sum, allocation) => {
          const quantity = Number.parseInt(allocation?.quantity, 10) || 0;
          const cashbackAmount = parseNumericValue(
            allocation?.cashbackAmount,
            0,
          );
          return cashbackAmount > 0 ? sum + quantity : sum;
        }, 0)
      : 0;

    const totalCount = Number.isFinite(statsTotal)
      ? Math.max(statsTotal, totalQty)
      : totalQty;
    const redeemedCount = Number.isFinite(statsRedeemed) ? statsRedeemed : 0;
    const activeBase =
      campaign.planType === "postpaid" ? fundedPostpaidQty : totalCount;
    const activeCount = Math.max(0, activeBase - redeemedCount);

    const handleSaveDates = async () => {
      try {
        setSavingDates(true);
        await updateVendorCampaign(token, campaign.id, {
          startDate: dateForm.startDate,
          endDate: dateForm.endDate,
        });
        success("Campaign dates updated");
        setEditingDates(false);
        loadCampaigns(token);
      } catch (err) {
        toastError("Error", err?.message || "Failed to update dates");
      } finally {
        setSavingDates(false);
      }
    };

    const handleDownloadInvoice = async () => {
      try {
        const data = await getVendorInvoices(token, {
          campaignId: campaign.id,
        });
        const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
        if (invoices.length > 0) {
          await downloadVendorInvoicePdf(token, invoices[0].id);
        } else {
          alert("No invoices found.");
        }
      } catch (error) {
        alert(error?.message || "Failed to download invoice.");
      }
    };

    const isBulkExportStarting = isStartingBulkExportId === campaign.id;
    const campaignStatus = String(campaign.status || "active").toLowerCase();
    const isOnHold = campaignStatus === "paused";
    const statusLabel =
      campaignStatus === "paused"
        ? "On Hold"
        : campaignStatus === "pending"
          ? "Pending"
          : campaignStatus === "completed"
            ? "Completed"
            : campaignStatus === "rejected"
              ? "Rejected"
              : "Active";
    const statusBadgeClass =
      campaignStatus === "paused"
        ? "bg-rose-500/15 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
        : campaignStatus === "pending"
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
          : campaignStatus === "completed"
            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            : campaignStatus === "rejected"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
              : "bg-primary/15 text-primary";
    const actionButtonClass = isOnHold
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20"
      : "border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20";
    const actionButtonTitle = isOnHold
      ? "Resume Campaign"
      : "Put Campaign on Hold";

    return (
      <div className={`rounded-2xl border px-4 py-4 shadow-sm transition-all hover:shadow-md ${isOnHold ? "border-rose-500/25 bg-rose-50/55 dark:border-rose-500/20 dark:bg-rose-950/10 hover:border-rose-500/40" : "border-gray-300/20 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/60 hover:border-primary/40"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {campaign.title}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                {statusLabel}
              </span>
            </div>
            {campaign.Product?.name && (
              <div className="text-[11px] font-bold text-primary/80 dark:text-primary/70 uppercase tracking-tight">
                {campaign.Product.name}
              </div>
            )}
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Campaign ID: {campaign.id.slice(0, 10)}...
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end">
            {typeof onStartBulkExport === "function" ? (
              campaignExportJob?.isReady ||
              campaignExportJob?.status === "completed" ? (
                (campaignExportJob.createdAt && campaign.updatedAt && new Date(campaign.updatedAt) > new Date(campaignExportJob.createdAt)) ? (
                  <button
                    type="button"
                    onClick={() => onStartBulkExport(campaign)}
                    disabled={isBulkExportStarting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
                    title="Campaign has been updated. Click to generate a new export."
                  >
                    {isBulkExportStarting ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Update Export
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onDownloadReadyExport &&
                      onDownloadReadyExport(campaignExportJob)
                    }
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <Download size={14} />
                    Download Export
                  </button>
                )
              ) : campaignExportJob?.status === "processing" ||
                campaignExportJob?.status === "queued" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <LoaderCircle size={14} className="animate-spin" />
                  {campaignExportJob.status === "queued"
                    ? "Queued"
                    : `Exporting ${campaignExportJob.progressPercent || 0}%`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartBulkExport(campaign)}
                  disabled={isBulkExportStarting}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
                >
                  {isBulkExportStarting ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {isBulkExportStarting ? "Starting..." : "Download QR Code"}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => onDownloadQr(campaign)}
                disabled={isDownloadingPdf === campaign.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
              >
                <Download size={14} />
                Download QR Code
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold cursor-pointer"
            >
              <FileText size={14} />
              Download Invoice
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(campaign)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-400 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-gray-400 dark:hover:bg-zinc-700 transition-all active:scale-95"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(campaign)}
              disabled={deletingCampaignId === campaign.id}
              className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-colors disabled:opacity-60 ${actionButtonClass}`}
              title={actionButtonTitle}
            >
              {isOnHold ? <RefreshCw size={14} /> : <Ban size={14} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-4">
          <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-3 transition-all hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 text-left">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Budget
            </div>
            <div className="text-sm font-black text-gray-900 dark:text-white">
              INR {formatAmount(totalBudget)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-3 transition-all hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 text-left">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Total QRs
            </div>
            <div className="text-sm font-black text-gray-900 dark:text-white">
              {totalCount || 0}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-3 transition-all hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 text-left">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Active
            </div>
            <div className="text-sm font-black text-gray-900 dark:text-white">
              {activeCount}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-3 transition-all hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 text-left">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Redeemed
            </div>
            <div className="text-sm font-black text-primary">
              {redeemedCount}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 px-1">
          {!editingDates ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Start:
                </span>
                <span>
                  {campaign.startDate
                    ? formatShortDate(campaign.startDate)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  End:
                </span>
                <span>
                  {campaign.endDate ? formatShortDate(campaign.endDate) : "—"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingDates(true)}
                className="inline-flex items-center justify-center h-6 w-6 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Edit2 size={12} />
              </button>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="uppercase tracking-wide font-medium">
                  Start Date
                </span>
                <input
                  type="date"
                  value={dateForm.startDate}
                  onChange={(e) =>
                    setDateForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </label>
              <label className="flex flex-col gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="uppercase tracking-wide font-medium">
                  End Date
                </span>
                <input
                  type="date"
                  value={dateForm.endDate}
                  min={dateForm.startDate}
                  onChange={(e) =>
                    setDateForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </label>
              <button
                type="button"
                disabled={savingDates}
                onClick={handleSaveDates}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingDates ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingDates(false)}
                className="inline-flex items-center px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {campaign.planType === "postpaid" && (
          <PostpaidSheetManager
            campaign={campaign}
            totalQrs={totalCount}
            token={token}
            loadCampaigns={loadCampaigns}
            onDownloadQr={onDownloadQr}
          />
        )}

        {/* Mobile Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-5 sm:hidden border-t border-gray-100 dark:border-zinc-800/50 mt-4">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm active:scale-95"
            title="Download Invoice"
          >
            <FileText size={16} />
          </button>

          {typeof onStartBulkExport === "function" && (
            campaignExportJob?.isReady || campaignExportJob?.status === "completed" ? (
              <button
                type="button"
                onClick={() => onDownloadReadyExport && onDownloadReadyExport(campaignExportJob)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm active:scale-95"
                title="Download Export"
              >
                <Download size={16} />
              </button>
            ) : (campaignExportJob?.status === "processing" || campaignExportJob?.status === "queued") ? (
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
                <LoaderCircle size={16} className="animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onStartBulkExport(campaign)}
                disabled={isBulkExportStarting}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-60 shadow-sm active:scale-95"
                title="Bulk Export"
              >
                {isBulkExportStarting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Archive size={16} />
                )}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onViewDetails(campaign)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(campaign)}
            disabled={deletingCampaignId === campaign.id}
            className={`inline-flex items-center justify-center h-10 w-10 rounded-xl transition-all disabled:opacity-60 shadow-sm active:scale-95 ${actionButtonClass}`}
            title={actionButtonTitle}
          >
            {isOnHold ? <RefreshCw size={16} /> : <Ban size={16} />}
          </button>
        </div>
      </div>
    );
  },
);

export default CampaignCard;










