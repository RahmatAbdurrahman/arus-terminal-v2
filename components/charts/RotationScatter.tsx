"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from "recharts";
import { motion } from "framer-motion";

export interface RotationPoint {
  subSector: string;
  breadth: number;
  momentum: number;
  moneyFlow: number;
  label: "Hot" | "Warming" | "Cold" | "Distribution";
}

const LABEL_COLOR: Record<RotationPoint["label"], string> = {
  Hot: "var(--accent-strong)",
  Warming: "var(--accent)",
  Cold: "var(--neutral)",
  Distribution: "var(--cool)",
};

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: RotationPoint = payload[0].payload;
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
      <div style={{ color: "var(--text)", fontWeight: 700, marginBottom: 2 }}>{p.subSector}</div>
      <div style={{ color: LABEL_COLOR[p.label] }}>{p.label}</div>
      <div style={{ color: "var(--text-soft)" }}>Breadth {Math.round(p.breadth)}% · Momentum {p.momentum.toFixed(1)}%</div>
    </div>
  );
}

export default function RotationScatter({ data }: { data: RotationPoint[] }) {
  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%", height: 360 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            type="number"
            dataKey="momentum"
            name="Momentum"
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            label={{ value: "Momentum (return median 7h, %)", position: "insideBottom", offset: -4, fill: "var(--text-faint)", fontSize: 10.5 }}
          />
          <YAxis
            type="number"
            dataKey="breadth"
            name="Breadth"
            domain={[0, 100]}
            tick={{ fill: "var(--text-faint)", fontSize: 10, fontFamily: "var(--mono)" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Breadth (% di atas MA20)", angle: -90, position: "insideLeft", fill: "var(--text-faint)", fontSize: 10.5 }}
          />
          <ZAxis type="number" dataKey="moneyFlowAbs" range={[80, 700]} />
          <ReferenceLine y={50} stroke="var(--border)" />
          <ReferenceLine x={0} stroke="var(--border)" />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }} />
          <Scatter
            data={data.map((d) => ({ ...d, moneyFlowAbs: Math.abs(d.moneyFlow) }))}
            animationDuration={700}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={LABEL_COLOR[d.label]} fillOpacity={0.75} stroke={LABEL_COLOR[d.label]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
