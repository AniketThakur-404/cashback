import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  RefreshCw,
  User,
  Wallet,
  QrCode,
  MessageSquare,
  Bell,
  Save,
  Info,
} from "lucide-react";
import {
  getAdminUserOverview,
  updateAdminUserDetails,
  updateAdminUserStatus,
} from "../../lib/api";

const fmtAmt = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-IN");
};

const toForm = (u) => ({
  name: u?.name || "",
  username: u?.username || "",
  email: u?.email || "",
  phoneNumber: u?.phoneNumber || "",
  status: u?.status || "active",
});

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "profile", label: "Profile", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "redemptions", label: "Redemptions", icon: QrCode },
  { id: "support", label: "Support", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const UserAccountManager = ({ user, token, onClose, onUpdate }) => {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(user || null);
  const [form, setForm] = useState(toForm(user));
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const current = profile || user;

  useEffect(() => {
    setProfile(user || null);
    setForm(toForm(user));
    setTab("overview");
    setMsg({ type: "", text: "" });
  }, [user?.id]);

  const load = async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    try {
      const data = await getAdminUserOverview(token, user.id);
      const u = data?.user || user;
      setProfile((p) => ({ ...(p || {}), ...u }));
      setForm(toForm(u));
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
      setRedemptions(Array.isArray(data?.redemptions) ? data.redemptions : []);
      setSupportTickets(
        Array.isArray(data?.supportTickets) ? data.supportTickets : [],
      );
      setNotifications(
        Array.isArray(data?.notifications) ? data.notifications : [],
      );
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Failed to load user data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, token]);

  const stats = useMemo(() => {
    const redeemed = redemptions.reduce(
      (s, r) => s + Number(r?.cashbackAmount || 0),
      0,
    );
    return {
      wallet: Number(current?.Wallet?.balance || 0),
      tx: transactions.length,
      redemptions: redemptions.length,
      redeemed,
      support: supportTickets.length,
      unread: notifications.filter((n) => !n?.isRead).length,
    };
  }, [current?.Wallet?.balance, transactions, redemptions, supportTickets, notifications]);

  const saveProfile = async () => {
    if (!current?.id || !token) return;
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await updateAdminUserDetails(token, current.id, form);
      const updated = res?.user || {};
      setProfile((p) => ({ ...(p || {}), ...updated }));
      setForm((f) => ({
        ...f,
        name: updated?.name ?? f.name,
        username: updated?.username ?? f.username,
        email: updated?.email ?? f.email,
        phoneNumber: updated?.phoneNumber ?? f.phoneNumber,
        status: updated?.status ?? f.status,
      }));
      setMsg({ type: "success", text: "User profile updated." });
      if (onUpdate) onUpdate();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status) => {
    if (!current?.id || !token) return;
    try {
      await updateAdminUserStatus(token, current.id, status);
      setProfile((p) => ({ ...(p || {}), status }));
      setForm((f) => ({ ...f, status }));
      setMsg({ type: "success", text: `Status updated to ${status}.` });
      if (onUpdate) onUpdate();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Failed to update status." });
    }
  };

  if (!current) return null;

  const badge =
    msg.text && (
      <div
        className={`mb-3 rounded p-2 text-xs ${
          msg.type === "error"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}
      >
        {msg.text}
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[88vh] bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex overflow-hidden">
        <aside className="w-72 border-r border-slate-200 dark:border-zinc-800 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {current.name || "User"}
            </div>
            <div className="text-xs text-slate-500 truncate">{current.email || "-"}</div>
            <div className="text-[11px] text-slate-400 truncate">@{current.username || "-"}</div>
          </div>

          <div className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 rounded px-3 py-2 text-sm ${
                  tab === t.id
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="text-xs text-slate-500">Status: {current.status}</div>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => updateStatus("active")} className="text-[10px] rounded bg-emerald-100 text-emerald-700 py-1">Active</button>
              <button onClick={() => updateStatus("inactive")} className="text-[10px] rounded bg-amber-100 text-amber-700 py-1">Inactive</button>
              <button onClick={() => updateStatus("blocked")} className="text-[10px] rounded bg-rose-100 text-rose-700 py-1">Blocked</button>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
              User / {tab}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="p-2 rounded border border-slate-200 dark:border-zinc-700"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded border border-slate-200 dark:border-zinc-700"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {badge}

          {tab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded border p-3">Wallet: INR {fmtAmt(stats.wallet)}</div>
              <div className="rounded border p-3">Transactions: {stats.tx}</div>
              <div className="rounded border p-3">Redeemed: INR {fmtAmt(stats.redeemed)}</div>
              <div className="rounded border p-3">Redemptions: {stats.redemptions}</div>
              <div className="rounded border p-3">Support Tickets: {stats.support}</div>
              <div className="rounded border p-3">Unread Notifications: {stats.unread}</div>
            </div>
          )}

          {tab === "profile" && (
            <div className="max-w-2xl space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="rounded border px-3 py-2 bg-white dark:bg-zinc-900" />
                <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="Username" className="rounded border px-3 py-2 bg-white dark:bg-zinc-900" />
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="rounded border px-3 py-2 bg-white dark:bg-zinc-900" />
                <input value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} placeholder="Phone" className="rounded border px-3 py-2 bg-white dark:bg-zinc-900" />
              </div>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="rounded border px-3 py-2 bg-white dark:bg-zinc-900">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="blocked">blocked</option>
              </select>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-3 py-2"
              >
                <Save size={14} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {tab === "wallet" && (
            <div className="rounded border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-t">
                        <td className="p-2">{fmtDate(tx.createdAt)}</td>
                        <td className="p-2">{tx.type}</td>
                        <td className="p-2">{String(tx.category || "").replace(/_/g, " ") || "-"}</td>
                        <td className="p-2 text-right">{tx.type === "debit" ? "-" : "+"} INR {fmtAmt(tx.amount)}</td>
                        <td className="p-2">{tx.status || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-500">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "redemptions" && (
            <div className="rounded border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Campaign</th>
                    <th className="text-left p-2">Brand</th>
                    <th className="text-right p-2">Cashback</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.length ? (
                    redemptions.map((qr) => (
                      <tr key={qr.id || qr.uniqueHash} className="border-t">
                        <td className="p-2">{fmtDate(qr.redeemedAt || qr.updatedAt)}</td>
                        <td className="p-2">{qr.Campaign?.title || "-"}</td>
                        <td className="p-2">{qr.Campaign?.Brand?.name || "-"}</td>
                        <td className="p-2 text-right">INR {fmtAmt(qr.cashbackAmount)}</td>
                        <td className="p-2">{qr.status || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-500">No redemptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "support" && (
            <div className="space-y-2">
              {supportTickets.length ? (
                supportTickets.map((t) => (
                  <div key={t.id} className="rounded border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{t.subject || "Support Ticket"}</div>
                      <div className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">{t.status || "open"}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{fmtDate(t.createdAt)}</div>
                    <p className="mt-2 whitespace-pre-line">{t.message || "-"}</p>
                    {t.response && (
                      <div className="mt-2 rounded border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 p-2 text-xs">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300">Admin Response</div>
                        <div className="mt-1 whitespace-pre-line">{t.response}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded border p-3 text-sm text-slate-500">No support tickets found.</div>
              )}
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-2">
              {notifications.length ? (
                notifications.map((n) => (
                  <div key={n.id} className="rounded border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{n.title || "Notification"}</div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">{n.type || "system"}</span>
                        <span className={`px-2 py-0.5 rounded ${n.isRead ? "bg-slate-100 dark:bg-zinc-800" : "bg-emerald-100 text-emerald-700"}`}>
                          {n.isRead ? "read" : "unread"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{fmtDate(n.createdAt)}</div>
                    <p className="mt-2 whitespace-pre-line">{n.message || "-"}</p>
                    {n.metadata && <div className="text-[11px] text-slate-400 mt-1"><Info size={12} className="inline mr-1" />Metadata available</div>}
                  </div>
                ))
              ) : (
                <div className="rounded border p-3 text-sm text-slate-500">No notifications found.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserAccountManager;
