"use client";

import {
  ComposedChart,
  Area,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

export interface PriceFlowPoint {
  date: string;
  close: number;
  netForeignBuy: number | null;
}

function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(Math.round(n));
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const price = payload.find((p: any) => p.dataKey === "close")?.value;
  const flow = payload.find((p: any) => p.dataKey === "netForeignBuy")?.value;
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
      {price != null && <div style={{ color: "var(--text)" }}>Close: {Number(price).toLocaleString("id-ID")}</div>}
      {flow != null && (
        <div style={{ color: flow >= 0 ? "var(--accent-strong)" : "var(--cool)" }}>
          Net Foreign: {flow >= 0 ? "+" : ""}
          {formatCompact(flow)}
        </div>
      )}
    </div>
  );
}

export default function PriceFlowChart({ data }: { data: PriceFlowPoint[] }) {
  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%", height: 320 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
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
            yAxisId="price"
            orientation="left"
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={(v) => formatCompact(v)}
          />
          <YAxis
            yAxisId="flow"
            orientation="right"
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => formatCompact(v)}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine yAxisId="flow" y={0} stroke="var(--border)" />
          <Bar yAxisId="flow" dataKey="netForeignBuy" radius={[2, 2, 0, 0]} maxBarSize={10}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={(d.netForeignBuy ?? 0) >= 0 ? "var(--accent)" : "var(--cool)"}
                fillOpacity={0.55}
              />
            ))}
          </Bar>
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="var(--accent-strong)"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent-strong)" }}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
