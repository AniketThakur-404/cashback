
import React, { useState, useEffect } from "react";
import {
    X, CheckCircle2, AlertCircle, Building2, Store, Wallet, Megaphone,
    ShoppingBag, Activity, Calendar, Download, Eye, RotateCw, Save,
    ShieldCheck, Power, PieChart as PieChartIcon, BarChart as BarChartIcon, Briefcase
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell
} from "recharts";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import {
    getAdminVendorOverview,
    updateAdminVendorDetails,
    updateAdminVendorStatus,
    getAdminBrandOverview,
    updateAdminBrandDetails,
    updateAdminBrandStatus,
    getAdminTransactionsFiltered,
    getAdminOrders,
    updateAdminOrderStatus,
    getAdminQrBatch,
    uploadImage,
    updateAdminVendorCredentials,
    getAdminVendorCredentialRequests,
    approveAdminCredentialRequest,
    rejectAdminCredentialRequest,
    getAdminCampaignAnalytics,
    updateAdminCampaignStatus
} from "../../services/api";

const COLORS = ['#059669', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];
const QR_BASE_URL = import.meta.env.VITE_QR_BASE_URL || "https://shakti-gold-rewards.vercel.app/q";
const MAX_QR_PRICE = 10000;

const InputGroup = ({ label, value, onChange, type = "text", min, max, step }) => (
    <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#059669]/50 to-[#047857]/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="relative w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-all shadow-sm"
            />
        </div>
    </div>
);

const MetricItem = ({ label, value, subtext }) => (
    <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl flex flex-col justify-center min-h-[100px] backdrop-blur-md">
        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {value}
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {label}
        </div>
        {subtext && <div className="text-[10px] text-slate-400 mt-1">{subtext}</div>}
    </div>
);

