import { apiRequest, buildApiUrl } from "./apiClient";
import { AUTH_TOKEN_KEY } from "./auth";

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length) return "";
  const search = new URLSearchParams(entries);
  return `?${search.toString()}`;
};

const resolveAuthToken = (token) => {
  if (token) return token;
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
};

const downloadAuthedFile = async (token, path, fallbackName) => {
  const authToken = resolveAuthToken(token);
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download file");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  let derivedFileName = null;
  if (fileNameMatch?.[1]) {
    const rawFileName = fileNameMatch[1].replace(/"/g, "");
    try {
      derivedFileName = decodeURIComponent(rawFileName);
    } catch (_) {
      derivedFileName = rawFileName;
    }
  }

  const fileName = derivedFileName || fallbackName;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  window.setTimeout(() => link.click(), 0);
  window.setTimeout(() => link.remove(), 300);
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
};

export const sendOtp = (phoneNumber) =>
  apiRequest("/api/auth/send-otp", {
    method: "POST",
    body: { phoneNumber },
  });

export const verifyOtp = (phoneNumber, otp) =>
  apiRequest("/api/auth/verify-otp", {
    method: "POST",
    body: { phoneNumber, otp },
  });

export const sendEmailOtp = (email) =>
  apiRequest("/api/auth/send-email-otp", {
    method: "POST",
    body: { email },
  });

export const resetPasswordWithOtp = (email, otp, password) =>
  apiRequest("/api/auth/reset-password-otp", {
    method: "POST",
    body: { email, otp, password },
  });

export const getUserDashboard = (token) =>
  apiRequest("/api/user/dashboard", {
    token,
  });

export const getUserRedemptionHistory = (token) =>
  apiRequest("/api/user/redemptions", {
    token: resolveAuthToken(token),
  });

// Claim QR APIs
export const getClaimPreview = (token) =>
  apiRequest(`/api/claim/preview?token=${encodeURIComponent(token)}`);

export const redeemClaim = (authToken, token, payload = {}) =>
  apiRequest("/api/claim/redeem", {
    method: "POST",
    token: authToken,
    body: { token, ...payload },
  });

export const getWalletSummary = (token) =>
  apiRequest("/api/wallet", {
    token: resolveAuthToken(token),
  });

export const scanQR = (hash, token, payload = {}) =>
  apiRequest(`/api/user/scan-qr/${encodeURIComponent(hash)}`, {
    method: "POST",
    token: resolveAuthToken(token),
    body: payload,
  });

// Wallet APIs
export const getWalletOverview = (token) =>
  apiRequest("/api/wallet/overview", { token: resolveAuthToken(token) });

export const getTransactionHistory = (params = {}, token) =>
  apiRequest(`/api/wallet/transactions${buildQueryString(params)}`, {
    token: resolveAuthToken(token),
  });

export const requestPayout = (amount, payoutMethodId, token) =>
  apiRequest("/api/wallet/redeem", {
    method: "POST",
    token: resolveAuthToken(token),
    body: { amount, payoutMethodId },
  });

export const getPayoutStatus = (payoutId, token) =>
  apiRequest(`/api/wallet/payout/${encodeURIComponent(payoutId)}`, {
    token: resolveAuthToken(token),
  });

export const getPayoutMethods = (token) =>
  apiRequest("/api/wallet/payout-methods", { token: resolveAuthToken(token) });

export const addUPIMethod = (upiId, setAsPrimary = false, token) =>
  apiRequest("/api/wallet/payout-methods/upi", {
    method: "POST",
    token: resolveAuthToken(token),
    body: { upi: upiId, setAsPrimary },
  });

export const setPrimaryUPI = (methodId, token) =>
  apiRequest("/api/wallet/payout-methods/primary", {
    method: "PUT",
    token: resolveAuthToken(token),
    body: { methodId },
  });

export const deleteUPIMethod = (methodId, token) =>
  apiRequest(`/api/wallet/payout-methods/${encodeURIComponent(methodId)}`, {
    method: "DELETE",
    token: resolveAuthToken(token),
  });

export const loginWithEmail = (email, password, username) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password, username },
  });

