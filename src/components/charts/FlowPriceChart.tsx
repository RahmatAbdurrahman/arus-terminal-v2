'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import type { PricePoint, FlowPoint } from '@/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';

interface FlowPriceChartProps {
  priceData: PricePoint[];
  flowData: FlowPoint[];
  ticker: string;
  isLoading?: boolean;
}

export default function FlowPriceChart({ priceData, flowData, ticker, isLoading }: FlowPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || isLoading) return;
    if (priceData.length === 0) return;

    // Get theme colors from CSS variables
    const style = getComputedStyle(document.documentElement);
    const bgColor = style.getPropertyValue('--bg-secondary').trim();
    const textColor = style.getPropertyValue('--text-secondary').trim();
    const gridColor = style.getPropertyValue('--chart-grid').trim();
    const crosshairColor = style.getPropertyValue('--chart-crosshair').trim();
    const priceColor = style.getPropertyValue('--chart-price').trim();

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { color: bgColor || '#111827' },
        textColor: textColor || '#8892a4',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor || '#1e2d3d', style: LineStyle.Dotted },
        horzLines: { color: gridColor || '#1e2d3d', style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: { color: crosshairColor || '#4a5568', labelBackgroundColor: '#1a2235' },
        horzLine: { color: crosshairColor || '#4a5568', labelBackgroundColor: '#1a2235' },
      },
      rightPriceScale: {
        borderColor: gridColor || '#1e2d3d',
        scaleMargins: { top: 0.05, bottom: 0.35 },
      },
      timeScale: {
        borderColor: gridColor || '#1e2d3d',
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    // Price line series
    const priceSeries = chart.addLineSeries({
      color: priceColor || '#60a5fa',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });
    priceSeries.setData(priceData as any);

    // Flow histogram series (overlay at bottom)
    const flowSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'flow',
    });

    chart.priceScale('flow').applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    flowSeries.setData(flowData as any);

    // Fit content
    chart.timeScale().fitContent();

    // Resize observer
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        chart.applyOptions({ width: entries[0].contentRect.width });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [mounted, priceData, flowData, isLoading]);

  if (isLoading || !mounted) return <ChartSkeleton />;

  return (
    <div className="terminal-panel overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="font-mono font-bold text-sm text-text-primary flex items-center gap-2">
          <span aria-hidden="true">📈</span>
          Flow vs Price — {ticker}
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-mono text-text-tertiary">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-accent inline-block rounded" />
            Price
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-signal-accumulation/50 inline-block rounded-sm" />
            Net Flow
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="w-full"
        aria-label={`Price and capital flow chart for ${ticker}`}
      />
    </div>
  );
}
