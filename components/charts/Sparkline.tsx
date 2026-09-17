"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  if (data.length < 2) return null;
  const points = data.map((v, i) => ({ i, v }));
  const color = positive ? "var(--accent-strong)" : "var(--cool)";
  const gradId = `spark-${positive ? "up" : "down"}`;

  return (
    <div style={{ width: "100%", height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.6}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
