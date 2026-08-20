"use client";

import { VisibleSeries } from "@/types/revenueTrend";

interface ChartControlsProps {
  comparePrevious: boolean;
  onCompareChange: (value: boolean) => void;
  visibleSeries: VisibleSeries;
  onSeriesChange: (series: VisibleSeries) => void;
  onExport: () => void;
  exporting: boolean;
}

const SERIES_OPTIONS: { key: keyof VisibleSeries; label: string; color: string }[] = [
  { key: "posRevenue", label: "POS Revenue", color: "#172033" },
  { key: "eatclubRevenue", label: "Eatclub Revenue", color: "#7c3aed" },
  { key: "labourCosts", label: "Labour Costs", color: "#f97316" },
];

export default function ChartControls({
  comparePrevious,
  onCompareChange,
  visibleSeries,
  onSeriesChange,
  onExport,
  exporting,
}: ChartControlsProps) {
  return (
    <div className="flex flex-col gap-3 lg:items-end">
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => onCompareChange(!comparePrevious)}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            comparePrevious
              ? "bg-[#f4bd27] text-slate-950"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Compare to Previous
        </button>

        <div className="flex flex-wrap justify-end gap-x-3 gap-y-2">
          {SERIES_OPTIONS.map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={visibleSeries[key]}
                onChange={(e) =>
                  onSeriesChange({ ...visibleSeries, [key]: e.target.checked })
                }
                className="rounded border-slate-300"
              />
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="self-end rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {exporting ? "Exporting..." : "Export PNG"}
      </button>
    </div>
  );
}
