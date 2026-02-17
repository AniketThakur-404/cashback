import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  BadgeCheck,
  Megaphone,
  Package,
  Wallet,
  QrCode,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Plus,
  Info,
  ArrowRight,
  ClipboardCheck,
  Bell,
  MessageSquare,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Upload,
  Globe,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Users,
  HelpCircle,
  TicketCheck,
  Image as ImageIcon,
  FileText,
  Save,
  Building2,
  MapPin,
} from "lucide-react";
import {
  getMe,
  getVendorQrs,
  getVendorQrInventorySeries,
  getVendorWallet,
  getVendorTransactions,
  getVendorBrand,
  getVendorCampaigns,
  getVendorCampaignStats,
  getVendorOrders,
  getVendorProfile,
  upsertVendorBrand,
  updateUserProfile,
  getVendorProducts,
  addVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  uploadImage,
  loginWithEmail,
  createVendorCampaign,
  updateVendorCampaign,
  deleteVendorCampaign,
  deleteVendorQrBatch,
  orderVendorQrs,
  rechargeVendorWallet,
  updateVendorProfile,
  payVendorCampaign,
  downloadVendorOrderPdf,
  downloadCampaignQrPdf,
  createPaymentOrder,
  verifyPayment,
  getUserNotifications,
  markUserNotificationRead,
  changeUserPassword,
  sendEmailOtp,
  resetPasswordWithOtp,
  getVendorRedemptionsMap,
  getVendorCustomers,
  exportVendorCustomers,
  getVendorInvoices,
  downloadVendorInvoicePdf,
  shareVendorInvoice,
  getVendorProductReports,
  downloadVendorProductReport,
} from "../lib/api";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getApiBaseUrl } from "../lib/apiClient";
import VendorAnalytics from "../components/VendorAnalytics";
import VendorRedemptions from "../components/vendor/VendorRedemptions";
import VendorSupport from "../components/vendor/VendorSupport";
import ProductEditModal from "../components/ProductEditModal";
import StarBorder from "../components/StarBorder";

import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  DANGER_BUTTON,
  SUCCESS_BUTTON,
  GHOST_BUTTON,
  ICON_BUTTON,
  LINK_BUTTON,
  getTabButtonClass,
} from "../styles/buttonStyles";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const VENDOR_TOKEN_KEY = "cashback_vendor_token";
const formatAmount = (value) => {
  if (value === undefined || value === null) return "0.00";
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric.toFixed(2);
  return String(value);
};

const formatCompactAmount = (value) => {
  if (value === undefined || value === null) return "0.00";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);

  const abs = Math.abs(numeric);
  const sign = numeric < 0 ? "-" : "";
  const units = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const compact = abs / unit.value;
      const decimals = compact >= 100 ? 0 : compact >= 10 ? 1 : 2;
      let compactText = compact.toFixed(decimals);
      compactText = compactText
        .replace(/\.0+$/, "")
        .replace(/(\.\d*[1-9])0+$/, "$1");
      return `${sign}${compactText}${unit.suffix}`;
    }
  }

  return formatAmount(numeric);
};

const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd MMM yyyy");
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd MMM yyyy, p");
};

const notificationTypeConfig = {
  "qr-redeemed": {
    icon: QrCode,
    badgeClass:
      "bg-primary-strong/10 text-primary-strong border-primary-strong/20 dark:bg-primary-strong/15 dark:text-primary dark:border-primary-strong/30",
    label: "QR Redeemed",
  },
  "wallet-recharge": {
    icon: ArrowDownRight,
    badgeClass:
      "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/30",
    label: "Wallet Credit",
  },
  "wallet-debit": {
    icon: ArrowUpRight,
    badgeClass:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    label: "Wallet Debit",
  },
  "wallet-adjustment": {
    icon: Wallet,
    badgeClass:
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    label: "Wallet Adjustment",
  },
  "campaign-created": {
    icon: Megaphone,
    badgeClass:
      "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/30",
    label: "Campaign",
  },
  "pdf-downloaded": {
    icon: Download,
    badgeClass:
      "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/30",
    label: "PDF Download",
  },
  default: {
    icon: Bell,
    badgeClass:
      "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30",
    label: "Notification",
  },
};

const getNotificationMeta = (notification) => {
  if (!notification?.type) return notificationTypeConfig.default;
  return (
    notificationTypeConfig[notification.type] || notificationTypeConfig.default
  );
};

const API_BASE_URL = getApiBaseUrl();

