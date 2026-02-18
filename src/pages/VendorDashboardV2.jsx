import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  Download,
  FileText,
  LifeBuoy,
  LogOut,
  MapPinned,
  RefreshCw,
  Users,
  Wallet,
  Loader2,
  Building2,
  ChartLine,
  ClipboardList,
  Settings,
  Save,
  Copy,
} from "lucide-react";
import {
  downloadVendorInvoicePdf,
  downloadVendorProductReport,
  exportVendorCustomers,
  exportVendorRedemptions,
  exportVendorWalletTransactions,
  getVendorBrands,
  getVendorCampaigns,
  getVendorCustomers,
  getVendorInvoices,
  getVendorProductReports,
  getVendorProfile,
  getVendorRedemptions,
  getVendorRedemptionsMap,
  getVendorSummaryAnalytics,
  getVendorWallet,
  getVendorWalletTransactionsDetailed,
  loginWithEmail,
  rechargeVendorWallet,
  shareVendorInvoice,
  upsertVendorBrand,
  updateVendorProfile,
} from "../lib/api";
import VendorSupport from "../components/vendor/VendorSupport";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const VENDOR_TOKEN_KEY = "cashback_vendor_token";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: ChartLine },
  { key: "redemptions", label: "Redemptions", icon: ClipboardList },
  { key: "locations", label: "Locations", icon: MapPinned },
  { key: "customers", label: "Customers", icon: Users },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "billing", label: "Billing", icon: FileText },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "reports", label: "Product Reports", icon: BarChart3 },
];

const formatAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const VendorDashboardV2 = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeSection = useMemo(
    () => (NAV_ITEMS.some((x) => x.key === section) ? section : "overview"),
    [section],
  );

  const [token, setToken] = useState(
    () => localStorage.getItem(VENDOR_TOKEN_KEY) || "",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vendorProfile, setVendorProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [campaigns, setCampaigns] = useState([]);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    campaignId: "",
    city: "",
    mobile: "",
  });

  const [overview, setOverview] = useState({ summary: {}, trend: [] });
  const [redemptions, setRedemptions] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [walletTx, setWalletTx] = useState([]);
  const [walletSummary, setWalletSummary] = useState({
    credit: 0,
    debit: 0,
    closingBalance: 0,
  });
  const [invoices, setInvoices] = useState([]);
  const [reports, setReports] = useState([]);

  const [rechargeAmount, setRechargeAmount] = useState("");
  const [invoiceShareStatus, setInvoiceShareStatus] = useState("");
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
  });
  const [brandForm, setBrandForm] = useState({
    name: "",
    website: "",
    logoUrl: "",
  });
  const [settingsStatus, setSettingsStatus] = useState("");

  useEffect(() => {
    if (!NAV_ITEMS.some((x) => x.key === section)) {
      navigate("/vendor/overview", { replace: true });
    }
  }, [section, navigate]);

  const loadBase = useCallback(async () => {
    const [walletData, profileData, brandsData, campaignsData] =
      await Promise.all([
        getVendorWallet(token),
        getVendorProfile(token),
        getVendorBrands(token),
        getVendorCampaigns(token),
      ]);
    setWallet(walletData || null);
    setVendorProfile(profileData || null);
    setBrands(Array.isArray(brandsData) ? brandsData : []);
    setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    if (Array.isArray(brandsData) && brandsData.length && !selectedBrandId) {
      setSelectedBrandId(brandsData[0].id);
    }
    setProfileForm({
      businessName: profileData?.businessName || "",
      contactPhone: profileData?.contactPhone || "",
      contactEmail: profileData?.contactEmail || "",
      address: profileData?.address || "",
    });
  }, [token, selectedBrandId]);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await loadBase();
      if (activeSection === "overview") {
        const data = await getVendorSummaryAnalytics(token, filters);
        setOverview(data || { summary: {}, trend: [] });
      }
      if (activeSection === "redemptions") {
        const data = await getVendorRedemptions(token, filters);
        setRedemptions(
          Array.isArray(data?.redemptions) ? data.redemptions : [],
        );
      }
      if (activeSection === "locations") {
        const data = await getVendorRedemptionsMap(token, filters);
        setMapPoints(Array.isArray(data?.points) ? data.points : []);
      }
      if (activeSection === "customers") {
        const data = await getVendorCustomers(token, filters);
        setCustomers(Array.isArray(data?.customers) ? data.customers : []);
      }
      if (activeSection === "wallet") {
        const data = await getVendorWalletTransactionsDetailed(token, filters);
        setWalletTx(Array.isArray(data?.transactions) ? data.transactions : []);
        setWalletSummary(
          data?.summary || { credit: 0, debit: 0, closingBalance: 0 },
        );
      }
      if (activeSection === "billing") {
        const data = await getVendorInvoices(token, filters);
        setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
      }
      if (activeSection === "reports") {
        const data = await getVendorProductReports(token, filters);
        setReports(Array.isArray(data?.reports) ? data.reports : []);
      }
    } catch (err) {
      if (err?.status === 401) {
        localStorage.removeItem(VENDOR_TOKEN_KEY);
        setToken("");
      }
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token, filters, activeSection, loadBase]);

  useEffect(() => {
    if (!token) return;
    reload();
  }, [token, activeSection, reload]);

  const mapCenter = mapPoints.length
    ? [Number(mapPoints[0].lat || 20.5937), Number(mapPoints[0].lng || 78.9629)]
    : [20.5937, 78.9629];

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f3ec] via-[#f6faf7] to-[#e7f0ff] p-6">
        <div className="mx-auto mt-24 max-w-md rounded-3xl border border-[#d5e4dc] bg-white/95 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#eaf6f1] p-2 text-[#0e6b53]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#12231b]">
                Vendor Dashboard
              </h1>
              <p className="text-sm text-[#5f6f68]">Sign in to continue</p>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setAuthError("");
              setAuthLoading(true);
              try {
                const response = await loginWithEmail(email.trim(), password);
                if (response?.role !== "vendor") {
                  setAuthError("This account is not a vendor account.");
                  return;
                }
                localStorage.setItem(VENDOR_TOKEN_KEY, response.token);
                setToken(response.token);
                navigate("/vendor/overview", { replace: true });
              } catch (err) {
                setAuthError(err.message || "Sign in failed");
              } finally {
                setAuthLoading(false);
              }
            }}
          >
            <input
              className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <input
              className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
            {authError ? (
              <p className="text-sm text-red-600">{authError}</p>
            ) : null}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f6d54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a5a45]"
              type="submit"
              disabled={authLoading}
            >
              {authLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {authLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf5ef] via-[#f7fbf8] to-[#eaf1ff] text-[#12231b]">
      <div className="mx-auto flex max-w-[1500px] gap-4 p-4 md:p-6">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm lg:block">
          <div className="mb-4 border-b border-[#e2ece6] pb-4">
            <p className="text-xs uppercase tracking-wide text-[#6e7f75]">
              Dashboard
            </p>
            <p className="mt-1 text-lg font-semibold">
              {vendorProfile?.businessName || "Vendor"}
            </p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(`/vendor/${item.key}`)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? "bg-[#e5f4ec] text-[#0f6d54]" : "text-[#33463d] hover:bg-[#f1f7f3]"}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem(VENDOR_TOKEN_KEY);
              setToken("");
              navigate("/vendor", { replace: true });
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8e5dd] px-3 py-2 text-sm text-[#34463d] hover:bg-[#f3f7f5]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#d6e4db] bg-white/90 p-2 shadow-sm lg:hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={`mobile-${item.key}`}
                  onClick={() => navigate(`/vendor/${item.key}`)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                    isActive
                      ? "bg-[#e5f4ec] text-[#0f6d54]"
                      : "text-[#33463d] hover:bg-[#f1f7f3]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <header className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6e7f75]">
                  Vendor Panel
                </p>
                <h1 className="text-xl font-semibold">
                  {NAV_ITEMS.find((x) => x.key === activeSection)?.label}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-[#d2e0d8] bg-white px-3 py-2 text-sm"
                  value={selectedBrandId}
                  onChange={(event) => setSelectedBrandId(event.target.value)}
                >
                  {(brands.length
                    ? brands
                    : [{ id: "", name: "No brand" }]
                  ).map((brand) => (
                    <option key={brand.id || "none"} value={brand.id || ""}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <div className="rounded-xl border border-[#d9e6df] bg-[#f4fbf7] px-3 py-2 text-sm">
                  Available:{" "}
                  <span className="font-semibold">
                    INR{" "}
                    {formatAmount(
                      wallet?.availableBalance ?? wallet?.balance ?? 0,
                    )}
                  </span>
                </div>
                <div className="rounded-xl border border-[#d9e6df] bg-[#f8faf2] px-3 py-2 text-sm">
                  Locked:{" "}
                  <span className="font-semibold">
                    INR {formatAmount(wallet?.lockedBalance ?? 0)}
                  </span>
                </div>
                <button
                  onClick={reload}
                  className="flex items-center gap-2 rounded-xl border border-[#d8e5dd] px-3 py-2 text-sm hover:bg-[#f3f7f5]"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                type="date"
                className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, dateFrom: e.target.value }))
                }
              />
              <input
                type="date"
                className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, dateTo: e.target.value }))
                }
              />
              <select
                className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                value={filters.campaignId}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, campaignId: e.target.value }))
                }
              >
                <option value="">All campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
              <input
                className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                placeholder="City"
                value={filters.city}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, city: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                placeholder="Mobile"
                value={filters.mobile}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, mobile: e.target.value }))
                }
              />
              <button
                onClick={reload}
                className="rounded-xl bg-[#0f6d54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b5b45]"
              >
                Apply
              </button>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </section>

          {activeSection === "overview" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Total Scans</p>
                  <p className="text-2xl font-semibold">
                    {overview?.summary?.totalScans || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Unique Users</p>
                  <p className="text-2xl font-semibold">
                    {overview?.summary?.uniqueUsers || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Repeated Users</p>
                  <p className="text-2xl font-semibold">
                    {overview?.summary?.repeatedUsers || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Top City</p>
                  <p className="text-2xl font-semibold">
                    {overview?.summary?.topCity || "-"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview?.trend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dce9e2" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#0f6d54"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "redemptions" ? (
            <section className="space-y-3 rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
              <div className="flex justify-end">
                <button
                  onClick={() => exportVendorRedemptions(token, filters)}
                  className="rounded-xl border border-[#d8e5dd] px-3 py-2 text-sm hover:bg-[#f3f7f5]"
                >
                  <Download className="mr-1 inline h-4 w-4" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Type</th>
                      <th className="px-2 py-2">Amount</th>
                      <th className="px-2 py-2">Campaign</th>
                      <th className="px-2 py-2">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-2 py-2">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-2 py-2">{row.type}</td>
                        <td className="px-2 py-2">
                          INR {formatAmount(row.amount)}
                        </td>
                        <td className="px-2 py-2">
                          {row.campaign?.title || "-"}
                        </td>
                        <td className="px-2 py-2">{row.city || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "locations" ? (
            <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="overflow-hidden rounded-3xl border border-[#d6e4db] bg-white/90 shadow-sm">
                <div className="h-[420px]">
                  <MapContainer
                    center={mapCenter}
                    zoom={5}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapPoints.map((point, i) => (
                      <Marker
                        key={`${point.lat}-${point.lng}-${i}`}
                        position={[Number(point.lat), Number(point.lng)]}
                      >
                        <Popup>
                          <p>{point.city || "Unknown"}</p>
                          <p>{point.count} scans</p>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Clusters</h3>
                <div className="space-y-2">
                  {mapPoints.map((point, i) => (
                    <div key={i} className="rounded-xl border p-2 text-sm">
                      <p>{point.city || "Unknown"}</p>
                      <p>{point.count} scans</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "customers" ? (
            <section className="space-y-3 rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
              <div className="flex justify-end">
                <button
                  onClick={() => exportVendorCustomers(token, filters)}
                  className="rounded-xl border border-[#d8e5dd] px-3 py-2 text-sm hover:bg-[#f3f7f5]"
                >
                  <Download className="mr-1 inline h-4 w-4" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Mobile</th>
                      <th className="px-2 py-2">Codes</th>
                      <th className="px-2 py-2">Earned</th>
                      <th className="px-2 py-2">First Scan</th>
                      <th className="px-2 py-2">Last Scan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((entry) => (
                      <tr key={entry.userId} className="border-t">
                        <td className="px-2 py-2">{entry.mobile || "-"}</td>
                        <td className="px-2 py-2">{entry.codeCount}</td>
                        <td className="px-2 py-2">
                          INR {formatAmount(entry.rewardsEarned)}
                        </td>
                        <td className="px-2 py-2">
                          {entry.firstScanLocation || "-"}
                        </td>
                        <td className="px-2 py-2">
                          {formatDate(entry.lastScanned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "wallet" ? (
            <section className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Credits</p>
                  <p className="text-2xl font-semibold">
                    INR {formatAmount(walletSummary.credit)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Debits</p>
                  <p className="text-2xl font-semibold">
                    INR {formatAmount(walletSummary.debit)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbe6df] bg-white/90 p-4">
                  <p className="text-xs text-[#5f6f68]">Closing</p>
                  <p className="text-2xl font-semibold">
                    INR {formatAmount(walletSummary.closingBalance)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#d6e4db] bg-white/90 p-4">
                <input
                  type="number"
                  className="rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                  placeholder="Top-up amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                />
                <button
                  onClick={async () => {
                    const amount = Number(rechargeAmount);
                    if (!Number.isFinite(amount) || amount <= 0) return;
                    await rechargeVendorWallet(token, amount);
                    setRechargeAmount("");
                    await reload();
                  }}
                  className="rounded-xl bg-[#0f6d54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b5b45]"
                >
                  Top-up
                </button>
                <button
                  onClick={() => exportVendorWalletTransactions(token, filters)}
                  className="rounded-xl border border-[#d8e5dd] px-3 py-2 text-sm hover:bg-[#f3f7f5]"
                >
                  <Download className="mr-1 inline h-4 w-4" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-[#d6e4db] bg-white/90 p-2 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Txn</th>
                      <th className="px-2 py-2">Type</th>
                      <th className="px-2 py-2">Category</th>
                      <th className="px-2 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletTx.map((tx) => (
                      <tr key={tx.id} className="border-t">
                        <td className="px-2 py-2">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs">
                          {tx.id.slice(-8)}
                        </td>
                        <td className="px-2 py-2">{tx.type}</td>
                        <td className="px-2 py-2">{tx.category}</td>
                        <td className="px-2 py-2">
                          INR {formatAmount(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "billing" ? (
            <section className="space-y-3 rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
              {invoiceShareStatus ? (
                <p className="text-sm text-[#2c5445]">{invoiceShareStatus}</p>
              ) : null}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Invoice</th>
                      <th className="px-2 py-2">Type</th>
                      <th className="px-2 py-2">Issued</th>
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-t">
                        <td className="px-2 py-2 font-mono text-xs">
                          {invoice.number}
                        </td>
                        <td className="px-2 py-2">{invoice.type}</td>
                        <td className="px-2 py-2">
                          {formatDate(invoice.issuedAt)}
                        </td>
                        <td className="px-2 py-2">
                          INR {formatAmount(invoice.total)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() =>
                              downloadVendorInvoicePdf(token, invoice.id)
                            }
                            className="mr-2 rounded-lg border px-2 py-1 text-xs"
                          >
                            Download
                          </button>
                          <button
                            onClick={async () => {
                              const r = await shareVendorInvoice(
                                token,
                                invoice.id,
                              );
                              if (
                                r?.shareUrl &&
                                navigator?.clipboard?.writeText
                              ) {
                                await navigator.clipboard.writeText(r.shareUrl);
                                setInvoiceShareStatus(
                                  `Share link copied: ${r.shareUrl}`,
                                );
                              } else {
                                setInvoiceShareStatus(
                                  r?.shareUrl || "Share link created.",
                                );
                              }
                            }}
                            className="mr-2 rounded-lg border px-2 py-1 text-xs"
                          >
                            Share
                          </button>
                          {invoice.shareToken ? (
                            <a
                              href={`/api/public/invoices/shared/${invoice.shareToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border px-2 py-1 text-xs"
                            >
                              Open
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "support" ? <VendorSupport token={token} /> : null}

          {activeSection === "settings" ? (
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Vendor Profile</h3>
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Business name"
                    value={profileForm.businessName}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        businessName: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Contact phone"
                    value={profileForm.contactPhone}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        contactPhone: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Contact email"
                    value={profileForm.contactEmail}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        contactEmail: e.target.value,
                      }))
                    }
                  />
                  <textarea
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Address"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, address: e.target.value }))
                    }
                    rows={3}
                  />
                  <button
                    onClick={async () => {
                      await updateVendorProfile(token, profileForm);
                      setSettingsStatus("Profile updated.");
                      await reload();
                    }}
                    className="rounded-xl bg-[#0f6d54] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Save className="mr-1 inline h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Brand Settings</h3>
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Brand name"
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Website"
                    value={brandForm.website}
                    onChange={(e) =>
                      setBrandForm((p) => ({ ...p, website: e.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-[#d2e0d8] px-3 py-2 text-sm"
                    placeholder="Logo URL"
                    value={brandForm.logoUrl}
                    onChange={(e) =>
                      setBrandForm((p) => ({ ...p, logoUrl: e.target.value }))
                    }
                  />
                  <button
                    onClick={async () => {
                      await upsertVendorBrand(token, brandForm);
                      setSettingsStatus("Brand updated.");
                      await reload();
                    }}
                    className="rounded-xl bg-[#0f6d54] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Save className="mr-1 inline h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
              {settingsStatus ? (
                <div className="lg:col-span-2 rounded-xl border border-[#d8e7df] bg-[#f3faf6] px-3 py-2 text-sm text-[#2c5445]">
                  {settingsStatus}
                </div>
              ) : null}
            </section>
          ) : null}

          {activeSection === "reports" ? (
            <section className="rounded-3xl border border-[#d6e4db] bg-white/90 p-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Title</th>
                      <th className="px-2 py-2">Product</th>
                      <th className="px-2 py-2">Reported By</th>
                      <th className="px-2 py-2">Created</th>
                      <th className="px-2 py-2">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-t">
                        <td className="px-2 py-2">{report.title}</td>
                        <td className="px-2 py-2">
                          {report.Product?.name || "-"}
                        </td>
                        <td className="px-2 py-2">
                          {report.User?.name || "-"}
                        </td>
                        <td className="px-2 py-2">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() =>
                              downloadVendorProductReport(token, report.id)
                            }
                            className="rounded-lg border px-2 py-1 text-xs"
                          >
                            <Download className="mr-1 inline h-3 w-3" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboardV2;