export const registerVendor = (payload) =>
  apiRequest("/api/auth/vendor/register", {
    method: "POST",
    body: payload,
  });

export const uploadImage = (token, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest("/api/upload", {
    method: "POST",
    token,
    body: formData,
  });
};

export const uploadUserAvatar = (token, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest("/api/user/avatar", {
    method: "POST",
    token,
    body: formData,
  });
};

export const getMe = (token) =>
  apiRequest("/api/auth/me", {
    token,
  });

export const updateUserProfile = (token, payload) =>
  apiRequest("/api/user/profile", {
    method: "PUT",
    token,
    body: payload,
  });

export const changeUserPassword = (token, oldPassword, newPassword) =>
  apiRequest("/api/user/change-password", {
    method: "PUT",
    token,
    body: { oldPassword, newPassword },
  });

export const getUserNotifications = (token) =>
  apiRequest("/api/user/notifications", {
    token,
  });

export const markUserNotificationRead = (token, notificationId) =>
  apiRequest(`/api/user/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "PUT",
    token,
  });

export const getUserSupportTickets = (token) =>
  apiRequest("/api/user/support", {
    token: resolveAuthToken(token),
  });

export const createUserSupportTicket = (payload, token) =>
  apiRequest("/api/user/support", {
    method: "POST",
    token: resolveAuthToken(token),
    body: payload,
  });

export const getVendorWallet = (token) =>
  apiRequest("/api/vendor/wallet", {
    token,
  });

export const getVendorTransactions = (token, params) =>
  apiRequest(`/api/vendor/transactions${buildQueryString(params)}`, {
    token,
  });

export const getVendorWalletTransactionsDetailed = (token, params) =>
  apiRequest(`/api/vendor/wallet/transactions${buildQueryString(params)}`, {
    token,
  });

export const exportVendorWalletTransactions = (token, params) =>
  downloadAuthedFile(
    token,
    `/api/vendor/wallet/transactions/export${buildQueryString(params)}`,
    `vendor-wallet-transactions-${Date.now()}.csv`
  );

export const rechargeVendorWallet = (token, amount) =>
  apiRequest("/api/vendor/wallet/recharge", {
    method: "POST",
    token,
    body: { amount },
  });

export const createPaymentOrder = (token, amount) =>
  apiRequest("/api/payments/order", {
    method: "POST",
    token,
    body: { amount },
  });

export const verifyPayment = (token, paymentData) =>
  apiRequest("/api/payments/verify", {
    method: "POST",
    token,
    body: paymentData,
  });

export const orderVendorQrs = (
  token,
  campaignId,
  quantity,
  cashbackAmount,
  seriesCode = null,
) =>
  apiRequest("/api/vendor/qrs/order", {
    method: "POST",
    token,
    body: { campaignId, quantity, cashbackAmount, seriesCode },
  });

export const rechargeVendorQrs = (
  token,
  campaignId,
  quantity,
  cashbackAmount,
  seriesCode = null,
) =>
  apiRequest("/api/vendor/qrs/recharge", {
    method: "POST",
    token,
    body: { campaignId, quantity, cashbackAmount, seriesCode },
  });

export const getVendorQrInventorySeries = (token, params) =>
  apiRequest(`/api/vendor/qrs/inventory/series${buildQueryString(params)}`, {
    token,
  });

export const downloadVendorInventoryQrPdf = (token, params = {}) =>
  downloadAuthedFile(
    token,
    `/api/vendor/qrs/inventory/download${buildQueryString(params)}`,
    `vendor-inventory-qr-${Date.now()}.pdf`
  );

export const getVendorQrs = (token, params) =>
  apiRequest(`/api/vendor/qrs${buildQueryString(params)}`, {
    token,
  });

export const deleteVendorQrBatch = (token, campaignId, cashbackAmount) =>
  apiRequest(
    `/api/vendor/qrs/batch?campaignId=${encodeURIComponent(campaignId)}&cashbackAmount=${encodeURIComponent(
      cashbackAmount ?? ""
    )}`,
    {
      method: "DELETE",
      token,
      body: { campaignId, cashbackAmount },
    }
  );

export const verifyPublicQr = (hash) =>
  apiRequest(`/api/public/qrs/${encodeURIComponent(hash)}`);

export const getVendorProfile = (token) =>
  apiRequest("/api/vendor/profile", {
    token,
  });

export const updateVendorProfile = (token, payload) =>
  apiRequest("/api/vendor/profile", {
    method: "PUT",
    token,
    body: payload,
  });

export const requestVendorCredentialUpdate = (token, payload) =>
  apiRequest("/api/vendor/credentials/request", {
    method: "POST",
    token,
    body: payload,
  });

export const getVendorBrand = (token) =>
  apiRequest("/api/vendor/brand", {
    token,
  });

export const getVendorBrands = (token) =>
  apiRequest("/api/vendor/brands", {
    token,
  });

export const getVendorProducts = (token) =>
  apiRequest("/api/vendor/products", {
    token,
  });

export const addVendorProduct = (token, payload) =>
  apiRequest("/api/vendor/products", {
    method: "POST",
    token,
    body: payload,
  });

export const importVendorProducts = (token, payload) =>
  apiRequest("/api/vendor/products/import", {
    method: "POST",
    token,
    body: payload,
  });

export const upsertVendorBrand = (token, payload) =>
  apiRequest("/api/vendor/brand", {
    method: "POST",
    token,
    body: payload,
  });

export const getVendorCampaigns = (token) =>
  apiRequest("/api/vendor/campaigns", {
    token,
  });

export const getVendorCampaignStats = (token) =>
  apiRequest("/api/vendor/campaigns/stats", {
    token,
  });

export const createVendorCampaign = (token, payload) =>
  apiRequest("/api/vendor/campaigns", {
    method: "POST",
    token,
    body: payload,
  });

export const updateVendorCampaign = (token, campaignId, payload) =>
  apiRequest(`/api/vendor/campaigns/${campaignId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const deleteVendorCampaign = (token, campaignId) =>
  apiRequest(`/api/vendor/campaigns/${campaignId}`, {
    method: "DELETE",
    token,
  });

// Vendor Redemptions (B11 - Customer Data)
export const getVendorRedemptions = (token, params) =>
  apiRequest(`/api/vendor/redemptions${buildQueryString(params)}`, {
    token,
  });

export const exportVendorRedemptions = (token, params) =>
  downloadAuthedFile(
    token,
    `/api/vendor/redemptions/export${buildQueryString(params)}`,
    `vendor-redemptions-${Date.now()}.csv`
  );

export const getVendorRedemptionsMap = (token, params) =>
  apiRequest(`/api/vendor/redemptions/map${buildQueryString(params)}`, {
    token,
  });

export const getVendorSummaryAnalytics = (token, params) =>
  apiRequest(`/api/vendor/analytics/summary${buildQueryString(params)}`, {
    token,
  });

export const getVendorCustomers = (token, params) =>
  apiRequest(`/api/vendor/customers${buildQueryString(params)}`, {
    token,
  });

export const exportVendorCustomers = (token, params) =>
  downloadAuthedFile(
    token,
    `/api/vendor/customers/export${buildQueryString(params)}`,
    `vendor-customers-${Date.now()}.csv`
  );

// Vendor Support Tickets (B13)
export const getVendorSupportTickets = (token, params) =>
  apiRequest(`/api/vendor/support${buildQueryString(params)}`, {
    token,
  });

export const createVendorSupportTicket = (token, payload) =>
  apiRequest("/api/vendor/support", {
    method: "POST",
    token,
    body: payload,
  });

export const getVendorInvoices = (token, params) =>
  apiRequest(`/api/vendor/invoices${buildQueryString(params)}`, {
    token,
  });

export const downloadVendorInvoicePdf = (token, invoiceId) =>
  downloadAuthedFile(
    token,
    `/api/vendor/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    `invoice-${invoiceId}.pdf`
  );

export const shareVendorInvoice = (token, invoiceId) =>
  apiRequest(`/api/vendor/invoices/${encodeURIComponent(invoiceId)}/share`, {
    method: "POST",
    token,
  });

export const getVendorProductReports = (token, params) =>
  apiRequest(`/api/vendor/product-reports${buildQueryString(params)}`, {
    token,
  });

export const downloadVendorProductReport = (token, reportId) =>
  downloadAuthedFile(
    token,
    `/api/vendor/product-reports/${encodeURIComponent(reportId)}/download`,
    `product-report-${reportId}.txt`
  );

export const getAdminDashboard = (token) =>
  apiRequest("/api/admin/dashboard", {
    token,
  });

export const getAdminFinanceSummary = (token) =>
  apiRequest("/api/admin/finance/summary", {
    token,
  });

export const getAdminUsers = (token) =>
  apiRequest("/api/admin/users", {
    token,
  });

export const updateAdminUserStatus = (token, userId, status) =>
  apiRequest(`/api/admin/users/${userId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });

export const getAdminUserOverview = (token, userId) =>
  apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/overview`, {
    token,
  });

export const updateAdminUserDetails = (token, userId, payload) =>
  apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminVendors = (token, params) =>
  apiRequest(`/api/admin/vendors${buildQueryString(params)}`, {
    token,
  });

export const getAdminBrands = (token, params) =>
  apiRequest(`/api/admin/brands${buildQueryString(params)}`, {
    token,
  });

export const getAdminCampaigns = (token, paramsOrType) => {
  const params = typeof paramsOrType === "string" ? { type: paramsOrType } : paramsOrType;
  return apiRequest(`/api/admin/campaigns${buildQueryString(params)}`, {
    token,
  });
};

export const createAdminBrand = (token, payload) =>
  apiRequest("/api/admin/brands", {
    method: "POST",
    token,
    body: payload,
  });

export const updateAdminVendorStatus = (token, vendorId, status) =>
  apiRequest(`/api/admin/vendors/${vendorId}/verify`, {
    method: "PUT",
    token,
    body: { status },
  });

export const updateAdminBrandStatus = (token, brandId, payload) =>
  apiRequest(`/api/admin/brands/${brandId}/verify`, {
    method: "PUT",
    token,
    body: payload,
  });

export const creditVendorWalletAdmin = (token, payload) =>
  apiRequest("/api/admin/wallets/credit", {
    method: "POST",
    token,
    body: payload,
  });

export const updateAdminCampaignStatus = (token, campaignId, status) =>
  apiRequest(`/api/admin/campaigns/${campaignId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });

export const updateAdminCampaignDetails = (token, campaignId, payload) =>
  apiRequest(`/api/admin/campaigns/${campaignId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminCampaignAnalytics = (token, campaignId) =>
  apiRequest(`/api/admin/campaigns/${campaignId}/analytics`, {
    token,
  });

export const deleteAdminCampaign = (token, campaignId) =>
  apiRequest(`/api/admin/campaigns/${campaignId}`, {
    method: "DELETE",
    token,
  });

export const getAdminTransactions = (token) =>
  apiRequest("/api/admin/transactions", {
    token,
  });

export const getAdminTransactionsFiltered = (token, params) =>
  apiRequest(`/api/admin/transactions${buildQueryString(params)}`, {
    token,
  });

export const getAdminQrs = (token, params) =>
  apiRequest(`/api/admin/qrs${buildQueryString(params)}`, {
    token,
  });

export const getAdminQrBatch = (token, params) =>
  apiRequest(`/api/admin/qrs/batch${buildQueryString(params)}`, {
    token,
  });

export const getAdminWithdrawals = (token) =>
  apiRequest("/api/admin/withdrawals", {
    token,
  });

export const processAdminWithdrawal = (token, withdrawalId, payload) =>
  apiRequest(`/api/admin/withdrawals/${withdrawalId}/process`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminNotifications = (token) =>
  apiRequest("/api/admin/notifications", {
    token,
  });

export const getAdminSupportTickets = (token) =>
  apiRequest("/api/admin/support", {
    token,
  });

export const replyAdminSupportTicket = (token, ticketId, payload) =>
  apiRequest(`/api/admin/support/${ticketId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminSubscriptions = (token, status) =>
  apiRequest(`/api/admin/subscriptions${status ? `?status=${status}` : ""}`, {
    token,
  });

export const updateAdminVendorSubscription = (token, vendorId, payload) =>
  apiRequest(`/api/admin/vendors/${vendorId}/subscription`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminVendorOverview = (token, vendorId) =>
  apiRequest(`/api/admin/vendors/${vendorId}/overview`, {
    token,
  });

// C8: System Settings
export const getAdminSystemSettings = (token) =>
  apiRequest("/api/admin/settings", {
    token,
  });

export const updateAdminSystemSettings = (token, payload) =>
  apiRequest("/api/admin/settings", {
    method: "PUT",
    token,
    body: payload,
  });

// C9: Activity Logs (Audit)
export const getAdminActivityLogs = (token, params) =>
  apiRequest(`/api/admin/activity-logs${buildQueryString(params)}`, {
    token,
  });

export const updateAdminVendorDetails = (token, vendorId, payload) =>
  apiRequest(`/api/admin/vendors/${vendorId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const updateAdminVendorCredentials = (token, vendorId, payload) =>
  apiRequest(`/api/admin/vendors/${vendorId}/credentials`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminVendorCredentialRequests = (token, vendorId, params) =>
  apiRequest(`/api/admin/vendors/${vendorId}/credential-requests${buildQueryString(params)}`, {
    token,
  });

export const approveAdminCredentialRequest = (token, requestId, payload) =>
  apiRequest(`/api/admin/credential-requests/${requestId}/approve`, {
    method: "PUT",
    token,
    body: payload,
  });

export const rejectAdminCredentialRequest = (token, requestId, payload) =>
  apiRequest(`/api/admin/credential-requests/${requestId}/reject`, {
    method: "PUT",
    token,
    body: payload,
  });

export const getAdminBrandOverview = (token, brandId) =>
  apiRequest(`/api/admin/brands/${brandId}`, {
    token,
  });

export const updateAdminBrandDetails = (token, brandId, payload) =>
  apiRequest(`/api/admin/brands/${brandId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const adjustVendorWalletAdmin = (token, payload) =>
  apiRequest("/api/admin/wallets/adjust", {
    method: "POST",
    token,
    body: payload,
  });

// --- Vendor Order APIs ---
export const getVendorOrders = (token, params) =>
  apiRequest(`/api/vendor/orders${buildQueryString(params)}`, {
    token,
  });

export const createVendorOrder = (token, campaignId, quantity, cashbackAmount) =>
  apiRequest("/api/vendor/orders", {
    method: "POST",
    token,
    body: { campaignId, quantity, cashbackAmount },
  });

export const payVendorOrder = (token, orderId) =>
  apiRequest(`/api/vendor/orders/${orderId}/pay`, {
    method: "POST",
    token,
  });

export const downloadVendorOrderPdf = async (token, orderId) => {
  const url = buildApiUrl(`/api/vendor/orders/${orderId}/download`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download PDF");
  }
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  let derivedFileName = null;
  if (fileNameMatch?.[1]) {
    const rawFileName = fileNameMatch[1].replace(/"/g, "");
    try {
      derivedFileName = decodeURIComponent(rawFileName);
    } catch (_) {
      derivedFileName = rawFileName;
    }
  }
  const fileName = derivedFileName || `QR_Order_${orderId.slice(-8)}.pdf`;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = fileName;
  // Keep current SPA route untouched even if browser ignores `download`.
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  window.setTimeout(() => {
    link.click();
  }, 0);
  window.setTimeout(() => {
    link.remove();
  }, 300);
  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 2000);
};

export const downloadCampaignQrPdf = async (token, campaignId) => {
  const url = buildApiUrl(`/api/vendor/campaigns/${campaignId}/download`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download PDF");
  }
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  let derivedFileName = null;
  if (fileNameMatch?.[1]) {
    const rawFileName = fileNameMatch[1].replace(/"/g, "");
    try {
      derivedFileName = decodeURIComponent(rawFileName);
    } catch (_) {
      derivedFileName = rawFileName;
    }
  }
  const fileName = derivedFileName || `QR_Campaign_${campaignId.slice(-8)}.pdf`;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = fileName;
  // Keep current SPA route untouched even if browser ignores `download`.
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  window.setTimeout(() => {
    link.click();
  }, 0);
  window.setTimeout(() => {
    link.remove();
  }, 300);
  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 2000);
};

// --- Admin Order APIs ---
export const getAdminOrders = (token, params) =>
  apiRequest(`/api/admin/orders${buildQueryString(params)}`, {
    token,
  });

export const updateAdminOrderStatus = (token, orderId, status) =>
  apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });

export const payVendorCampaign = (token, campaignId, payload = undefined) =>
  apiRequest(`/api/vendor/campaigns/${campaignId}/pay`, {
    method: "POST",
    token,
    body: payload,
  });

export const assignSheetCashback = (token, campaignId, { sheetIndex, cashbackAmount }) =>
  apiRequest(`/api/vendor/campaigns/${campaignId}/sheet-cashback`, {
    method: "PUT",
    token,
    body: { sheetIndex, cashbackAmount },
  });

export const paySheetCashback = (token, campaignId, { sheetIndex, cashbackAmount }) =>
  apiRequest(`/api/vendor/campaigns/${campaignId}/sheet-pay`, {
    method: "POST",
    token,
    body: { sheetIndex, cashbackAmount },
  });

// --- Public APIs ---
export const getPublicHome = () => apiRequest("/api/public/home");

export const getPublicProducts = (params) =>
  apiRequest(`/api/public/products${buildQueryString(params)}`);

export const getPublicProductDetails = (productId) =>
  apiRequest(`/api/public/products/${encodeURIComponent(productId)}`);

export const getPublicCategories = () => apiRequest("/api/public/categories");

export const getPublicBrands = () => apiRequest("/api/public/brands");

export const getPublicBrandDetails = (brandId) =>
  apiRequest(`/api/public/brands/${encodeURIComponent(brandId)}`);

export const getPublicFaqs = () => apiRequest("/api/public/faqs");

export const getPublicContent = (slug) =>
  apiRequest(`/api/public/content/${encodeURIComponent(slug)}`);

export const getPublicGiftCardCategories = () =>
  apiRequest("/api/public/giftcards/categories");

export const getPublicGiftCards = (params) =>
  apiRequest(`/api/public/giftcards${buildQueryString(params)}`);

export const getPublicGiftCardDetails = (giftCardId) =>
  apiRequest(`/api/public/giftcards/${encodeURIComponent(giftCardId)}`);

export const getPublicStoreData = () => apiRequest("/api/public/store");

export const redeemStoreProduct = (token, productId) =>
  apiRequest("/api/user/store/redeem", {
    method: "POST",
    token: resolveAuthToken(token),
    body: { productId },
  });




export const requestWithdrawal = (token, payload) =>
  apiRequest("/api/user/withdrawals", {
    method: "POST",
    token,
    body: payload,
  });

export const updateVendorProduct = (token, productId, payload) =>
  apiRequest(`/api/vendor/products/${productId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const deleteVendorProduct = (token, productId) =>
  apiRequest(`/api/vendor/products/${productId}`, {
    method: "DELETE",
    token,
  });

export const getUserHomeStats = (token) =>
  apiRequest("/api/user/home-stats", {
    token,
  });
