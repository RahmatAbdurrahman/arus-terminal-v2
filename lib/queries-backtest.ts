import { supabasePublic } from "./supabase/server";

export interface BacktestRow {
  runAt: string;
  tickers: string[];
  nObservations: number;
  smfiThreshold: number;
  nAboveThreshold: number;
  avgForwardReturnAbove: number;
  avgForwardReturnBaseline: number;
  windowDays: number;
  forwardDays: number;
}

export async function getLatestBacktest(): Promise<BacktestRow | null> {
  const db = supabasePublic();
  const { data } = await db
    .from("backtest_results")
    .select("*")
    .order("run_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    runAt: data.run_at,
    tickers: data.tickers_sampled,
    nObservations: data.n_observations,
    smfiThreshold: data.smfi_threshold,
    nAboveThreshold: data.n_above_threshold,
    avgForwardReturnAbove: data.avg_forward_return_above,
    avgForwardReturnBaseline: data.avg_forward_return_baseline,
    windowDays: data.window_days,
    forwardDays: data.forward_days,
  };
}
