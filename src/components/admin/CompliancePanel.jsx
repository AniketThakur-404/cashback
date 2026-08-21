import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  TrendingDown,
  Calendar,
  Building2,
  Users,
  BarChart2,
  Banknote,
  Link,
  Check,
  X,
  Pause,
  Play,
  QrCode,
  Search,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Copy,
  ExternalLink,
  UserCheck,
  Coins,
  ArrowUpRight,
  FolderOpen,
} from "lucide-react";

// ── Styles shared with AdminDashboard ──────────────────────────────────────
const panelClass =
  "bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl shadow-sm transition-all duration-200";
const cardClass =
  "bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl p-5 shadow-sm";
const inputClass =
  "px-3 py-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#059669] transition-colors";
const selectClass =
  "px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a221c] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#059669] transition-colors cursor-pointer";
const primaryBtnClass =
  "px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold shadow-sm shadow-[#059669]/20 transition-all inline-flex items-center gap-2";
const ghostBtnClass =
  "px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 font-medium transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-white inline-flex items-center gap-2";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => {
  if (v === undefined || v === null) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v);
};
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-IN");
};
const durationDays = (start, end) => {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  if (isNaN(ms)) return "—";
  return `${Math.ceil(ms / 86400000)} days`;
};
const statusColor = (s) => {
  const m = {
    active: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    redeemed: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    success: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    pending: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
    paused: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
    rejected: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10",
    blocked: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10",
    inactive: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5",
    completed: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  };
  return m[String(s || "").toLowerCase()] || "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5";
};