const resolveAssetUrl = (value) => {
  if (!value) return "";
  const source = String(value).trim().replace(/\\/g, "/");
  if (!source) return "";
  if (/^(https?:\/\/|data:|blob:)/i.test(source)) return source;
  if (source.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${source}` : source;
  }
  if (/^(api\/)?uploads\//i.test(source)) {
    return API_BASE_URL ? `${API_BASE_URL}/${source}` : `/${source}`;
  }
  return source;
};

const normalizeQrStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .trim();

const isRedeemedQrStatus = (status) => {
  const normalized = normalizeQrStatus(status);
  return (
    normalized.includes("redeem") ||
    normalized.includes("claim") ||
    normalized.includes("used")
  );
};

const isInactiveQrStatus = (status) => {
  const normalized = normalizeQrStatus(status);
  return (
    normalized.includes("expire") ||
    normalized.includes("block") ||
    normalized.includes("revoke") ||
    normalized.includes("inactive") ||
    normalized.includes("cancel") ||
    normalized.includes("void")
  );
};

const formatTransactionDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd MMM yyyy, p");
};

const parseNumericValue = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const parseOptionalNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeWholeNumberInput = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "";
  }
  return String(Math.max(0, Math.trunc(numeric)));
};

const getAllocationRowTotal = (row) => {
  const cashback = parseOptionalNumber(row?.cashbackAmount);
  const quantity = parseOptionalNumber(row?.quantity);
  if (cashback === null || quantity === null) return null;
  return cashback * quantity;
};

const formatAllocationTotal = (row) => {
  const total = getAllocationRowTotal(row);
  return total === null ? "" : total.toFixed(2);
};

const getGeneratedPrice = (qr) => {
  const qrValue = parseNumericValue(qr?.cashbackAmount, 0);
  if (qrValue > 0) {
    return qrValue;
  }
  return parseNumericValue(qr?.Campaign?.cashbackAmount, 0);
};

const buildAllocationGroups = (allocations) => {
  if (!Array.isArray(allocations)) return [];
  const grouped = new Map();

  allocations.forEach((alloc) => {
    const price = parseNumericValue(alloc?.cashbackAmount, 0);
    const quantity = parseInt(alloc?.quantity, 10) || 0;
    const key = price.toFixed(2);
    if (!grouped.has(key)) {
      grouped.set(key, { price, quantity: 0, totalBudget: 0 });
    }
    const group = grouped.get(key);
    const rowBudget = parseNumericValue(alloc?.totalBudget, 0);
    group.quantity += quantity;
    group.totalBudget += rowBudget || price * quantity;
  });

  return Array.from(grouped.values()).sort((a, b) => a.price - b.price);
};

const getCampaignPaymentSummary = (campaign, qrPricePerUnit) => {
  const allocations = Array.isArray(campaign?.allocations)
    ? campaign.allocations
    : [];
  const totalQty = allocations.reduce(
    (sum, allocation) => sum + (parseInt(allocation?.quantity, 10) || 0),
    0,
  );
  const baseBudget = parseNumericValue(
    campaign?.subtotal,
    parseNumericValue(campaign?.totalBudget, 0),
  );
  const printCost = totalQty * parseNumericValue(qrPricePerUnit, 0);
  const totalCost = baseBudget + printCost;
  return { totalQty, baseBudget, printCost, totalCost };
};

const VendorDashboard = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  // Map URL section to internal state identifiers if necessary, or use directly
  // 'overview', 'brand', 'campaigns', 'products', 'wallet', 'scan'
  const allowedTabs = new Set([
    "overview",
    "brand",
    "campaigns",
    "products",
    "wallet",
    "redemptions",
    "support",
    "locations",
    "customers",
    "billing",
    "reports",
  ]);
  const normalizedSection =
    section === "qr-generation"
      ? "campaigns"
      : section === "settings"
        ? "brand"
        : section;
  const activeTab = allowedTabs.has(normalizedSection)
    ? normalizedSection
    : "overview";

  useEffect(() => {
    if (section === "notifications") {
      navigate("/vendor/overview", { replace: true });
    }
  }, [section, navigate]);

  const [token, setToken] = useState(() =>
    localStorage.getItem(VENDOR_TOKEN_KEY),
  );
  const [vendorInfo, setVendorInfo] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] =
    useState(false);
  const lastNotificationCountRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const notificationsTriggerRef = useRef(null);
  const { info, error: toastError } = useToast();

  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState("");
  const [walletStatus, setWalletStatus] = useState("");
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [isRecharging, setIsRecharging] = useState(false);

  const [campaignId, setCampaignId] = useState("");
  const [qrOrderStatus, setQrOrderStatus] = useState("");
  const [qrOrderError, setQrOrderError] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [lastOrderHashes, setLastOrderHashes] = useState([]);
  const [lastBatchSummary, setLastBatchSummary] = useState(null);
  const [selectedQrCampaign, setSelectedQrCampaign] = useState("");
  const [selectedQrProduct, setSelectedQrProduct] = useState("");
  const [selectedQrSeries, setSelectedQrSeries] = useState("");
  const [qrInventorySeries, setQrInventorySeries] = useState([]);
  const [qrRows, setQrRows] = useState([
    { id: Date.now(), cashbackAmount: "", quantity: 10 },
  ]);

  const [qrs, setQrs] = useState([]);
  const [qrError, setQrError] = useState("");
  const [isLoadingQrs, setIsLoadingQrs] = useState(false);
  const [deletingBatchKey, setDeletingBatchKey] = useState(null);
  const [qrPage, setQrPage] = useState(1);
  const [qrTotal, setQrTotal] = useState(0);
  const [qrStatusCounts, setQrStatusCounts] = useState({});
  const [qrHasMore, setQrHasMore] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [orderStatusCounts, setOrderStatusCounts] = useState({});
  const [ordersHasMore, setOrdersHasMore] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [transactionsError, setTransactionsError] = useState("");
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState({
    dateFrom: "",
    dateTo: "",
    campaignId: "",
    city: "",
    mobile: "",
    invoiceNo: "",
  });
  const [locationsData, setLocationsData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [isLoadingExtraTab, setIsLoadingExtraTab] = useState(false);
  const [extraTabError, setExtraTabError] = useState("");
  const [invoiceShareStatus, setInvoiceShareStatus] = useState("");

  const [showAllInventory, setShowAllInventory] = useState(false);

  const [companyProfile, setCompanyProfile] = useState({
    businessName: "",
    contactPhone: "",
    contactEmail: "",
    gstin: "",
    address: "",
    designation: "",
    alternatePhone: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [accountProfile, setAccountProfile] = useState({
    name: "",
    email: "",
    username: "",
    phoneNumber: "",
  });
  const [accountStatus, setAccountStatus] = useState("");
  const [accountError, setAccountError] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showOtpReset, setShowOtpReset] = useState(false);
  const [otpReset, setOtpReset] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpStatus, setOtpStatus] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingOtp, setIsResettingOtp] = useState(false);

  const [brandProfile, setBrandProfile] = useState({
    id: "",
    name: "",
    logoUrl: "",
    website: "",
    qrPricePerUnit: "",
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    description: "",
    logo: null,
    logoPreview: null,
  });
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  // Brand Logo Upload State
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [brandLogoStatus, setBrandLogoStatus] = useState("");
  const [brandLogoError, setBrandLogoError] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleBrandLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!token) {
      setBrandLogoError("Please sign in first.");
      return;
    }
    setIsUploadingBrandLogo(true);
    setBrandLogoStatus("");
    setBrandLogoError("");
    try {
      const data = await uploadImage(token, file);
      const uploadedUrl = data?.url;
      if (!uploadedUrl) {
        throw new Error("Upload failed. No URL returned.");
      }
      setBrandProfile((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      setBrandLogoStatus("Brand logo uploaded.");
      setImageLoadError(false);
    } catch (err) {
      setBrandLogoError(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingBrandLogo(false);
      event.target.value = "";
    }
  };

  const handleRegistrationChange = (field) => (e) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openSuccessModal = (title, message) => {
    setSuccessModal({
      isOpen: true,
      title,
      message,
    });
  };

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegistrationForm((prev) => ({
          ...prev,
          logo: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API
    setTimeout(() => {
      // Generate Mock Credentials
      const mockCreds = {
        vendorId: `VND-${Math.floor(10000 + Math.random() * 90000)}`,
        password: `pass${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setGeneratedCredentials(mockCreds);
      setRegistrationSubmitted(true);
    }, 1500);
  };
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignStatsMap, setCampaignStatsMap] = useState({});
  const [overviewCampaignId, setOverviewCampaignId] = useState("all");
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    cashbackAmount: "",
    totalBudget: "",
    productId: "",
  });
  const [campaignStatus, setCampaignStatus] = useState("");
  const [campaignError, setCampaignError] = useState("");
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [campaignRows, setCampaignRows] = useState([
    { id: Date.now(), cashbackAmount: "", quantity: "", totalBudget: "" },
  ]);
  const [campaignTab, setCampaignTab] = useState("create"); // 'create', 'pending', 'active'
  const [selectedPendingCampaign, setSelectedPendingCampaign] = useState(null);
  const [selectedActiveCampaign, setSelectedActiveCampaign] = useState(null);
  const [isPayingCampaign, setIsPayingCampaign] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState(null);

  const handleAddCampaignRow = () => {
    setCampaignRows((prev) => [
      ...prev,
      { id: Date.now(), cashbackAmount: "", quantity: "", totalBudget: "" },
    ]);
  };

  const handleRemoveCampaignRow = (id) => {
    setCampaignRows((prev) => {
      const remaining = prev.filter((row) => row.id !== id);
      return remaining.length
        ? remaining
        : [
            {
              id: Date.now(),
              cashbackAmount: "",
              quantity: "",
              totalBudget: "",
            },
          ];
    });
  };

  const handleCampaignRowChange = (id, field, value) => {
    setCampaignRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const normalizedValue =
            field === "cashbackAmount" || field === "quantity"
              ? normalizeWholeNumberInput(value)
              : value;
          const updatedRow = { ...row, [field]: normalizedValue };
          if (field === "cashbackAmount" || field === "quantity") {
            const cb = parseFloat(updatedRow.cashbackAmount);
            const qty = parseFloat(updatedRow.quantity);
            if (!isNaN(cb) && !isNaN(qty) && cb > 0 && qty > 0) {
              updatedRow.totalBudget = (cb * qty).toFixed(2);
            } else {
              updatedRow.totalBudget = "";
            }
          }
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const campaignAllocationSummary = useMemo(() => {
    return campaignRows.reduce(
      (summary, row) => {
        const quantityValue = parseOptionalNumber(row.quantity);
        const rowTotal = getAllocationRowTotal(row);
        summary.subtotal += rowTotal ?? 0;
        if (Number.isFinite(quantityValue)) {
          summary.quantity += Math.max(0, Math.floor(quantityValue));
        }
        return summary;
      },
      { subtotal: 0, quantity: 0 },
    );
  }, [campaignRows]);

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    variant: "",
    category: "",
    description: "",
    imageUrl: "",
  });
  const [productStatus, setProductStatus] = useState("");
  const [productError, setProductError] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productImageUploadStatus, setProductImageUploadStatus] = useState("");
  const [productImageUploadError, setProductImageUploadError] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalContext, setProductModalContext] = useState(null); // 'campaign' or 'qr'
  const [failedProductImages, setFailedProductImages] = useState(
    () => new Set(),
  );
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // QR Row Handlers
  const handleAddQrRow = () => {
    setQrRows((prev) => [
      ...prev,
      { id: Date.now(), cashbackAmount: "", quantity: 10 },
    ]);
  };
  const handleRemoveQrRow = (id) => {
    setQrRows((prev) => {
      const remaining = prev.filter((row) => row.id !== id);
      return remaining.length
        ? remaining
        : [{ id: Date.now(), cashbackAmount: "", quantity: 10 }];
    });
  };
  const handleQrRowChange = (id, field, value) => {
    setQrRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedQrCampaign),
    [campaigns, selectedQrCampaign],
  );

  const campaignPriceHints = useMemo(() => {
    const map = {};
    qrs.forEach((qr) => {
      const campaignId = qr.Campaign?.id || qr.campaignId;
      if (!campaignId) return;
      const price = getGeneratedPrice(qr);
      if (!price) return;
      const createdAt = new Date(qr.createdAt || 0).getTime();
      const existing = map[campaignId];
      if (!existing || createdAt > existing.createdAt) {
        map[campaignId] = { price, createdAt };
      }
    });
    return map;
  }, [qrs]);

  const selectedCampaignCashback = parseNumericValue(
    selectedCampaign?.cashbackAmount,
    0,
  );
  const selectedCampaignBudget = parseNumericValue(
    selectedCampaign?.totalBudget,
    0,
  );
  const selectedCampaignPriceHint = selectedCampaign
    ? campaignPriceHints[selectedCampaign.id]?.price || 0
    : 0;
  const effectiveCampaignCashback =
    selectedCampaignCashback > 0
      ? selectedCampaignCashback
      : selectedCampaignPriceHint;

  const isAuthenticated = Boolean(token);
  const subscriptionStatus = String(
    subscriptionInfo?.status || "INACTIVE",
  ).toLowerCase();
  const subscriptionStatusLabel = subscriptionStatus.toUpperCase();
  const subscriptionBadgeClass =
    {
      active: "bg-primary/10 text-primary",
      paused: "bg-amber-500/10 text-amber-400",
      expired: "bg-rose-500/10 text-rose-400",
      inactive: "bg-rose-500/10 text-rose-400",
    }[subscriptionStatus] || "bg-slate-500/10 text-slate-300";
  const subscriptionEndsAt = formatShortDate(subscriptionInfo?.endDate);
  const subscriptionStartsAt = formatShortDate(subscriptionInfo?.startDate);
  const subscriptionPlanLabel = "-";
  const subscriptionHeading =
    subscriptionStatus === "expired"
      ? "Subscription expired"
      : subscriptionStatus === "paused"
        ? "Subscription paused"
        : "Subscription inactive";
  const qrPricePerUnit = parseNumericValue(brandProfile?.qrPricePerUnit, 1);
  const brandLogoPreviewSrc = resolveAssetUrl(brandProfile.logoUrl);

  const getQrValue = (hash) => {
    const envBase = import.meta.env.VITE_QR_BASE_URL;
    if (envBase) {
      return `${envBase.replace(/\/$/, "")}/redeem/${hash}`;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/redeem/${hash}`;
    }
    return hash;
  };

  const getQrCanvasId = (hash) => `qr-canvas-${hash}`;

  const setStatusWithTimeout = (message) => {
    setQrActionStatus(message);
    setTimeout(() => setQrActionStatus(""), 2000);
  };

  const getStatusClasses = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "redeemed") return "text-primary dark:text-primary";
    if (normalized === "paid" || normalized === "shipped") {
      return "text-primary dark:text-primary";
    }
    if (normalized === "expired") return "text-rose-600 dark:text-rose-400";
    if (normalized === "assigned") return "text-amber-600 dark:text-amber-400";
    if (normalized === "generated" || normalized === "active") {
      return "text-primary-strong dark:text-primary";
    }
    return "text-gray-500 dark:text-gray-400";
  };

  const copyToClipboard = async (value) => {
    const textValue = String(value ?? "");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textValue);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textValue;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleCopyHash = async (hash) => {
    const ok = await copyToClipboard(hash);
    setStatusWithTimeout(ok ? "QR hash copied." : "Unable to copy QR hash.");
  };

  const handleDownloadQr = (hash) => {
    const canvas = document.getElementById(getQrCanvasId(hash));
    if (!canvas) {
      setStatusWithTimeout("QR not ready yet.");
      return;
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-${hash.slice(0, 8)}.png`;
    link.click();
  };

  const handleDownloadGroupPdf = (group) => {
    if (!group || !group.qrs || group.qrs.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const qrSize = 40;
    const margin = 14;
    const itemsPerRow = 4;
    const rowsPerPage = 6;
    const rowSpacing = qrSize + 28;
    const spacing =
      (pageWidth - margin * 2 - qrSize * itemsPerRow) /
      Math.max(itemsPerRow - 1, 1);
    const displayPrice = parseNumericValue(
      group.price,
      group.qrs[0]?.cashbackAmount ?? 0,
    );
    const priceLabel = formatAmount(displayPrice);
    const campaignTitle = group.campaignTitle || "Campaign";

    const drawHeader = () => {
      doc.setFontSize(16);
      doc.text(`QR Batch - INR ${priceLabel}`, margin, 18);
      doc.setFontSize(10);
      doc.text(`Campaign: ${campaignTitle}`, margin, 26);
    };
    drawHeader();

    const itemsPerPage = itemsPerRow * rowsPerPage;

    group.qrs.forEach((qr, index) => {
      const localIndex = index % itemsPerPage;
      if (index > 0 && localIndex === 0) {
        doc.addPage();
        drawHeader();
      }

      const col = localIndex % itemsPerRow;
      const row = Math.floor(localIndex / itemsPerRow);
      const xPos = margin + col * (qrSize + spacing);
      const yPos = 36 + row * rowSpacing;

      const canvas = document.getElementById(getQrCanvasId(qr.uniqueHash));
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", xPos, yPos, qrSize, qrSize);

      const perPrice = getGeneratedPrice(qr) || displayPrice;
      doc.setFontSize(8);
      doc.text(qr.uniqueHash.slice(0, 8), xPos, yPos + qrSize + 6);
      doc.text(`INR ${formatAmount(perPrice)}`, xPos, yPos + qrSize + 12);
    });

    doc.save(`qrs-${priceLabel}-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`);
  };

  const handleDeleteQrBatch = async ({
    campaignId,
    priceKey,
    price,
    count,
  }) => {
    if (!token) return;
    const priceLabel = formatAmount(price);
    const confirmMessage = `Delete ${count} QR${count !== 1 ? "s" : ""} at INR ${priceLabel}? Only unused QRs will be removed.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const batchKey = `${campaignId}-${priceKey ?? price}`;
    setDeletingBatchKey(batchKey);
    setQrError("");

    try {
      const result = await deleteVendorQrBatch(
        token,
        campaignId,
        priceKey ?? price,
      );
      const deleted = result.deleted ?? result.count ?? 0;
      const skipped = result.skipped ?? 0;
      if (skipped > 0) {
        setStatusWithTimeout(
          `Deleted ${deleted} QRs. Skipped ${skipped} redeemed/blocked.`,
        );
      } else {
        setStatusWithTimeout(`Deleted ${deleted} QRs from batch.`);
      }
      await loadQrs();
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setQrError(err.message || "Failed to delete QR batch.");
      setTimeout(() => setQrError(""), 3000);
    } finally {
      setDeletingBatchKey(null);
    }
  };

  const handlePrintQr = (hash) => {
    const canvas = document.getElementById(getQrCanvasId(hash));
    if (!canvas) {
      setStatusWithTimeout("QR not ready yet.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "width=480,height=520");
    if (!printWindow) {
      setStatusWithTimeout("Popup blocked.");
      return;
    }
    printWindow.document.write(
      `<html><head><title>Print QR</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;"><img src="${dataUrl}" style="width:320px;height:320px;" /></body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({
    show: false,
    progress: 0,
    message: "",
  });

  const runDownloadWithProgress = async (downloadTask, initialMessage) => {
    setDownloadProgress({
      show: true,
      progress: 12,
      message: initialMessage || "Preparing your PDF...",
    });

    let progressValue = 12;
    const progressTimer = setInterval(() => {
      progressValue = Math.min(progressValue + 7, 88);
      setDownloadProgress((prev) => ({
        ...prev,
        progress: progressValue,
      }));
    }, 220);

    try {
      setDownloadProgress((prev) => ({
        ...prev,
        progress: Math.max(prev.progress, 30),
        message: "Generating file...",
      }));
      await downloadTask();
      clearInterval(progressTimer);
      setDownloadProgress({
        show: true,
        progress: 100,
        message: "Download complete!",
      });
      setTimeout(() => {
        setDownloadProgress({ show: false, progress: 0, message: "" });
      }, 1400);
    } catch (err) {
      clearInterval(progressTimer);
      setDownloadProgress({ show: false, progress: 0, message: "" });
      throw err;
    }
  };

  const handleDownloadOrderPdf = async (orderId) => {
    if (!token || !orderId) return;
    setIsDownloadingPdf(orderId);

    try {
      await runDownloadWithProgress(
        () => downloadVendorOrderPdf(token, orderId),
        "Preparing order PDF...",
      );

      setStatusWithTimeout("PDF downloaded successfully.");
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      const errorMsg = err.message || "Failed to download PDF.";
      setStatusWithTimeout(errorMsg);
      toastError("Download Failed", errorMsg);
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  const handleDownloadCampaignPdf = async (campaignId) => {
    if (!token || !campaignId) return;
    setIsDownloadingPdf(campaignId);

    try {
      await runDownloadWithProgress(
        () => downloadCampaignQrPdf(token, campaignId),
        "Preparing campaign PDF...",
      );
      setStatusWithTimeout("Campaign QR PDF downloaded successfully.");
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      const errorMsg = err.message || "Failed to download PDF.";
      setStatusWithTimeout(errorMsg);
      toastError("Download Failed", errorMsg);
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  const clearSession = (message) => {
    localStorage.removeItem(VENDOR_TOKEN_KEY);
    setToken(null);
    setVendorInfo(null);
    setAuthStatus(message || "");
    setNotifications([]);
    setNotificationsError("");
    setIsLoadingNotifications(false);
    setIsNotificationsOpen(false);
    lastNotificationCountRef.current = null;
    setLastBatchSummary(null);
    setDeletingBatchKey(null);
    lastAutoFilledCashbackRef.current = null;
    setSubscriptionBlocked("");
    setSubscriptionInfo(null);
    setSelectedActiveCampaign(null);
    setQrs([]);
    setQrTotal(0);
    setQrPage(1);
    setQrStatusCounts({});
    setQrHasMore(false);
    setOrders([]);
    setOrdersTotal(0);
    setOrdersPage(1);
    setOrderStatusCounts({});
    setOrdersHasMore(false);
    setTransactions([]);
    setTransactionsError("");
    setIsLoadingTransactions(false);
    setShowAllTransactions(false);
    setAccountProfile({
      name: "",
      email: "",
      username: "",
      phoneNumber: "",
    });
    setAccountStatus("");
    setAccountError("");
    setIsSavingAccount(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus("");
    setPasswordError("");
    setIsChangingPassword(false);
    setShowOtpReset(false);
    setOtpReset({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtpStatus("");
    setOtpError("");
    setIsSendingOtp(false);
    setIsResettingOtp(false);
  };

  const handleVendorAccessError = (err) => {
    if (err?.status === 401) {
      clearSession("Session expired.");
      return true;
    }
    if (err?.status === 403) {
      setAuthError(err.message || "Access denied.");
      return true;
    }
    return false;
  };

  const loadVendor = async (authToken) => {
    try {
      const data = await getMe(authToken);
      if (data?.role && data.role !== "vendor") {
        clearSession("This account is not a vendor.");
        setAuthError("This account is not a vendor.");
        return;
      }
      setVendorInfo(data);
    } catch (err) {
      if (err.status === 401) {
        clearSession("Session expired.");
      } else {
        setAuthError(err.message || "Unable to load vendor profile.");
      }
    }
  };

  const loadNotifications = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingNotifications(true);
    setNotificationsError("");
    try {
      const data = await getUserNotifications(authToken);
      const list = Array.isArray(data) ? data : data?.items || [];
      setNotifications(list);
      if (
        lastNotificationCountRef.current !== null &&
        list.length > lastNotificationCountRef.current
      ) {
        const diff = list.length - lastNotificationCountRef.current;
        info(
          "New Notification",
          `${diff} new ${diff === 1 ? "notification" : "notifications"} received.`,
        );
      }
      lastNotificationCountRef.current = list.length;
    } catch (err) {
      if (err?.status === 401) {
        clearSession("Session expired.");
        return;
      }
      setNotificationsError(err.message || "Unable to load notifications.");
      toastError(
        "Notifications Failed",
        err.message || "Unable to load notifications.",
      );
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationRead = async (notification) => {
    if (!notification?.id || notification.isRead || !token) return;
    try {
      await markUserNotificationRead(token, notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
    } catch (err) {
      toastError(
        "Notification Update Failed",
        err.message || "Unable to mark notification as read.",
      );
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;

    const unreadItems = notifications.filter(
      (item) => item?.id && !item.isRead,
    );
    if (!unreadItems.length) return;

    setIsMarkingNotificationsRead(true);
    setNotificationsError("");
    try {
      const results = await Promise.allSettled(
        unreadItems.map((item) => markUserNotificationRead(token, item.id)),
      );

      const successIds = new Set(
        unreadItems
          .filter((_, index) => results[index]?.status === "fulfilled")
          .map((item) => item.id),
      );
      const failedCount = unreadItems.length - successIds.size;

      if (successIds.size > 0) {
        setNotifications((prev) =>
          prev.map((item) =>
            successIds.has(item.id) ? { ...item, isRead: true } : item,
          ),
        );
        info(
          "Notifications Updated",
          `${successIds.size} notification${successIds.size === 1 ? "" : "s"} marked as read.`,
        );
      }

      if (failedCount > 0) {
        toastError(
          "Some Notifications Failed",
          `${failedCount} notification${failedCount === 1 ? "" : "s"} could not be marked read.`,
        );
      }
    } catch (err) {
      toastError(
        "Notification Update Failed",
        err.message || "Unable to mark notifications as read.",
      );
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    await handleNotificationRead(notification);
    const metadataTab = notification?.metadata?.tab;
    let target = metadataTab ? `/vendor/${metadataTab}` : "/vendor/overview";
    switch (notification?.type) {
      case "qr-redeemed":
        target = "/vendor/redemptions";
        break;
      case "wallet-recharge":
      case "wallet-debit":
      case "wallet-adjustment":
        target = "/vendor/wallet";
        break;
      case "campaign-created":
      case "pdf-downloaded":
        target = "/vendor/campaigns";
        break;
      default:
        break;
    }
    setIsNotificationsOpen(false);
    navigate(target);
  };

  const loadWallet = async (authToken = token) => {
    if (!authToken) return false;
    setIsLoadingWallet(true);
    setWalletError("");
    try {
      const data = await getVendorWallet(authToken);
      setWallet(data);
      return true;
    } catch (err) {
      if (handleVendorAccessError(err)) return false;
      if (err.status === 404) {
        setWallet(null);
      } else {
        setWalletError(err.message || "Unable to load wallet.");
      }
      return true;
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const loadQrs = async (
    authToken = token,
    { page = 1, append = false } = {},
  ) => {
    if (!authToken) return;
    setIsLoadingQrs(true);
    setQrError("");
    const limit = 120;
    try {
      const data = await getVendorQrs(authToken, { page, limit });
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.data || [];
      const total = Number.isFinite(data?.total) ? data.total : items.length;
      const statusCounts = data?.statusCounts || {};

      setQrs((prev) => {
        const updated = append ? [...prev, ...items] : items;
        setQrHasMore(updated.length < total);
        return updated;
      });
      setQrTotal(total);
      setQrPage(page);
      setQrStatusCounts(statusCounts);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setQrs([]);
        setQrTotal(0);
        setQrHasMore(false);
      } else {
        setQrError(err.message || "Unable to load QR inventory.");
      }
    } finally {
      setIsLoadingQrs(false);
    }
  };

  const loadOrders = async (
    authToken = token,
    { page = 1, append = false } = {},
  ) => {
    if (!authToken) return;
    setIsLoadingOrders(true);
    setOrdersError("");
    const limit = 20;
    try {
      const data = await getVendorOrders(authToken, { page, limit });
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.data || [];
      const total = Number.isFinite(data?.total) ? data.total : items.length;
      const statusCounts = data?.statusCounts || {};

      setOrders((prev) => {
        const updated = append ? [...prev, ...items] : items;
        setOrdersHasMore(updated.length < total);
        return updated;
      });
      setOrdersTotal(total);
      setOrdersPage(page);
      setOrderStatusCounts(statusCounts);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setOrders([]);
        setOrdersTotal(0);
        setOrdersHasMore(false);
      } else {
        setOrdersError(err.message || "Unable to load orders.");
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadTransactions = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingTransactions(true);
    setTransactionsError("");
    try {
      const data = await getVendorTransactions(authToken);
      setTransactions(Array.isArray(data) ? data : data?.transactions || []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setTransactions([]);
      } else {
        setTransactionsError(err.message || "Unable to load transactions.");
      }
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const loadQrInventorySeries = async (authToken = token) => {
    if (!authToken) return;
    try {
      const data = await getVendorQrInventorySeries(authToken);
      setQrInventorySeries(Array.isArray(data?.series) ? data.series : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setQrInventorySeries([]);
    }
  };

  const buildExtraFilterParams = () => {
    const params = {};
    if (dashboardFilters.dateFrom) params.dateFrom = dashboardFilters.dateFrom;
    if (dashboardFilters.dateTo) params.dateTo = dashboardFilters.dateTo;
    if (dashboardFilters.campaignId)
      params.campaignId = dashboardFilters.campaignId;
    if (dashboardFilters.city) params.city = dashboardFilters.city.trim();
    if (dashboardFilters.mobile)
      params.mobile = dashboardFilters.mobile.trim();
    if (dashboardFilters.invoiceNo)
      params.invoiceNo = dashboardFilters.invoiceNo.trim();
    return params;
  };

  const loadLocationsData = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingExtraTab(true);
    setExtraTabError("");
    try {
      const data = await getVendorRedemptionsMap(authToken, buildExtraFilterParams());
      setLocationsData(Array.isArray(data?.points) ? data.points : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setExtraTabError(err.message || "Unable to load locations.");
    } finally {
      setIsLoadingExtraTab(false);
    }
  };

  const loadCustomersData = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingExtraTab(true);
    setExtraTabError("");
    try {
      const data = await getVendorCustomers(authToken, buildExtraFilterParams());
      setCustomersData(Array.isArray(data?.customers) ? data.customers : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setExtraTabError(err.message || "Unable to load customers.");
    } finally {
      setIsLoadingExtraTab(false);
    }
  };

  const loadInvoicesData = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingExtraTab(true);
    setExtraTabError("");
    try {
      const data = await getVendorInvoices(authToken, buildExtraFilterParams());
      setInvoicesData(Array.isArray(data?.invoices) ? data.invoices : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setExtraTabError(err.message || "Unable to load invoices.");
    } finally {
      setIsLoadingExtraTab(false);
    }
  };

  const loadReportsData = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingExtraTab(true);
    setExtraTabError("");
    try {
      const data = await getVendorProductReports(
        authToken,
        buildExtraFilterParams(),
      );
      setReportsData(Array.isArray(data?.reports) ? data.reports : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setExtraTabError(err.message || "Unable to load product reports.");
    } finally {
      setIsLoadingExtraTab(false);
    }
  };

  const loadExtraTabData = async (authToken = token) => {
    if (!authToken) return;
    if (activeTab === "locations") {
      await loadLocationsData(authToken);
      return;
    }
    if (activeTab === "customers") {
      await loadCustomersData(authToken);
      return;
    }
    if (activeTab === "billing") {
      await loadInvoicesData(authToken);
      return;
    }
    if (activeTab === "reports") {
      await loadReportsData(authToken);
    }
  };

  const loadCompanyProfile = async (authToken = token) => {
    if (!authToken) return;
    setRegistrationError("");
    try {
      const data = await getVendorProfile(authToken);
      setCompanyProfile({
        businessName: data.businessName || "",
        contactPhone: data.contactPhone || accountProfile.phoneNumber || "",
        contactEmail: data.contactEmail || accountProfile.email || "",
        gstin: data.gstin || "",
        address: data.address || "",
        designation: data.designation || "",
        alternatePhone: data.alternatePhone || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setCompanyProfile({
          businessName: "",
          contactPhone: accountProfile.phoneNumber || "",
          contactEmail: accountProfile.email || "",
          gstin: "",
          address: "",
          designation: "",
          alternatePhone: "",
          city: "",
          state: "",
          pincode: "",
        });
      } else {
        setRegistrationError(err.message || "Unable to load company profile.");
      }
    }
  };

  const loadBrandProfile = async (authToken = token) => {
    if (!authToken) return;
    setRegistrationError("");
    try {
      const data = await getVendorBrand(authToken);
      setBrandProfile({
        id: data.id || "",
        name: data.name || "",
        logoUrl: data.logoUrl || "",
        website: data.website || "",
        qrPricePerUnit:
          data.qrPricePerUnit !== undefined && data.qrPricePerUnit !== null
            ? Number(data.qrPricePerUnit)
            : "",
      });
      setSubscriptionInfo(null);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setBrandProfile({
          id: "",
          name: "",
          logoUrl: "",
          website: "",
          qrPricePerUnit: "",
        });
        setSubscriptionInfo(null);
      } else {
        setRegistrationError(err.message || "Unable to load brand profile.");
      }
    }
  };

  const loadCampaigns = async (authToken = token) => {
    if (!authToken) return;
    setCampaignError("");
    try {
      const data = await getVendorCampaigns(authToken);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setCampaigns([]);
      } else {
        setCampaignError(err.message || "Unable to load campaigns.");
      }
    }
  };

  const loadCampaignStats = async (authToken = token) => {
    if (!authToken) return;
    try {
      const data = await getVendorCampaignStats(authToken);
      const statsList = Array.isArray(data) ? data : [];
      const map = {};
      statsList.forEach((stat) => {
        if (stat?.id) {
          map[stat.id] = stat;
        }
        if (stat?.campaign) {
          map[`title:${stat.campaign}`] = stat;
        }
      });
      setCampaignStatsMap(map);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      // Keep stats map as-is on failure
    }
  };

  const loadProducts = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingProducts(true);
    setProductError("");
    try {
      const data = await getVendorProducts(authToken);
      setProducts(Array.isArray(data) ? data : []);
      setFailedProductImages(new Set());
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      if (err.status === 404) {
        setProducts([]);
      } else {
        setProductError(err.message || "Unable to load products.");
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSaveProduct = async (formData) => {
    if (!token) return;

    setIsSavingProduct(true);
    setProductError("");
    setProductStatus("");

    try {
      const payload = { ...formData };
      const imageFile = payload.imageFile;
      delete payload.imageFile;
      payload.sku =
        typeof payload.sku === "string" ? payload.sku.trim() || null : null;
      payload.mrp =
        payload.mrp === undefined || payload.mrp === null || payload.mrp === ""
          ? null
          : Number(payload.mrp);
      payload.packSize =
        typeof payload.packSize === "string"
          ? payload.packSize.trim() || null
          : null;
      payload.warranty =
        typeof payload.warranty === "string"
          ? payload.warranty.trim() || null
          : null;

      if (imageFile) {
        setIsUploadingProductImage(true);
        setProductImageUploadStatus("");
        setProductImageUploadError("");
        try {
          const uploadResult = await uploadImage(token, imageFile);
          const uploadedUrl = uploadResult?.url;
          if (!uploadedUrl) {
            throw new Error("Image upload failed. No URL returned.");
          }
          payload.imageUrl = uploadedUrl;
          setProductImageUploadStatus("Image uploaded.");
        } catch (uploadErr) {
          setProductImageUploadError(
            uploadErr.message || "Failed to upload image.",
          );
          throw uploadErr;
        } finally {
          setIsUploadingProductImage(false);
        }
      }

      if (editingProduct?.id) {
        // Update existing product
        await updateVendorProduct(token, editingProduct.id, payload);
        setProductStatus("Product updated successfully!");
      } else {
        if (!payload.brandId) {
          let effectiveBrandId = brandProfile?.id || null;
          if (!effectiveBrandId) {
            try {
              const brand = await getVendorBrand(token);
              effectiveBrandId = brand?.id || null;
            } catch (brandErr) {
              if (handleVendorAccessError(brandErr)) return;
              setProductError(
                "No brand is assigned yet. Please contact the admin.",
              );
              setIsSavingProduct(false);
              return;
            }
          }
          if (!effectiveBrandId) {
            setProductError(
              "No brand is assigned yet. Please contact the admin.",
            );
            setIsSavingProduct(false);
            return;
          }
          payload.brandId = effectiveBrandId;
        }
        // Add new product
        const newProduct = await addVendorProduct(token, payload);
        const newProductId = newProduct?.id || newProduct?.data?.id;

        setProductStatus("Product added successfully!");

        // Refresh product list
        await loadProducts();

        // Auto-select the new product if context exists
        if (newProductId) {
          if (productModalContext === "campaign") {
            setCampaignForm((prev) => ({ ...prev, productId: newProductId }));
          } else if (productModalContext === "qr") {
            setSelectedQrProduct(newProductId);
          }
        }
      }

      // Refresh product list
      if (!editingProduct?.id) {
        // already handled above for new products to ensure timing
      } else {
        await loadProducts();
      }

      // Close modal
      setShowProductModal(false);
      setEditingProduct(null);
      setProductModalContext(null);

      // Clear status after 3 seconds
      setTimeout(() => setProductStatus(""), 3000);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setProductError(err.message || "Failed to save product.");
      setTimeout(() => setProductError(""), 3000);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!token || !productId) return;

    if (
      !window.confirm(
        "Delete this product and all its campaigns/QRs? This action cannot be undone.",
      )
    ) {
      return;
    }

    setProductError("");
    setProductStatus("");

    try {
      await deleteVendorProduct(token, productId);
      setProductStatus(
        "Product and associated campaigns deleted successfully!",
      );

      // Reset selected campaign state (campaigns may have been deleted)
      setSelectedPendingCampaign(null);
      setSelectedActiveCampaign(null);

      // Refresh all related data
      await Promise.all([
        loadProducts(),
        loadCampaigns(token),
        loadCampaignStats(token),
        loadQrs(token, { page: 1, append: false }),
        loadOrders(token, { page: 1, append: false }),
      ]);

      // Clear status after 3 seconds
      setTimeout(() => setProductStatus(""), 3000);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setProductError(err.message || "Failed to delete product.");
      setTimeout(() => setProductError(""), 3000);
    }
  };

  useEffect(() => {
    if (!token) return;
    const initializeVendorData = async () => {
      await loadVendor(token);
      const canContinue = await loadWallet(token);
      if (!canContinue) return;
      await Promise.all([
        loadQrs(token),
        loadQrInventorySeries(token),
        loadOrders(token),
        loadTransactions(token),
        loadCompanyProfile(token),
        loadBrandProfile(token),
        loadCampaigns(token),
        loadCampaignStats(token),
        loadProducts(token),
      ]);
    };
    initializeVendorData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (
      activeTab !== "locations" &&
      activeTab !== "customers" &&
      activeTab !== "billing" &&
      activeTab !== "reports"
    ) {
      return;
    }
    loadExtraTabData(token);
  }, [token, activeTab]);

  useEffect(() => {
    if (!token) return;
    loadNotifications(token);
    const interval = setInterval(() => {
      loadNotifications(token);
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (
        notificationsDropdownRef.current?.contains(event.target) ||
        notificationsTriggerRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!vendorInfo) return;
    setAccountProfile({
      name: vendorInfo.name || "",
      email: vendorInfo.email || "",
      username: vendorInfo.username || "",
      phoneNumber: vendorInfo.phoneNumber || "",
    });
    setOtpReset((prev) => ({
      ...prev,
      email: vendorInfo.email || prev.email || "",
    }));
  }, [vendorInfo]);

  useEffect(() => {
    const companyUpdates = {};
    if (accountProfile.email && !companyProfile.contactEmail) {
      companyUpdates.contactEmail = accountProfile.email;
    }
    if (accountProfile.phoneNumber && !companyProfile.contactPhone) {
      companyUpdates.contactPhone = accountProfile.phoneNumber;
    }

    if (Object.keys(companyUpdates).length > 0) {
      setCompanyProfile((prev) => ({
        ...prev,
        ...companyUpdates,
      }));
    }

    // Sync back to account if empty
    if (companyProfile.contactPhone && !accountProfile.phoneNumber) {
      setAccountProfile((prev) => ({
        ...prev,
        phoneNumber: companyProfile.contactPhone,
      }));
    }
  }, [
    accountProfile.email,
    accountProfile.phoneNumber,
    companyProfile.contactEmail,
    companyProfile.contactPhone,
  ]);

  useEffect(() => {
    setImageLoadError(false);
  }, [brandProfile.logoUrl]);

  useEffect(() => {
    if (!selectedCampaign) {
      return;
    }

    const cashbackValue =
      effectiveCampaignCashback > 0 ? String(effectiveCampaignCashback) : "";

    setQrRows((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      const firstValueRaw = String(first.cashbackAmount || "").trim();
      const firstValue = parseNumericValue(first.cashbackAmount, 0);
      const autoFillValue = lastAutoFilledCashbackRef.current;
      const shouldReplace =
        !firstValueRaw ||
        (autoFillValue !== null && firstValue === autoFillValue);

      if (!shouldReplace || !cashbackValue) {
        return prev;
      }

      lastAutoFilledCashbackRef.current = parseNumericValue(cashbackValue, 0);
      return [{ ...first, cashbackAmount: cashbackValue }, ...rest];
    });
  }, [selectedCampaign, effectiveCampaignCashback]);

  // Scroll to top on route/tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  const handleSignIn = async () => {
    const identifier = email.trim();
    if (!identifier || !password) {
      setAuthError("Enter email/username and password to continue.");
      return;
    }
    setAuthError("");
    setAuthStatus("");
    setSubscriptionBlocked("");
    setIsSigningIn(true);
    try {
      const normalizedEmail = identifier.toLowerCase();
      const isEmail = normalizedEmail.includes("@");
      const data = await loginWithEmail(
        isEmail ? normalizedEmail : undefined,
        password,
        isEmail ? undefined : identifier,
      );
      if (data.role !== "vendor") {
        throw new Error("This account is not a vendor.");
      }
      localStorage.setItem(VENDOR_TOKEN_KEY, data.token);
      setToken(data.token);
      setVendorInfo({ name: data.name, email: data.email, role: data.role });
      setEmail("");
      setPassword("");
      setAuthStatus("Signed in successfully.");
    } catch (err) {
      setAuthError(err.message || "Sign in failed.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = () => {
    clearSession("Signed out.");
    setWallet(null);
    setQrs([]);
    setOrders([]);
    setScanHash("");
    setScanStatus("");
    setScanError("");
    setVerifyData(null);
    setCompanyProfile({
      businessName: "",
      contactPhone: "",
      contactEmail: "",
      gstin: "",
      address: "",
      designation: "",
      alternatePhone: "",
      city: "",
      state: "",
      pincode: "",
    });
    setBrandProfile({
      id: "",
      name: "",
      logoUrl: "",
      website: "",
      qrPricePerUnit: "",
    });
    setAccountProfile({
      name: "",
      email: "",
      username: "",
      phoneNumber: "",
    });
    setAccountStatus("");
    setAccountError("");
    setIsSavingAccount(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus("");
    setPasswordError("");
    setIsChangingPassword(false);
    setShowOtpReset(false);
    setOtpReset({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtpStatus("");
    setOtpError("");
    setIsSendingOtp(false);
    setIsResettingOtp(false);
    setCampaigns([]);
    setCampaignId("");
    setLastBatchSummary(null);
    setSelectedQrSeries("");
    setQrInventorySeries([]);
    setDashboardFilters({
      dateFrom: "",
      dateTo: "",
      campaignId: "",
      city: "",
      mobile: "",
      invoiceNo: "",
    });
    setLocationsData([]);
    setCustomersData([]);
    setInvoicesData([]);
    setReportsData([]);
    setIsLoadingExtraTab(false);
    setExtraTabError("");
    setInvoiceShareStatus("");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async (amount, description, onSuccess) => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay SDK failed to load. Check your internet connection.",
        );
      }

      const order = await createPaymentOrder(token, amount);
      if (!order || !order.id) {
        throw new Error("Failed to create payment order.");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RwcLAPO7q0AESo",
        amount: order.amount,
        currency: order.currency,
        name: "GoHype",
        description: description || "Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verification = await verifyPayment(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              await loadWallet();
              await loadTransactions();
              if (onSuccess) onSuccess();
            } else {
              setWalletError("Payment verification failed.");
            }
          } catch (verifyErr) {
            setWalletError(verifyErr.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: vendorInfo?.name || "",
          email: vendorInfo?.email || "",
          contact: "",
        },
        theme: {
          color: "#10B981",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        setWalletError(response.error.description || "Payment failed.");
      });
      rzp1.open();
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setWalletError(err.message || "Payment initialization failed.");
    }
  };

  const handleRecharge = async () => {
    const amountValue = parseFloat(rechargeAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setWalletError("Enter a valid recharge amount.");
      return;
    }
    setIsRecharging(true);
    setWalletError("");
    setWalletStatus("");

    await initiateRazorpayPayment(amountValue, "Wallet Recharge", () => {
      setWalletStatus("Wallet recharged successfully.");
      setRechargeAmount("");
      setIsRecharging(false);
    });
    // Note: setIsRecharging(false) is handled in callback or if error occurs?
    // The shared function doesn't handle loading state fully for the caller.
    // Let's rely on the user manually closing or the flow completing.
    // Actually, simple way:
    setIsRecharging(false);
  };

  // Re-implementing handleRecharge to be cleaner with the async flow
  // The initiateRazorpayPayment is async but the payment itself is user-driven.
  // So validation happens synchronously-ish.

  const handlePayCampaign = async (campaign) => {
    if (!campaign || isPayingCampaign) return;
    setIsPayingCampaign(true);
    setCampaignError("");

    try {
      const { totalCost } = getCampaignPaymentSummary(campaign, qrPricePerUnit);
      const currentBalance = parseNumericValue(
        wallet?.availableBalance,
        parseNumericValue(wallet?.balance, 0) - parseNumericValue(wallet?.lockedBalance, 0),
      );

      if (currentBalance < totalCost) {
        const shortfall = Math.max(totalCost - currentBalance, 0);
        setCampaignError(
          `Insufficient wallet balance. Add INR ${shortfall.toFixed(2)} in Wallet before activating this campaign.`,
        );
        return;
      }

      await payVendorCampaign(token, campaign.id);
      setCampaignStatusWithTimeout("Campaign paid and activated!");
      setSelectedPendingCampaign(null);
      await loadWallet();
      await loadTransactions();
      await loadCampaigns();
      await loadCampaignStats();
      await loadQrs(token, { page: 1, append: false });
      openSuccessModal(
        "Campaign activated",
        "Payment successful. Your campaign is now active.",
      );
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      const requiredAmount = parseNumericValue(err?.data?.required, NaN);
      const availableAmount = parseNumericValue(err?.data?.available, NaN);
      if (Number.isFinite(requiredAmount) && Number.isFinite(availableAmount)) {
        const shortfall = Math.max(requiredAmount - availableAmount, 0);
        setCampaignError(
          `Insufficient wallet balance. Add INR ${shortfall.toFixed(2)} in Wallet before activating this campaign.`,
        );
        return;
      }
      console.error("Payment error:", err);
      setCampaignError(err.message || "Payment flow failed.");
    } finally {
      setIsPayingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (campaign) => {
    if (!campaign?.id || !token) return;
    if (
      !window.confirm("Delete this campaign? This action cannot be undone.")
    ) {
      return;
    }

    setDeletingCampaignId(campaign.id);
    setCampaignError("");
    setCampaignStatus("");

    try {
      await deleteVendorCampaign(token, campaign.id);
      setCampaignStatusWithTimeout("Campaign deleted.");
      setCampaigns((prev) => prev.filter((item) => item.id !== campaign.id));
      if (selectedPendingCampaign?.id === campaign.id) {
        setSelectedPendingCampaign(null);
      }
      if (selectedActiveCampaign?.id === campaign.id) {
        setSelectedActiveCampaign(null);
      }
      await loadCampaigns(token);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setCampaignError(err.message || "Unable to delete campaign.");
    } finally {
      setDeletingCampaignId(null);
    }
  };

  const handleOrderQrs = async () => {
    if (!selectedQrCampaign) {
      setQrOrderError("Please select a campaign first.");
      return;
    }
    if (!selectedQrProduct) {
      setQrOrderError("Please select a product first.");
      return;
    }

    const campaign = campaigns.find((c) => c.id === selectedQrCampaign);
    if (!campaign || campaign.status !== "active") {
      setQrOrderError("Selected campaign is not active.");
      return;
    }

    // Get cashback and quantity from campaignRows (allocations)
    const validRows = campaignRows.filter(
      (row) => Number(row.cashbackAmount) > 0 && Number(row.quantity) > 0,
    );

    // If no valid allocations in campaign, use campaign's default cashback
    const rowsToUse =
      validRows.length > 0
        ? validRows
        : [
            {
              cashbackAmount: campaign.cashbackAmount || 0,
              quantity: 1,
            },
          ];

    if (rowsToUse.length === 0 || rowsToUse[0].cashbackAmount <= 0) {
      setQrOrderError("Please set cashback amount in campaign allocations.");
      return;
    }

    setIsOrdering(true);
    setQrOrderError("");
    setQrOrderStatus("");

    const batchTiers = rowsToUse
      .map((row) => {
        const price = parseNumericValue(row.cashbackAmount, 0);
        const quantityValue = Math.max(
          0,
          Math.floor(Number(row.quantity) || 0),
        );
        if (price <= 0 || quantityValue <= 0) return null;
        return {
          price,
          quantity: quantityValue,
          cost: price * quantityValue,
        };
      })
      .filter(Boolean);

    const uniquePrices = Array.from(
      new Set(batchTiers.map((tier) => tier.price)),
    );
    const desiredCashback = uniquePrices.length === 1 ? uniquePrices[0] : null;
    const desiredBudget = batchTiers.reduce((sum, tier) => sum + tier.cost, 0);

    // Skip the campaign update confirmation - just proceed with QR generation

    let successes = 0;
    let failures = 0;
    const newHashes = [];
    const newOrderIds = [];
    let totalPrintCost = 0;

    try {
      for (const row of rowsToUse) {
        try {
          // Use the selected campaign for all rows, pass per-row cashbackAmount
          const result = await orderVendorQrs(
            token,
            selectedQrCampaign,
            Number(row.quantity),
            Number(row.cashbackAmount),
            selectedQrSeries || null,
          );
          successes += result.count || 0;
          if (result?.order?.id) {
            newOrderIds.push(result.order.id);
            const printAmount = Number(result.order.totalAmount);
            if (Number.isFinite(printAmount)) {
              totalPrintCost += printAmount;
            }
          }
          if (Array.isArray(result.qrs)) {
            newHashes.push(...result.qrs.map((item) => item.uniqueHash));
          }
        } catch (err) {
          if (handleVendorAccessError(err)) {
            throw err;
          }
          const errorMsg =
            err.message ||
            `Failed to generate QRs for cashback INR ${row.cashbackAmount}`;
          console.error(errorMsg, err);
          // Show the actual error to user
          if (
            err.message?.includes("Insufficient") ||
            err.message?.includes("balance")
          ) {
            setQrOrderError(
              `Insufficient wallet balance. Please top up your wallet first.`,
            );
            setIsOrdering(false);
            return;
          }
          failures++;
        }
      }

      if (failures > 0 && successes === 0) {
        setQrOrderStatus("");
        setQrOrderError(
          "QR generation failed. Please check your allocations and wallet balance.",
        );
      } else {
        setQrOrderStatus(
          `Generated ${successes} QRs successfully.` +
            (failures > 0 ? ` (${failures} batches failed)` : ""),
        );
        if (successes > 0) {
          openSuccessModal(
            "QRs generated",
            `Generated ${successes} QR${successes !== 1 ? "s" : ""} successfully.${failures > 0 ? ` ${failures} batch${failures !== 1 ? "es" : ""} failed.` : ""}`,
          );
        }
      }

      if (successes > 0 && batchTiers.length > 0) {
        setLastBatchSummary({
          id: newOrderIds[0] || Date.now(),
          campaignTitle: campaign?.title || "Campaign",
          timestamp: new Date().toISOString(),
          tiers: batchTiers,
          totalQrs: successes,
          totalCost: batchTiers.reduce((sum, tier) => sum + tier.cost, 0),
          totalPrintCost,
          selectedSeries: selectedQrSeries || null,
          orderIds: newOrderIds,
          hashes: newHashes.slice(0, 50),
        });
      }
      if (newHashes.length > 0) {
        setLastOrderHashes(newHashes.slice(0, 10));
        await loadWallet();
        await loadTransactions();
        await loadQrs();
        await loadQrInventorySeries();
        await loadOrders();
        await loadCampaignStats();
      }
      if (failures === 0) {
        setQrRows([{ id: Date.now(), cashbackAmount: "", quantity: 10 }]);
      }
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setQrOrderError(err.message || "QR generation failed.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCompanyChange = (field) => (event) => {
    setCompanyProfile((prev) => ({ ...prev, [field]: event.target.value }));
    setRegistrationStatus("");
    setRegistrationError("");
  };

  const handleRegistrationSave = async () => {
    if (!companyProfile.businessName.trim()) {
      setRegistrationError("Company name is required.");
      return;
    }
    if (!brandProfile.name.trim()) {
      setRegistrationError("Brand name is required.");
      return;
    }
    setRegistrationError("");
    setRegistrationStatus("");
    setIsSavingRegistration(true);
    try {
      await Promise.all([
        updateVendorProfile(token, {
          businessName: companyProfile.businessName.trim(),
          contactPhone: companyProfile.contactPhone.trim() || null,
          contactEmail: companyProfile.contactEmail.trim() || null,
          gstin: companyProfile.gstin.trim() || null,
          address: companyProfile.address.trim() || null,
          designation: companyProfile.designation.trim() || null,
          alternatePhone: companyProfile.alternatePhone.trim() || null,
          city: companyProfile.city.trim() || null,
          state: companyProfile.state.trim() || null,
          pincode: companyProfile.pincode.trim() || null,
        }),
        upsertVendorBrand(token, {
          name: brandProfile.name.trim(),
          website: brandProfile.website.trim() || null,
          logoUrl: brandProfile.logoUrl || null,
          qrPricePerUnit:
            brandProfile.qrPricePerUnit !== ""
              ? Number(brandProfile.qrPricePerUnit)
              : undefined,
        }),
      ]);
      setRegistrationStatus("Company and brand profile updated.");
      await Promise.all([loadCompanyProfile(), loadBrandProfile()]);
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setRegistrationError(err.message || "Unable to save profile.");
    } finally {
      setIsSavingRegistration(false);
    }
  };

  const handleAccountChange = (field) => (event) => {
    setAccountProfile((prev) => ({ ...prev, [field]: event.target.value }));
    setAccountStatus("");
    setAccountError("");
  };

  const handleAccountSave = async () => {
    if (!token) return;
    setAccountError("");
    setAccountStatus("");
    setIsSavingAccount(true);
    try {
      const payload = {
        name: accountProfile.name.trim() || null,
        email: accountProfile.email.trim() || null,
        username: accountProfile.username.trim() || null,
        phoneNumber: accountProfile.phoneNumber.trim() || null,
      };
      const result = await updateUserProfile(token, payload);
      const updatedUser = result?.user || result;
      if (updatedUser) {
        setVendorInfo((prev) => ({ ...prev, ...updatedUser }));
        setAccountProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          username: updatedUser.username || "",
          phoneNumber: updatedUser.phoneNumber || "",
        });
        setOtpReset((prev) => ({
          ...prev,
          email: updatedUser.email || prev.email || "",
        }));
      }
      setAccountStatus("Login profile updated.");
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setAccountError(err.message || "Unable to update login profile.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordFieldChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
    setPasswordStatus("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    if (!token) return;
    const oldPassword = passwordForm.oldPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!oldPassword || !newPassword) {
      setPasswordError("Enter your old password and a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordError("");
    setPasswordStatus("");
    setIsChangingPassword(true);
    try {
      await changeUserPassword(token, oldPassword, newPassword);
      setPasswordStatus("Password updated successfully.");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setPasswordError(err.message || "Unable to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOtpFieldChange = (field) => (event) => {
    setOtpReset((prev) => ({ ...prev, [field]: event.target.value }));
    setOtpStatus("");
    setOtpError("");
  };

  const handleSendOtp = async () => {
    const email = (otpReset.email || accountProfile.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      setOtpError("Enter the email to receive OTP.");
      return;
    }
    setIsSendingOtp(true);
    setOtpError("");
    setOtpStatus("");
    try {
      await sendEmailOtp(email);
      setOtpReset((prev) => ({ ...prev, email }));
      setOtpStatus("OTP sent to your email.");
    } catch (err) {
      setOtpError(err.message || "Unable to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpResetPassword = async () => {
    const email = (otpReset.email || accountProfile.email || "")
      .trim()
      .toLowerCase();
    const otp = otpReset.otp.trim();
    const newPassword = otpReset.newPassword.trim();
    const confirmPassword = otpReset.confirmPassword.trim();

    if (!email || !otp || !newPassword) {
      setOtpError("Enter email, OTP, and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setOtpError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError("New password and confirmation do not match.");
      return;
    }

    setIsResettingOtp(true);
    setOtpError("");
    setOtpStatus("");
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      setOtpStatus("Password reset successfully.");
      setOtpReset((prev) => ({
        ...prev,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setOtpError(err.message || "Unable to reset password.");
    } finally {
      setIsResettingOtp(false);
    }
  };

  const handleCampaignChange = (field) => (event) => {
    const value = event.target.value;
    if (field === "productId" && value === "ADD_NEW_PRODUCT") {
      setProductModalContext("campaign");
      setEditingProduct(null);
      setShowProductModal(true);
      return;
    }
    setCampaignForm((prev) => ({ ...prev, [field]: value }));
    setCampaignStatus("");
    setCampaignError("");
  };

  const setCampaignStatusWithTimeout = (message) => {
    setCampaignStatus(message);
    setTimeout(() => setCampaignStatus(""), 2000);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.title.trim()) {
      setCampaignError("Campaign title is required.");
      return;
    }
    if (!campaignForm.productId) {
      setCampaignError("Please select a product before creating a campaign.");
      return;
    }
    if (!campaignForm.description.trim()) {
      setCampaignError("Short campaign summary is required.");
      return;
    }

    const rowsWithAnyInput = campaignRows.filter((row) => {
      const cashbackInput = String(row.cashbackAmount ?? "").trim();
      const quantityInput = String(row.quantity ?? "").trim();
      const totalInput = String(row.totalBudget ?? "").trim();
      return cashbackInput || quantityInput || totalInput;
    });

    if (!rowsWithAnyInput.length) {
      setCampaignError(
        "Add at least one allocation with cashback and quantity.",
      );
      return;
    }

    const normalizedAllocations = [];
    // Calculate total allocations from rows
    let calculatedTotalBudget = 0;
    let firstCashbackValue = 0;
    let maxCashbackValue = 0;

    if (rowsWithAnyInput.length > 0) {
      firstCashbackValue =
        parseOptionalNumber(rowsWithAnyInput[0].cashbackAmount) || 0;
    }

    for (const row of rowsWithAnyInput) {
      const cb = parseOptionalNumber(row.cashbackAmount);
      const qtyValue = parseOptionalNumber(row.quantity);
      const derivedTotal = getAllocationRowTotal(row);

      if (cb === null || cb <= 0) {
        setCampaignError(
          "Cashback amount must be greater than 0 for all allocations.",
        );
        return;
      }
      if (qtyValue === null || qtyValue <= 0) {
        setCampaignError(
          "Quantity must be greater than 0 for all allocations.",
        );
        return;
      }
      if (derivedTotal === null || derivedTotal <= 0) {
        setCampaignError("Allocation total must be greater than 0.");
        return;
      }
      calculatedTotalBudget += derivedTotal;
      if (cb !== null && cb > maxCashbackValue) {
        maxCashbackValue = cb;
      }
      normalizedAllocations.push({
        productId: campaignForm.productId,
        cashbackAmount: cb,
        quantity: Math.floor(qtyValue),
        totalBudget: derivedTotal,
      });
    }

    if (!normalizedAllocations.length) {
      setCampaignError("Please add at least one valid allocation row.");
      return;
    }

    const cashbackValue = maxCashbackValue || firstCashbackValue || 0;
    const budgetValue =
      calculatedTotalBudget > 0 ? calculatedTotalBudget : null;
    const now = new Date();
    const startDate = new Date(now);
    let endDate = null;
    if (subscriptionInfo?.endDate) {
      const parsedEnd = new Date(subscriptionInfo.endDate);
      if (!Number.isNaN(parsedEnd.getTime())) {
        endDate = parsedEnd;
      }
    }
    if (!endDate || endDate <= startDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
    }
    const startDateValue = startDate.toISOString().slice(0, 10);
    const endDateValue = endDate.toISOString().slice(0, 10);
    setCampaignError("");
    setCampaignStatus("");
    setIsSavingCampaign(true);
    try {
      let derivedBrandId = null;

      // Check if we can get brandId from selected product
      if (campaignForm.productId) {
        const product = products.find((p) => p.id === campaignForm.productId);
        if (product && product.brandId) {
          derivedBrandId = product.brandId;
        }
      }

      let effectiveBrandId = derivedBrandId || brandProfile?.id || null;

      if (!effectiveBrandId) {
        try {
          const brand = await getVendorBrand(token);
          effectiveBrandId = brand?.id || null;
        } catch (brandErr) {
          if (handleVendorAccessError(brandErr)) return;
          setCampaignError(
            "No brand is assigned yet. Please contact the admin or select a product.",
          );
          setIsSavingCampaign(false);
          return;
        }
      }

      if (!effectiveBrandId) {
        setCampaignError(
          "Unable to determine brand for this campaign. Please select a product.",
        );
        setIsSavingCampaign(false);
        return;
      }

      const result = await createVendorCampaign(token, {
        brandId: effectiveBrandId,
        productId: campaignForm.productId || undefined,
        title: campaignForm.title.trim(),
        description: campaignForm.description.trim() || undefined,
        cashbackAmount: cashbackValue > 0 ? cashbackValue : null,
        startDate: startDateValue,
        endDate: endDateValue,
        totalBudget: budgetValue,
        subtotal: budgetValue,
        allocations: normalizedAllocations,
      });
      setCampaignStatusWithTimeout("Campaign created.");
      setCampaignForm({
        title: "",
        description: "",
        cashbackAmount: "",
        totalBudget: "",
        productId: "",
      });
      setCampaignRows([
        { id: Date.now(), cashbackAmount: "", quantity: "", totalBudget: "" },
      ]);
      if (result?.campaign) {
        setCampaigns((prev) => {
          const filtered = prev.filter(
            (campaign) => campaign.id !== result.campaign.id,
          );
          return [result.campaign, ...filtered];
        });
      }
      // result from createVendorCampaign structure is { message, campaign }
      // But we can just reload campaigns.
      await loadCampaigns();
      await loadCampaignStats();
      setCampaignTab("pending");
      openSuccessModal(
        "Campaign created",
        "Your campaign has been created. Proceed to payment to activate it.",
      );
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      console.error("Campaign creation error:", err);
      setCampaignError(err.error || err.message || "Campaign creation failed.");
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleProductChange = (field) => (event) => {
    setProductForm((prev) => ({ ...prev, [field]: event.target.value }));
    setProductStatus("");
    setProductError("");
    if (field === "imageUrl") {
      setProductImageUploadStatus("");
      setProductImageUploadError("");
    }
  };

  const setProductStatusWithTimeout = (message) => {
    setProductStatus(message);
    setTimeout(() => setProductStatus(""), 2000);
  };

  const handleProductImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!token) {
      setProductImageUploadError("Please sign in first.");
      return;
    }
    setIsUploadingProductImage(true);
    setProductImageUploadStatus("");
    setProductImageUploadError("");
    try {
      const data = await uploadImage(token, file);
      const uploadedUrl = data?.url;
      if (!uploadedUrl) {
        throw new Error("Upload failed. No URL returned.");
      }
      setProductForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setProductImageUploadStatus("Image uploaded.");
    } catch (err) {
      setProductImageUploadError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingProductImage(false);
      event.target.value = "";
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name.trim()) {
      setProductError("Product name is required.");
      return;
    }

    setProductError("");
    setProductStatus("");
    setIsSavingProduct(true);

    try {
      // Get the vendor's first brand
      let effectiveBrandId = brandProfile?.id || null;
      if (!effectiveBrandId) {
        try {
          const brand = await getVendorBrand(token);
          effectiveBrandId = brand?.id || null;
        } catch (brandErr) {
          if (handleVendorAccessError(brandErr)) return;
          setProductError(
            "No brand is assigned yet. Please contact the admin.",
          );
          setIsSavingProduct(false);
          return;
        }
      }

      if (!effectiveBrandId) {
        setProductError("No brand is assigned yet. Please contact the admin.");
        setIsSavingProduct(false);
        return;
      }

      await addVendorProduct(token, {
        brandId: effectiveBrandId,
        name: productForm.name.trim(),
        sku: productForm.sku?.trim() || null,
        mrp:
          productForm.mrp === undefined ||
          productForm.mrp === null ||
          productForm.mrp === ""
            ? null
            : Number(productForm.mrp),
        variant: productForm.variant.trim() || null,
        category: productForm.category.trim() || null,
        description: productForm.description.trim() || null,
        imageUrl: productForm.imageUrl.trim() || null,
      });
      setProductStatusWithTimeout("Product added successfully.");
      setProductForm({
        name: "",
        variant: "",
        category: "",
        description: "",
        imageUrl: "",
      });
      setProductImageUploadStatus("");
      setProductImageUploadError("");
      await loadProducts();
    } catch (err) {
      if (handleVendorAccessError(err)) return;
      setProductError(err.message || "Failed to add product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const qrStats = useMemo(() => {
    const statusCounts = qrStatusCounts || {};
    const toNumber = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    };

    if (Object.keys(statusCounts).length > 0) {
      let redeemed = 0;
      let inactive = 0;
      let countedTotal = 0;

      Object.entries(statusCounts).forEach(([status, value]) => {
        if (normalizeQrStatus(status) === "total") return;
        const amount = toNumber(value);
        if (!amount) return;
        countedTotal += amount;
        if (isRedeemedQrStatus(status)) {
          redeemed += amount;
        } else if (isInactiveQrStatus(status)) {
          inactive += amount;
        }
      });

      const totalFromCounts = toNumber(statusCounts.total);
      const totalFromApi =
        Number.isFinite(qrTotal) && qrTotal > 0 ? qrTotal : 0;
      const total =
        totalFromCounts || countedTotal || totalFromApi || qrs.length;
      const active = Math.max(0, total - redeemed - inactive);
      return { total, redeemed, active };
    }

    const total = qrs.length;
    let redeemed = 0;
    let inactive = 0;
    qrs.forEach((qr) => {
      const status = normalizeQrStatus(qr.status);
      if (isRedeemedQrStatus(status)) redeemed += 1;
      else if (isInactiveQrStatus(status)) inactive += 1;
    });
    const active = Math.max(0, total - redeemed - inactive);
    return { total, redeemed, active };
  }, [qrStatusCounts, qrTotal, qrs]);
  const notificationUnreadCount = notifications.filter(
    (item) => !item.isRead,
  ).length;
  const qrTotalLabel = qrTotal || qrs.length;
  const qrCoverageLabel =
    qrTotal > qrs.length ? `Showing latest ${qrs.length} of ${qrTotal}` : "";
  const pendingCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "pending"),
    [campaigns],
  );
  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns],
  );
  const showQrGenerator = false;
  const showQrOrdersSection = false;
  const showOrderTracking = false;

  const overviewCampaignOptions = useMemo(() => {
    const options = [{ id: "all", label: "All campaigns" }];
    const sortedCampaigns = [...campaigns].sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || "")),
    );
    sortedCampaigns.forEach((campaign) => {
      options.push({
        id: campaign.id,
        label: campaign.title || "Untitled campaign",
      });
    });
    const hasUnassigned = qrs.some((qr) => !(qr.Campaign?.id || qr.campaignId));
    if (hasUnassigned) {
      options.push({ id: "unassigned", label: "Unassigned QRs" });
    }
    return options;
  }, [campaigns, qrs]);

  const overviewCampaignLabel = useMemo(() => {
    const match = overviewCampaignOptions.find(
      (option) => option.id === overviewCampaignId,
    );
    return match?.label || "Campaign";
  }, [overviewCampaignId, overviewCampaignOptions]);

  useEffect(() => {
    const isValidSelection = overviewCampaignOptions.some(
      (option) => option.id === overviewCampaignId,
    );
    if (!isValidSelection) {
      setOverviewCampaignId("all");
    }
  }, [overviewCampaignId, overviewCampaignOptions]);

  const overviewFilteredQrs = useMemo(() => {
    if (overviewCampaignId === "all") return qrs;
    if (overviewCampaignId === "unassigned") {
      return qrs.filter((qr) => !(qr.Campaign?.id || qr.campaignId));
    }
    return qrs.filter(
      (qr) => (qr.Campaign?.id || qr.campaignId) === overviewCampaignId,
    );
  }, [overviewCampaignId, qrs]);

  const overviewQrStatusCounts = useMemo(() => {
    const counts = {
      total: 0,
      generated: 0,
      assigned: 0,
      active: 0,
      redeemed: 0,
      expired: 0,
      blocked: 0,
      unknown: 0,
    };

    overviewFilteredQrs.forEach((qr) => {
      counts.total += 1;
      const status = String(qr.status || "unknown").toLowerCase();
      if (status === "claimed") {
        counts.redeemed += 1;
        return;
      }
      if (counts[status] !== undefined) {
        counts[status] += 1;
      } else {
        counts.unknown += 1;
      }
    });

    return counts;
  }, [overviewFilteredQrs]);
  const isOverviewAll = overviewCampaignId === "all";
  const isOverviewUnassigned = overviewCampaignId === "unassigned";
  const overviewSelectedCampaignCount = isOverviewAll
    ? campaigns.length
    : isOverviewUnassigned
      ? 0
      : 1;
  const selectedCampaignStats = useMemo(() => {
    if (isOverviewAll || isOverviewUnassigned) return null;
    if (campaignStatsMap[overviewCampaignId]) {
      return campaignStatsMap[overviewCampaignId];
    }
    const selectedCampaign = campaigns.find(
      (campaign) => campaign.id === overviewCampaignId,
    );
    if (selectedCampaign?.title) {
      return campaignStatsMap[`title:${selectedCampaign.title}`] || null;
    }
    return null;
  }, [
    campaignStatsMap,
    campaigns,
    isOverviewAll,
    isOverviewUnassigned,
    overviewCampaignId,
  ]);
  const selectedCampaignTotal = Number(selectedCampaignStats?.totalQRsOrdered);
  const selectedCampaignRedeemed = Number(
    selectedCampaignStats?.totalUsersJoined,
  );
  const overviewSelectedQrTotal = isOverviewAll
    ? qrStats.total
    : isOverviewUnassigned
      ? overviewQrStatusCounts.total
      : Number.isFinite(selectedCampaignTotal)
        ? selectedCampaignTotal
        : overviewQrStatusCounts.total;
  const overviewSelectedQrRedeemed = isOverviewAll
    ? qrStats.redeemed
    : isOverviewUnassigned
      ? overviewQrStatusCounts.redeemed
      : Number.isFinite(selectedCampaignRedeemed)
        ? selectedCampaignRedeemed
        : overviewQrStatusCounts.redeemed;

  const overviewRedemptionSeries = useMemo(() => {
    const days = 7;
    const today = new Date();
    const buckets = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const key = format(date, "yyyy-MM-dd");
      buckets.push({ key, name: format(date, "MMM d"), redemptions: 0 });
    }

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    overviewFilteredQrs.forEach((qr) => {
      const status = String(qr.status || "").toLowerCase();
      if (status !== "redeemed" && status !== "claimed") return;
      const rawDate = qr.updatedAt || qr.createdAt;
      if (!rawDate) return;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;
      const key = format(date, "yyyy-MM-dd");
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.redemptions += 1;
    });

    return buckets.map(({ key, ...rest }) => rest);
  }, [overviewFilteredQrs]);

  const campaignPerformanceSeries = useMemo(() => {
    if (!overviewFilteredQrs.length) return [];
    const redeemedStatuses = new Set(["redeemed", "claimed"]);

    if (!isOverviewAll) {
      const redeemedCount = overviewFilteredQrs.filter((qr) =>
        redeemedStatuses.has(String(qr.status || "").toLowerCase()),
      ).length;
      return [
        {
          name: overviewCampaignLabel,
          sent: overviewFilteredQrs.length,
          redeemed: redeemedCount,
        },
      ];
    }

    const nameMap = new Map(
      campaigns.map((campaign) => [
        campaign.id,
        campaign.title || "Untitled campaign",
      ]),
    );
    const summaryMap = new Map();

    overviewFilteredQrs.forEach((qr) => {
      const campaignId = qr.Campaign?.id || qr.campaignId || "unassigned";
      const campaignTitle =
        qr.Campaign?.title || nameMap.get(campaignId) || "Unassigned";
      if (!summaryMap.has(campaignId)) {
        summaryMap.set(campaignId, {
          name: campaignTitle,
          sent: 0,
          redeemed: 0,
        });
      }
      const summary = summaryMap.get(campaignId);
      summary.sent += 1;
      if (redeemedStatuses.has(String(qr.status || "").toLowerCase())) {
        summary.redeemed += 1;
      }
    });

    return Array.from(summaryMap.values())
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 6);
  }, [overviewFilteredQrs, isOverviewAll, overviewCampaignLabel, campaigns]);

  const recentQrs = useMemo(() => {
    return [...qrs]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 12);
  }, [qrs]);

  const qrGallery = useMemo(() => {
    return [...qrs].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [qrs]);

  const inventoryQrs = useMemo(() => {
    return showAllInventory ? qrGallery : recentQrs;
  }, [showAllInventory, qrGallery, recentQrs]);

  // Group QRs by Campaign first, then by price within each campaign
  const qrsGroupedByCampaign = useMemo(() => {
    const campaignMap = {};

    qrs.forEach((qr) => {
      const campaignId = qr.Campaign?.id || "unassigned";
      const campaignTitle = qr.Campaign?.title || "Unassigned";
      const price = getGeneratedPrice(qr);
      const priceKey = price.toFixed(2);

      if (!campaignMap[campaignId]) {
        campaignMap[campaignId] = {
          id: campaignId,
          title: campaignTitle,
          endDate: qr.Campaign?.endDate,
          status: qr.Campaign?.status,
          priceGroups: {},
          stats: { total: 0, active: 0, redeemed: 0 },
        };
      }

      if (!campaignMap[campaignId].priceGroups[priceKey]) {
        campaignMap[campaignId].priceGroups[priceKey] = {
          price,
          priceKey,
          qrs: [],
          activeCount: 0,
          redeemedCount: 0,
        };
      }

      const group = campaignMap[campaignId].priceGroups[priceKey];
      group.qrs.push(qr);
      campaignMap[campaignId].stats.total++;

      if (isRedeemedQrStatus(qr.status)) {
        group.redeemedCount++;
        campaignMap[campaignId].stats.redeemed++;
      } else if (!isInactiveQrStatus(qr.status)) {
        group.activeCount++;
        campaignMap[campaignId].stats.active++;
      }
    });

    return Object.values(campaignMap)
      .map((campaign) => ({
        ...campaign,
        priceGroups: Object.values(campaign.priceGroups).sort(
          (a, b) => b.price - a.price,
        ),
      }))
      .sort((a, b) => {
        if (a.id === "unassigned") return 1;
        if (b.id === "unassigned") return -1;
        return a.title.localeCompare(b.title);
      });
  }, [qrs]);
  const campaignQrMap = useMemo(() => {
    const map = new Map();
    qrsGroupedByCampaign.forEach((campaign) => {
      if (campaign.id !== "unassigned") {
        map.set(campaign.id, campaign);
      }
    });
    return map;
  }, [qrsGroupedByCampaign]);
  const activeCampaignDetails = useMemo(() => {
    if (!selectedActiveCampaign) return null;
    const campaign = selectedActiveCampaign;
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
    const printCost = totalQty * qrPricePerUnit;
    const stats = campaignQrMap.get(campaign.id);
    const priceGroups = stats?.priceGroups || [];
    const productId =
      campaign.productId ||
      (Array.isArray(campaign.allocations)
        ? campaign.allocations.find((alloc) => alloc.productId)?.productId
        : null);
    const product = productId
      ? products.find((item) => item.id === productId)
      : null;
    const breakdownRows = priceGroups.length
      ? priceGroups.map((group) => ({
          cashback: group.price,
          quantity: group.qrs.length,
          active: group.activeCount,
          redeemed: group.redeemedCount,
        }))
      : allocationGroups.map((group) => ({
          cashback: group.price,
          quantity: group.quantity,
          active: 0,
          redeemed: 0,
        }));

    return {
      campaign,
      allocationGroups,
      totalQty,
      totalBudget,
      printCost,
      stats,
      product,
      breakdownRows,
    };
  }, [selectedActiveCampaign, campaignQrMap, products, qrPricePerUnit]);
  const activeCampaign = activeCampaignDetails?.campaign;
  const pendingCampaignPayment = useMemo(
    () => getCampaignPaymentSummary(selectedPendingCampaign, qrPricePerUnit),
    [selectedPendingCampaign, qrPricePerUnit],
  );
  const pendingWalletBalance = parseNumericValue(
    wallet?.availableBalance,
    parseNumericValue(wallet?.balance, 0) - parseNumericValue(wallet?.lockedBalance, 0),
  );
  const pendingCampaignShortfall = Math.max(
    pendingCampaignPayment.totalCost - pendingWalletBalance,
    0,
  );
  const canPaySelectedPendingCampaign =
    Boolean(selectedPendingCampaign) && pendingCampaignShortfall <= 0;

  const primaryQrRow = qrRows[0];
  const primaryQrCashback = parseNumericValue(primaryQrRow?.cashbackAmount, 0);
  const primaryQrQuantity = Math.max(
    0,
    Math.floor(Number(primaryQrRow?.quantity) || 0),
  );
  const primaryQrCost = primaryQrCashback * primaryQrQuantity;
  const canGenerateQrs =
    Boolean(selectedQrCampaign) &&
    primaryQrCashback > 0 &&
    primaryQrQuantity > 0;

  const walletBalance = parseNumericValue(
    wallet?.availableBalance,
    parseNumericValue(wallet?.balance, 0) - parseNumericValue(wallet?.lockedBalance, 0),
  );
  const lockedBalance = parseNumericValue(wallet?.lockedBalance, 0);
  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 5);
  const locationMapCenter = useMemo(() => {
    if (!locationsData.length) return [20.5937, 78.9629];
    const firstPoint = locationsData.find(
      (point) =>
        Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)),
    );
    if (!firstPoint) return [20.5937, 78.9629];
    return [Number(firstPoint.lat), Number(firstPoint.lng)];
  }, [locationsData]);

  const handleApplyExtraFilters = () => {
    if (!token) return;
    loadExtraTabData(token);
  };

  return (
    <>
      {/* Download Progress Modal - Portal Overlay */}
      {downloadProgress.show && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-md">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                {downloadProgress.progress === 100 ? (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                ) : (
                  <Download className="w-8 h-8 text-primary animate-bounce" />
                )}
              </div>

              {/* Progress Text */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {downloadProgress.progress === 100
                    ? "Complete!"
                    : "Downloading..."}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {downloadProgress.message}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-strong rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${downloadProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-primary">
                  {downloadProgress.progress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 p-6 text-gray-900 dark:text-gray-100">
        {subscriptionBlocked ? (
          <div className="mx-auto max-w-md bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <ShieldCheck size={18} className="text-rose-400" />
              {subscriptionHeading}
            </div>
            <div className="text-xs text-gray-400">{subscriptionBlocked}</div>
            <div className="flex flex-wrap justify-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-semibold ${subscriptionBadgeClass}`}
              >
                {subscriptionStatusLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-400">
                Plan: {subscriptionPlanLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-400">
                Ends: {subscriptionEndsAt}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl bg-white/10 text-white text-sm font-semibold py-2 hover:bg-white/20 transition-colors"
            >
              Back to login
            </button>
          </div>
        ) : (
          <>
            {!isAuthenticated && (
              <div className="flex min-h-[80vh] items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-strong"></div>

                  <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary-strong/20 text-primary dark:text-primary mb-4 ring-1 ring-primary/10 dark:ring-primary-strong/40">
                        <Store size={24} />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Vendor Portal
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign in to manage your store & campaigns
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
                          Email or Username
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your credentials"
                            className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition-colors">
                            <ShieldCheck size={18} />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            placeholder="Enter password"
                            className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSignIn}
                          disabled={isSigningIn}
                          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-strong hover:from-primary hover:to-primary-strong text-white text-sm font-bold py-3 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSigningIn ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Signing in...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ArrowRight size={18} className="opacity-80" />
                            </>
                          )}
                        </button>
                      </div>

                      {authStatus && (
                        <div className="p-3 bg-primary/5 dark:bg-primary-strong/20 border border-primary/10 dark:border-primary-strong/30 rounded-lg flex items-center gap-2 text-xs font-medium text-primary dark:text-primary">
                          <Check size={14} />
                          {authStatus}
                        </div>
                      )}

                      {authError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                          <BadgeCheck size={14} className="rotate-180" />
                          {authError}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-zinc-800"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-900 px-2 text-gray-400 font-medium tracking-wider">
                          New to Platform?
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/brand-registration")}
                      className="w-full rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/30 text-gray-600 dark:text-gray-400 font-semibold py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-primary hover:text-primary text-sm transition-all flex items-center justify-center gap-2 group"
                    >
                      <Store
                        size={16}
                        className="group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary"
                      />
                      Apply for Partnership
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Onboarding / Registration Modal */}
            {showOnboarding && !isAuthenticated && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/60 backdrop-blur-md">
                <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BadgeCheck className="text-primary" size={24} />
                      Partner Application
                    </h2>
                    <button
                      onClick={() => {
                        setShowOnboarding(false);
                        setRegistrationSubmitted(false);
                        setRegistrationForm((prev) => ({
                          ...prev,
                          logo: null,
                          logoPreview: null,
                        }));
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="overflow-y-auto">
                    {registrationSubmitted ? (
                      <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 dark:bg-primary-strong/30 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Application Received!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                          Thank you for registering{" "}
                          <strong>{registrationForm.businessName}</strong>.
                        </p>
                        {generatedCredentials && (
                          <div className="w-full max-w-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 space-y-4 text-left mx-auto my-4">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                              Your Login Credentials
                            </div>

                            <div className="space-y-3">
                              <div
                                className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between items-center group relative cursor-pointer"
                                title="Copy ID"
                              >
                                <div>
                                  <div className="text-[10px] text-gray-400 font-medium">
                                    Vendor ID
                                  </div>
                                  <div className="font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wide text-lg">
                                    {generatedCredentials.vendorId}
                                  </div>
                                </div>
                                <ClipboardCheck
                                  size={16}
                                  className="text-gray-400 group-hover:text-primary transition-colors"
                                />
                              </div>

                              <div
                                className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between items-center group cursor-pointer"
                                title="Copy Password"
                              >
                                <div>
                                  <div className="text-[10px] text-gray-400 font-medium">
                                    Temporary Password
                                  </div>
                                  <div className="font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wide text-lg">
                                    {generatedCredentials.password}
                                  </div>
                                </div>
                                <ClipboardCheck
                                  size={16}
                                  className="text-gray-400 group-hover:text-primary transition-colors"
                                />
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg">
                              <div className="mt-0.5">??</div>
                              Please save these credentials safely.
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setShowOnboarding(false);
                            setRegistrationSubmitted(false);
                            setGeneratedCredentials(null);
                            setRegistrationForm({
                              businessName: "",
                              contactName: "",
                              email: "",
                              phone: "",
                              website: "",
                              category: "",
                              description: "",
                              logo: null,
                              logoPreview: null,
                            });
                          }}
                          className="w-full max-w-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-gray-500/20 active:scale-[0.98] transition-all"
                        >
                          Got it, Return to Login
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleRegistrationSubmit}
                        className="p-6 space-y-6"
                      >
                        {/* Logo Upload Section */}
                        <div className="flex justify-center mb-2">
                          <div className="relative group">
                            <input
                              type="file"
                              id="logo-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoChange}
                            />
                            <label
                              htmlFor="logo-upload"
                              className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                                registrationForm.logoPreview
                                  ? "border-primary bg-white"
                                  : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {registrationForm.logoPreview ? (
                                <img
                                  src={registrationForm.logoPreview}
                                  alt="Logo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <>
                                  <Upload
                                    size={24}
                                    className="text-gray-400 mb-2 group-hover:text-primary transition-colors"
                                  />
                                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Upload Logo
                                  </span>
                                </>
                              )}
                            </label>
                            {registrationForm.logoPreview && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setRegistrationForm((prev) => ({
                                    ...prev,
                                    logo: null,
                                    logoPreview: null,
                                  }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Business Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                                Business Name
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                  <Store size={16} />
                                </div>
                                <input
                                  required
                                  type="text"
                                  value={registrationForm.businessName}
                                  onChange={handleRegistrationChange(
                                    "businessName",
                                  )}
                                  placeholder="Brand / Company"
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-normal"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                                Website
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                  <Globe size={16} />
                                </div>
                                <input
                                  type="url"
                                  value={registrationForm.website}
                                  onChange={handleRegistrationChange("website")}
                                  placeholder="https://brand.com"
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-normal"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                              Contact Person
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-gray-400">
                                <User size={16} />
                              </div>
                              <input
                                required
                                type="text"
                                value={registrationForm.contactName}
                                onChange={handleRegistrationChange(
                                  "contactName",
                                )}
                                placeholder="Full Name of representative"
                                className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-normal"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                                Work Email
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                  <Mail size={16} />
                                </div>
                                <input
                                  required
                                  type="email"
                                  value={registrationForm.email}
                                  onChange={handleRegistrationChange("email")}
                                  placeholder="name@work.com"
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-normal"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                                Mobile
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                  <Phone size={16} />
                                </div>
                                <input
                                  required
                                  type="tel"
                                  value={registrationForm.phone}
                                  onChange={handleRegistrationChange("phone")}
                                  placeholder="+91..."
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-normal"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                              Category
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-gray-400">
                                <Package size={16} />
                              </div>
                              <select
                                required
                                value={registrationForm.category}
                                onChange={handleRegistrationChange("category")}
                                className="w-full appearance-none rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-8 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                              >
                                <option value="">
                                  Select industry category
                                </option>
                                <option value="fmcg">
                                  FMCG / Packaged Goods
                                </option>
                                <option value="electronics">
                                  Electronics & Appliances
                                </option>
                                <option value="fashion">
                                  Fashion & Apparel
                                </option>
                                <option value="home">Home & Kitchen</option>
                                <option value="construction">
                                  Construction Materials
                                </option>
                                <option value="automotive">Automotive</option>
                                <option value="other">Other</option>
                              </select>
                              <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                <ChevronRight size={14} className="rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1">
                              Description (Optional)
                            </label>
                            <textarea
                              rows="2"
                              value={registrationForm.description}
                              onChange={handleRegistrationChange("description")}
                              placeholder="Briefly describe your products..."
                              className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:font-normal"
                            />
                          </div>
                        </div>

                        <div className="pt-4 pb-2">
                          <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-strong hover:from-primary hover:to-primary-strong text-white font-bold py-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            Submit Application
                            <ArrowRight size={18} />
                          </button>
                          <p className="text-[10px] text-center text-gray-400 mt-4 max-w-xs mx-auto leading-relaxed">
                            By clicking submit, you verify that you are an
                            authorized representative of the brand and agree to
                            our{" "}
                            <a href="#" className="underline">
                              Terms of Service
                            </a>
                            .
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <>
                {/* Main Dashboard Layout */}
                <div className="mx-auto w-full max-w-[1920px] px-4 py-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-xl h-fit sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar">
                      <div className="space-y-6">
                        {/* Profile Section */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                              {(vendorInfo?.name || "V")[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {vendorInfo?.name || "Vendor"}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {vendorInfo?.email || ""}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Quick View */}
                        {/* Stats Quick View */}
                        <div className="grid grid-cols-2 gap-2">
                          <StarBorder
                            as="div"
                            className="w-full"
                            color="var(--primary)"
                            speed="5s"
                            innerClassName="bg-white dark:bg-[#000] shadow-sm dark:shadow-none"
                          >
                            <div className="flex flex-col items-center justify-center w-full">
                              <div className="text-[10px] text-gray-500 mb-0.5">
                                Available
                              </div>
                              <div
                                className="text-sm font-bold text-primary truncate max-w-full"
                                title={`\u20B9${formatAmount(walletBalance)}`}
                              >
                                {"\u20B9"}
                                {formatCompactAmount(walletBalance)}
                              </div>
                            </div>
                          </StarBorder>
                          <StarBorder
                            as="div"
                            className="w-full"
                            color="var(--primary)"
                            speed="5s"
                            innerClassName="bg-white dark:bg-[#000] shadow-sm dark:shadow-none"
                          >
                            <div className="flex flex-col items-center justify-center w-full">
                              <div className="text-[10px] text-gray-500 mb-0.5">
                                Active QRs
                              </div>
                              <div className="text-sm font-bold text-primary">
                                {qrStats.active}
                              </div>
                            </div>
                          </StarBorder>
                        </div>

                        {/* Navigation */}
                        {/* Navigation */}
                        <nav className="space-y-2">
                          {[
                            { id: "overview", label: "Overview", icon: Store },
                            {
                              id: "products",
                              label: "Products",
                              icon: Package,
                            },
                            {
                              id: "campaigns",
                              label: "Campaigns & QR",
                              icon: BadgeCheck,
                            },
                            {
                              id: "redemptions",
                              label: "Redemptions",
                              icon: Users,
                            },
                            {
                              id: "locations",
                              label: "Locations",
                              icon: Globe,
                            },
                            {
                              id: "customers",
                              label: "Customers",
                              icon: Users,
                            },
                            { id: "wallet", label: "Wallet", icon: Wallet },
                            {
                              id: "billing",
                              label: "Billing",
                              icon: FileText,
                            },
                            {
                              id: "brand",
                              label: "Settings",
                              icon: ShieldCheck,
                            },
                            {
                              id: "reports",
                              label: "Product Reports",
                              icon: TicketCheck,
                            },
                            {
                              id: "support",
                              label: "Support",
                              icon: HelpCircle,
                            },
                          ].map((item) => {
                            const isActive = activeTab === item.id;
                            if (isActive) {
                              return (
                                <StarBorder
                                  key={item.id}
                                  as="button"
                                  onClick={() => navigate(`/vendor/${item.id}`)}
                                  color="var(--primary)"
                                  speed="4s"
                                  className="w-full cursor-pointer"
                                  innerClassName="bg-white dark:bg-[#000] pointer-events-none text-gray-900 dark:text-white"
                                >
                                  <item.icon
                                    size={18}
                                    className="text-primary"
                                  />
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {item.label}
                                  </span>
                                </StarBorder>
                              );
                            }
                            return (
                              <button
                                key={item.id}
                                onClick={() => navigate(`/vendor/${item.id}`)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#252525] dark:hover:text-gray-200 transition-all font-medium"
                              >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </nav>

                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-900/20 text-red-400 text-sm font-medium border border-red-900/30"
                        >
                          <LogOut size={18} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 space-y-4 overflow-x-hidden">
                      {/* Top Greeting Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Good morning, {vendorInfo?.name || "Vendor"}!
                          </h1>
                          <p className="text-sm text-gray-400 mt-1">
                            Here's what's happening with your store today
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="search"
                              placeholder="Search..."
                              className="w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] px-4 py-2 pl-10 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                            />
                            <svg
                              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                          <div className="relative mr-2">
                            <button
                              ref={notificationsTriggerRef}
                              type="button"
                              onClick={() =>
                                setIsNotificationsOpen((prev) => !prev)
                              }
                              className={`h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-all ${
                                isNotificationsOpen
                                  ? "ring-2 ring-primary/30 border-primary/40"
                                  : ""
                              }`}
                              aria-label="Notifications"
                            >
                              <Bell size={18} />
                              {notificationUnreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                                  {notificationUnreadCount > 9
                                    ? "9+"
                                    : notificationUnreadCount}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      {activeTab === "overview" && (
                        <div className="space-y-6">
                          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-400 pr-6">
                            <span className="text-gray-500">Campaign</span>
                            <select
                              value={overviewCampaignId}
                              onChange={(event) =>
                                setOverviewCampaignId(event.target.value)
                              }
                              className="mr-2 min-w-[180px] max-w-[240px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] px-3 py-1.5 text-xs text-gray-900 dark:text-white"
                            >
                              {overviewCampaignOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {/* Wallet Balance Card */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 overflow-hidden shadow-sm dark:shadow-none">
                              <div className="flex justify-between items-start mb-2">
                                <div className="overflow-hidden">
                                  <div
                                    className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate"
                                    title={`\u20B9${formatAmount(walletBalance)}`}
                                  >
                                    {"\u20B9"}
                                    {formatCompactAmount(walletBalance)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Wallet Balance
                                  </div>
                                </div>
                                <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-cyan-600/10 flex items-center justify-center flex-shrink-0 ml-2">
                                  <Wallet className="h-5 w-5 xl:h-6 xl:w-6 text-cyan-400" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-primary">+5.9%</span>
                                <span className="text-gray-500">
                                  vs last month
                                </span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 overflow-hidden shadow-sm dark:shadow-none">
                              <div className="flex justify-between items-start mb-2">
                                <div className="overflow-hidden">
                                  <div className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                    {overviewSelectedCampaignCount}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Total Campaigns
                                  </div>
                                </div>
                                <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-purple-600/10 flex items-center justify-center flex-shrink-0 ml-2">
                                  <BadgeCheck className="h-5 w-5 xl:h-6 xl:w-6 text-purple-400" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>
                                  Selected: {overviewSelectedCampaignCount}
                                </span>
                                <span className="text-gray-400">�</span>
                                <span>All: {campaigns.length}</span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 overflow-hidden shadow-sm dark:shadow-none">
                              <div className="flex justify-between items-start mb-2">
                                <div className="overflow-hidden">
                                  <div className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                    {overviewSelectedQrTotal}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Total QR Codes
                                  </div>
                                </div>
                                <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
                                  <QrCode className="h-5 w-5 xl:h-6 xl:w-6 text-primary" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>Selected: {overviewSelectedQrTotal}</span>
                                <span className="text-gray-400">�</span>
                                <span>All: {qrStats.total}</span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 overflow-hidden shadow-sm dark:shadow-none">
                              <div className="flex justify-between items-start mb-2">
                                <div className="overflow-hidden">
                                  <div className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                    {overviewSelectedQrRedeemed}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    QRs Redeemed
                                  </div>
                                </div>
                                <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-pink-600/10 flex items-center justify-center flex-shrink-0 ml-2">
                                  <Store className="h-5 w-5 xl:h-6 xl:w-6 text-pink-400" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>
                                  Selected: {overviewSelectedQrRedeemed}
                                </span>
                                <span className="text-gray-400">�</span>
                                <span>All: {qrStats.redeemed}</span>
                              </div>
                            </div>
                          </div>

                          <VendorAnalytics
                            redemptionSeries={overviewRedemptionSeries}
                            campaignSeries={campaignPerformanceSeries}
                            selectionLabel={overviewCampaignLabel}
                          />

                          <div
                            id="overview"
                            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                  <Store size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                  Recent Redemptions
                                </h3>
                              </div>
                              <button
                                onClick={() => navigate("/vendor/scan")}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                              >
                                Scan New
                              </button>
                            </div>

                            {qrs.filter(
                              (q) =>
                                q.status === "redeemed" ||
                                q.status === "claimed",
                            ).length === 0 ? (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                No redemptions yet. Share your QR codes to get
                                started!
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                  <thead className="text-xs uppercase bg-gray-100 dark:bg-[#252525] text-gray-500 dark:text-gray-300">
                                    <tr>
                                      <th className="px-4 py-3 rounded-l-lg">
                                        Time
                                      </th>
                                      <th className="px-4 py-3">Campaign</th>
                                      <th className="px-4 py-3">Amount</th>
                                      <th className="px-4 py-3 rounded-r-lg text-right">
                                        Hash
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-800">
                                    {qrs
                                      .filter(
                                        (q) =>
                                          q.status === "redeemed" ||
                                          q.status === "claimed",
                                      )
                                      .sort(
                                        (a, b) =>
                                          new Date(b.updatedAt || b.createdAt) -
                                          new Date(a.updatedAt || a.createdAt),
                                      )
                                      .slice(0, 10)
                                      .map((qr) => (
                                        <tr
                                          key={qr.id}
                                          className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                          <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                              Today
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              {format(new Date(), "h:mm a")}
                                              {/* Using current time as placeholder since API might not return update time yet */}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="truncate max-w-[150px] text-gray-900 dark:text-white">
                                              {qr.Campaign?.title ||
                                                "Unknown Campaign"}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 font-bold text-primary">
                                            {"\u20B9"}
                                            {formatAmount(
                                              getGeneratedPrice(qr),
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                                            {qr.uniqueHash.substring(0, 8)}...
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "brand" && (
                        <div className="space-y-6 pb-20">
                          <div
                            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none"
                            id="brand"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <Store size={22} className="text-primary" />
                                Profile & Brand Settings
                              </div>
                            </div>

                            <div className="text-sm text-gray-500 mb-8 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 flex items-start gap-3">
                              <Info
                                size={18}
                                className="text-primary mt-0.5 shrink-0"
                              />
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">
                                  Profile Management
                                </span>
                                Your company details, brand information, and
                                contact preferences can be updated here. These
                                details will be visible on your public profile.
                              </div>
                            </div>

                            <div className="space-y-6">
                              {/* Business Identity */}
                              <div className="pt-2 border-b border-gray-100 dark:border-white/5 pb-2">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Building2 size={16} />
                                  Business Identity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Company name
                                    </label>
                                    <input
                                      type="text"
                                      value={companyProfile.businessName}
                                      onChange={handleCompanyChange(
                                        "businessName",
                                      )}
                                      placeholder="Legal company name"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Brand name
                                    </label>
                                    <input
                                      type="text"
                                      value={brandProfile.name}
                                      onChange={(event) =>
                                        setBrandProfile((prev) => ({
                                          ...prev,
                                          name: event.target.value,
                                        }))
                                      }
                                      placeholder="Brand display name"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Designation
                                    </label>
                                    <input
                                      type="text"
                                      value={companyProfile.designation}
                                      onChange={handleCompanyChange(
                                        "designation",
                                      )}
                                      placeholder="e.g. CEO, Manager"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      GSTIN
                                    </label>
                                    <input
                                      type="text"
                                      value={companyProfile.gstin}
                                      onChange={handleCompanyChange("gstin")}
                                      placeholder="GST Number"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Contact Information */}
                              <div className="pt-2 border-b border-gray-100 dark:border-white/5 pb-2">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Phone size={16} />
                                  Contact Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Contact phone
                                    </label>
                                    <div className="relative">
                                      <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                      />
                                      <input
                                        type="tel"
                                        value={companyProfile.contactPhone}
                                        onChange={handleCompanyChange(
                                          "contactPhone",
                                        )}
                                        placeholder="Primary contact"
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Alternate Mobile
                                    </label>
                                    <div className="relative">
                                      <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                      />
                                      <input
                                        type="tel"
                                        value={companyProfile.alternatePhone}
                                        onChange={handleCompanyChange(
                                          "alternatePhone",
                                        )}
                                        placeholder="Alternate contact"
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Contact email
                                    </label>
                                    <div className="relative">
                                      <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                      />
                                      <input
                                        type="email"
                                        value={companyProfile.contactEmail}
                                        onChange={handleCompanyChange(
                                          "contactEmail",
                                        )}
                                        placeholder="contact@brand.com"
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Website
                                    </label>
                                    <div className="relative">
                                      <Globe
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                      />
                                      <input
                                        type="text"
                                        value={brandProfile.website}
                                        onChange={(event) =>
                                          setBrandProfile((prev) => ({
                                            ...prev,
                                            website: event.target.value,
                                          }))
                                        }
                                        placeholder="https://brand.com"
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Brand Assets */}
                              <div className="pt-2 border-b border-gray-100 dark:border-white/5 pb-6">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <ImageIcon size={16} />
                                  Brand Assets
                                </h4>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Brand Logo
                                  </label>
                                  <div className="flex items-center gap-6 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                                    <div className="relative group shrink-0">
                                      <input
                                        type="file"
                                        id="brand-logo-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleBrandLogoUpload}
                                        disabled={isUploadingBrandLogo}
                                      />
                                      <label
                                        htmlFor="brand-logo-upload"
                                        className={`relative block h-32 w-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary cursor-pointer transition-all bg-white dark:bg-black ${isUploadingBrandLogo ? "opacity-50 cursor-not-allowed" : ""}`}
                                      >
                                        {brandLogoPreviewSrc &&
                                        !imageLoadError ? (
                                          <img
                                            src={brandLogoPreviewSrc}
                                            alt="Brand logo"
                                            className="h-full w-full object-contain p-1"
                                            onError={() =>
                                              setImageLoadError(true)
                                            }
                                          />
                                        ) : (
                                          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <ImageIcon size={32} />
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Upload
                                            size={24}
                                            className="text-white"
                                          />
                                        </div>
                                      </label>
                                      {isUploadingBrandLogo && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-2xl">
                                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div>
                                        <label
                                          htmlFor="brand-logo-upload"
                                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-sm"
                                        >
                                          <Upload
                                            size={18}
                                            className="text-primary"
                                          />
                                          {brandProfile.logoUrl
                                            ? "Change Logo"
                                            : "Upload Logo"}
                                        </label>
                                      </div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Recommended: Square image (e.g.,
                                        512x512px). Supports JPG, PNG.
                                      </p>
                                      {brandLogoError && (
                                        <p className="text-sm text-red-500 font-medium">
                                          {brandLogoError}
                                        </p>
                                      )}
                                      {brandLogoStatus && (
                                        <p className="text-sm text-primary font-medium">
                                          {brandLogoStatus}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Registered Address */}
                              <div className="pt-2">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <MapPin size={16} />
                                  Registered Address
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      Street Address
                                    </label>
                                    <input
                                      type="text"
                                      value={companyProfile.address}
                                      onChange={handleCompanyChange("address")}
                                      placeholder="Block, Street, Area"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                      City
                                    </label>
                                    <input
                                      type="text"
                                      value={companyProfile.city}
                                      onChange={handleCompanyChange("city")}
                                      placeholder="City"
                                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                          State
                                        </label>
                                        <input
                                          type="text"
                                          value={companyProfile.state}
                                          onChange={handleCompanyChange(
                                            "state",
                                          )}
                                          placeholder="State"
                                          className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                          Pincode
                                        </label>
                                        <input
                                          type="text"
                                          value={companyProfile.pincode}
                                          onChange={handleCompanyChange(
                                            "pincode",
                                          )}
                                          placeholder="Pincode"
                                          className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-8">
                              {(registrationStatus || registrationError) && (
                                <div
                                  className={`text-sm font-medium ${registrationError ? "text-red-500" : "text-primary"}`}
                                >
                                  {registrationStatus || registrationError}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={handleRegistrationSave}
                                disabled={isSavingRegistration}
                                className="bg-primary hover:bg-primary-strong text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-70 transition-all active:scale-[0.98] flex items-center gap-2"
                              >
                                {isSavingRegistration ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save size={18} />
                                    Save Company Profile
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                              id="login-profile"
                              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-5 shadow-sm space-y-6"
                            >
                              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <User size={20} className="text-primary" />
                                Login Profile
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    value={accountProfile.name}
                                    onChange={handleAccountChange("name")}
                                    placeholder="Your name"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Login email
                                  </label>
                                  <input
                                    type="email"
                                    value={accountProfile.email}
                                    onChange={handleAccountChange("email")}
                                    placeholder="you@company.com"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Username
                                  </label>
                                  <input
                                    type="text"
                                    value={accountProfile.username}
                                    onChange={handleAccountChange("username")}
                                    placeholder="Unique username"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={accountProfile.phoneNumber}
                                    onChange={handleAccountChange(
                                      "phoneNumber",
                                    )}
                                    placeholder="Contact number"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={handleAccountSave}
                                  disabled={isSavingAccount}
                                  className="w-full rounded-xl bg-primary hover:bg-primary text-white text-sm font-bold py-3 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                  {isSavingAccount ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Login Details"
                                  )}
                                </button>
                                {(accountStatus || accountError) && (
                                  <div
                                    className={`text-sm text-center mt-3 font-medium ${accountError ? "text-red-500" : "text-primary"}`}
                                  >
                                    {accountStatus || accountError}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              id="login-security"
                              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-5 shadow-sm space-y-6"
                            >
                              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <ShieldCheck
                                  size={20}
                                  className="text-primary"
                                />
                                Password & Recovery
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Old password
                                  </label>
                                  <input
                                    type="password"
                                    value={passwordForm.oldPassword}
                                    onChange={handlePasswordFieldChange(
                                      "oldPassword",
                                    )}
                                    placeholder="Enter old password"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    New password
                                  </label>
                                  <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordFieldChange(
                                      "newPassword",
                                    )}
                                    placeholder="Create new password"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                    Confirm new password
                                  </label>
                                  <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordFieldChange(
                                      "confirmPassword",
                                    )}
                                    placeholder="Re-enter new password"
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={handlePasswordSubmit}
                                  disabled={isChangingPassword}
                                  className="w-full rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white text-sm font-bold py-3 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                  {isChangingPassword ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Update Password"
                                  )}
                                </button>
                                {(passwordStatus || passwordError) && (
                                  <div
                                    className={`text-sm text-center mt-3 font-medium ${passwordError ? "text-red-500" : "text-primary"}`}
                                  >
                                    {passwordStatus || passwordError}
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowOtpReset((prev) => !prev)
                                  }
                                  className="text-sm font-semibold text-primary hover:text-primary-strong dark:text-primary dark:hover:text-primary-strong transition-colors flex items-center gap-1"
                                >
                                  Forgot old password? Use OTP
                                </button>

                                {showOtpReset && (
                                  <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          Email
                                        </label>
                                        <input
                                          type="email"
                                          value={otpReset.email}
                                          onChange={handleOtpFieldChange(
                                            "email",
                                          )}
                                          placeholder="you@company.com"
                                          className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          OTP
                                        </label>
                                        <input
                                          type="text"
                                          value={otpReset.otp}
                                          onChange={handleOtpFieldChange("otp")}
                                          placeholder="Enter OTP"
                                          className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          New password
                                        </label>
                                        <input
                                          type="password"
                                          value={otpReset.newPassword}
                                          onChange={handleOtpFieldChange(
                                            "newPassword",
                                          )}
                                          placeholder="New pass"
                                          className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          Confirm
                                        </label>
                                        <input
                                          type="password"
                                          value={otpReset.confirmPassword}
                                          onChange={handleOtpFieldChange(
                                            "confirmPassword",
                                          )}
                                          placeholder="Confirm pass"
                                          className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                      <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                        className="w-full rounded-lg border border-primary/40 bg-white dark:bg-transparent text-primary dark:text-primary text-sm font-semibold py-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors disabled:opacity-60"
                                      >
                                        {isSendingOtp
                                          ? "Sending..."
                                          : "Send OTP"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleOtpResetPassword}
                                        disabled={isResettingOtp}
                                        className="w-full rounded-lg bg-primary hover:bg-primary text-white text-sm font-semibold py-2 transition-colors disabled:opacity-60"
                                      >
                                        {isResettingOtp
                                          ? "Resetting..."
                                          : "Reset"}
                                      </button>
                                    </div>
                                    {(otpStatus || otpError) && (
                                      <div
                                        className={`text-xs text-center font-medium ${otpError ? "text-red-500" : "text-primary"}`}
                                      >
                                        {otpStatus || otpError}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "campaigns" && (
                        <div
                          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 shadow-sm space-y-4"
                          id="campaigns"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                              <BadgeCheck
                                size={16}
                                className="text-primary-strong"
                              />
                              Campaigns
                            </div>
                            <button
                              type="button"
                              onClick={() => loadCampaigns()}
                              className={ICON_BUTTON}
                            >
                              <RefreshCw size={16} />
                            </button>
                          </div>

                          {/* Campaign Sub-tabs */}
                          <div className="flex border-b border-gray-200 dark:border-zinc-800">
                            <button
                              onClick={() => setCampaignTab("create")}
                              className={getTabButtonClass(
                                campaignTab === "create",
                              )}
                            >
                              Create Campaign
                            </button>
                            <button
                              onClick={() => setCampaignTab("pending")}
                              className={getTabButtonClass(
                                campaignTab === "pending",
                              )}
                            >
                              Pending Campaigns ({pendingCampaigns.length})
                            </button>
                            <button
                              onClick={() => setCampaignTab("active")}
                              className={getTabButtonClass(
                                campaignTab === "active",
                              )}
                            >
                              Active Campaigns ({activeCampaigns.length})
                            </button>
                          </div>
                          {/* Create Campaign Tab */}
                          {campaignTab === "create" && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  Campaign title
                                </label>
                                <input
                                  type="text"
                                  value={campaignForm.title}
                                  onChange={handleCampaignChange("title")}
                                  placeholder="e.g. Diwali Cashback"
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    Product
                                  </label>
                                </div>
                                <select
                                  value={campaignForm.productId}
                                  onChange={handleCampaignChange("productId")}
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                >
                                  <option value="">Select Product...</option>
                                  <option
                                    value="ADD_NEW_PRODUCT"
                                    className="text-primary font-bold"
                                  >
                                    + Add New Product
                                  </option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <textarea
                                  rows="2"
                                  value={campaignForm.description}
                                  onChange={handleCampaignChange("description")}
                                  placeholder="Short campaign summary"
                                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  Allocations
                                </label>
                                {campaignRows.map((row, index) => (
                                  <div
                                    key={row.id}
                                    className="grid grid-cols-12 gap-2 items-end"
                                  >
                                    <div className="col-span-3 space-y-1">
                                      <label className="text-[10px] uppercase tracking-wide text-gray-400">
                                        Cashback
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={row.cashbackAmount}
                                        onChange={(e) =>
                                          handleCampaignRowChange(
                                            row.id,
                                            "cashbackAmount",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Amt"
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div className="col-span-4 space-y-1">
                                      <label className="text-[10px] uppercase tracking-wide text-gray-400">
                                        Quantity
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={row.quantity}
                                        onChange={(e) =>
                                          handleCampaignRowChange(
                                            row.id,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Qty"
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div className="col-span-4 space-y-1">
                                      <label className="text-[10px] uppercase tracking-wide text-gray-400">
                                        Total ({"\u20B9"})
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formatAllocationTotal(row)}
                                        readOnly
                                        placeholder="Total"
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div className="col-span-1 pb-1.5 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveCampaignRow(row.id)
                                        }
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label="Remove row"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={handleAddCampaignRow}
                                  className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-primary text-xs font-semibold hover:bg-primary/20 hover:border-primary/60 transition-colors"
                                >
                                  <Plus size={16} />
                                  Add another allocation
                                </button>
                              </div>

                              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 px-3 py-2 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Subtotal ({campaignAllocationSummary.quantity}{" "}
                                  QRs)
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {"\u20B9"}
                                  {formatAmount(
                                    campaignAllocationSummary.subtotal,
                                  )}
                                </span>
                              </div>

                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                Campaign dates are auto-set from today.
                              </div>

                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={handleCreateCampaign}
                                  disabled={isSavingCampaign}
                                  className={`w-full sm:w-auto sm:px-10 ${PRIMARY_BUTTON}`}
                                >
                                  {isSavingCampaign
                                    ? "Creating..."
                                    : "Create Campaign"}
                                </button>
                              </div>
                              {campaignStatus && (
                                <div className="text-xs text-primary font-semibold">
                                  {campaignStatus}
                                </div>
                              )}
                              {campaignError && (
                                <div className="text-xs text-red-600 font-semibold">
                                  {campaignError}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Active Campaigns Tab */}
                          {campaignTab === "active" && (
                            <div className="space-y-4">
                              {showQrGenerator && (
                                <div className="rounded-xl border border-gray-100 dark:border-zinc-800 p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                      <QrCode
                                        size={16}
                                        className="text-primary-strong"
                                      />
                                      Generate QRs
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                      Select a campaign and product to generate
                                      QR codes.
                                    </div>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-3">
                                    <div className="space-y-2">
                                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Campaign
                                      </label>
                                      <select
                                        value={selectedQrCampaign}
                                        onChange={(event) =>
                                          setSelectedQrCampaign(
                                            event.target.value,
                                          )
                                        }
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                      >
                                        <option value="">
                                          Select campaign
                                        </option>
                                        {activeCampaigns.map((campaign) => (
                                          <option
                                            key={campaign.id}
                                            value={campaign.id}
                                          >
                                            {campaign.title}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          Product
                                        </label>
                                      </div>
                                      <select
                                        value={selectedQrProduct}
                                        onChange={(event) => {
                                          const value = event.target.value;
                                          if (value === "ADD_NEW_PRODUCT") {
                                            setProductModalContext("qr");
                                            setEditingProduct(null);
                                            setShowProductModal(true);
                                          } else {
                                            setSelectedQrProduct(value);
                                          }
                                        }}
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                      >
                                        <option value="">Select product</option>
                                        <option
                                          value="ADD_NEW_PRODUCT"
                                          className="text-primary font-bold"
                                        >
                                          + Add New Product
                                        </option>
                                        {products.map((product) => (
                                          <option
                                            key={product.id}
                                            value={product.id}
                                          >
                                            {product.name}
                                            {product.variant
                                              ? ` - ${product.variant}`
                                              : ""}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                          QR Series
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => loadQrInventorySeries()}
                                          className="text-[10px] text-primary hover:underline"
                                        >
                                          Refresh
                                        </button>
                                      </div>
                                      <select
                                        value={selectedQrSeries}
                                        onChange={(event) =>
                                          setSelectedQrSeries(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                      >
                                        <option value="">
                                          Any available series
                                        </option>
                                        {qrInventorySeries.map((series) => (
                                          <option
                                            key={`${series.seriesCode}-${series.sourceBatch || "na"}`}
                                            value={series.seriesCode}
                                          >
                                            {series.seriesCode} ({series.availableCount})
                                          </option>
                                        ))}
                                      </select>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {qrInventorySeries.length
                                          ? "Series values come from your pre-provisioned inventory."
                                          : "No explicit series found. Recharge will use any available inventory."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleOrderQrs}
                                      disabled={
                                        !selectedQrCampaign ||
                                        !selectedQrProduct ||
                                        isOrdering
                                      }
                                      className={SUCCESS_BUTTON}
                                    >
                                      {isOrdering
                                        ? "Generating..."
                                        : "Generate QRs"}
                                    </button>
                                  </div>
                                  {qrOrderStatus && (
                                    <div className="text-xs text-primary font-semibold">
                                      {qrOrderStatus}
                                    </div>
                                  )}
                                  {qrOrderError && (
                                    <div className="text-xs text-red-600 font-semibold">
                                      {qrOrderError}
                                    </div>
                                  )}
                                  {lastBatchSummary && (
                                    <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary-strong/20 p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-primary">
                                          Order Invoice
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {format(
                                            new Date(
                                              lastBatchSummary.timestamp,
                                            ),
                                            "PPP p",
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                            Campaign
                                          </div>
                                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {lastBatchSummary.campaignTitle}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                            Quantity
                                          </div>
                                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {lastBatchSummary.totalQrs || 0} QRs
                                          </div>
                                        </div>
                                      </div>
                                      <div className="border-t border-primary/30 pt-3 flex items-center justify-between gap-3">
                                        <div className="text-xs text-gray-400">
                                          Payment recorded. Admin will ship the
                                          QR codes after processing.
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const invoiceData = {
                                                id: lastBatchSummary.id,
                                                date: lastBatchSummary.timestamp,
                                                campaign:
                                                  lastBatchSummary.campaignTitle,
                                                quantity:
                                                  lastBatchSummary.totalQrs,
                                              };
                                              const invoiceText = `
INVOICE #${invoiceData.id}
Date: ${format(new Date(invoiceData.date), "PPP p")}
----------------------------------------
Campaign: ${invoiceData.campaign}
Quantity: ${invoiceData.quantity} QRs
----------------------------------------
                                      `.trim();
                                              const blob = new Blob(
                                                [invoiceText],
                                                { type: "text/plain" },
                                              );
                                              const url =
                                                URL.createObjectURL(blob);
                                              const a =
                                                document.createElement("a");
                                              a.href = url;
                                              a.download = `invoice-${invoiceData.id}.txt`;
                                              a.click();
                                              URL.revokeObjectURL(url);
                                            }}
                                            className="text-xs font-semibold text-primary hover:text-primary-strong px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/10"
                                          >
                                            Download Invoice
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-2">
                                {activeCampaigns.length === 0 ? (
                                  <div className="text-xs text-center text-gray-500 py-4">
                                    No active campaigns found.
                                  </div>
                                ) : (
                                  activeCampaigns.map((campaign) => {
                                    const allocationGroups =
                                      buildAllocationGroups(
                                        campaign.allocations,
                                      );
                                    const totalQty = allocationGroups.reduce(
                                      (sum, group) => sum + group.quantity,
                                      0,
                                    );
                                    const fallbackBudget =
                                      allocationGroups.reduce(
                                        (sum, group) => sum + group.totalBudget,
                                        0,
                                      );
                                    const totalBudget = parseNumericValue(
                                      campaign.subtotal,
                                      parseNumericValue(
                                        campaign.totalBudget,
                                        fallbackBudget,
                                      ),
                                    );
                                    const stats = campaignQrMap.get(
                                      campaign.id,
                                    );
                                    const statsTotal = stats?.stats?.total;
                                    const statsActive = stats?.stats?.active;
                                    const statsRedeemed =
                                      stats?.stats?.redeemed;
                                    const hasStatsTotal =
                                      Number.isFinite(statsTotal);
                                    const totalCount = hasStatsTotal
                                      ? Math.max(statsTotal, totalQty)
                                      : totalQty;
                                    const redeemedCount = Number.isFinite(
                                      statsRedeemed,
                                    )
                                      ? statsRedeemed
                                      : 0;
                                    const activeCount =
                                      Number.isFinite(statsActive) &&
                                      hasStatsTotal &&
                                      statsTotal >= totalQty
                                        ? statsActive
                                        : Math.max(
                                            0,
                                            totalCount - redeemedCount,
                                          );

                                    return (
                                      <div
                                        key={campaign.id}
                                        className="rounded-2xl border border-gray-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 px-4 py-4 shadow-sm transition-colors transition-shadow hover:border-primary/40 hover:shadow-md"
                                      >
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
                                              onClick={() =>
                                                handleDownloadCampaignPdf(
                                                  campaign.id,
                                                )
                                              }
                                              disabled={
                                                isDownloadingPdf === campaign.id
                                              }
                                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
                                              title="Download QR Code"
                                              aria-label="Download QR Code"
                                            >
                                              <Download size={14} />
                                              Download QR Code
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedActiveCampaign(
                                                  campaign,
                                                )
                                              }
                                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-500/30 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                                              title="View Details"
                                              aria-label="View Details"
                                            >
                                              <Eye size={14} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteCampaign(campaign)
                                              }
                                              disabled={
                                                deletingCampaignId ===
                                                campaign.id
                                              }
                                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
                                              title="Delete"
                                              aria-label="Delete"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-4">
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
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 sm:hidden">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDownloadCampaignPdf(
                                                campaign.id,
                                              )
                                            }
                                            disabled={
                                              isDownloadingPdf === campaign.id
                                            }
                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
                                            title="Download PDF"
                                            aria-label="Download PDF"
                                          >
                                            <Download size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedActiveCampaign(
                                                campaign,
                                              )
                                            }
                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-500/30 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                                            title="View Details"
                                            aria-label="View Details"
                                          >
                                            <Eye size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteCampaign(campaign)
                                            }
                                            disabled={
                                              deletingCampaignId === campaign.id
                                            }
                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
                                            title="Delete"
                                            aria-label="Delete"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}

                          {/* Pending Campaigns Tab */}
                          {campaignTab === "pending" && (
                            <div className="space-y-4">
                              {pendingCampaigns.length === 0 ? (
                                <div className="text-xs text-center text-gray-500 py-4">
                                  No pending campaigns found.
                                </div>
                              ) : (
                                pendingCampaigns.map((campaign) => {
                                  const allocationGroups =
                                    buildAllocationGroups(campaign.allocations);
                                  const totalQty = allocationGroups.reduce(
                                    (sum, group) => sum + group.quantity,
                                    0,
                                  );
                                  const fallbackBudget =
                                    allocationGroups.reduce(
                                      (sum, group) => sum + group.totalBudget,
                                      0,
                                    );
                                  const totalBudget = parseNumericValue(
                                    campaign.subtotal,
                                    parseNumericValue(
                                      campaign.totalBudget,
                                      fallbackBudget,
                                    ),
                                  );
                                  return (
                                    <div
                                      key={campaign.id}
                                      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    >
                                      <div className="bg-gradient-to-r from-amber-600/20 to-amber-600/10 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Megaphone
                                              size={18}
                                              className="text-amber-400"
                                            />
                                            <div>
                                              <span className="text-base font-bold text-gray-900 dark:text-white">
                                                {campaign.title}
                                              </span>
                                            </div>
                                          </div>
                                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold tracking-wide">
                                            Pending
                                          </span>
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 dark:bg-[#0f0f0f] divide-y divide-gray-200 dark:divide-gray-800">
                                        {allocationGroups.length === 0 ? (
                                          <div className="p-4 text-xs text-gray-500">
                                            No allocations configured yet.
                                          </div>
                                        ) : (
                                          allocationGroups.map((group) => {
                                            const groupKey = `${campaign.id}-${group.price.toFixed(2)}`;
                                            return (
                                              <div
                                                key={groupKey}
                                                className="p-4"
                                              >
                                                <div className="flex items-center">
                                                  <div className="flex items-center gap-4">
                                                    <div>
                                                      <div className="text-xs text-gray-500">
                                                        Cashback Amount
                                                      </div>
                                                      <div className="text-lg font-bold text-primary">
                                                        {"\u20B9"}
                                                        {formatAmount(
                                                          group.price,
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div>
                                                      <div className="text-xs text-gray-500">
                                                        Quantity
                                                      </div>
                                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {group.quantity} QRs
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>

                                      <div className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#0f0f0f]">
                                        <span>
                                          Total: {totalQty} QR
                                          {totalQty !== 1 ? "s" : ""} - Budget{" "}
                                          {"\u20B9"}
                                          {formatAmount(totalBudget)}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteCampaign(campaign)
                                            }
                                            disabled={
                                              deletingCampaignId === campaign.id
                                            }
                                            className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 font-medium hover:bg-rose-500/20 hover:border-rose-500/50 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                          >
                                            <Trash2 size={14} />
                                            {deletingCampaignId === campaign.id
                                              ? "Deleting..."
                                              : "Delete"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedPendingCampaign(
                                                campaign,
                                              )
                                            }
                                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                          >
                                            Proceed to Pay
                                            <ArrowRight size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* Pending Campaign Details Modal */}
                          {selectedPendingCampaign && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/50 backdrop-blur-sm">
                              <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto ios-scroll shadow-2xl border border-gray-100 dark:border-zinc-800">
                                <div className="p-6 space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedPendingCampaign.title}
                                      </h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(
                                          new Date(
                                            selectedPendingCampaign.startDate,
                                          ),
                                          "MMM dd",
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          new Date(
                                            selectedPendingCampaign.endDate,
                                          ),
                                          "MMM dd, yyyy",
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setSelectedPendingCampaign(null)
                                      }
                                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                    >
                                      <X size={20} className="text-gray-500" />
                                    </button>
                                  </div>

                                  {selectedPendingCampaign.description && (
                                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                                      {selectedPendingCampaign.description}
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <Package
                                        size={16}
                                        className="text-primary"
                                      />
                                      Allocations Breakdown
                                    </h4>
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase text-gray-500 font-medium">
                                          <tr>
                                            <th className="px-4 py-3">
                                              Cashback
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              Qty
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                              Budget
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                          {(
                                            selectedPendingCampaign.allocations ||
                                            []
                                          ).map((alloc, idx) => (
                                            <tr
                                              key={idx}
                                              className="bg-white dark:bg-zinc-900"
                                            >
                                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                INR{" "}
                                                {formatAmount(
                                                  alloc.cashbackAmount,
                                                )}
                                              </td>
                                              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                                                {alloc.quantity}
                                              </td>
                                              <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                INR{" "}
                                                {formatAmount(
                                                  alloc.totalBudget,
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-zinc-800/30 font-semibold text-gray-900 dark:text-white">
                                          <tr>
                                            <td className="px-4 py-3">
                                              Subtotal
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              {pendingCampaignPayment.totalQty}{" "}
                                              QRs
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              INR{" "}
                                              {pendingCampaignPayment.baseBudget.toFixed(
                                                2,
                                              )}
                                            </td>
                                          </tr>
                                          {/* QR Generation Cost Row */}
                                          <tr>
                                            <td className="px-4 py-3 text-gray-500 font-normal">
                                              QR Generation Cost (INR{" "}
                                              {formatAmount(qrPricePerUnit)}/QR)
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-500 font-normal">
                                              -
                                            </td>
                                            <td className="px-4 py-3 text-right font-normal text-gray-600 dark:text-gray-400">
                                              + INR{" "}
                                              {pendingCampaignPayment.printCost.toFixed(
                                                2,
                                              )}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>

                                  <div className="bg-primary/5 dark:bg-primary-strong/10 border border-primary/10 dark:border-primary-strong/30 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Wallet Balance
                                      </span>
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        INR {formatAmount(pendingWalletBalance)}
                                      </span>
                                    </div>
                                    <div className="h-px bg-primary/20 dark:bg-primary-strong/30"></div>
                                    <div className="flex items-center justify-between text-base font-bold text-primary-strong dark:text-primary">
                                      <span>Total Payable</span>
                                      <span>
                                        INR{" "}
                                        {pendingCampaignPayment.totalCost.toFixed(
                                          2,
                                        )}
                                      </span>
                                    </div>
                                    {pendingCampaignShortfall > 0 && (
                                      <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                        Add INR{" "}
                                        {pendingCampaignShortfall.toFixed(2)} to
                                        wallet to enable payment.
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setSelectedPendingCampaign(null)
                                      }
                                      className={SECONDARY_BUTTON}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handlePayCampaign(
                                          selectedPendingCampaign,
                                        )
                                      }
                                      disabled={
                                        isPayingCampaign ||
                                        !canPaySelectedPendingCampaign
                                      }
                                      className={`flex-1 ${PRIMARY_BUTTON} flex items-center justify-center gap-2 ${
                                        !canPaySelectedPendingCampaign &&
                                        !isPayingCampaign
                                          ? "opacity-60 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {isPayingCampaign ? (
                                        <>Processing...</>
                                      ) : !canPaySelectedPendingCampaign ? (
                                        <>Insufficient Balance</>
                                      ) : (
                                        <>
                                          <Wallet size={18} />
                                          Pay & Activate
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Active Campaign Details Modal */}
                          {activeCampaignDetails && activeCampaign && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/50 backdrop-blur-sm">
                              <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto ios-scroll shadow-2xl border border-gray-100 dark:border-zinc-800">
                                <div className="p-6 space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {activeCampaign.title}
                                      </h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatShortDate(
                                          activeCampaign.startDate,
                                        )}{" "}
                                        -{" "}
                                        {formatShortDate(
                                          activeCampaign.endDate,
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setSelectedActiveCampaign(null)
                                      }
                                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                    >
                                      <X size={20} className="text-gray-500" />
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                    <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                                      Active
                                    </span>
                                    <span>ID: {activeCampaign.id}</span>
                                    {activeCampaignDetails.product && (
                                      <span>
                                        Product:{" "}
                                        {activeCampaignDetails.product.name}
                                        {activeCampaignDetails.product.variant
                                          ? ` - ${activeCampaignDetails.product.variant}`
                                          : ""}
                                      </span>
                                    )}
                                  </div>

                                  {activeCampaign.description && (
                                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                                      {activeCampaign.description}
                                    </div>
                                  )}

                                  <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-3">
                                      <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                        Budget
                                      </div>
                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {"\u20B9"}
                                        {formatAmount(
                                          activeCampaignDetails.totalBudget,
                                        )}
                                      </div>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-3">
                                      <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                        Total QRs
                                      </div>
                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {activeCampaignDetails.stats?.stats
                                          .total ||
                                          activeCampaignDetails.totalQty ||
                                          0}
                                      </div>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-3">
                                      <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                        Redeemed
                                      </div>
                                      <div className="text-lg font-bold text-primary">
                                        {activeCampaignDetails.stats?.stats
                                          .redeemed || 0}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Active QRs:{" "}
                                    {activeCampaignDetails.stats?.stats
                                      .active || 0}{" "}
                                    - Redeemed:{" "}
                                    {activeCampaignDetails.stats?.stats
                                      .redeemed || 0}
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <Package
                                        size={16}
                                        className="text-primary"
                                      />
                                      {activeCampaignDetails.stats?.stats.total
                                        ? "QR Breakdown"
                                        : "Allocation Breakdown"}
                                    </h4>
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase text-gray-500 font-medium">
                                          <tr>
                                            <th className="px-4 py-3">
                                              Cashback
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              Qty
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              Active
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              Redeemed
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                          {activeCampaignDetails.breakdownRows.map(
                                            (row, idx) => (
                                              <tr
                                                key={`${activeCampaign.id}-${idx}`}
                                                className="bg-white dark:bg-zinc-900"
                                              >
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                  INR{" "}
                                                  {formatAmount(row.cashback)}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                                                  {row.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                                                  {row.active || 0}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                                                  {row.redeemed || 0}
                                                </td>
                                              </tr>
                                            ),
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setSelectedActiveCampaign(null)
                                      }
                                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                      Close
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteCampaign(activeCampaign)
                                      }
                                      disabled={
                                        deletingCampaignId ===
                                        activeCampaign?.id
                                      }
                                      className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors disabled:opacity-60 cursor-pointer"
                                    >
                                      {deletingCampaignId === activeCampaign?.id
                                        ? "Deleting..."
                                        : "Delete Campaign"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {showQrOrdersSection && (
                            <div
                              className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none space-y-4"
                              id="qr-inventory"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-base font-bold text-white">
                                  <ClipboardCheck
                                    size={18}
                                    className="text-primary"
                                  />
                                  QR Orders
                                </div>
                                <div className="flex items-center gap-2">
                                  {qrHasMore && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        loadQrs(token, {
                                          page: qrPage + 1,
                                          append: true,
                                        })
                                      }
                                      disabled={isLoadingQrs}
                                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                                    >
                                      <Download size={12} />
                                      Load more
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      loadQrs(token, { page: 1, append: false })
                                    }
                                    disabled={isLoadingQrs}
                                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                                  >
                                    <RefreshCw size={12} />
                                    Refresh
                                  </button>
                                </div>
                              </div>
                              {isLoadingQrs && (
                                <div className="text-xs text-gray-400">
                                  Loading orders...
                                </div>
                              )}
                              {qrError && (
                                <div className="text-xs text-red-500 font-semibold">
                                  {qrError}
                                </div>
                              )}
                              {!isLoadingQrs && qrs.length === 0 && (
                                <div className="text-xs text-gray-500">
                                  No QR orders yet. Generate QRs above.
                                </div>
                              )}
                              {showOrderTracking && (
                                <>
                                  {isLoadingOrders && (
                                    <div className="text-xs text-gray-400">
                                      Loading order status...
                                    </div>
                                  )}
                                  {ordersError && (
                                    <div className="text-xs text-red-500 font-semibold">
                                      {ordersError}
                                    </div>
                                  )}
                                  {!isLoadingOrders &&
                                    ordersTotal === 0 &&
                                    orders.length === 0 && (
                                      <div className="text-xs text-gray-500">
                                        No print orders logged yet.
                                      </div>
                                    )}
                                  {orders.length > 0 && (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-100 dark:bg-zinc-800/60 text-gray-500 uppercase text-[10px]">
                                          <tr>
                                            <th className="px-3 py-2 text-left">
                                              Order
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                              Campaign
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                              Qty
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                              Status
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                          {orders.map((order) => (
                                            <tr key={order.id}>
                                              <td className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">
                                                {order.id.slice(0, 8)}...
                                              </td>
                                              <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                                {order.campaignTitle ||
                                                  "Campaign"}
                                              </td>
                                              <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-200">
                                                {order.quantity}
                                              </td>
                                              <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                                <span
                                                  className={getStatusClasses(
                                                    order.status,
                                                  )}
                                                >
                                                  {order.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                  {ordersHasMore && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        loadOrders(token, {
                                          page: ordersPage + 1,
                                          append: true,
                                        })
                                      }
                                      disabled={isLoadingOrders}
                                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                      Load more orders
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Order Summary by Campaign */}
                              {qrsGroupedByCampaign.length > 0 && (
                                <div className="space-y-3">
                                  {qrsGroupedByCampaign.map((campaign) => (
                                    <div
                                      key={campaign.id}
                                      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    >
                                      {/* Campaign Header */}
                                      <div className="bg-gradient-to-r from-primary/30 to-primary/10 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Megaphone
                                              size={18}
                                              className="text-primary"
                                            />
                                            <div>
                                              <span className="text-base font-bold text-gray-900 dark:text-white">
                                                {campaign.title}
                                              </span>
                                              {campaign.endDate && (
                                                <span className="ml-2 text-xs text-gray-400">
                                                  Expires:{" "}
                                                  {format(
                                                    new Date(campaign.endDate),
                                                    "MMM dd, yyyy",
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs">
                                            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                                              {campaign.stats.active} Active
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-gray-600/20 text-gray-400 font-semibold">
                                              {campaign.stats.redeemed} Redeemed
                                            </span>
                                            <span className="text-gray-500">
                                              Total: {campaign.stats.total}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Order Summary (No QR Images) */}
                                      <div className="bg-gray-50 dark:bg-[#0f0f0f] divide-y divide-gray-200 dark:divide-gray-800">
                                        {campaign.priceGroups.map(
                                          (priceGroup) => {
                                            const groupKey = `${campaign.id}-${priceGroup.priceKey ?? priceGroup.price}`;
                                            return (
                                              <div
                                                key={groupKey}
                                                className="p-4"
                                              >
                                                <div className="flex items-center">
                                                  <div className="flex items-center gap-4">
                                                    <div>
                                                      <div className="text-xs text-gray-500">
                                                        Cashback Amount
                                                      </div>
                                                      <div className="text-lg font-bold text-primary">
                                                        {"\u20B9"}
                                                        {formatAmount(
                                                          priceGroup.price,
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div>
                                                      <div className="text-xs text-gray-500">
                                                        Quantity
                                                      </div>
                                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {priceGroup.qrs.length}{" "}
                                                        QRs
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="text-[10px] text-gray-500 flex items-center justify-between">
                                <span>
                                  Total: {qrTotalLabel} QR
                                  {qrTotalLabel !== 1 ? "s" : ""} across{" "}
                                  {qrsGroupedByCampaign.length} campaign
                                  {qrsGroupedByCampaign.length !== 1 ? "s" : ""}
                                  {qrCoverageLabel
                                    ? ` - ${qrCoverageLabel}`
                                    : ""}
                                </span>
                                <span>
                                  {qrStats.redeemed} redeemed - {qrStats.active}{" "}
                                  active
                                </span>
                              </div>
                              {qrActionStatus && (
                                <div className="text-xs text-primary font-semibold">
                                  {qrActionStatus}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Products Section */}
                      {activeTab === "products" && (
                        <div
                          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none space-y-4"
                          id="products"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                              <Package size={18} className="text-primary" />
                              Products
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => loadProducts()}
                                disabled={isLoadingProducts}
                                className={ICON_BUTTON}
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(null);
                                  setShowProductModal(true);
                                }}
                                className={`${PRIMARY_BUTTON} inline-flex items-center gap-2`}
                              >
                                <Plus size={14} className="flex-shrink-0" />
                                Add Product
                              </button>
                            </div>
                          </div>

                          {/* Products List */}
                          {isLoadingProducts ? (
                            <div className="text-center py-12">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
                              <div className="text-sm text-gray-400 mt-3">
                                Loading products...
                              </div>
                            </div>
                          ) : products.length === 0 ? (
                            <div className="text-center py-12">
                              <Package
                                size={48}
                                className="mx-auto text-gray-400 mb-3"
                              />
                              <div className="text-sm text-gray-500">
                                No products yet.
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Click "Add Product" to create your first product
                              </div>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                              <table className="w-full text-sm table-fixed min-w-[900px]">
                                <colgroup>
                                  <col className="w-24" />
                                  <col className="w-auto" />
                                  <col className="w-32" />
                                  <col className="w-32" />
                                  <col className="w-28" />
                                  <col className="w-28" />
                                  <col className="w-32" />
                                </colgroup>
                                <thead className="bg-gradient-to-r from-primary to-primary text-white">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      Image
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      Product
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      SKU
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      Category
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      MRP
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                      Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {products.map((product, idx) => {
                                    const imageSrc = resolveAssetUrl(
                                      product.imageUrl,
                                    );
                                    const hasImageError =
                                      failedProductImages.has(product.id);
                                    return (
                                      <tr
                                        key={product.id}
                                        className={`${
                                          idx % 2 === 0
                                            ? "bg-gray-50 dark:bg-[#1a1a1a]"
                                            : "bg-white dark:bg-[#0f0f0f]"
                                        } hover:bg-primary/5/50 dark:hover:bg-primary-strong/10 transition-colors`}
                                      >
                                        <td className="px-4 py-4">
                                          {imageSrc && !hasImageError ? (
                                            <img
                                              src={imageSrc}
                                              alt={product.name}
                                              className="h-14 w-14 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                                              onError={() => {
                                                setFailedProductImages(
                                                  (prev) => {
                                                    const next = new Set(prev);
                                                    next.add(product.id);
                                                    return next;
                                                  },
                                                );
                                              }}
                                            />
                                          ) : (
                                            <div className="h-14 w-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                              <Package
                                                size={24}
                                                className="text-gray-400"
                                              />
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="space-y-1">
                                            <div className="font-semibold text-gray-900 dark:text-white leading-tight">
                                              {product.name}
                                            </div>
                                            {product.variant && (
                                              <div className="text-xs text-gray-500 leading-tight">
                                                {product.variant}
                                              </div>
                                            )}
                                            {product.description && (
                                              <div className="text-xs text-gray-400 leading-tight line-clamp-2">
                                                {product.description}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                          {product.sku || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                          <span className="line-clamp-2">
                                            {product.category || "-"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold whitespace-nowrap">
                                          {product.mrp
                                            ? `INR ${Number(product.mrp).toFixed(2)}`
                                            : "-"}
                                        </td>
                                        <td className="px-4 py-4">
                                          <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                              product.status === "active"
                                                ? "bg-primary/10 dark:bg-primary-strong/30 text-primary-strong dark:text-primary"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            }`}
                                          >
                                            {product.status || "active"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="flex items-center justify-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingProduct(product);
                                                setShowProductModal(true);
                                              }}
                                              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex-shrink-0 cursor-pointer"
                                              title="Edit product"
                                            >
                                              <Edit2 size={16} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteProduct(product.id)
                                              }
                                              className="p-2 rounded-lg border border-rose-300 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex-shrink-0 cursor-pointer"
                                              title="Delete product"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Total: {products.length} product
                              {products.length !== 1 ? "s" : ""}
                            </span>
                            {productStatus && (
                              <div className="text-primary font-semibold">
                                {productStatus}
                              </div>
                            )}
                            {productError && (
                              <div className="text-rose-500 font-semibold">
                                {productError}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Wallet Section */}
                      {activeTab === "wallet" && (
                        <div
                          className="bg-white dark:bg-[#09090b] rounded-2xl p-6 space-y-8 min-h-[80vh]"
                          id="wallet"
                        >
                          {/* Wallet Controls Header */}
                          <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-200">
                            <Wallet size={20} className="text-primary" />
                            Wallet controls
                          </div>

                          {/* Balance Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Available Balance */}
                            <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#111] p-6 shadow-sm dark:shadow-none">
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                Available balance
                              </div>
                              <div
                                className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
                                title={`INR ${formatAmount(walletBalance)}`}
                              >
                                INR {formatCompactAmount(walletBalance)}
                              </div>
                            </div>

                            {/* Locked Balance */}
                            <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#111] p-6 shadow-sm dark:shadow-none">
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                Locked balance
                              </div>
                              <div
                                className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
                                title={`INR ${formatAmount(lockedBalance)}`}
                              >
                                INR {formatCompactAmount(lockedBalance)}
                              </div>
                            </div>
                          </div>

                          {/* Recharge Section */}
                          <div className="space-y-3">
                            <label className="text-xs font-medium text-gray-500 block">
                              Recharge amount
                            </label>
                            <div className="flex gap-3">
                              <input
                                type="number"
                                min="1"
                                value={rechargeAmount}
                                onChange={(event) =>
                                  setRechargeAmount(event.target.value)
                                }
                                placeholder="Enter amount in INR"
                                className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={handleRecharge}
                                disabled={isRecharging}
                                className="rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold px-6 shadow-lg shadow-primary-strong/20 disabled:opacity-60 transition-all active:scale-[0.99] whitespace-nowrap"
                              >
                                {isRecharging
                                  ? "Recharging..."
                                  : "Recharge wallet"}
                              </button>
                            </div>
                          </div>

                          {/* Status Messages */}
                          {(walletStatus || walletError) && (
                            <div
                              className={`text-xs font-semibold px-1 ${walletError ? "text-red-500" : "text-primary"}`}
                            >
                              {walletStatus || walletError}
                            </div>
                          )}

                          {/* Transaction History Section */}
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-base font-semibold text-gray-900 dark:text-gray-200">
                                Transaction history
                              </div>
                              <button
                                type="button"
                                onClick={() => loadTransactions()}
                                disabled={isLoadingTransactions}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <RefreshCw size={12} />
                                Refresh
                              </button>
                            </div>

                            {isLoadingTransactions && (
                              <div className="text-xs text-gray-500 animate-pulse">
                                Loading transactions...
                              </div>
                            )}

                            {!isLoadingTransactions &&
                              transactions.length === 0 &&
                              !transactionsError && (
                                <div className="text-xs text-gray-500 py-8 text-center border border-gray-100 dark:border-zinc-900 rounded-xl bg-white dark:bg-[#111]">
                                  No transactions found.
                                </div>
                              )}

                            {transactions.length > 0 && (
                              <div className="rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#111]">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 font-medium border-b border-gray-100 dark:border-zinc-800">
                                    <tr>
                                      <th className="px-5 py-3.5 w-40">Date</th>
                                      <th className="px-5 py-3.5">Category</th>
                                      <th className="px-5 py-3.5 w-24">Type</th>
                                      <th className="px-5 py-3.5 w-40 text-right">
                                        Amount
                                      </th>
                                      <th className="px-5 py-3.5 w-24">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                                    {displayedTransactions.map((tx, idx) => {
                                      const typeLabel = String(
                                        tx.type || "",
                                      ).toLowerCase();
                                      const isCredit = typeLabel === "credit";

                                      return (
                                        <tr
                                          key={tx.id || idx}
                                          className="hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors"
                                        >
                                          <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                            {formatTransactionDate(
                                              tx.createdAt,
                                            )}
                                          </td>
                                          <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                            {String(
                                              tx.category || "n/a",
                                            ).replace(/_/g, " ")}
                                          </td>
                                          <td className="px-5 py-4 capitalize text-gray-500 dark:text-gray-400">
                                            {typeLabel}
                                          </td>
                                          <td className="px-5 py-4 text-right font-medium">
                                            <span
                                              className={
                                                isCredit
                                                  ? "text-primary"
                                                  : "text-rose-500"
                                              }
                                            >
                                              {isCredit ? "+" : "-"}INR{" "}
                                              {formatAmount(tx.amount)}
                                            </span>
                                          </td>
                                          <td className="px-5 py-4">
                                            <span className="text-gray-400">
                                              success
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {transactions.length > 5 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAllTransactions((prev) => !prev)
                                }
                                className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                              >
                                {showAllTransactions
                                  ? "View less"
                                  : `View all (${transactions.length})`}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Redemptions Tab - Customer redemption history */}
                      {activeTab === "redemptions" && (
                        <VendorRedemptions token={token} />
                      )}

                      {activeTab === "locations" && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm dark:shadow-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                              <input
                                type="date"
                                value={dashboardFilters.dateFrom}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateFrom: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="date"
                                value={dashboardFilters.dateTo}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateTo: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <select
                                value={dashboardFilters.campaignId}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    campaignId: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              >
                                <option value="">All campaigns</option>
                                {campaigns.map((campaign) => (
                                  <option key={campaign.id} value={campaign.id}>
                                    {campaign.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                placeholder="City"
                                value={dashboardFilters.city}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    city: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Mobile"
                                value={dashboardFilters.mobile}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    mobile: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleApplyExtraFilters}
                                className={`${PRIMARY_BUTTON} rounded-lg`}
                              >
                                Apply
                              </button>
                            </div>
                            {extraTabError && (
                              <p className="mt-3 text-xs text-rose-500">
                                {extraTabError}
                              </p>
                            )}
                          </div>

                          {isLoadingExtraTab ? (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-6 text-sm text-gray-500">
                              Loading locations...
                            </div>
                          ) : (
                            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                                <div className="h-[480px]">
                                  <MapContainer
                                    center={locationMapCenter}
                                    zoom={5}
                                    className="h-full w-full"
                                  >
                                    <TileLayer
                                      attribution='&copy; OpenStreetMap contributors'
                                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {locationsData
                                      .filter(
                                        (point) =>
                                          Number.isFinite(Number(point?.lat)) &&
                                          Number.isFinite(Number(point?.lng)),
                                      )
                                      .map((point, index) => (
                                        <Marker
                                          key={`${point.lat}-${point.lng}-${index}`}
                                          position={[
                                            Number(point.lat),
                                            Number(point.lng),
                                          ]}
                                        >
                                          <Popup>
                                            <div className="text-xs">
                                              <div className="font-semibold">
                                                {point.city || "Unknown city"}
                                              </div>
                                              <div>{point.count || 0} scans</div>
                                            </div>
                                          </Popup>
                                        </Marker>
                                      ))}
                                  </MapContainer>
                                </div>
                              </div>
                              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                  Clusters
                                </div>
                                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                                  {locationsData.length === 0 ? (
                                    <div className="text-xs text-gray-500">
                                      No locations found.
                                    </div>
                                  ) : (
                                    locationsData.map((point, index) => (
                                      <div
                                        key={`${point.lat}-${point.lng}-${index}-list`}
                                        className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 p-2"
                                      >
                                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                          {point.city || "Unknown"}
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                          {point.count || 0} scans
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "customers" && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm dark:shadow-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                              <input
                                type="date"
                                value={dashboardFilters.dateFrom}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateFrom: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="date"
                                value={dashboardFilters.dateTo}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateTo: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <select
                                value={dashboardFilters.campaignId}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    campaignId: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              >
                                <option value="">All campaigns</option>
                                {campaigns.map((campaign) => (
                                  <option key={campaign.id} value={campaign.id}>
                                    {campaign.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                placeholder="City"
                                value={dashboardFilters.city}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    city: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Mobile"
                                value={dashboardFilters.mobile}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    mobile: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleApplyExtraFilters}
                                className={`${PRIMARY_BUTTON} rounded-lg`}
                              >
                                Apply
                              </button>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  exportVendorCustomers(token, buildExtraFilterParams())
                                }
                                className={`${SECONDARY_BUTTON} rounded-lg text-xs inline-flex items-center gap-2`}
                              >
                                <Download size={14} />
                                Export CSV
                              </button>
                            </div>
                            {extraTabError && (
                              <p className="mt-3 text-xs text-rose-500">
                                {extraTabError}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-gray-50 dark:bg-[#171717] text-gray-500 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                  <th className="px-4 py-3">Customer</th>
                                  <th className="px-4 py-3">Mobile</th>
                                  <th className="px-4 py-3">Codes</th>
                                  <th className="px-4 py-3">Rewards Earned</th>
                                  <th className="px-4 py-3">First Scan Location</th>
                                  <th className="px-4 py-3">Member Since</th>
                                  <th className="px-4 py-3">Last Scanned</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {isLoadingExtraTab ? (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      Loading customers...
                                    </td>
                                  </tr>
                                ) : customersData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      No customers found.
                                    </td>
                                  </tr>
                                ) : (
                                  customersData.map((customer) => (
                                    <tr key={customer.userId || customer.mobile}>
                                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                        {customer.name || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                        {customer.mobile || "-"}
                                      </td>
                                      <td className="px-4 py-3">{customer.codeCount || 0}</td>
                                      <td className="px-4 py-3">
                                        INR {formatAmount(customer.rewardsEarned)}
                                      </td>
                                      <td className="px-4 py-3">
                                        {customer.firstScanLocation || "-"}
                                      </td>
                                      <td className="px-4 py-3">
                                        {formatDate(customer.memberSince)}
                                      </td>
                                      <td className="px-4 py-3">
                                        {formatDate(customer.lastScanned)}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeTab === "billing" && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm dark:shadow-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                              <input
                                type="date"
                                value={dashboardFilters.dateFrom}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateFrom: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="date"
                                value={dashboardFilters.dateTo}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    dateTo: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Invoice number"
                                value={dashboardFilters.invoiceNo}
                                onChange={(event) =>
                                  setDashboardFilters((prev) => ({
                                    ...prev,
                                    invoiceNo: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleApplyExtraFilters}
                                className={`${PRIMARY_BUTTON} rounded-lg`}
                              >
                                Apply
                              </button>
                              <button
                                type="button"
                                onClick={() => loadInvoicesData(token)}
                                className={`${SECONDARY_BUTTON} rounded-lg`}
                              >
                                Refresh
                              </button>
                            </div>
                            {invoiceShareStatus && (
                              <p className="mt-3 text-xs text-primary">
                                {invoiceShareStatus}
                              </p>
                            )}
                            {extraTabError && (
                              <p className="mt-3 text-xs text-rose-500">
                                {extraTabError}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-gray-50 dark:bg-[#171717] text-gray-500 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                  <th className="px-4 py-3">Invoice No.</th>
                                  <th className="px-4 py-3">Type</th>
                                  <th className="px-4 py-3">Issued</th>
                                  <th className="px-4 py-3">Subtotal</th>
                                  <th className="px-4 py-3">Tax</th>
                                  <th className="px-4 py-3">Total</th>
                                  <th className="px-4 py-3">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {isLoadingExtraTab ? (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      Loading invoices...
                                    </td>
                                  </tr>
                                ) : invoicesData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      No invoices found.
                                    </td>
                                  </tr>
                                ) : (
                                  invoicesData.map((invoice) => (
                                    <tr key={invoice.id}>
                                      <td className="px-4 py-3 font-mono text-[11px]">
                                        {invoice.number || invoice.id}
                                      </td>
                                      <td className="px-4 py-3">{invoice.type}</td>
                                      <td className="px-4 py-3">{formatDate(invoice.issuedAt)}</td>
                                      <td className="px-4 py-3">INR {formatAmount(invoice.subtotal)}</td>
                                      <td className="px-4 py-3">INR {formatAmount(invoice.tax)}</td>
                                      <td className="px-4 py-3">INR {formatAmount(invoice.total)}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              downloadVendorInvoicePdf(token, invoice.id)
                                            }
                                            className={`${SECONDARY_BUTTON} text-[11px] px-2 py-1`}
                                          >
                                            Download
                                          </button>
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              try {
                                                const response = await shareVendorInvoice(
                                                  token,
                                                  invoice.id,
                                                );
                                                const shareUrl =
                                                  response?.shareUrl ||
                                                  response?.url ||
                                                  "";
                                                if (
                                                  shareUrl &&
                                                  navigator?.clipboard?.writeText
                                                ) {
                                                  await navigator.clipboard.writeText(
                                                    shareUrl,
                                                  );
                                                  setInvoiceShareStatus(
                                                    "Share link copied to clipboard.",
                                                  );
                                                } else if (shareUrl) {
                                                  setInvoiceShareStatus(shareUrl);
                                                } else {
                                                  setInvoiceShareStatus(
                                                    "Share link generated.",
                                                  );
                                                }
                                              } catch (error) {
                                                setInvoiceShareStatus(
                                                  error.message ||
                                                    "Unable to generate share link.",
                                                );
                                              }
                                            }}
                                            className={`${SECONDARY_BUTTON} text-[11px] px-2 py-1`}
                                          >
                                            Share
                                          </button>
                                          {invoice.shareToken && (
                                            <a
                                              href={`${API_BASE_URL}/api/public/invoices/shared/${invoice.shareToken}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className={`${SECONDARY_BUTTON} text-[11px] px-2 py-1 inline-flex items-center`}
                                            >
                                              Open
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeTab === "reports" && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                Product Reports
                              </div>
                              <button
                                type="button"
                                onClick={() => loadReportsData(token)}
                                className={`${SECONDARY_BUTTON} rounded-lg inline-flex items-center gap-2`}
                              >
                                <RefreshCw size={14} />
                                Refresh
                              </button>
                            </div>
                            {extraTabError && (
                              <p className="mt-3 text-xs text-rose-500">
                                {extraTabError}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-gray-50 dark:bg-[#171717] text-gray-500 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                  <th className="px-4 py-3">Title</th>
                                  <th className="px-4 py-3">Product</th>
                                  <th className="px-4 py-3">Customer</th>
                                  <th className="px-4 py-3">Created</th>
                                  <th className="px-4 py-3">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {isLoadingExtraTab ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      Loading reports...
                                    </td>
                                  </tr>
                                ) : reportsData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-4 py-6 text-center text-gray-500"
                                    >
                                      No reports found.
                                    </td>
                                  </tr>
                                ) : (
                                  reportsData.map((report) => (
                                    <tr key={report.id}>
                                      <td className="px-4 py-3">{report.title || "-"}</td>
                                      <td className="px-4 py-3">
                                        {report.Product?.name || "-"}
                                      </td>
                                      <td className="px-4 py-3">
                                        {report.User?.name || "-"}
                                      </td>
                                      <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                                      <td className="px-4 py-3">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            downloadVendorProductReport(
                                              token,
                                              report.id,
                                            )
                                          }
                                          className={`${SECONDARY_BUTTON} text-[11px] px-2 py-1 inline-flex items-center gap-1`}
                                        >
                                          <Download size={12} />
                                          Download
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Support Tab - Create and view support tickets */}
                      {activeTab === "support" && (
                        <VendorSupport token={token} />
                      )}
                    </main>
                  </div>
                </div>

                {isNotificationsOpen && (
                  <div className="fixed inset-0 z-50">
                    <button
                      type="button"
                      aria-label="Close notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="absolute inset-0 z-40 bg-black/10 dark:bg-black/40 backdrop-blur-[1px]"
                    />
                    <div
                      ref={notificationsDropdownRef}
                      className="absolute z-50 right-6 top-20 w-[420px] max-w-[calc(100vw-2rem)] h-[min(80vh,640px)] rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f0f0f]/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-colors duration-200 flex flex-col"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Notifications
                          </span>
                          {notificationUnreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              {notificationUnreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => loadNotifications(token)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                            title="Refresh notifications"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${isLoadingNotifications ? "animate-spin" : ""}`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={handleMarkAllNotificationsRead}
                            disabled={
                              isMarkingNotificationsRead ||
                              isLoadingNotifications ||
                              notificationUnreadCount === 0
                            }
                            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check size={12} />
                            {isMarkingNotificationsRead
                              ? "Marking..."
                              : "Mark all read"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                            title="Close notifications"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      {notificationsError && (
                        <div className="px-4 py-2.5 text-xs text-primary dark:text-primary bg-primary/5 dark:bg-primary/10 border-b border-primary/20 dark:border-primary/30">
                          {notificationsError}
                        </div>
                      )}
                      <div
                        className="min-h-0 flex-1 overflow-y-scroll overscroll-contain p-3 pr-2 space-y-2 custom-scrollbar touch-pan-y"
                        style={{ WebkitOverflowScrolling: "touch" }}
                        onWheel={(event) => event.stopPropagation()}
                        onTouchMove={(event) => event.stopPropagation()}
                      >
                        {isLoadingNotifications ? (
                          <div className="text-xs text-gray-400 text-center py-6">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((item) => {
                            const meta = getNotificationMeta(item);
                            const Icon = meta.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNotificationClick(item)}
                                className={`w-full text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                                  item.isRead
                                    ? "border-gray-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    : "border-primary/25 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-xl border ${meta.badgeClass} flex items-center justify-center flex-shrink-0`}
                                  >
                                    <Icon size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {item.title || meta.label}
                                      </div>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {formatDate(item.createdAt)}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {item.message || "No details available."}
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5">
                                      {!item.isRead && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      )}
                                      <span
                                        className={`text-[10px] font-semibold ${
                                          item.isRead
                                            ? "text-gray-400 dark:text-gray-500"
                                            : "text-primary"
                                        }`}
                                      >
                                        {item.isRead ? "Read" : "New"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Preview Modal Start */}
                <ConfirmModal
                  isOpen={successModal.isOpen}
                  onClose={closeSuccessModal}
                  onConfirm={closeSuccessModal}
                  title={successModal.title || "Success"}
                  message={
                    successModal.message || "Action completed successfully."
                  }
                  confirmText="OK"
                  type="success"
                  showCancel={false}
                />

                {/* Product Edit Modal */}
                {showProductModal && (
                  <ProductEditModal
                    product={editingProduct}
                    onClose={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                    }}
                    onSave={handleSaveProduct}
                    isLoading={isSavingProduct}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default VendorDashboard;
