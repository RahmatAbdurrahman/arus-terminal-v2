"use client";

import Link from "next/link";
import { ShortlistRow, confluenceText } from "@/lib/queries";
import Sparkline from "@/components/charts/Sparkline";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

export default function ShortlistCard({ row: s }: { row: ShortlistRow }) {
  const cool = s.confluence === "distribusi" || s.confluence === "sudah_di_harga";

  return (
    <Link href={`/saham/${s.ticker}`} className="stockcard">
      <div className="row1">
        <div>
          <div className="ticker">{s.ticker}</div>
          <div className="name">{s.name}</div>
        </div>
        {s.sector && <span className="sector-pill">{s.sector}</span>}
      </div>

      {s.smfiHistory.length >= 2 && <Sparkline data={s.smfiHistory} positive={!cool} />}

      <div className="scorepair">
        <div>
          <div className="lbl">SMFI</div>
          <div className="val">
            <AnimatedNumber value={s.smfi} />
          </div>
        </div>
        <div>
          <div className="lbl">DIVERGENCE</div>
          <div className="val">
            <AnimatedNumber value={s.divergenceDelta} prefix={s.divergenceDelta > 0 ? "+" : ""} />
          </div>
        </div>
      </div>
      <div className={`confluence-pill ${cool ? "cool" : "hot"}`}>{confluenceText(s.confluence)}</div>
    </Link>
  );
}
