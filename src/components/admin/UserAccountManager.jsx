import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Wallet,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Activity,
    CreditCard,
    QrCode,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowDownUp
} from "lucide-react";
import {
    getAdminTransactionsFiltered,
    getAdminQrs,
    updateAdminUserStatus,
    updateUserProfile // Assuming this exists or using admin specific update
} from "../../lib/api";

const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getStatusClasses = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "active" || s === "success" || s === "redeemed")
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    if (s === "pending" || s === "processing")
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    if (s === "blocked" || s === "inactive")
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400";
};

const NavButton = ({ active, onClick, icon: Icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
            ? "text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#047857] opacity-100" />
        )}
        <div className="relative z-10 flex items-center gap-3">
            <Icon size={18} className={active ? "text-white" : "opacity-70 group-hover:opacity-100 transition-opacity"} />
            <span className={active ? "font-semibold" : "font-medium"}>{label}</span>
        </div>
        {badge && (
            <span className={`relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white"
                }`}>
                {badge}
            </span>
        )}
    </button>
);

const MetricItem = ({ label, value, subtext }) => (
    <div className="bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 dark:hover:bg-white/10">
        <div className="text-xs text-slate-500 dark:text-white/60 mb-1 font-medium">{label}</div>
        <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
        {subtext && <div className="text-[10px] text-slate-400 mt-1">{subtext}</div>}
    </div>
);

