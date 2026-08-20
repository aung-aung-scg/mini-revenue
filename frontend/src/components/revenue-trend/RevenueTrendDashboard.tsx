"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Chart as ChartJS } from "chart.js";
import { ApiError, adminLogout, fetchRevenueTrends } from "@/lib/api/revenueTrends";
import {
  buildChartRows,
  getMondayOfWeek,
  isEmptyData,
} from "@/lib/revenueTrendUtils";
import { RevenueTrendResponse, VisibleSeries } from "@/types/revenueTrend";
import ChartControls from "./ChartControls";
import KpiCards from "./KpiCards";
import RevenueTrendChart from "./RevenueTrendChart";

export default function RevenueTrendDashboard() {
  const router = useRouter();
  const chartRef = useRef<ChartJS<"bar", number[], string> | undefined>(undefined);
  const [startDate] = useState(getMondayOfWeek);
  const [data, setData] = useState<RevenueTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparePrevious, setComparePrevious] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>({
    posRevenue: true,
    eatclubRevenue: true,
    labourCosts: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRevenueTrends(startDate);
      setData(response);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load revenue trends";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    loadData().catch((err) => {
      if (err instanceof ApiError && err.status === 401) router.replace("/admin/login");
    });
  }, [loadData, router]);

  const chartRows = useMemo(() => {
    if (!data) return [];
    return buildChartRows(
      data.data.current_period.days,
      data.data.previous_period.days
    );
  }, [data]);

  const title = comparePrevious
    ? "This Week's Revenue Trend vs Previous Period"
    : "This Week's Revenue Trend";

  const handleExport = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      const dataUrl = chartRef.current.toBase64Image("image/png", 1);
      const link = document.createElement("a");
      link.download = `revenue-trend-${startDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Failed to export chart as PNG");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-7">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Weekly overview
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Week of {data.data.current_period.start_date}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/revenue-entries")}
              className="text-xs font-semibold text-slate-600 hover:text-slate-950"
            >
              Manage entries
            </button>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              Log out
            </button>
          </div>
        </div>

        <ChartControls
          comparePrevious={comparePrevious}
          onCompareChange={setComparePrevious}
          visibleSeries={visibleSeries}
          onSeriesChange={setVisibleSeries}
          onExport={handleExport}
          exporting={exporting}
        />
      </div>

      <div className="space-y-6 pt-6">
        <KpiCards
          summary={data.data.current_period.summary}
          previousSummary={data.data.previous_period.summary}
          comparePrevious={comparePrevious}
        />

        {isEmptyData(data) ? (
          <div className="flex h-[330px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-slate-500">No revenue data entered for this week yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white px-1 pt-2">
            <RevenueTrendChart
              ref={chartRef}
              data={chartRows}
              comparePrevious={comparePrevious}
              visibleSeries={visibleSeries}
            />
          </div>
        )}
      </div>
    </div>
  );
}
