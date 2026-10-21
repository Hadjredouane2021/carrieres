"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ink = "#173D70";
const muted = "#6B7A90";
const grid = "#E8ECF3";

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-xl border border-night/10 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="text-institution">{label}</p>
      <p className="mt-0.5 font-semibold text-night">
        {value} {unit}
        {value > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function DashboardCharts({
  days,
  types,
}: {
  days: { day: string; count: number }[];
  types: { name: string; count: number }[];
}) {
  const sortedTypes = [...types].sort((a, b) => b.count - a.count);
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <section className="admin-card p-5 xl:col-span-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-medium text-night">Inscriptions par jour</h2>
          <p className="text-xs text-institution">14 derniers jours</p>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="registrations-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ink} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={ink} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: muted }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip unit="inscription" />} cursor={{ stroke: muted, strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={ink}
                strokeWidth={2}
                fill="url(#registrations-fill)"
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: ink }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="admin-card p-5 xl:col-span-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-medium text-night">Profils inscrits</h2>
          <p className="text-xs text-institution">Toutes les inscriptions</p>
        </div>
        {sortedTypes.length ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedTypes} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={8}>
                <CartesianGrid stroke={grid} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: muted }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#122033" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<ChartTooltip unit="personne" />} cursor={{ fill: "rgba(23,61,112,0.05)" }} />
                <Bar dataKey="count" fill={ink} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 grid h-64 place-items-center rounded-2xl bg-mist/60 text-sm text-institution">Pas encore d'inscription.</p>
        )}
      </section>
    </div>
  );
}
