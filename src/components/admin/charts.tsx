"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardCharts({
  days,
  types,
}: {
  days: { day: string; count: number }[];
  types: { name: string; count: number }[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <div className="h-80 rounded-3xl bg-white p-4 xl:col-span-3">
        <p className="mb-2 text-sm font-medium text-night">Inscriptions — 14 jours</p>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={days}>
            <CartesianGrid stroke="#EEF2F7" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} width={32} />
            <Tooltip />
            <Area dataKey="count" name="Inscriptions" stroke="#173D70" fill="#D8B57A" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-80 rounded-3xl bg-white p-4 xl:col-span-2">
        <p className="mb-2 text-sm font-medium text-night">Profils</p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={types}>
            <CartesianGrid stroke="#EEF2F7" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={50} />
            <YAxis allowDecimals={false} width={32} />
            <Tooltip />
            <Bar dataKey="count" name="Personnes" fill="#0B1B3A" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
