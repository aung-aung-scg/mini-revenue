"use client";

import { forwardRef, useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartRow, VisibleSeries } from "@/types/revenueTrend";
import { formatCurrency, SERIES_COLORS } from "@/lib/revenueTrendUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RevenueTrendChartProps {
  data: ChartRow[];
  comparePrevious: boolean;
  visibleSeries: VisibleSeries;
}

function EventBadge({ impact }: { impact: ChartRow["event_impact"] }) {
  if (!impact) return <div className="h-6" />;

  const isPositive = impact === "positive";
  return (
    <div
      className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
        isPositive ? "bg-emerald-600" : "bg-rose-600"
      }`}
      title={isPositive ? "Positive event impact" : "Negative event impact"}
      aria-label={isPositive ? "Positive event impact" : "Negative event impact"}
    >
      {isPositive ? "↑" : "↓"}
    </div>
  );
}

const RevenueTrendChart = forwardRef<
  ChartJS<"bar", number[], string> | undefined,
  RevenueTrendChartProps
>(
  function RevenueTrendChart({ data, comparePrevious, visibleSeries }, ref) {
    const chartData = useMemo<ChartData<"bar", number[], string>>(() => {
      const datasets: ChartData<"bar", number[], string>["datasets"] = [];

      if (visibleSeries.posRevenue) {
        datasets.push({
          label: "POS Revenue",
          data: data.map((row) => row.current_pos),
          backgroundColor: SERIES_COLORS.pos,
          stack: "current",
          borderRadius: 3,
        });
      }

      if (visibleSeries.eatclubRevenue) {
        datasets.push({
          label: "Eatclub Revenue",
          data: data.map((row) => row.current_eatclub),
          backgroundColor: SERIES_COLORS.eatclub,
          stack: "current",
          borderRadius: 3,
        });
      }

      if (visibleSeries.labourCosts) {
        datasets.push({
          label: "Labour Costs",
          data: data.map((row) => row.current_labour),
          backgroundColor: SERIES_COLORS.labour,
          stack: "current_labour",
          borderRadius: 3,
        });
      }

      if (comparePrevious && visibleSeries.posRevenue) {
        datasets.push({
          label: "Prev POS Revenue",
          data: data.map((row) => row.prev_pos),
          backgroundColor: SERIES_COLORS.prevPos,
          stack: "previous",
          borderRadius: 3,
        });
      }

      if (comparePrevious && visibleSeries.eatclubRevenue) {
        datasets.push({
          label: "Prev Eatclub Revenue",
          data: data.map((row) => row.prev_eatclub),
          backgroundColor: SERIES_COLORS.prevEatclub,
          stack: "previous",
          borderRadius: 3,
        });
      }

      if (comparePrevious && visibleSeries.labourCosts) {
        datasets.push({
          label: "Prev Labour Costs",
          data: data.map((row) => row.prev_labour),
          backgroundColor: SERIES_COLORS.prevLabour,
          stack: "previous_labour",
          borderRadius: 3,
        });
      }

      return {
        labels: data.map((row) => row.label),
        datasets,
      };
    }, [comparePrevious, data, visibleSeries]);

    const options = useMemo<ChartOptions<"bar">>(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: "#475569",
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${formatCurrency(Number(context.raw ?? 0))}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: "#64748b" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#e2e8f0" },
            ticks: {
              color: "#64748b",
              callback: (value) => `$${Number(value) / 1000}k`,
            },
          },
        },
      }),
      []
    );

    return (
      <div className="w-full min-w-[680px]">
        <div className="mb-2 grid grid-cols-7 gap-2 px-12">
          {data.map((row) => (
            <EventBadge key={row.date} impact={row.event_impact} />
          ))}
        </div>
        <div className="h-[330px]">
          <Bar ref={ref} data={chartData} options={options} />
        </div>
      </div>
    );
  }
);

export default RevenueTrendChart;
