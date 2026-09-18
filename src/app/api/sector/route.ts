import { NextRequest, NextResponse } from 'next/server';
import { generateSectorData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '5D';

  const sectors = generateSectorData(range);

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    timeRange: range,
    sectors,
  });
}