const NavButton = ({ active, onClick, icon: Icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={`transition-colors ${active ? "text-[#059669]" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
            <span className="text-sm">{label}</span>
        </div>
        {badge && (
            <span className="bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-emerald-500/30">
                {badge}
            </span>
        )}
    </button>
);

const VendorAccountManager = ({
    vendorId,
    brandId,
    onClose,
    token,
    onUpdate,
    initialTab = "overview"
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Data States
    const [vendorData, setVendorData] = useState(null);
    const [brandData, setBrandData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderActionError, setOrderActionError] = useState("");
    const [campaignStats, setCampaignStats] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);

    // PDF Generation State
    const [isPreparingBatchPdf, setIsPreparingBatchPdf] = useState(false);
    const [qrBatchStatus, setQrBatchStatus] = useState("");
    const [qrBatchError, setQrBatchError] = useState("");
    const [batchQrs, setBatchQrs] = useState([]);

    const getQrValue = (hash) => {
        if (!QR_BASE_URL) return hash;
        return `${QR_BASE_URL}/redeem/${hash}`;
    };
    const getBatchCanvasId = (hash) => `pdf-qr-${hash}`;

    // Edit Forms
    const [vendorForm, setVendorForm] = useState({
        businessName: "",
        contactPhone: "",
        contactEmail: "",
        gstin: "",
        address: "",
        techFeePerQr: ""
    });
    const [brandForm, setBrandForm] = useState({
        name: "",
        website: "",
        logoUrl: "",
        qrPricePerUnit: ""
    });
    const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
    const [brandLogoUploadStatus, setBrandLogoUploadStatus] = useState("");
    const [brandLogoUploadError, setBrandLogoUploadError] = useState("");
    const [brandStatusForm, setBrandStatusForm] = useState({
        status: "",
        reason: ""
    });
    const [vendorStatusForm, setVendorStatusForm] = useState({
        status: "",
        reason: ""
    });
    const [credentialForm, setCredentialForm] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [credentialRequests, setCredentialRequests] = useState([]);
    const [isLoadingCredentialRequests, setIsLoadingCredentialRequests] = useState(false);
    const [credentialRequestError, setCredentialRequestError] = useState("");
    const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
    const [credentialActionStatus, setCredentialActionStatus] = useState("");
    const [credentialActionError, setCredentialActionError] = useState("");

    // Action States
    const [isSaving, setIsSaving] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
    const [processingOrderId, setProcessingOrderId] = useState(null);

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
        });
    };

    const getStatusClasses = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "active" || s === "paid" || s === "completed" || s === "shipped")
            return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
        if (s === "pending" || s === "processing")
            return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
        if (s === "paused" || s === "inactive")
            return "bg-secondary text-secondary-foreground border border-secondary/50";
        if (s === "rejected" || s === "failed" || s === "expired")
            return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
        return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400";
    };

    const handleRequestError = (err, setErrorState, defaultMessage) => {
        const message = err.response?.data?.message || err.message || defaultMessage;
        setErrorState(message);
        setActionMessage({ type: "error", text: message });
    };

    const loadCredentialRequests = async () => {
        if (!token || !vendorId) return;
        setIsLoadingCredentialRequests(true);
        setCredentialRequestError("");
        try {
            const data = await getAdminVendorCredentialRequests(token, vendorId, { status: "pending" });
            setCredentialRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            setCredentialRequestError(err.message || "Failed to load credential requests.");
        } finally {
            setIsLoadingCredentialRequests(false);
        }
    };

    const pendingCredentialRequest = credentialRequests.find(
        (request) => String(request?.status || "").toLowerCase() === "pending"
    );

    // Fetch Data
    useEffect(() => {
        if (!token) return;
        loadData();
    }, [token, vendorId, brandId]);

    // Fetch Analytics when campaign is selected
    useEffect(() => {
        if (selectedCampaign) {
            loadCampaignAnalytics(selectedCampaign.id);
        } else {
            setAnalyticsData(null);
        }
    }, [selectedCampaign]);

    useEffect(() => {
        const fallbackUsername =
            pendingCredentialRequest?.requestedUsername ||
            vendorData?.vendor?.User?.username ||
            vendorData?.vendor?.User?.email ||
            "";

        if (!fallbackUsername) return;

        setCredentialForm((prev) => {
            if (prev.username) return prev;
            return { ...prev, username: fallbackUsername };
        });
    }, [pendingCredentialRequest?.requestedUsername, vendorData?.vendor?.User?.username, vendorData?.vendor?.User?.email]);

    const loadCampaignAnalytics = async (campaignId) => {
        try {
            const data = await getAdminCampaignAnalytics(token, campaignId);
            setAnalyticsData(data);
        } catch (err) {
            console.error("Failed to load campaign analytics", err);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        setError("");
        console.log("Loading Vendor Data:", { vendorId, brandId });

        try {
            // 1. Load Vendor Overview if ID exists
            if (vendorId) {
                const vData = await getAdminVendorOverview(token, vendorId);
                setVendorData(vData);
                setVendorForm({
                    businessName: vData.vendor?.businessName || "",
                    contactPhone: vData.vendor?.contactPhone || "",
                    contactEmail: vData.vendor?.contactEmail || "",
                    gstin: vData.vendor?.gstin || "",
                    address: vData.vendor?.address || "",
                    techFeePerQr: vData.vendor?.techFeePerQr || ""
                });
                setVendorStatusForm({
                    status: vData.vendor?.status || "active",
                    reason: vData.vendor?.rejectionReason || ""
                });
            }

            // 2. Load Brand Overview if ID exists
            if (brandId) {
                const bData = await getAdminBrandOverview(token, brandId);
                setBrandData(bData);
                setBrandForm({
                    name: bData.brand?.name || "",
                    website: bData.brand?.website || "",
                    logoUrl: bData.brand?.logoUrl || "",
                    qrPricePerUnit:
                        bData.brand?.qrPricePerUnit !== undefined && bData.brand?.qrPricePerUnit !== null
                            ? String(bData.brand.qrPricePerUnit)
                            : ""
                });
                setBrandStatusForm({
                    status: bData.brand?.status || "active",
                    reason: ""
                });
            }

            // 3. Fetch Shared Data (Transactions & Orders)
            if (vendorId || brandId) {
                const params = {};
                if (vendorId) params.vendorId = vendorId;
                if (brandId) params.brandId = brandId;

                // Fetch transactions
                try {
                    const txData = await getAdminTransactionsFiltered(token, params);
                    setTransactions(txData?.transactions || (Array.isArray(txData) ? txData : []));
                } catch (txErr) {
                    console.warn("Failed to load transactions", txErr);
                }

                // Fetch orders
                try {
                    const orderParams = {};
                    if (vendorId) orderParams.vendorId = vendorId;
                    const ordersData = await getAdminOrders(token, orderParams);
                    setOrders(ordersData?.items || (Array.isArray(ordersData) ? ordersData : []));
                } catch (orderErr) {
                    console.warn("Failed to load orders", orderErr);
                    setOrders([]);
                }
            }

            if (vendorId) {
                await loadCredentialRequests();
            }

        } catch (err) {
            console.error(err);
            setError("Failed to load account details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVendor = async () => {
        if (!vendorId) return;
        setIsSaving(true);
        setActionMessage({ type: "", text: "" });
        try {
            await updateAdminVendorDetails(token, vendorId, vendorForm);
            setActionMessage({ type: "success", text: "Vendor profile updated successfully." });
            if (onUpdate) onUpdate();
            loadData();
        } catch (err) {
            setActionMessage({ type: "error", text: err.message || "Failed to update vendor." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateVendorStatus = async (override = {}) => {
        if (!vendorId) return;
        setIsSaving(true);
        setActionMessage({ type: "", text: "" });
        try {
            const payload = { ...vendorStatusForm, ...override };
            await updateAdminVendorStatus(token, vendorId, payload);

            if (vendorData?.vendor) {
                setVendorData({
                    ...vendorData,
                    vendor: { ...vendorData.vendor, status: payload.status }
                });
            }
            setVendorStatusForm((prev) => ({ ...prev, ...payload }));
            setActionMessage({ type: "success", text: `Vendor status updated to ${payload.status}.` });
            if (onUpdate) onUpdate();
        } catch (err) {
            setActionMessage({ type: "error", text: err.message || "Failed to update vendor status." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBrand = async () => {
        if (!brandId) return;
        const priceValue = brandForm.qrPricePerUnit === "" ? null : Number(brandForm.qrPricePerUnit);
        if (priceValue !== null && (!Number.isFinite(priceValue) || priceValue < 0 || priceValue > MAX_QR_PRICE)) {
            setActionMessage({
                type: "error",
                text: `QR price per unit must be between 0.01 and ${MAX_QR_PRICE}.`
            });
            return;
        }
        setIsSaving(true);
        setActionMessage({ type: "", text: "" });
        try {
            await updateAdminBrandDetails(token, brandId, brandForm);
            if (brandStatusForm.status !== brandData?.brand?.status) {
                await updateAdminBrandStatus(token, brandId, brandStatusForm);
            }
            setActionMessage({ type: "success", text: "Brand details updated successfully." });
            if (onUpdate) onUpdate();
            loadData();
        } catch (err) {
            setActionMessage({ type: "error", text: err.message || "Failed to update brand." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBrandLogoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!token) {
            setBrandLogoUploadError("Sign in to upload.");
            return;
        }
        setBrandLogoUploadStatus("");
        setBrandLogoUploadError("");
        setIsUploadingBrandLogo(true);
        try {
            const data = await uploadImage(token, file);
            const uploadedUrl = data?.url;
            if (!uploadedUrl) {
                throw new Error("Upload failed. No URL returned.");
            }
            setBrandForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
            setBrandLogoUploadStatus("Logo uploaded.");
        } catch (err) {
            setBrandLogoUploadError(err.message || "Failed to upload logo.");
        } finally {
            setIsUploadingBrandLogo(false);
            event.target.value = "";
        }
    };

    const handleCredentialUpdate = async ({ useRequestDefaults } = {}) => {
        if (!vendorId) return;
        setCredentialActionStatus("");
        setCredentialActionError("");

        const trimmedUsername = credentialForm.username.trim();
        const hasUsername = Boolean(trimmedUsername);
        const hasPassword = Boolean(credentialForm.password);

        if (hasPassword && credentialForm.password !== credentialForm.confirmPassword) {
            setCredentialActionError("Passwords do not match.");
            return;
        }

        const payload = {};
        if (!useRequestDefaults && hasUsername) payload.username = trimmedUsername;
        if (!useRequestDefaults && hasPassword) payload.password = credentialForm.password;

        if (!pendingCredentialRequest && !Object.keys(payload).length) {
            setCredentialActionError("Provide a username or password to update.");
            return;
        }

        if (pendingCredentialRequest && useRequestDefaults && !pendingCredentialRequest.requestedUsername && !pendingCredentialRequest.requestedPassword) {
            setCredentialActionError("No requested credentials available.");
            return;
        }

        setIsUpdatingCredentials(true);
        try {
            if (pendingCredentialRequest) {
                await approveAdminCredentialRequest(token, pendingCredentialRequest.id, payload);
                setCredentialActionStatus("Credential request approved.");
            } else {
                await updateAdminVendorCredentials(token, vendorId, payload);
                setCredentialActionStatus("Credentials updated.");
            }

            setCredentialForm((prev) => ({
                ...prev,
                password: "",
                confirmPassword: ""
            }));
            await loadCredentialRequests();
            await loadData();
        } catch (err) {
            setCredentialActionError(err.message || "Failed to update credentials.");
        } finally {
            setIsUpdatingCredentials(false);
        }
    };

    const handleRejectCredentialRequest = async () => {
        if (!pendingCredentialRequest) return;
        setCredentialActionStatus("");
        setCredentialActionError("");
        setIsUpdatingCredentials(true);
        try {
            await rejectAdminCredentialRequest(token, pendingCredentialRequest.id, {});
            setCredentialActionStatus("Credential request rejected.");
            await loadCredentialRequests();
        } catch (err) {
            setCredentialActionError(err.message || "Failed to reject request.");
        } finally {
            setIsUpdatingCredentials(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setProcessingOrderId(orderId);
        setActionMessage({ type: "", text: "" });
        try {
            await updateAdminOrderStatus(token, orderId, newStatus);
            setActionMessage({ type: "success", text: `Order ${newStatus} successfully.` });
            loadData();
        } catch (err) {
            console.error(err);
            handleRequestError(err, setOrderActionError, "Unable to update order status.");
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleDownloadOrderPdf = async (order) => {
        if (isPreparingBatchPdf) return;
        if (!order?.id) return;

        setQrBatchError("");
        setQrBatchStatus("");
        setIsPreparingBatchPdf(true);

        try {
            const data = await getAdminQrBatch(token, {
                orderId: order.id,
                limit: 5000
            });
            const items = Array.isArray(data) ? data : data?.items || [];

            if (!items.length) {
                setQrBatchError("No QRs found for this order.");
                setIsPreparingBatchPdf(false);
                return;
            }

            setBatchQrs(items);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const qrSize = 40;
            const margin = 14;
            const itemsPerRow = 4;
            const rowsPerPage = 6;
            const rowSpacing = qrSize + 28;
            const spacing = (pageWidth - margin * 2 - qrSize * itemsPerRow) / Math.max(itemsPerRow - 1, 1);
            const campaignTitle = order.campaignTitle || "Campaign";
            const priceLabel = formatAmount(order.cashbackAmount);
            const perQrPrice = order.quantity ? Number(order.printCost || 0) / order.quantity : 0;
            const perQrLabel = Number.isFinite(perQrPrice) && perQrPrice > 0 ? formatAmount(perQrPrice) : "0.00";
            const printCostLabel = formatAmount(order.printCost || 0);

            const drawHeader = () => {
                doc.setFontSize(16);
                doc.text(`QR Order #${order.id.slice(0, 8)} - INR ${priceLabel}`, margin, 18);
                doc.setFontSize(10);
                doc.text(`Campaign: ${campaignTitle}`, margin, 26);
                doc.text(`Quantity: ${order.quantity}`, margin, 32);
                doc.text(`Date: ${formatDate(order.createdAt)}`, margin, 38);
                doc.text(`QR price: INR ${perQrLabel}/QR | Print cost: INR ${printCostLabel}`, margin, 44);
            };

            drawHeader();
            let skipped = 0;
            const itemsPerPage = itemsPerRow * rowsPerPage;

            items.forEach((qr, index) => {
                const localIndex = index % itemsPerPage;
                if (index > 0 && localIndex === 0) {
                    doc.addPage();
                    drawHeader();
                }
                const col = localIndex % itemsPerRow;
                const row = Math.floor(localIndex / itemsPerRow);
                const xPos = margin + col * (qrSize + spacing);
                const yPos = 54 + row * rowSpacing;

                const canvas = document.getElementById(getBatchCanvasId(qr.uniqueHash));
                if (!canvas) {
                    skipped += 1;
                    return;
                }
                try {
                    const imgData = canvas.toDataURL("image/png");
                    doc.addImage(imgData, "PNG", xPos, yPos, qrSize, qrSize);
                    doc.setFontSize(8);
                    doc.text(qr.uniqueHash.slice(0, 8), xPos, yPos + qrSize + 6);
                    doc.text(`INR ${formatAmount(qr.cashbackAmount)}`, xPos, yPos + qrSize + 12);
                } catch (e) {
                    console.error("Canvas export error", e);
                    skipped++;
                }
            });

            if (skipped > 0) {
                setQrBatchStatus(`Downloaded PDF. ${skipped} QRs skipped.`);
            } else {
                setQrBatchStatus("Order PDF downloaded successfully.");
            }
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
            doc.save(`order-${order.id.slice(0, 8)}-${timestamp}.pdf`);
        } catch (err) {
            console.error("PDF Download Error:", err);
            setQrBatchError(err.message || "Failed to generate PDF.");
        } finally {
            setIsPreparingBatchPdf(false);
            setBatchQrs([]);
        }
    };

    const handleDownloadCampaignPdf = async (campaign) => {
        if (isPreparingBatchPdf || !campaign?.id) return;
        setQrBatchError("");
        setQrBatchStatus("Fetching QR data...");
        setIsPreparingBatchPdf(true);

        try {
            const data = await getAdminQrBatch(token, {
                campaignId: campaign.id,
                cashbackAmount: campaign.cashbackAmount,
                limit: 2000
            });
            const items = Array.isArray(data) ? data : data?.items || [];

            if (!items.length) {
                setQrBatchError("No QRs found for this campaign.");
                setIsPreparingBatchPdf(false);
                return;
            }

            setBatchQrs(items);
            setQrBatchStatus(`Rendering ${items.length} QRs...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const qrSize = 40;
            const margin = 14;
            const itemsPerRow = 4;
            const rowsPerPage = 6;
            const rowSpacing = qrSize + 28;
            const spacing = (pageWidth - margin * 2 - qrSize * itemsPerRow) / Math.max(itemsPerRow - 1, 1);
            const campaignTitle = campaign.title || "Campaign";
            const priceLabel = formatAmount(campaign.cashbackAmount);
            const brandName = brandData?.brand?.name || "Brand";

            const drawHeader = () => {
                doc.setFontSize(16);
                doc.text(`Campaign QRs - INR ${priceLabel}`, margin, 18);
                doc.setFontSize(10);
                doc.text(`Campaign: ${campaignTitle}`, margin, 26);
                doc.text(`Brand: ${brandName}`, margin, 32);
                doc.text(`Generated: ${formatDate(new Date())}`, margin, 38);
            };

            drawHeader();
            let skipped = 0;
            const itemsPerPage = itemsPerRow * rowsPerPage;

            items.forEach((qr, index) => {
                const localIndex = index % itemsPerPage;
                if (index > 0 && localIndex === 0) {
                    doc.addPage();
                    drawHeader();
                }
                const col = localIndex % itemsPerRow;
                const row = Math.floor(localIndex / itemsPerRow);
                const xPos = margin + col * (qrSize + spacing);
                const yPos = 46 + row * rowSpacing;

                const canvas = document.getElementById(getBatchCanvasId(qr.uniqueHash));
                if (!canvas) {
                    skipped += 1;
                    return;
                }
                try {
                    const imgData = canvas.toDataURL("image/png");
                    doc.addImage(imgData, "PNG", xPos, yPos, qrSize, qrSize);
                    doc.setFontSize(8);
                    doc.text(qr.uniqueHash.slice(0, 8), xPos, yPos + qrSize + 6);
                    doc.text(`INR ${formatAmount(qr.cashbackAmount)}`, xPos, yPos + qrSize + 12);
                } catch (e) {
                    console.error("Canvas export error", e);
                    skipped++;
                }
            });

            if (skipped > 0) {
                setQrBatchStatus(`Downloaded PDF. ${skipped} QRs skipped.`);
            } else {
                setQrBatchStatus("");
            }
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
            doc.save(`campaign-${campaign.id.slice(0, 8)}-${timestamp}.pdf`);
        } catch (err) {
            console.error("Campaign PDF Error:", err);
            setQrBatchError(err.message || "Failed to generate PDF.");
        } finally {
            setIsPreparingBatchPdf(false);
            setBatchQrs([]);
        }
    };

    const handleUpdateCampaignStatus = async (campaignId, newStatus) => {
        setIsSaving(true);
        setActionMessage({ type: "", text: "" });
        try {
            await updateAdminCampaignStatus(token, campaignId, newStatus);
            setActionMessage({ type: "success", text: `Campaign marked as ${newStatus}.` });
            if (selectedCampaign && selectedCampaign.id === campaignId) {
                setSelectedCampaign({ ...selectedCampaign, status: newStatus });
                if (brandData) {
                    const updatedCampaigns = brandData.campaigns.map(c =>
                        c.id === campaignId ? { ...c, status: newStatus } : c
                    );
                    setBrandData({ ...brandData, campaigns: updatedCampaigns });
                }
            }
            loadData();
        } catch (err) {
            console.error(err);
            setActionMessage({ type: "error", text: err.message || "Failed to update campaign." });
        } finally {
            setIsSaving(false);
        }
    };

    const getPieData = () => {
        if (!analyticsData?.statusCounts) return [];
        return Object.entries(analyticsData.statusCounts).map(([name, value]) => ({ name, value }));
    };

    /* START RENDER */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-gradient-to-br dark:from-[#2a2a2c] dark:via-[#1e1e20] dark:to-[#1f1f21] flex flex-col overflow-hidden transition-all duration-300">
                <div className="p-8 text-center text-slate-500">Loading UI...</div>
            </div>
        </div>
    );
    /* END RENDER */
};

export default VendorAccountManager;
