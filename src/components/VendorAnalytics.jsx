import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import { format, subDays, subMonths, subYears, parseISO } from "date-fns";
import {
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";

/* ── Custom tooltip ─────────────────────────────────────────── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1.5">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500 dark:text-gray-400">{entry.name}</span>
          <span className="ml-auto font-semibold text-gray-900 dark:text-white pl-3">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">
        {data.fullDate || label}
      </p>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-gray-500 dark:text-gray-400">Redemptions</span>
        <span className="ml-auto font-semibold text-gray-900 dark:text-white pl-3">
          {payload[0]?.value}
        </span>
      </div>
    </div>
  );
};

/* ── Custom legend ──────────────────────────────────────────── */
const CustomLegend = ({ payload }) => {
  if (!payload?.length) return null;
  return (
    <div className="flex items-center justify-center gap-5 pt-4">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────── */
const VendorAnalytics = ({
  redemptionSeries = [],
  campaignSeries = [],
  selectionLabel = "All campaigns",
  dateFilter = { from: "", to: "" },
  onDateFilterChange = () => {},
}) => {
  const showRedemptionChart = redemptionSeries.length > 0;
  const showCampaignChart = campaignSeries.length > 0;

  /* ── Custom X-Axis Tick (Defined here to access redemptionSeries) ── */
  const CustomXAxisTick = ({ x, y, payload, index }) => {
    const dataPoint = redemptionSeries[index];
    if (!dataPoint) return null;

    const { d, m } = dataPoint;
    // If we explicitly decided not to show a label here (d and m are empty), return null
    if (!d && !m) return null;

    if (m) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={10}
            textAnchor="middle"
            fill="currentColor"
            className="text-gray-900 dark:text-white font-bold"
            fontSize={11}
          >
            {d}
          </text>
          <text
            x={0}
            y={0}
            dy={26}
            textAnchor="middle"
            fill="currentColor"
            className="text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-tighter"
            fontSize={9}
          >
            {m}
          </text>
        </g>
      );
    }

    return (
      <text
        x={x}
        y={y}
        dy={10}
        textAnchor="middle"
        fill="currentColor"
        className="text-gray-900 dark:text-white font-bold"
        fontSize={11}
      >
        {d}
      </text>
    );
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "d MMM yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    if (!val) return;

    const to = new Date();
    let from;

    switch (val) {
      case "1d":
        from = to;
        break;
      case "1w":
        from = subDays(to, 6);
        break;
      case "1m":
        from = subMonths(to, 1);
        break;
      case "3m":
        from = subMonths(to, 3);
        break;
      case "6m":
        from = subMonths(to, 6);
        break;
      case "1y":
        from = subYears(to, 1);
        break;
      default:
        return;
    }

    onDateFilterChange({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      preset: val,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* ── Redemption Activity Chart ── */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                Redemption Trends
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {formatDateLabel(dateFilter.from)} -{" "}
                {formatDateLabel(dateFilter.to)} &middot; {selectionLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-zinc-900/50 p-1.5 rounded-xl border border-gray-100 dark:border-zinc-800 self-start sm:self-center">
            <div className="relative group">
              <select
                onChange={handlePresetChange}
                value={dateFilter.preset || ""}
                className="appearance-none bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700 px-3 py-1.5 pr-9 text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer hover:border-emerald-500/40 transition-all"
              >
                <option value="" disabled>
                  Select Range
                </option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="1y">1 Year</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                <ChevronDown size={11} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[240px] w-full">
          {showRedemptionChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={redemptionSeries}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorRedemptions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="dateKey"
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomXAxisTick />}
                  height={60}
                  interval={0}
                  padding={{ left: 15, right: 15 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="redemptions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRedemptions)"
                  activeDot={{
                    r: 4,
                    fill: "#10b981",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  dot={false}
                  label={null}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
              <TrendingUp
                size={24}
                className="text-gray-300 dark:text-gray-600"
              />
              <p className="text-xs text-gray-400">
                No redemption activity yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Campaign Performance Chart ── */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-500/20 to-indigo-600/10 flex items-center justify-center">
            <Activity size={16} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              Campaign Performance
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Total vs Redeemed &middot; {selectionLabel}
            </p>
          </div>
        </div>

        <div className="h-[240px] w-full">
          {showCampaignChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignSeries}
                margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                barCategoryGap="40%"
              >
                <defs>
                  <linearGradient
                    id="barGradientTotal"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient
                    id="barGradientRedeemed"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                  dy={8}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: "rgba(99,102,241,0.06)", radius: 8 }}
                />
                {/* <Legend content={<CustomLegend />} /> */}
                <Bar
                  dataKey="sent"
                  name="Total"
                  fill="url(#barGradientTotal)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="redeemed"
                  name="Redeemed"
                  fill="url(#barGradientRedeemed)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
              <Activity
                size={24}
                className="text-gray-300 dark:text-gray-600"
              />
              <p className="text-xs text-gray-400">No campaign data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
