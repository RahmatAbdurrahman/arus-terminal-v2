"use client";

import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

export interface SmfiHistoryPoint {
  date: string;
  smfi: number;
  divergence: number;
}

function HistoryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const smfi = payload.find((p: any) => p.dataKey === "smfi")?.value;
  const div = payload.find((p: any) => p.dataKey === "divergence")?.value;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "8px 12px",
        fontFamily: "var(--mono)",
        fontSize: 11.5,
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
      {smfi != null && <div style={{ color: "var(--accent-strong)" }}>SMFI: {smfi}</div>}
      {div != null && (
        <div style={{ color: div >= 0 ? "var(--accent)" : "var(--cool)" }}>
          Divergence: {div >= 0 ? "+" : ""}
          {div}
        </div>
      )}
    </div>
  );
}

export default function SmfiHistoryChart({ data }: { data: SmfiHistoryPoint[] }) {
  if (data.length < 2) {
    return (
      <div className="empty-state" style={{ padding: "24px 20px" }}>
        Riwayat skor baru muncul setelah beberapa siklus ingest berjalan di tanggal yang berbeda —
        saat ini baru {data.length} titik data.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%", height: 220 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="smfiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip content={<HistoryTooltip />} />
          <ReferenceLine y={70} stroke="var(--accent)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="smfi"
            stroke="var(--accent-strong)"
            strokeWidth={2}
            fill="url(#smfiGradient)"
            dot={{ r: 2.5, fill: "var(--accent-strong)" }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