// ── Copy Helper ────────────────────────────────────────────────────────────
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text || text === "—") return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label || "text"}`}
      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
};

// ── CSV Export helper ──────────────────────────────────────────────────────
const downloadCSV = (rows, headers, filename) => {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  setTimeout(() => { a.click(); a.remove(); URL.revokeObjectURL(url); }, 0);
};

const downloadStyledExcel = ({
  table1Headers,
  table1Rows,
  table2Headers,
  table2Rows,
  filename = "compliance_report.xls",
}) => {
  const table1Html = `
    <table border="1" style="border-collapse:collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin-bottom: 20px;">
      <thead>
        <tr>
          ${table1Headers
            .map(
              (h) =>
                `<th style="background-color:#C6EFCE; color:#006100; font-weight:bold; border:1px solid #70AD47; padding:8px 12px; text-align:left;">${h}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${table1Rows
          .map(
            (row) => `
          <tr>
            ${row
              .map(
                (cell) =>
                  `<td style="border:1px solid #D9D9D9; padding:6px 10px; mso-number-format:'\\@';">${cell ?? "—"}</td>`
              )
              .join("")}
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  const table2Html = `
    <table border="1" style="border-collapse:collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
      <thead>
        <tr>
          ${table2Headers
            .map(
              (h) =>
                `<th style="background-color:#C6EFCE; color:#006100; font-weight:bold; border:1px solid #70AD47; padding:8px 12px; text-align:left;">${h}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${table2Rows
          .map(
            (row) => `
          <tr>
            ${row
              .map(
                (cell) =>
                  `<td style="border:1px solid #D9D9D9; padding:6px 10px; mso-number-format:'\\@';">${cell ?? "—"}</td>`
              )
              .join("")}
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  const fullHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Compliance Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      ${table1Html}
      <br/>
      ${table2Html}
    </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") || filename.endsWith(".xlsx") ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  setTimeout(() => {
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
};

// ── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: "approval",    label: "Campaign Approval",      icon: CheckCircle2  },
  { id: "redemptions", label: "QR Redemptions & Users", icon: QrCode        },
  { id: "mapping",     label: "Payout Mapping",          icon: Link          },
  { id: "validation",  label: "API Validation Rules",    icon: ShieldCheck   },
  { id: "budgets",     label: "Budget Controls",         icon: BarChart2     },
  { id: "exceptions",  label: "Exception Report",        icon: AlertTriangle },
  { id: "report",      label: "Monthly Report",          icon: FileText      },
];

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color = "text-slate-900 dark:text-white", sub, icon: Icon }) => (
  <div className={cardClass}>
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {Icon && <Icon size={16} className="text-slate-400 dark:text-slate-500" />}
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Empty state ────────────────────────────────────────────────────
const Empty = ({ message = "No data available." }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 gap-3">
    <FileText size={36} strokeWidth={1.2} />
    <p className="text-sm">{message}</p>
  </div>
);

// ── Table shell ────────────────────────────────────────────────────
const Table = ({ heads, children, empty }) => (
  <div className={`${panelClass} overflow-hidden`}>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-white/[0.04]">
          <tr>
            {heads.map((h) => (
              <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {children}
        </tbody>
      </table>
      {empty && <Empty message={empty} />}
    </div>
  </div>
);
const Td = ({ children, className = "" }) => (
  <td className={`py-3 px-4 text-slate-700 dark:text-slate-300 ${className}`}>{children}</td>
);
const Badge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(status)}`}>
    {status || "—"}
  </span>
);

// ── User Details Modal ─────────────────────────────────────────────
const UserRedemptionModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111813] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#059669] flex items-center justify-center font-bold text-base">
              {String(user.beneficiaryName || "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {user.beneficiaryName || "Redeemed User Details"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User ID: <span className="font-mono">{user.beneficiaryId || "—"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Profile Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">Account Status</span>
              <div className="flex items-center gap-2 pt-0.5">
                <Badge status={user.userStatus} />
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">Cashback Redeemed</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(user.amount)}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact &amp; Identification</h4>
            <div className="rounded-xl border border-slate-200/70 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 text-sm">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Phone size={14} />
                  <span>Mobile Number</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white font-medium">
                  {user.mobileNumber || "—"}
                  <CopyButton text={user.mobileNumber} label="Phone Number" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Mail size={14} />
                  <span>Email Address</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                  {user.beneficiaryEmail || "—"}
                  <CopyButton text={user.beneficiaryEmail} label="Email" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <CreditCard size={14} />
                  <span>UPI / Payout Method</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white font-medium">
                  {user.upiId || user.payoutMethod || "—"}
                  <CopyButton text={user.upiId || user.payoutMethod} label="UPI ID" />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign & Vendor Redemption Meta */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Redemption Details</h4>
            <div className="rounded-xl border border-slate-200/70 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 text-sm">
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 dark:text-slate-400">Corporate / Vendor</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.vendorName || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 dark:text-slate-400">Campaign Title</span>
                <span className="font-medium text-slate-900 dark:text-white">{user.campaignName || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 dark:text-slate-400">Voucher / QR Code</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                  {user.voucherNo || "—"}
                  <CopyButton text={user.voucherNo} label="Voucher Code" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin size={14} />
                  <span>Location</span>
                </div>
                <span className="text-slate-900 dark:text-white">
                  {[user.city, user.state, user.pincode].filter(Boolean).join(", ") || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  <span>Redeemed At</span>
                </div>
                <span className="text-slate-900 dark:text-white text-xs">{fmtDateTime(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 flex justify-end bg-slate-50/50 dark:bg-white/[0.02]">
          <button onClick={onClose} className={ghostBtnClass}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Campaign Redeemed Users Modal ──────────────────────────────────────────
const CampaignRedeemedUsersModal = ({ campaign, vendorName, beneficiaries = [], token, apiBase, onClose, onSelectUser }) => {
  if (!campaign) return null;

  const fallbackList = beneficiaries.filter(
    (b) =>
      b.campaignId === campaign.id ||
      (b.campaignName && campaign.title && b.campaignName.toLowerCase() === campaign.title.toLowerCase())
  );

  const [list, setList] = useState(fallbackList);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaign?.id || !token || !apiBase) return;
    let isMounted = true;
    setLoading(true);

    fetch(`${apiBase}/api/admin/compliance/beneficiary-report?campaignId=${encodeURIComponent(campaign.id)}&limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { beneficiaries: [] }))
      .then((data) => {
        if (isMounted) {
          if (data.beneficiaries && data.beneficiaries.length > 0) {
            setList(data.beneficiaries);
          } else if (fallbackList.length > 0) {
            setList(fallbackList);
          }
        }
      })
      .catch(() => {
        if (isMounted && fallbackList.length > 0) setList(fallbackList);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [campaign?.id, token, apiBase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111813] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-[#059669] flex items-center justify-center font-bold shadow-sm">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Redeemed Users for "{campaign.title}"
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
                  {list.length} {list.length === 1 ? "Redemption" : "Redemptions"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Corporate: <strong className="text-slate-700 dark:text-slate-200">{vendorName}</strong></span>
                <span>•</span>
                <span>Max Budget: <strong className="text-slate-700 dark:text-slate-200">₹{fmt(campaign.totalBudget)}</strong></span>
                {campaign.startDate && (
                  <>
                    <span>•</span>
                    <span>Valid: <span className="font-mono">{fmtDate(campaign.startDate)} – {fmtDate(campaign.endDate)}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {list.length > 0 && (
              <button
                onClick={() =>
                  downloadCSV(
                    list.map((b) => [
                      b.beneficiaryName || "Verified User",
                      b.mobileNumber || "—",
                      b.beneficiaryEmail || "—",
                      b.upiId || b.payoutMethod || "Instant Payout",
                      vendorName,
                      campaign.title,
                      b.voucherNo,
                      fmt(b.amount),
                      b.redemptionStatus || "redeemed",
                      [b.city, b.state, b.pincode].filter(Boolean).join(" ") || "In-Store / Direct",
                      fmtDateTime(b.createdAt),
                    ]),
                    [
                      "User Name",
                      "Mobile Number",
                      "Email",
                      "UPI / Payout ID",
                      "Corporate / Vendor",
                      "Campaign",
                      "Voucher QR Hash",
                      "Amount (₹)",
                      "Status",
                      "Location",
                      "Redeemed At",
                    ],
                    `${vendorName}_${campaign.title}_redeemed_users.csv`
                  )
                }
                className={ghostBtnClass}
              >
                <Download size={13} /> Export CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
              <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[#059669]" />
              <p className="font-medium text-slate-600 dark:text-slate-300">Loading verified redemption records…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <QrCode size={36} className="mx-auto mb-2.5 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No redemptions found for this campaign yet.</p>
              <p className="text-xs text-slate-400 mt-1">Once users scan and redeem QR codes, complete profiles will appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Beneficiary / User</th>
                    <th className="py-3 px-4">Contact &amp; Payout Method</th>
                    <th className="py-3 px-4">Voucher QR Code</th>
                    <th className="py-3 px-4">Cashback</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Redeemed At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                  {list.map((b, idx) => {
                    const displayName = b.beneficiaryName && b.beneficiaryName !== "Unknown User" ? b.beneficiaryName : "Verified Customer";
                    const hasPhone = b.mobileNumber && b.mobileNumber !== "—" && b.mobileNumber !== "";
                    const hasEmail = b.beneficiaryEmail && b.beneficiaryEmail !== "—" && b.beneficiaryEmail !== "";
                    const hasUpi = b.upiId && b.upiId !== "—" && b.upiId !== "";
                    const locationStr = [b.city, b.state, b.pincode].filter(Boolean).join(", ");

                    return (
                      <tr key={b.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        {/* 1. User / Beneficiary */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#059669] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {String(displayName).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{displayName}</span>
                                <Badge status={b.userStatus || "active"} />
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {b.beneficiaryId ? `ID: ${b.beneficiaryId.slice(0, 8)}…` : "Verified Beneficiary"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Contact & Payout */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {hasPhone ? (
                              <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white">
                                <Phone size={11} className="text-slate-400 flex-shrink-0" />
                                <span>{b.mobileNumber}</span>
                                <CopyButton text={b.mobileNumber} label="Phone" />
                              </div>
                            ) : null}
                            {hasEmail ? (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <Mail size={11} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[140px]">{b.beneficiaryEmail}</span>
                              </div>
                            ) : null}
                            {hasUpi ? (
                              <div className="flex items-center gap-1.5 font-mono text-slate-800 dark:text-slate-200">
                                <CreditCard size={11} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[140px]" title={b.upiId}>
                                  {b.upiId}
                                </span>
                                <CopyButton text={b.upiId} label="UPI" />
                              </div>
                            ) : (
                              !hasPhone && !hasEmail && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                                  <ShieldCheck size={11} /> Instant UPI Payout
                                </span>
                              )
                            )}
                          </div>
                        </td>

                        {/* 3. Voucher QR Hash */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                            <span className="truncate max-w-[120px]" title={b.voucherNo}>
                              {b.voucherNo || "—"}
                            </span>
                            <CopyButton text={b.voucherNo} label="QR Hash" />
                          </div>
                        </td>

                        {/* 4. Cashback Amount */}
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-sm">
                          ₹{fmt(b.amount)}
                        </td>

                        {/* 5. Location */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[120px]" title={locationStr || "In-Store / Direct"}>
                              {locationStr || "In-Store / Direct"}
                            </span>
                          </div>
                        </td>

                        {/* 6. Redeemed At */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {fmtDateTime(b.createdAt)}
                        </td>

                        {/* 7. Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectUser && onSelectUser(b)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MODAL: Export Compliance Report (Multi-Month Selection & Dual Table CSV)
// ═══════════════════════════════════════════════════════════════════════════
const ComplianceExportModal = ({
  isOpen,
  onClose,
  campaigns,
  beneficiaries,
  availableYears,
}) => {
  const [selectedYear, setSelectedYear] = useState(
    availableYears[0] ? String(availableYears[0]) : "2026"
  );
  const [selectedMonths, setSelectedMonths] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  if (!isOpen) return null;

  const ALL_MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleToggleMonth = (mVal) => {
    setSelectedMonths((prev) =>
      prev.includes(mVal) ? prev.filter((m) => m !== mVal) : [...prev, mVal]
    );
  };

  const handleSelectAll = () => {
    setSelectedMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const handleClearAll = () => {
    setSelectedMonths([]);
  };

  const handleExport = () => {
    const selYear = Number(selectedYear);

    // 1. Filter campaigns active in the selected months and year
    const matchedCampaigns = campaigns.filter((c) => {
      const cStart = c.startDate ? new Date(c.startDate) : null;
      const cEnd = c.endDate ? new Date(c.endDate) : null;

      return selectedMonths.some((m) => {
        const monthStart = new Date(selYear, m - 1, 1);
        const monthEnd = new Date(selYear, m, 0, 23, 59, 59, 999);

        if (cStart && cEnd) return cStart <= monthEnd && cEnd >= monthStart;
        if (cStart) return cStart.getFullYear() === selYear && cStart.getMonth() + 1 === m;
        return true;
      });
    });

    const matchedCampaignIds = new Set(matchedCampaigns.map((c) => c.id).filter(Boolean));
    const matchedCampaignTitles = new Set(matchedCampaigns.map((c) => c.title?.toLowerCase()).filter(Boolean));

    // 2. Filter beneficiaries corresponding to matched campaigns or selected dates
    const matchedBeneficiaries = beneficiaries.filter((b) => {
      const bDate = b.createdAt ? new Date(b.createdAt) : null;
      const matchCamp =
        (b.campaignId && matchedCampaignIds.has(b.campaignId)) ||
        (b.campaignName && matchedCampaignTitles.has(b.campaignName.toLowerCase()));

      if (matchCamp) return true;

      if (bDate && !isNaN(bDate.getTime())) {
        return (
          bDate.getFullYear() === selYear &&
          selectedMonths.includes(bDate.getMonth() + 1)
        );
      }
      return false;
    });

    // 3. Build Table 1 Rows (Corporate / Campaign Summary)
    // Table 1 Headers: Corporate Name | Campaign Start Date | Campiage Duration | Max value of campaign | No of vouchers
    const table1Headers = [
      "Corporate Name",
      "Campaign Start Date",
      "Campiage Duration",
      "Max value of campaign",
      "No of vouchers",
    ];

    const table1Rows = matchedCampaigns.map((c) => [
      c.brandName || c.vendorName || "—",
      fmtDate(c.startDate),
      durationDays(c.startDate, c.endDate),
      `₹${fmt(c.totalBudget)}`,
      c.totalQrs ?? 0,
    ]);

    // 4. Build Table 2 Rows (Beneficiary Redemptions)
    // Table 2 Headers: Corporate Name | Campaign Name | Voucher No | Ben Name | Amount | Redemption status | Ben Mobile number
    const table2Headers = [
      "Corporate Name",
      "Campaign Name",
      "Voucher No",
      "Ben Name",
      "Amount",
      "Redemption status",
      "Ben Mobile number",
    ];

    const table2Rows = matchedBeneficiaries.map((b) => {
      const matchedCamp = campaigns.find(
        (c) =>
          c.id === b.campaignId ||
          (b.campaignName && c.title?.toLowerCase() === b.campaignName.toLowerCase())
      );
      const corporateName =
        matchedCamp?.brandName ||
        (b.brandName && b.brandName !== "go hype" ? b.brandName : null) ||
        (b.vendorName && b.vendorName !== "go hype" ? b.vendorName : null) ||
        matchedCamp?.vendorName ||
        "—";

      return [
        corporateName,
        b.campaignName || "—",
        b.voucherNo || "—",
        b.beneficiaryName && b.beneficiaryName !== "Unknown User" ? b.beneficiaryName : "Verified User",
        b.amount != null ? `₹${fmt(b.amount)}` : "—",
        b.redemptionStatus || "redeemed",
        b.mobileNumber || "—",
      ];
    });

    const filename = `compliance_report_${selectedYear}_${selectedMonths.length}_months.xls`;
    downloadStyledExcel({
      table1Headers,
      table1Rows,
      table2Headers,
      table2Rows,
      filename,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#059669] flex items-center justify-center">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Export Compliance Report
              </h3>
              <p className="text-xs text-slate-400">
                Select Year and Months to generate styled Excel report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Year Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`${selectClass} w-full text-sm font-semibold`}
              >
                {availableYears.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Months ({selectedMonths.length} of 12 selected)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 12 Months Grid Checkboxes */}
            <div className="grid grid-cols-3 gap-2">
              {ALL_MONTHS.map((m) => {
                const isChecked = selectedMonths.includes(m.value);
                return (
                  <label
                    key={m.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      isChecked
                        ? "border-[#059669] bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold"
                        : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleMonth(m.value)}
                      className="rounded border-slate-300 text-[#059669] focus:ring-[#059669]"
                    />
                    <span>{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Format preview box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.05] border border-emerald-200/60 dark:border-emerald-500/20 text-xs space-y-2">
            <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <FileText size={13} className="text-[#059669]" />
              Styled Sheet Format (Green Title Headers & Clean Borders):
            </div>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc text-[11px]">
              <li>
                <strong>Table 1 (Summary)</strong>: Corporate Name, Campaign Start Date, Campiage Duration, Max value of campaign, No of vouchers
              </li>
              <li>
                <strong>Table 2 (Beneficiary Details)</strong>: Corporate Name, Campaign Name, Voucher No, Ben Name, Amount, Redemption status, Ben Mobile number
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={selectedMonths.length === 0}
            className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-sm shadow-[#059669]/20 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Download Excel Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1 — Campaign Approval (Click Vendor to Expand & Show Different Campaigns)
// Columns: CORPORATE NAME | START DATE | END DATE | DURATION | MAX BUDGET | VOUCHERS | STATUS | ACTIONS
// ═══════════════════════════════════════════════════════════════════════════
const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const ApprovalTab = ({ token, apiBase }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [activeCampaignModal, setActiveCampaignModal] = useState(null);
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [campRes, benRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/compliance/campaign-summary?limit=300`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBase}/api/admin/compliance/beneficiary-report?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const campData = campRes.ok ? await campRes.json() : { campaigns: [] };
      const benData = benRes.ok ? await benRes.json() : { beneficiaries: [] };

      setCampaigns(campData.campaigns || []);
      setBeneficiaries(benData.beneficiaries || []);
    } catch {
      setCampaigns([]);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${apiBase}/api/admin/campaigns/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Available Years extracted dynamically from actual campaigns
  const availableYears = useMemo(() => {
    const set = new Set();
    campaigns.forEach((c) => {
      [c.startDate, c.endDate, c.createdAt].forEach((dt) => {
        if (dt) {
          const d = new Date(dt);
          if (!isNaN(d.getTime())) {
            set.add(d.getFullYear());
          }
        }
      });
    });
    if (set.size === 0) set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [campaigns]);

  // Group strictly by normalized Vendor name so each Vendor appears EXACTLY ONCE
  const vendorGroups = useMemo(() => {
    const map = new Map();

    campaigns.forEach((c) => {
      const rawName = (c.brandName || c.vendorName || "Unknown Vendor").trim();
      const normKey = rawName.toLowerCase();

      if (!map.has(normKey)) {
        map.set(normKey, {
          vendorKey: normKey,
          vendorName: rawName,
          campaigns: [],
          totalBudget: 0,
          totalQrs: 0,
          redeemedQrs: 0,
        });
      }

      const grp = map.get(normKey);
      grp.campaigns.push(c);
      grp.totalBudget += Number(c.totalBudget || 0);
      grp.totalQrs += Number(c.totalQrs || 0);
      grp.redeemedQrs += Number(c.redeemedQrs || 0);
    });

    return Array.from(map.values()).sort((a, b) => a.vendorName.localeCompare(b.vendorName));
  }, [campaigns]);

  // Filter vendor groups based on search, status, month & year
  const filteredVendors = useMemo(() => {
    return vendorGroups
      .map((vg) => {
        const matchingCamps = vg.campaigns.filter((c) => {
          const matchFilter = filter === "all" || c.status?.toLowerCase() === filter;
          const matchSearch =
            !search ||
            [vg.vendorName, c.title].some((v) =>
              String(v || "").toLowerCase().includes(search.toLowerCase())
            );

          const matchDate = (() => {
            if (selectedMonth === "all" && selectedYear === "all") return true;

            const cStart = c.startDate ? new Date(c.startDate) : null;
            const cEnd = c.endDate ? new Date(c.endDate) : null;

            // Filter with both Month and Year
            if (selectedMonth !== "all" && selectedYear !== "all") {
              const selYear = Number(selectedYear);
              const selMonth = Number(selectedMonth);
              const monthStart = new Date(selYear, selMonth - 1, 1);
              const monthEnd = new Date(selYear, selMonth, 0, 23, 59, 59, 999);

              if (cStart && cEnd) return cStart <= monthEnd && cEnd >= monthStart;
              if (cStart) return cStart.getFullYear() === selYear && cStart.getMonth() + 1 === selMonth;
              return true;
            }

            // Filter with Year only
            if (selectedYear !== "all") {
              const selYear = Number(selectedYear);
              const yearStart = new Date(selYear, 0, 1);
              const yearEnd = new Date(selYear, 11, 31, 23, 59, 59, 999);

              if (cStart && cEnd) return cStart <= yearEnd && cEnd >= yearStart;
              if (cStart) return cStart.getFullYear() === selYear;
              return true;
            }

            // Filter with Month only
            if (selectedMonth !== "all") {
              const selMonth = Number(selectedMonth);
              if (cStart && cEnd) {
                const sMonth = cStart.getMonth() + 1;
                const eMonth = cEnd.getMonth() + 1;
                const sYear = cStart.getFullYear();
                const eYear = cEnd.getFullYear();
                if (sYear === eYear) {
                  return selMonth >= sMonth && selMonth <= eMonth;
                }
                return true;
              }
              if (cStart) return cStart.getMonth() + 1 === selMonth;
            }

            return true;
          })();

          return matchFilter && matchSearch && matchDate;
        });

        const totalBudget = matchingCamps.reduce((sum, c) => sum + Number(c.totalBudget || 0), 0);
        const totalQrs = matchingCamps.reduce((sum, c) => sum + Number(c.totalQrs || 0), 0);
        const redeemedQrs = matchingCamps.reduce((sum, c) => sum + Number(c.redeemedQrs || 0), 0);

        return {
          ...vg,
          filteredCampaigns: matchingCamps,
          totalBudget,
          totalQrs,
          redeemedQrs,
        };
      })
      .filter((vg) => vg.filteredCampaigns.length > 0);
  }, [vendorGroups, filter, search, selectedMonth, selectedYear]);

  const toggleVendor = (vKey) => {
    setExpandedVendors((prev) => ({ ...prev, [vKey]: !prev[vKey] }));
  };

  const counts = campaigns.reduce((acc, c) => {
    const s = String(c.status || "").toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-white/5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Campaign Approval & Compliance
          </h3>
          <p className="text-xs text-slate-400">
            Audit campaigns, track redemptions, and export reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className={ghostBtnClass} disabled={loading}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-sm shadow-[#059669]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={campaigns.length} icon={Building2} sub={`${vendorGroups.length} unique vendors`} />
        <StatCard label="Active" value={counts.active || 0} color="text-emerald-600 dark:text-emerald-400" icon={CheckCircle2} />
        <StatCard label="Pending Approval" value={counts.pending || 0} color="text-amber-600 dark:text-amber-400" icon={Clock} />
        <StatCard label="Rejected" value={counts.rejected || 0} color="text-rose-600 dark:text-rose-400" icon={XCircle} />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign or vendor…"
            className={`${inputClass} pl-8 w-48`}
          />
        </div>

        {/* Month Selector */}
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`${inputClass} pl-8 pr-7 text-xs font-medium cursor-pointer appearance-none bg-white dark:bg-[#111827]`}
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Year Selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`${inputClass} px-3 pr-7 text-xs font-medium cursor-pointer appearance-none bg-white dark:bg-[#111827]`}
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {["all", "pending", "active", "paused", "rejected", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filter === s
                  ? "bg-[#059669] text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         EXPANDABLE TABLE FORM (CLICK VENDOR TO SHOW DIFFERENT CAMPAIGNS)
         Columns: CORPORATE NAME | START DATE | END DATE | DURATION | MAX BUDGET | VOUCHERS | STATUS | ACTIONS
         ══════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse py-8 text-center">Loading campaigns…</div>
      ) : (
        <Table
          heads={[
            "CAMPAIGN / CORPORATE NAME",
            "START DATE",
            "END DATE",
            "DURATION",
            "MAX BUDGET",
            "VOUCHERS",
            "STATUS",
            "ACTIONS",
          ]}
          empty={filteredVendors.length === 0 ? "No vendors or campaigns found." : undefined}
        >
          {filteredVendors.map((vg) => {
            const isExpanded = !!expandedVendors[vg.vendorKey];
            const camps = vg.filteredCampaigns;
            const primaryCamp = camps[0];

            return (
              <React.Fragment key={vg.vendorKey}>
                {/* ── VENDOR ROW (Simple & Clean Header) ── */}
                <tr
                  onClick={() => toggleVendor(vg.vendorKey)}
                  className={`cursor-pointer transition-colors border-b border-slate-200/70 dark:border-white/10 ${
                    isExpanded
                      ? "bg-slate-100/70 dark:bg-white/[0.04]"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.02] bg-white dark:bg-transparent"
                  }`}
                >
                  {/* 1. CORPORATE / CAMPAIGN NAME */}
                  <Td className="whitespace-nowrap font-bold">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400 dark:text-slate-500">
                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </div>
                      <span className="text-slate-900 dark:text-white font-semibold text-sm">
                        {vg.vendorName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {camps.length} {camps.length === 1 ? "campaign" : "campaigns"}
                      </span>
                    </div>
                  </Td>

                  {/* 2. START DATE */}
                  <Td className="whitespace-nowrap text-slate-500 text-xs">
                    {fmtDate(primaryCamp?.startDate)}
                  </Td>

                  {/* 3. END DATE */}
                  <Td className="whitespace-nowrap text-slate-500 text-xs">
                    {fmtDate(camps[camps.length - 1]?.endDate || primaryCamp?.endDate)}
                  </Td>

                  {/* 4. DURATION */}
                  <Td className="whitespace-nowrap text-slate-500 text-xs">
                    {durationDays(primaryCamp?.startDate, primaryCamp?.endDate)}
                  </Td>

                  {/* 5. MAX BUDGET */}
                  <Td className="whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                    ₹{fmt(vg.totalBudget)}
                  </Td>

                  {/* 6. VOUCHERS */}
                  <Td className="whitespace-nowrap text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {vg.totalQrs} total
                      </span>
                      <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {vg.redeemedQrs} redeemed
                      </span>
                    </div>
                  </Td>

                  {/* 7. STATUS */}
                  <Td>
                    <Badge status={primaryCamp?.status || "active"} />
                  </Td>

                  {/* 8. ACTIONS */}
                  <Td className="whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVendor(vg.vendorKey);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/80 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={12} className="text-slate-500" /> Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} className="text-slate-500" /> View {camps.length} Campaigns
                        </>
                      )}
                    </button>
                  </Td>
                </tr>

                {/* ── CAMPAIGN ROWS (Simple, Clean, Minimal) ── */}
                {isExpanded &&
                  camps.map((camp, idx) => {
                    const isPending = camp.status?.toLowerCase() === "pending";
                    const isActive = camp.status?.toLowerCase() === "active";
                    const isPaused = camp.status?.toLowerCase() === "paused";
                    const isBusy = updatingId === camp.id;

                    const campRedeemedCount = beneficiaries.filter(
                      (b) =>
                        b.campaignId === camp.id ||
                        (b.campaignName === camp.title &&
                          (b.vendorName?.toLowerCase() === vg.vendorName?.toLowerCase() || !b.vendorName))
                    ).length;

                    return (
                      <tr
                        key={camp.id || idx}
                        className="bg-slate-50/40 dark:bg-white/[0.015] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] transition-colors border-b border-slate-100 dark:border-white/5"
                      >
                        {/* 1. CAMPAIGN TITLE */}
                        <Td className="pl-8 py-2.5 whitespace-nowrap">
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                            {camp.title}
                          </span>
                        </Td>

                        {/* 2. START DATE */}
                        <Td className="py-2.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          {fmtDate(camp.startDate)}
                        </Td>

                        {/* 3. END DATE */}
                        <Td className="py-2.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          {fmtDate(camp.endDate)}
                        </Td>

                        {/* 4. DURATION */}
                        <Td className="py-2.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          {durationDays(camp.startDate, camp.endDate)}
                        </Td>

                        {/* 5. MAX BUDGET */}
                        <Td className="py-2.5 whitespace-nowrap text-xs font-semibold text-slate-900 dark:text-white">
                          ₹{fmt(camp.totalBudget)}
                        </Td>

                        {/* 6. VOUCHERS + REDEEMED LINK */}
                        <Td className="py-2.5 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-300">
                              {camp.totalQrs ?? "—"}
                            </span>
                            <button
                              onClick={() =>
                                setActiveCampaignModal({
                                  campaign: camp,
                                  vendorName: vg.vendorName,
                                })
                              }
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                              title="Click to view users who redeemed QR for this campaign"
                            >
                              ({campRedeemedCount || camp.redeemedQrs || 0} Redeemed ↗)
                            </button>
                          </div>
                        </Td>

                        {/* 7. STATUS */}
                        <Td className="py-2.5">
                          <Badge status={camp.status} />
                        </Td>

                        {/* 8. ACTIONS */}
                        <Td className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(camp.id, "active")}
                                  disabled={isBusy}
                                  title="Approve & Activate"
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                                >
                                  <Check size={11} /> Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(camp.id, "rejected")}
                                  disabled={isBusy}
                                  title="Reject Campaign"
                                  className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                                >
                                  <X size={11} /> Reject
                                </button>
                              </>
                            )}
                            {isActive && (
                              <button
                                onClick={() => handleStatusUpdate(camp.id, "paused")}
                                disabled={isBusy}
                                title="Pause Campaign"
                                className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                              >
                                <Pause size={11} /> Pause
                              </button>
                            )}
                            {isPaused && (
                              <button
                                onClick={() => handleStatusUpdate(camp.id, "active")}
                                disabled={isBusy}
                                title="Resume Campaign"
                                className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                              >
                                <Play size={11} /> Activate
                              </button>
                            )}
                            {!isPending && !isActive && !isPaused && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </Table>
      )}

      {/* Campaign Redeemed Users Modal */}
      {activeCampaignModal && (
        <CampaignRedeemedUsersModal
          campaign={activeCampaignModal.campaign}
          vendorName={activeCampaignModal.vendorName}
          beneficiaries={beneficiaries}
          token={token}
          apiBase={apiBase}
          onClose={() => setActiveCampaignModal(null)}
          onSelectUser={(u) => setSelectedUserModal(u)}
        />
      )}

      {/* Single User Details Modal */}
      {selectedUserModal && (
        <UserRedemptionModal
          user={selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
        />
      )}

      {/* Multi-Month & Dual-Table Export Modal */}
      <ComplianceExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        campaigns={campaigns}
        beneficiaries={beneficiaries}
        availableYears={availableYears}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2 — QR Redemptions & Users (Audit by Vendor & Campaign)
// ═══════════════════════════════════════════════════════════════════════════
const RedemptionsTab = ({ token, apiBase, initialVendor = "all", initialCampaign = "all" }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(initialVendor);
  const [selectedCampaign, setSelectedCampaign] = useState(initialCampaign);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  // Sync initial props if changed
  useEffect(() => {
    if (initialVendor) setSelectedVendor(initialVendor);
    if (initialCampaign) setSelectedCampaign(initialCampaign);
  }, [initialVendor, initialCampaign]);

  // Load campaigns for dropdowns
  const loadCampaigns = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/compliance/campaign-summary?limit=300`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      /* silent */
    }
  }, [token, apiBase]);

  // Load redeemed users report
  const loadBeneficiaries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${apiBase}/api/admin/compliance/beneficiary-report?limit=1000`;
      if (selectedVendor && selectedVendor !== "all") {
        url += `&vendorId=${encodeURIComponent(selectedVendor)}`;
      }
      if (selectedCampaign && selectedCampaign !== "all") {
        url += `&campaignId=${encodeURIComponent(selectedCampaign)}`;
      }
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBeneficiaries(data.beneficiaries || []);
    } catch {
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase, selectedVendor, selectedCampaign, search]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Extract unique vendors for vendor dropdown ("One Vendor and different campaigns")
  const vendors = useMemo(() => {
    const map = new Map();
    // From campaigns
    campaigns.forEach((c) => {
      const vName = c.brandName || c.vendorName || "Unknown";
      const vId = c.vendorId || c.brandId || vName;
      if (!map.has(vId)) {
        map.set(vId, { id: vId, name: vName });
      }
    });
    // From beneficiaries
    beneficiaries.forEach((b) => {
      if (b.vendorId && !map.has(b.vendorId)) {
        map.set(b.vendorId, { id: b.vendorId, name: b.vendorName || "Vendor" });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [campaigns, beneficiaries]);

  // Extract campaigns belonging to the selected vendor (Cascading)
  const availableCampaigns = useMemo(() => {
    let list = campaigns;
    if (selectedVendor !== "all") {
      list = list.filter(
        (c) => (c.vendorId || c.brandId || c.brandName) === selectedVendor || c.brandName === selectedVendor
      );
    }
    const map = new Map();
    list.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, { id: c.id, title: c.title });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [campaigns, selectedVendor]);

  const handleVendorChange = (v) => {
    setSelectedVendor(v);
    setSelectedCampaign("all");
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchStatus = statusFilter === "all" || String(b.redemptionStatus || "").toLowerCase() === statusFilter;
    const matchVendor =
      selectedVendor === "all" ||
      b.vendorId === selectedVendor ||
      b.vendorName?.toLowerCase() === selectedVendor.toLowerCase();
    const matchCampaign = selectedCampaign === "all" || b.campaignId === selectedCampaign;
    const matchSearch =
      !search ||
      [
        b.beneficiaryName,
        b.mobileNumber,
        b.beneficiaryEmail,
        b.voucherNo,
        b.upiId,
        b.campaignName,
        b.vendorName,
        b.city,
        b.state,
      ].some((val) => String(val || "").toLowerCase().includes(search.toLowerCase()));

    return matchStatus && matchVendor && matchCampaign && matchSearch;
  });

  const totalAmount = filteredBeneficiaries.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const uniqueUsers = new Set(filteredBeneficiaries.map((b) => b.beneficiaryId || b.mobileNumber || b.beneficiaryName)).size;

  return (
    <div className="space-y-5">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Redemptions" value={filteredBeneficiaries.length} icon={QrCode} />
        <StatCard
          label="Total Cashback Disbursed"
          value={`₹${fmt(totalAmount)}`}
          color="text-emerald-600 dark:text-emerald-400"
          icon={Coins}
        />
        <StatCard
          label="Unique Redeemed Users"
          value={uniqueUsers}
          color="text-blue-600 dark:text-blue-400"
          icon={Users}
        />
        <StatCard
          label="Matching Campaigns"
          value={selectedCampaign !== "all" ? "1 Campaign" : `${availableCampaigns.length} Campaigns`}
          icon={Building2}
        />
      </div>

      {/* Filter Toolbar with Cascading Dropdowns */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Vendor Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-slate-400 flex-shrink-0" />
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Vendor:
            </label>
            <select
              value={selectedVendor}
              onChange={(e) => handleVendorChange(e.target.value)}
              className={`${selectClass} w-48 font-medium`}
            >
              <option value="all">All Vendors / Corporates ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Dropdown (Filtered according to Vendor) */}
          <div className="flex items-center gap-2">
            <QrCode size={15} className="text-slate-400 flex-shrink-0" />
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Campaign:
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className={`${selectClass} w-52 font-medium`}
            >
              <option value="all">
                {selectedVendor !== "all" ? "All Campaigns of Vendor" : "All Campaigns"}
              </option>
              {availableCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, phone, email, QR hash, UPI…"
              className={`${inputClass} pl-8 w-full`}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={loadBeneficiaries} className={ghostBtnClass} disabled={loading}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() =>
                downloadCSV(
                  filteredBeneficiaries.map((b) => [
                    b.beneficiaryName,
                    b.mobileNumber,
                    b.beneficiaryEmail,
                    b.upiId || b.payoutMethod,
                    b.vendorName,
                    b.campaignName,
                    b.voucherNo,
                    fmt(b.amount),
                    b.redemptionStatus,
                    [b.city, b.state, b.pincode].filter(Boolean).join(" "),
                    fmtDateTime(b.createdAt),
                  ]),
                  [
                    "User Name",
                    "Mobile Number",
                    "Email",
                    "UPI / Payout ID",
                    "Corporate / Vendor",
                    "Campaign Name",
                    "Voucher QR Hash",
                    "Amount (₹)",
                    "Status",
                    "Location",
                    "Redeemed Date & Time",
                  ],
                  `qr_user_redemptions_${Date.now()}.csv`
                )
              }
              className={ghostBtnClass}
              disabled={filteredBeneficiaries.length === 0}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 mr-1">Status:</span>
          {["all", "redeemed", "success", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${
                statusFilter === s
                  ? "bg-[#059669] text-white"
                  : "bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
          {(selectedVendor !== "all" || selectedCampaign !== "all" || search) && (
            <button
              onClick={() => {
                setSelectedVendor("all");
                setSelectedCampaign("all");
                setSearch("");
                setStatusFilter("all");
              }}
              className="text-xs text-rose-500 hover:underline ml-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse py-12 text-center">
          Loading redeemed users data…
        </div>
      ) : (
        <Table
          heads={[
            "Beneficiary / User",
            "Contact Details",
            "UPI / Payout",
            "Corporate / Vendor",
            "Campaign Title",
            "Voucher QR Code",
            "Cashback",
            "Location",
            "Redeemed At",
            "Action",
          ]}
          empty={
            filteredBeneficiaries.length === 0
              ? "No QR redemptions found for the selected vendor/campaign."
              : undefined
          }
        >
          {filteredBeneficiaries.map((b, i) => (
            <tr
              key={b.id || i}
              className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => setSelectedUserModal(b)}
            >
              {/* User Profile */}
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#059669] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {String(b.beneficiaryName || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {b.beneficiaryName || "—"}
                      <Badge status={b.userStatus} />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {b.beneficiaryId ? `${b.beneficiaryId.slice(0, 8)}…` : "—"}
                    </div>
                  </div>
                </div>
              </Td>

              {/* Contact */}
              <Td>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-mono">
                    <Phone size={11} className="text-slate-400" />
                    <span>{b.mobileNumber || "—"}</span>
                    <CopyButton text={b.mobileNumber} label="Phone" />
                  </div>
                  {b.beneficiaryEmail && b.beneficiaryEmail !== "—" && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Mail size={11} className="text-slate-400" />
                      <span className="truncate max-w-[140px]">{b.beneficiaryEmail}</span>
                    </div>
                  )}
                </div>
              </Td>

              {/* UPI / Payout */}
              <Td>
                <div className="flex items-center gap-1 text-xs font-mono text-slate-800 dark:text-slate-200">
                  <CreditCard size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[130px]" title={b.upiId || b.payoutMethod}>
                    {b.upiId || b.payoutMethod || "—"}
                  </span>
                  <CopyButton text={b.upiId || b.payoutMethod} label="UPI / Payout ID" />
                </div>
              </Td>

              {/* Corporate / Vendor */}
              <Td>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Building2 size={11} className="text-slate-400" />
                  {b.vendorName || "—"}
                </span>
              </Td>

              {/* Campaign */}
              <Td>
                <div className="font-medium text-slate-900 dark:text-white text-xs max-w-[150px] truncate" title={b.campaignName}>
                  {b.campaignName || "—"}
                </div>
              </Td>

              {/* Voucher QR Hash */}
              <Td>
                <div className="flex items-center gap-1 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <span className="truncate max-w-[100px]" title={b.voucherNo}>
                    {b.voucherNo || "—"}
                  </span>
                  <CopyButton text={b.voucherNo} label="QR Hash" />
                </div>
              </Td>

              {/* Amount */}
              <Td className="whitespace-nowrap">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{fmt(b.amount)}
                </span>
              </Td>

              {/* Location */}
              <Td className="text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[120px]" title={[b.city, b.state, b.pincode].filter(Boolean).join(", ")}>
                    {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
              </Td>

              {/* Redeemed At */}
              <Td className="whitespace-nowrap text-xs text-slate-500">
                {fmtDateTime(b.createdAt)}
              </Td>

              {/* Action Button */}
              <Td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUserModal(b);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Eye size={12} /> Details
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* User Details Modal */}
      {selectedUserModal && (
        <UserRedemptionModal
          user={selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3 — Payout → Campaign Mapping
// ═══════════════════════════════════════════════════════════════════════════
const MappingTab = ({ token, apiBase }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUnmapped, setShowUnmapped] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/compliance/payout-mapping?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRows(data.payouts || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { load(); }, [load]);

  const unmapped = rows.filter((r) => !r.campaignId);
  const mapped = rows.filter((r) => r.campaignId);
  const displayed = showUnmapped ? unmapped : rows;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Payouts" value={rows.length} icon={Banknote} />
        <StatCard label="Mapped to Campaign" value={mapped.length} color="text-emerald-600 dark:text-emerald-400" icon={CheckCircle2} />
        <StatCard label="Unmapped / Flagged" value={unmapped.length} color={unmapped.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"} icon={AlertCircle} />
      </div>

      {unmapped.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span><strong>{unmapped.length}</strong> payout{unmapped.length > 1 ? "s" : ""} could not be matched to a valid campaign.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input type="checkbox" checked={showUnmapped} onChange={(e) => setShowUnmapped(e.target.checked)} className="rounded accent-[#059669]" />
          Show unmapped only
        </label>
        <button onClick={load} className={ghostBtnClass} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <button onClick={() => downloadCSV(displayed.map(r => [r.id, r.amount, r.status, r.campaignTitle || "UNMAPPED", r.campaignId || "—", fmtDateTime(r.createdAt)]), ["Payout ID", "Amount (₹)", "Status", "Campaign", "Campaign ID", "Date"], "payout_mapping.csv")} className={ghostBtnClass}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse py-8 text-center">Loading payouts…</div>
      ) : (
        <Table heads={["Payout ID", "Amount", "Status", "Campaign", "Campaign ID", "Date"]} empty={displayed.length === 0 ? "No payouts found." : undefined}>
          {displayed.map((r) => (
            <tr key={r.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${!r.campaignId ? "bg-rose-50/40 dark:bg-rose-500/5" : ""}`}>
              <Td className="font-mono text-xs">{r.id?.slice(0, 12)}…</Td>
              <Td className="font-semibold">₹{fmt(r.amount)}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td>
                {r.campaignTitle ? (
                  <span className="text-slate-900 dark:text-white">{r.campaignTitle}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                    <AlertTriangle size={12} /> UNMAPPED
                  </span>
                )}
              </Td>
              <Td className="font-mono text-xs text-slate-400">{r.campaignId?.slice(0, 12) || "—"}</Td>
              <Td className="whitespace-nowrap text-xs text-slate-500">{fmtDateTime(r.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4 — API Validation Rules
// ═══════════════════════════════════════════════════════════════════════════
const VALIDATION_RULES = [
  {
    id: "campaign_active",
    rule: "Campaign must be ACTIVE",
    description: "Payout is rejected if the campaign status is not 'active' at the time of redemption.",
    layer: "Controller",
    enforcement: "Hard block",
  },
  {
    id: "qr_not_redeemed",
    rule: "QR must be in GENERATED status",
    description: "If the QR code has already been redeemed (status ≠ generated), the payout is rejected.",
    layer: "Controller",
    enforcement: "Hard block",
  },
  {
    id: "campaign_date_window",
    rule: "Redemption within campaign date window",
    description: "Redemption timestamp must fall between campaign startDate and endDate.",
    layer: "Controller",
    enforcement: "Hard block",
  },
  {
    id: "budget_available",
    rule: "Campaign budget must be > 0",
    description: "If CampaignBudget.lockedAmount is insufficient to cover the cashbackAmount, the payout is rejected.",
    layer: "Service",
    enforcement: "Hard block",
  },
  {
    id: "qr_campaign_match",
    rule: "QR must belong to the redeemed campaign",
    description: "QRCode.campaignId must match the campaign being redeemed to prevent cross-campaign fraud.",
    layer: "Controller",
    enforcement: "Hard block",
  },
  {
    id: "user_active",
    rule: "User account must be ACTIVE",
    description: "Blocked or inactive users cannot trigger payouts.",
    layer: "Middleware",
    enforcement: "Hard block",
  },
  {
    id: "duplicate_prevention",
    rule: "No duplicate redemption of same QR",
    description: "Unique constraint on QRCode.payoutTransactionId prevents double-spend.",
    layer: "Database",
    enforcement: "DB constraint",
  },
];

const ValidationTab = () => {
  return (
    <div className="space-y-5">
      <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
        <span>All validation checks listed below are enforced server-side on the Node.js backend before any payout is processed. None of these can be bypassed from the client.</span>
      </div>

      <div className={`${panelClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/[0.04]">
              <tr>
                {["#", "Rule", "Description", "Layer", "Enforcement"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {VALIDATION_RULES.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <Td className="text-slate-400 font-mono text-xs">{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{r.rule}</span>
                    </div>
                  </Td>
                  <Td className="max-w-xs text-slate-600 dark:text-slate-300">{r.description}</Td>
                  <Td>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-mono text-slate-700 dark:text-slate-300">{r.layer}</span>
                  </Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.enforcement === "Hard block" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                      {r.enforcement}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => downloadCSV(VALIDATION_RULES.map(r => [r.rule, r.description, r.layer, r.enforcement]), ["Rule", "Description", "Layer", "Enforcement"], "api_validation_rules.csv")} className={ghostBtnClass}>
          <Download size={13} /> Export Rules CSV
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5 — Budget Controls
// ═══════════════════════════════════════════════════════════════════════════
const BudgetTab = ({ token, apiBase }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("all");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/compliance/campaign-summary?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { load(); }, [load]);

  const vendors = useMemo(() => {
    const map = new Map();
    campaigns.forEach((c) => {
      const vName = c.brandName || c.vendorName || "Unknown";
      const vId = c.vendorId || c.brandId || vName;
      if (!map.has(vId)) map.set(vId, { id: vId, name: vName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [campaigns]);

  const filtered = campaigns.filter((c) => {
    const matchVendor = selectedVendor === "all" || (c.vendorId || c.brandId || c.brandName) === selectedVendor || c.brandName === selectedVendor;
    const matchSearch = !search || [c.title, c.brandName].some((v) => String(v || "").toLowerCase().includes(search.toLowerCase()));
    return matchVendor && matchSearch;
  });

  const nearExhaustion = campaigns.filter((c) => {
    if (!c.totalBudget || !c.spentBudget) return false;
    return (Number(c.spentBudget) / Number(c.totalBudget)) > 0.9;
  });

  return (
    <div className="space-y-5">
      {nearExhaustion.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span><strong>{nearExhaustion.length}</strong> campaign{nearExhaustion.length > 1 ? "s" : ""} have consumed over 90% of their budget.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className={`${selectClass} w-44`}
        >
          <option value="all">All Vendors ({vendors.length})</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaign…" className={`${inputClass} w-56`} />
        <button onClick={load} className={ghostBtnClass} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <button onClick={() => downloadCSV(filtered.map(c => [c.brandName, c.title, fmt(c.totalBudget), fmt(c.spentBudget), fmt(Number(c.totalBudget || 0) - Number(c.spentBudget || 0)), c.totalQrs || 0, c.redeemedQrs || 0, c.totalQrs ? `${((c.redeemedQrs / c.totalQrs) * 100).toFixed(1)}%` : "0%"]), ["Corporate Name", "Campaign", "Total Budget (₹)", "Spent (₹)", "Remaining (₹)", "Total Vouchers", "Redeemed", "Redemption %"], "budget_controls.csv")} className={ghostBtnClass}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse py-8 text-center">Loading budget data…</div>
      ) : (
        <Table heads={["Corporate", "Campaign", "Total Budget", "Spent", "Remaining", "Vouchers", "Redeemed", "Redemption %", "Budget %"]} empty={filtered.length === 0 ? "No campaigns found." : undefined}>
          {filtered.map((c) => {
            const total = Number(c.totalBudget || 0);
            const spent = Number(c.spentBudget || 0);
            const remaining = total - spent;
            const pct = total > 0 ? (spent / total) * 100 : 0;
            const totalQrs = Number(c.totalQrs || 0);
            const redeemedQrs = Number(c.redeemedQrs || 0);
            const redemptionPct = totalQrs > 0 ? (redeemedQrs / totalQrs) * 100 : 0;
            const isWarning = pct > 90;
            return (
              <tr key={c.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${isWarning ? "bg-amber-50/30 dark:bg-amber-500/5" : ""}`}>
                <Td className="font-medium text-slate-900 dark:text-white">{c.brandName || "—"}</Td>
                <Td>{c.title}</Td>
                <Td className="whitespace-nowrap">₹{fmt(c.totalBudget)}</Td>
                <Td className="whitespace-nowrap text-rose-600 dark:text-rose-400">₹{fmt(spent)}</Td>
                <Td className="whitespace-nowrap text-emerald-600 dark:text-emerald-400">₹{fmt(remaining)}</Td>
                <Td>{totalQrs}</Td>
                <Td>{redeemedQrs}</Td>
                <Td>{redemptionPct.toFixed(1)}%</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${isWarning ? "bg-amber-500" : "bg-[#059669]"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-semibold ${isWarning ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>
                      {pct.toFixed(1)}%
                      {isWarning && <AlertTriangle size={10} className="inline ml-1" />}
                    </span>
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 6 — Exception Report
// ═══════════════════════════════════════════════════════════════════════════
const ExceptionsTab = ({ token, apiBase }) => {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/compliance/exceptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExceptions(data.exceptions || []);
    } catch {
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (id) => {
    setReviewing(id);
    try {
      await fetch(`${apiBase}/api/admin/compliance/exceptions/${id}/review`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: true }),
      });
      setExceptions((prev) => prev.map((e) => e.id === id ? { ...e, reviewed: true } : e));
    } catch { /* silent */ } finally {
      setReviewing(null);
    }
  };

  const flagTypeColor = (type) => {
    const m = { high_frequency: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300", date_boundary: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300", amount_deviation: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300" };
    return m[type] || "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300";
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Flags" value={exceptions.length} color={exceptions.length > 0 ? "text-rose-600 dark:text-rose-400" : undefined} icon={AlertTriangle} />
        <StatCard label="Unreviewed" value={exceptions.filter(e => !e.reviewed).length} color="text-amber-600 dark:text-amber-400" icon={Clock} />
        <StatCard label="Reviewed" value={exceptions.filter(e => e.reviewed).length} color="text-emerald-600 dark:text-emerald-400" icon={CheckCircle2} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={load} className={ghostBtnClass} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <button onClick={() => downloadCSV(exceptions.map(e => [e.id, e.userId, e.userName, e.campaignTitle, e.amount, e.flagType, e.flagReason, e.reviewed ? "Reviewed" : "Open", fmtDateTime(e.createdAt)]), ["ID", "User ID", "User", "Campaign", "Amount (₹)", "Flag Type", "Reason", "Status", "Date"], "exception_report.csv")} className={ghostBtnClass}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse py-8 text-center">Loading exception report…</div>
      ) : exceptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={40} strokeWidth={1.2} />
          <p className="text-sm font-medium">No suspicious activity detected in the last 30 days.</p>
        </div>
      ) : (
        <Table heads={["User", "Campaign", "Amount", "Flag Type", "Reason", "Date", "Status", "Action"]} empty={undefined}>
          {exceptions.map((e) => (
            <tr key={e.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${e.reviewed ? "opacity-60" : ""}`}>
              <Td>
                <div className="font-medium text-slate-900 dark:text-white">{e.userName || "—"}</div>
                <div className="text-xs text-slate-400 font-mono">{e.userId?.slice(0, 10)}</div>
              </Td>
              <Td className="max-w-[140px] truncate">{e.campaignTitle || "—"}</Td>
              <Td className="font-semibold">₹{fmt(e.amount)}</Td>
              <Td>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${flagTypeColor(e.flagType)}`}>
                  {String(e.flagType || "").replace(/_/g, " ")}
                </span>
              </Td>
              <Td className="text-xs text-slate-500 max-w-[160px]">{e.flagReason || "—"}</Td>
              <Td className="whitespace-nowrap text-xs text-slate-400">{fmtDateTime(e.createdAt)}</Td>
              <Td>
                {e.reviewed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={12} /> Reviewed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Clock size={12} /> Open
                  </span>
                )}
              </Td>
              <Td>
                {!e.reviewed && (
                  <button onClick={() => handleReview(e.id)} disabled={reviewing === e.id} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                    <Eye size={11} /> {reviewing === e.id ? "…" : "Mark Reviewed"}
                  </button>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 7 — Monthly Report (with Vendor & Campaign Dropdown)
// ═══════════════════════════════════════════════════════════════════════════
const MonthlyReportTab = ({ token, apiBase }) => {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [summaryData, setSummaryData] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token || !month) return;
    setLoading(true);
    setError("");
    try {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1).toISOString();
      const end = new Date(Number(y), Number(m), 0, 23, 59, 59).toISOString();

      let sumUrl = `${apiBase}/api/admin/compliance/campaign-summary?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&limit=500`;
      let benUrl = `${apiBase}/api/admin/compliance/beneficiary-report?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&limit=500`;

      if (selectedVendor && selectedVendor !== "all") {
        sumUrl += `&vendorId=${encodeURIComponent(selectedVendor)}`;
        benUrl += `&vendorId=${encodeURIComponent(selectedVendor)}`;
      }
      if (selectedCampaign && selectedCampaign !== "all") {
        benUrl += `&campaignId=${encodeURIComponent(selectedCampaign)}`;
      }

      const [sumRes, benRes] = await Promise.all([
        fetch(sumUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(benUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const sumJson = sumRes.ok ? await sumRes.json() : { campaigns: [] };
      const benJson = benRes.ok ? await benRes.json() : { beneficiaries: [] };
      setSummaryData(sumJson.campaigns || []);
      setBeneficiaryData(benJson.beneficiaries || []);
    } catch (e) {
      setError(e.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [token, apiBase, month, selectedVendor, selectedCampaign]);

  useEffect(() => { load(); }, [load]);

  // Extract unique vendors from summary data
  const vendors = useMemo(() => {
    const map = new Map();
    summaryData.forEach((c) => {
      const vName = c.brandName || c.vendorName || "Unknown";
      const vId = c.vendorId || c.brandId || vName;
      if (!map.has(vId)) map.set(vId, { id: vId, name: vName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [summaryData]);

  // Extract campaigns for selected vendor
  const availableCampaigns = useMemo(() => {
    let list = summaryData;
    if (selectedVendor !== "all") {
      list = list.filter((c) => (c.vendorId || c.brandId || c.brandName) === selectedVendor || c.brandName === selectedVendor);
    }
    const map = new Map();
    list.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, { id: c.id, title: c.title });
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [summaryData, selectedVendor]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400" />
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} />
        </div>

        {/* Vendor Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Vendor:</label>
          <select
            value={selectedVendor}
            onChange={(e) => {
              setSelectedVendor(e.target.value);
              setSelectedCampaign("all");
            }}
            className={`${selectClass} w-44`}
          >
            <option value="all">All Vendors ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Campaign Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Campaign:</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className={`${selectClass} w-48`}
          >
            <option value="all">All Campaigns</option>
            {availableCampaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <button onClick={load} className={primaryBtnClass} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> {loading ? "Loading…" : "Generate Report"}
        </button>
      </div>

      {error && <div className="text-sm text-rose-600 dark:text-rose-400 px-3">{error}</div>}

      {/* TABLE 1 — Campaign Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Table 1 — Campaign Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campaign-wise overview for compliance reporting period.</p>
          </div>
          <button onClick={() => downloadCSV(summaryData.map(c => [c.brandName, fmtDate(c.startDate), durationDays(c.startDate, c.endDate), fmt(c.totalBudget), c.totalQrs || 0]), ["Corporate Name", "Campaign Start Date", "Campaign Duration", "Max value of campaign", "No of vouchers"], `campaign_summary_${month}.csv`)} className={ghostBtnClass} disabled={summaryData.length === 0}>
            <Download size={13} /> Export CSV
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-slate-500 animate-pulse py-6 text-center">Loading…</div>
        ) : (
          <Table heads={["Corporate Name", "Campaign Start Date", "Campaign Duration", "Max value of campaign", "No of vouchers"]} empty={summaryData.length === 0 ? "No campaigns found for selected period." : undefined}>
            {summaryData.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <Td className="font-medium text-slate-900 dark:text-white">{c.brandName || "—"}</Td>
                <Td className="whitespace-nowrap">{fmtDate(c.startDate)}</Td>
                <Td className="whitespace-nowrap">{durationDays(c.startDate, c.endDate)}</Td>
                <Td className="whitespace-nowrap font-semibold">₹{fmt(c.totalBudget)}</Td>
                <Td>{c.totalQrs ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* TABLE 2 — Beneficiary / Payout Detail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Table 2 — Beneficiary Payout Detail</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Per-redemption beneficiary and payout record for the selected period.</p>
          </div>
          <button onClick={() => downloadCSV(beneficiaryData.map(b => [b.vendorName, b.campaignName, b.voucherNo, b.beneficiaryName, b.mobileNumber || "—", b.beneficiaryEmail || "—", b.upiId || b.payoutMethod || "—", fmt(b.amount), b.redemptionStatus, [b.city, b.state].filter(Boolean).join(" ")]), ["Corporate / Vendor", "Campaign Name", "Voucher No", "Ben Name", "Ben Mobile number", "Email", "UPI ID", "Amount", "Redemption status", "Location"], `beneficiary_report_${month}.csv`)} className={ghostBtnClass} disabled={beneficiaryData.length === 0}>
            <Download size={13} /> Export CSV
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-slate-500 animate-pulse py-6 text-center">Loading…</div>
        ) : (
          <Table heads={["Corporate / Vendor", "Campaign Name", "Voucher No", "Ben Name", "Ben Mobile Number", "UPI ID", "Amount", "Status", "Location"]} empty={beneficiaryData.length === 0 ? "No redemptions found for selected period." : undefined}>
            {beneficiaryData.map((b, i) => (
              <tr key={b.id || i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <Td className="font-semibold text-slate-900 dark:text-white">{b.vendorName || "—"}</Td>
                <Td className="font-medium text-slate-800 dark:text-slate-200">{b.campaignName || "—"}</Td>
                <Td className="font-mono text-xs">{b.voucherNo || "—"}</Td>
                <Td>{b.beneficiaryName || "—"}</Td>
                <Td className="font-mono">{b.mobileNumber || "—"}</Td>
                <Td className="font-mono text-xs">{b.upiId || b.payoutMethod || "—"}</Td>
                <Td className="font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">₹{fmt(b.amount)}</Td>
                <Td><Badge status={b.redemptionStatus} /></Td>
                <Td className="text-xs text-slate-500">{[b.city, b.state].filter(Boolean).join(", ") || "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Main CompliancePanel
// ═══════════════════════════════════════════════════════════════════════════
const CompliancePanel = ({ token, apiBase }) => {
  const [activeTab, setActiveTab] = useState("approval");

  const renderTab = () => {
    const props = { token, apiBase };
    switch (activeTab) {
      case "approval":
        return <ApprovalTab {...props} />;
      case "redemptions":
        return <RedemptionsTab {...props} />;
      case "mapping":
        return <MappingTab {...props} />;
      case "validation":
        return <ValidationTab {...props} />;
      case "budgets":
        return <BudgetTab {...props} />;
      case "exceptions":
        return <ExceptionsTab {...props} />;
      case "report":
        return <MonthlyReportTab {...props} />;
      default:
        return null;
    }
  };

  return (
    <section id="compliance" className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compliance &amp; Audit</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Regulatory controls, campaign audit trails, QR redemption user tracking, payout validation, and monthly compliance reports.
        </p>
      </div>

      {/* Tab Bar (Single Line) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap border-b border-slate-200 dark:border-white/10 pb-0 scroll-smooth">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px whitespace-nowrap shrink-0 ${
                isActive
                  ? "border-[#059669] text-[#059669] bg-emerald-50/60 dark:bg-emerald-500/10 font-semibold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-1">{renderTab()}</div>
    </section>
  );
};

export default CompliancePanel;
