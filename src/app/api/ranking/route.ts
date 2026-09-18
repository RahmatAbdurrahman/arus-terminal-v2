import { NextRequest, NextResponse } from 'next/server';
import { generateRankingData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '5D';

  const { rankings, summary } = generateRankingData(range);

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    timeRange: range,
    summary,
    rankings,
  });
}