const UserAccountManager = ({ user, token, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

    // Computed Stats
    const walletBalance = user?.Wallet?.balance ? Number(user.Wallet.balance) : 0;
    const totalTransactions = transactions.length;
    const totalRedemptions = redemptions.length;
    const totalCashbackEarned = redemptions.reduce((sum, r) => sum + Number(r.cashbackAmount || 0), 0);

    const loadData = async () => {
        if (!user?.id || !token) return;
        setIsLoading(true);
        try {
            // 1. Fetch Transactions
            const txData = await getAdminTransactionsFiltered(token, { userId: user.id });
            setTransactions(txData?.transactions || (Array.isArray(txData) ? txData : []));

            // 2. Fetch Redemptions (QRs redeemed by this user)
            const qrData = await getAdminQrs(token, { redeemedByUserId: user.id, status: 'redeemed' });
            setRedemptions(qrData?.items || (Array.isArray(qrData) ? qrData : []));

        } catch (err) {
            console.error("Failed to load user data:", err);
            setActionMessage({ type: "error", text: "Failed to load some user data." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id, token]);

    const handleStatusUpdate = async (newStatus) => {
        if (!user?.id) return;
        try {
            await updateAdminUserStatus(token, user.id, newStatus);
            setActionMessage({ type: "success", text: `User marked as ${newStatus}.` });
            if (onUpdate) onUpdate();
        } catch (err) {
            setActionMessage({ type: "error", text: err.message || "Failed to update status." });
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[85vh] bg-[#f8fafc] dark:bg-[#0f0f11] rounded-3xl shadow-2xl flex overflow-hidden border border-white/20 ring-1 ring-black/5">
                {/* Sidebar */}
                <div className="w-72 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-white/5 flex flex-col">
                    <div className="p-6 pb-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                                {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {user.name || "User Profile"}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <NavButton
                                active={activeTab === "overview"}
                                onClick={() => setActiveTab("overview")}
                                icon={Activity}
                                label="Overview"
                            />
                            <NavButton
                                active={activeTab === "profile"}
                                onClick={() => setActiveTab("profile")}
                                icon={User}
                                label="Profile Details"
                            />
                            <NavButton
                                active={activeTab === "wallet"}
                                onClick={() => setActiveTab("wallet")}
                                icon={Wallet}
                                label="Wallet & Txns"
                                badge={transactions.length}
                            />
                            <NavButton
                                active={activeTab === "redemptions"}
                                onClick={() => setActiveTab("redemptions")}
                                icon={QrCode}
                                label="Redemptions"
                                badge={redemptions.length}
                            />
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                Account Status
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusClasses(user.status)} capitalize`}>
                                    {user.status}
                                </span>
                            </div>

                            {user.status === 'active' ? (
                                <button
                                    onClick={() => handleStatusUpdate('blocked')}
                                    className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold transition-colors border border-rose-500/20"
                                >
                                    Block User
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStatusUpdate('active')}
                                    className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold transition-colors border border-emerald-500/20"
                                >
                                    Activate User
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0f0f11]/50 relative">
                    {/* Header */}
                    <div className="h-16 border-b border-slate-200/70 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0f0f11]/80 backdrop-blur-md z-10 sticky top-0">
                        <div className="flex items-center gap-2 text-sm breadcrumbs text-slate-500 dark:text-slate-400">
                            <span>Users</span>
                            <span className="text-slate-300 dark:text-slate-700">/</span>
                            <span className="font-medium text-slate-900 dark:text-white capitalize">{activeTab}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {actionMessage.text && (
                            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${actionMessage.type === "error"
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                }`}>
                                {actionMessage.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                <p className="text-sm font-medium">{actionMessage.text}</p>
                            </div>
                        )}

                        {activeTab === "overview" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <MetricItem
                                        label="Wallet Balance"
                                        value={`INR ${formatAmount(walletBalance)}`}
                                        subtext="Current available balance"
                                    />
                                    <MetricItem
                                        label="Total Redeemed"
                                        value={`INR ${formatAmount(totalCashbackEarned)}`}
                                        subtext={`${totalRedemptions} Campaigns`}
                                    />
                                    <MetricItem
                                        label="Activity Score"
                                        value={totalTransactions}
                                        subtext="Total Transactions"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <User size={16} className="text-indigo-500" /> User Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                                <span className="text-xs text-slate-500">Full Name</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name || "-"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                                <span className="text-xs text-slate-500">Email</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user.email || "-"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                                <span className="text-xs text-slate-500">Phone</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user.phoneNumber || "-"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2  border-slate-100 dark:border-white/5">
                                                <span className="text-xs text-slate-500">Joined Date</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(user.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Wallet size={16} className="text-emerald-500" /> Wallet Summary
                                        </h3>
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-4">
                                            <div className="text-xs text-slate-500 mb-1">Total Balance</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">INR {formatAmount(walletBalance)}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Credits</div>
                                                <div className="text-lg font-bold text-emerald-700">{transactions.filter(t => t.type === 'credit').length}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                                <div className="text-[10px] uppercase font-bold text-rose-600 mb-1">Debits</div>
                                                <div className="text-lg font-bold text-rose-700">{transactions.filter(t => t.type === 'debit').length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className="max-w-2xl bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Information</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                                            <input
                                                disabled
                                                value={user.name || ""}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                                            <input
                                                disabled
                                                value={user.username || ""}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    disabled
                                                    value={user.email || ""}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    disabled
                                                    value={user.phoneNumber || ""}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "wallet" && (
                            <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Transaction History</h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                        {transactions.length} Records
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-white/5 text-xs text-slate-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Date</th>
                                                <th className="px-6 py-3 text-left">Type</th>
                                                <th className="px-6 py-3 text-left">Category</th>
                                                <th className="px-6 py-3 text-right">Amount</th>
                                                <th className="px-6 py-3 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                            {transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                            {formatDate(tx.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tx.type === 'credit'
                                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                }`}>
                                                                {tx.type === 'credit' ? <ArrowDownUp size={12} className="rotate-180" /> : <ArrowDownUp size={12} />}
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium capitalize">
                                                            {(tx.category || "-").replace(/_/g, " ")}
                                                        </td>
                                                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                                                            }`}>
                                                            {tx.type === 'credit' ? "+" : "-"} {formatAmount(tx.amount)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClasses(tx.status)}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "redemptions" && (
                            <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Redemption History</h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                        {redemptions.length} Records
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-white/5 text-xs text-slate-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Date</th>
                                                <th className="px-6 py-3 text-left">Campaign</th>
                                                <th className="px-6 py-3 text-left">Brand</th>
                                                <th className="px-6 py-3 text-right">Cashback</th>
                                                <th className="px-6 py-3 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                            {redemptions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                                        No redemptions found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                redemptions.map((qr) => (
                                                    <tr key={qr.id || qr.uniqueHash} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                            {formatDate(qr.redeemedAt || qr.updatedAt)}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                                            {qr.Campaign?.title || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                            {qr.Campaign?.Brand?.name || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                            INR {formatAmount(qr.cashbackAmount)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClasses(qr.status)}`}>
                                                                {qr.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAccountManager;
