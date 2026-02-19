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
import { TrendingUp, Activity } from "lucide-react";

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
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">
        {label}
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
}) => {
  const showRedemptionChart = redemptionSeries.length > 0;
  const showCampaignChart = campaignSeries.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* ── Redemption Activity Chart ── */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              Redemption Trends
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Last 7 days &middot; {selectionLabel}
            </p>
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
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                  dy={8}
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
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRedemptions)"
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{
                    r: 5,
                    fill: "#10b981",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
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
                <Legend content={<CustomLegend />} />
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
