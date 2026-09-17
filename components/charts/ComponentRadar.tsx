"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

export interface ComponentBreakdown {
  flowPctl: number | null;
  institutionalPctl: number | null;
  turnoverPctl: number | null;
  insiderPctl: number | null;
}

const LABELS: Record<string, string> = {
  flow: "Flow Intensity",
  institutional: "Dominasi Institusi",
  turnover: "Turnover Relatif",
  insider: "Sinyal Insider",
};

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
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
      <div style={{ color: "var(--text)" }}>{p.component}</div>
      <div style={{ color: "var(--accent-strong)" }}>Persentil {p.value}</div>
    </div>
  );
}

export default function ComponentRadar({ data }: { data: ComponentBreakdown }) {
  const rows = [
    { key: "flow", component: LABELS.flow, value: data.flowPctl },
    { key: "institutional", component: LABELS.institutional, value: data.institutionalPctl },
    { key: "turnover", component: LABELS.turnover, value: data.turnoverPctl },
    ...(data.insiderPctl !== null ? [{ key: "insider", component: LABELS.insider, value: data.insiderPctl }] : []),
  ].map((r) => ({ ...r, value: r.value ?? 0 }));

  if (rows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      style={{ width: "100%", height: 260 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="component"
            tick={{ fill: "var(--text-soft)", fontSize: 10.5, fontFamily: "var(--mono)" }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={3} />
          <Tooltip content={<RadarTooltip />} />
          <Radar
            dataKey="value"
            stroke="var(--accent-strong)"
            fill="var(--accent)"
            fillOpacity={0.38}
            strokeWidth={2}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
