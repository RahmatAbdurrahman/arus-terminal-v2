import { NextRequest, NextResponse } from 'next/server';
import { generateStockDetail } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const range = request.nextUrl.searchParams.get('range') || '15D';

  const detail = generateStockDetail(ticker.toUpperCase(), range);

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    ticker: ticker.toUpperCase(),
    companyName: detail.companyName,
    sector: detail.sector,
    sectorName: detail.sectorName,
    currentSMFI: detail.currentSMFI,
    smfiTrend: detail.smfiTrend,
    divergenceDelta: detail.divergenceDelta,
    chartData: {
      priceTimeSeries: detail.priceTimeSeries,
      flowTimeSeries: detail.flowTimeSeries,
    },
    activityLog: detail.activityLog,
  });
}
