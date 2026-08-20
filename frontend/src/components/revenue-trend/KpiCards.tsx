"use client";

import { PeriodSummary } from "@/types/revenueTrend";
import { formatCurrency, formatPercent, numericValue } from "@/lib/revenueTrendUtils";

interface KpiCardsProps {
  summary: PeriodSummary;
  previousSummary: PeriodSummary;
  comparePrevious: boolean;
}

function ChangeLine({ value }: { value: number | null }) {
  if (value === null) {
    return <p className="text-sm text-slate-500">vs previous (N/A)</p>;
  }

  const positive = value >= 0;
  return (
    <p className={`text-sm font-medium ${positive ? "text-green-600" : "text-red-600"}`}>
      vs previous ({formatPercent(value)})
    </p>
  );
}

function KpiCard({
  title,
  value,
  previousValue,
  changeValue,
  comparePrevious,
  formatter = (v: number) => String(v),
}: {
  title: string;
  value: number | string;
  previousValue: number | string;
  changeValue: number | null;
  comparePrevious: boolean;
  formatter?: (value: number) => string;
}) {
  return (
    <div className="rounded-2xl bg-[#f4f6f8] px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <p className="mt-2 text-[25px] font-bold tracking-[-0.03em] text-slate-950">{formatter(numericValue(value))}</p>
      {comparePrevious && (
        <>
          <p className="text-sm text-slate-500">vs {formatter(numericValue(previousValue))}</p>
          <ChangeLine value={changeValue} />
        </>
      )}
    </div>
  );
}

export default function KpiCards({ summary, previousSummary, comparePrevious }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard
        title="Total Revenue"
        value={summary.total_revenue}
        previousValue={previousSummary.total_revenue}
        changeValue={summary.change?.total_revenue_pct ?? null}
        comparePrevious={comparePrevious}
        formatter={formatCurrency}
      />
      <KpiCard
        title="Average per Day"
        value={summary.average_per_day}
        previousValue={previousSummary.average_per_day}
        changeValue={summary.change?.average_per_day_pct ?? null}
        comparePrevious={comparePrevious}
        formatter={formatCurrency}
      />
      <KpiCard
        title="Total Covers"
        value={summary.total_covers}
        previousValue={previousSummary.total_covers}
        changeValue={summary.change?.total_covers_pct ?? null}
        comparePrevious={comparePrevious}
        formatter={(v) => v.toLocaleString()}
      />
    </div>
  );
}
