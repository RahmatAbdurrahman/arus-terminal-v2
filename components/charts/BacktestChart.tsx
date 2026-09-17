"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell, LabelList } from "recharts";
import { motion } from "framer-motion";

export default function BacktestChart({
  avgAbove,
  avgBaseline,
  smfiThreshold,
}: {
  avgAbove: number;
  avgBaseline: number;
  smfiThreshold: number;
}) {
  const data = [
    { name: `SMFI ≥ ${smfiThreshold}`, value: avgAbove },
    { name: "Semua observasi", value: avgBaseline },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%", height: 200 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--text-soft)", fontSize: 11, fontFamily: "var(--mono)" }} tickLine={false} axisLine={false} />
          <ReferenceLine x={0} stroke="var(--border)" />
          <Tooltip
            formatter={(v: any) => {
              const n = Number(v ?? 0);
              return [`${n >= 0 ? "+" : ""}${n.toFixed(2)}%`, "Return rata-rata"];
            }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 11.5 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28} animationDuration={800}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.value >= 0 ? "var(--accent-strong)" : "var(--cool)"} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: any) => {
                const n = Number(v ?? 0);
                return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
              }}
              style={{ fill: "var(--text)", fontFamily: "var(--mono)", fontSize: 11.5 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
