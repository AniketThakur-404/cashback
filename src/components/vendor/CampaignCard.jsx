import React, { useState } from "react";
import { Download, FileText, Eye, Trash2, Edit2 } from "lucide-react";
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
    loadCampaigns,
    setSheetPaymentData,
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

    const totalCount = Number.isFinite(statsTotal)
      ? Math.max(statsTotal, totalQty)
      : totalQty;
    const redeemedCount = Number.isFinite(statsRedeemed) ? statsRedeemed : 0;
    const activeCount = Math.max(0, totalCount - redeemedCount);

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

    return (
      <div className="rounded-2xl border border-gray-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 px-4 py-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {campaign.title}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wide">
                Active
              </span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              ID: {campaign.id.slice(0, 10)}...
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => onDownloadQr(campaign)}
              disabled={isDownloadingPdf === campaign.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
            >
              <Download size={14} />
              Download QR Code
            </button>
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
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-500/30 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(campaign)}
              disabled={deletingCampaignId === campaign.id}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4 mt-3">
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Budget
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              INR {formatAmount(totalBudget)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Total QRs
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {totalCount || 0}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Active
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeCount}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Redeemed
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
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
            token={token}
            setSheetPaymentData={setSheetPaymentData}
            loadCampaigns={loadCampaigns}
          />
        )}

        {/* Mobile Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 sm:hidden">
          <button
            type="button"
            onClick={() => onDownloadQr(campaign)}
            disabled={isDownloadingPdf === campaign.id}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            onClick={() => onViewDetails(campaign)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-500/30 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(campaign)}
            disabled={deletingCampaignId === campaign.id}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  },
);

export default CampaignCard;

