import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { MessageSquare, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { getVendorSupportTickets, createVendorSupportTicket, getVendorBrandInquiries } from "../../lib/api";
import { useToast } from "../ui";
import { useLocation } from "react-router-dom";

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd MMM yyyy, p");
};

const statusConfig = {
    open: { label: "Open", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Clock },
    in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-400/10", icon: AlertCircle },
    resolved: { label: "Resolved", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle },
    closed: { label: "Closed", color: "text-gray-400", bg: "bg-gray-400/10", icon: XCircle },
};

const priorityConfig = {
    low: { label: "Low", color: "text-gray-400" },
    medium: { label: "Medium", color: "text-yellow-400" },
    high: { label: "High", color: "text-orange-400" },
    urgent: { label: "Urgent", color: "text-red-400" },
};

const VendorSupport = ({ token }) => {
    const location = useLocation();
    const [tickets, setTickets] = useState([]);
    const [queries, setQueries] = useState([]);
    const [queriesError, setQueriesError] = useState("");
    const [isLoadingQueries, setIsLoadingQueries] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: "", message: "", priority: "medium" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const lastQueryCountRef = useRef(null);
    const queriesRef = useRef(null);
    const { info } = useToast();

    const loadTickets = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await getVendorSupportTickets(token);
            setTickets(data.tickets || []);
        } catch (err) {
            setError(err.message || "Failed to load support tickets");
        } finally {
            setIsLoading(false);
        }
    };

    const loadQueries = async () => {
        setIsLoadingQueries(true);
        setQueriesError("");
        try {
            const data = await getVendorBrandInquiries(token);
            const items = Array.isArray(data) ? data : data?.items || [];
            setQueries(items);
            if (lastQueryCountRef.current !== null && items.length > lastQueryCountRef.current) {
                const diff = items.length - lastQueryCountRef.current;
                info("New Customer Query", `${diff} new ${diff === 1 ? "query" : "queries"} received.`);
            }
            lastQueryCountRef.current = items.length;
        } catch (err) {
            setQueriesError(err.message || "Failed to load customer queries");
        } finally {
            setIsLoadingQueries(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadTickets();
            loadQueries();
        }
    }, [token]);

    useEffect(() => {
        const focus = new URLSearchParams(location.search).get("focus");
        if (focus === "queries" && queriesRef.current) {
            setTimeout(() => {
                queriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 150);
        }
    }, [location.search, queries.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) {
            setSubmitStatus("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("");
        try {
            await createVendorSupportTicket(token, form);
            setSubmitStatus("Ticket created successfully!");
            setForm({ subject: "", message: "", priority: "medium" });
            setShowForm(false);
            loadTickets();
        } catch (err) {
            setSubmitStatus(err.message || "Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Support</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create and track support tickets</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </button>
            </div>

            {/* Customer Queries */}
            <div ref={queriesRef} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customer Queries</h3>
                    <button
                        onClick={loadQueries}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-xs flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueries ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
                {queriesError && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2">
                        {queriesError}
                    </div>
                )}
                {isLoadingQueries ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Loading customer queries...</div>
                ) : queries.length === 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">No customer queries yet.</div>
                ) : (
                    <div className="space-y-3">
                        {queries.map((query) => {
                            const meta = query?.metadata || {};
                            const customerLabel = meta.customerName || meta.customerEmail || meta.customerPhone || "Customer";
                            const contactBits = [meta.customerEmail, meta.customerPhone].filter(Boolean).join(" • ");
                            const brandLabel = meta.brandName || "Brand";
                            return (
                                <div
                                    key={query.id}
                                    className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/50 p-3 space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold text-primary-strong">{brandLabel}</div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(query.createdAt)}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{customerLabel}</div>
                                    {contactBits && (
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{contactBits}</div>
                                    )}
                                    <p className="text-xs text-gray-600 dark:text-gray-300">{query.message}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* New Ticket Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Support Ticket</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Subject *</label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder="Brief description of your issue"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-strong"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Message *</label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Describe your issue in detail..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-strong resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-strong disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {submitStatus && (
                            <p className={`text-sm ${submitStatus.includes("success") ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                                {submitStatus}
                            </p>
                        )}
                    </form>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300">
                    {error}
                </div>
            )}

            {/* Tickets List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-8 text-center text-gray-500 dark:text-gray-400">
                        Loading tickets...
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-8 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Support Tickets</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any support tickets yet.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong"
                        >
                            Create Your First Ticket
                        </button>
                    </div>
                ) : (
                    tickets.map((ticket) => {
                        const status = statusConfig[ticket.status] || statusConfig.open;
                        const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={ticket.id}
                                className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 hover:border-gray-300 dark:hover:border-gray-600/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-gray-900 dark:text-white font-medium truncate">{ticket.subject}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <span className={`text-xs ${priority.color}`}>
                                                {priority.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{ticket.message}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                            Created: {formatDate(ticket.createdAt)}
                                            {ticket.updatedAt !== ticket.createdAt && ` • Updated: ${formatDate(ticket.updatedAt)}`}
                                        </p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${status.bg}`}>
                                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VendorSupport;
