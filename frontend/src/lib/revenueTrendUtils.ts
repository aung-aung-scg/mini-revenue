import { ChartRow, RevenueDay, RevenueTrendResponse } from "@/types/revenueTrend";

export function numericValue(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function dayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const weekday = date.toLocaleDateString("en-AU", { weekday: "short" });
  const day = date.getDate();
  return `${weekday} ${day}`;
}

export function buildChartRows(
  currentDays: RevenueDay[],
  previousDays: RevenueDay[]
): ChartRow[] {
  return currentDays.map((day, index) => {
    const prev = previousDays[index];
    return {
      label: dayLabel(day.date),
      date: day.date,
      event_impact: day.event_impact,
      current_pos: numericValue(day.pos_revenue),
      current_eatclub: numericValue(day.eatclub_revenue),
      current_labour: numericValue(day.labour_costs),
      prev_pos: prev ? numericValue(prev.pos_revenue) : 0,
      prev_eatclub: prev ? numericValue(prev.eatclub_revenue) : 0,
      prev_labour: prev ? numericValue(prev.labour_costs) : 0,
    };
  });
}

export function isEmptyData(data: RevenueTrendResponse): boolean {
  return data.data.current_period.days.every(
    (day) => numericValue(day.pos_revenue) === 0 && numericValue(day.eatclub_revenue) === 0 && day.covers === 0
  );
}

export const SERIES_COLORS = {
  pos: "#172033",
  eatclub: "#7c3aed",
  labour: "#f97316",
  prevPos: "#94a3b8",
  prevEatclub: "#c4b5fd",
  prevLabour: "#fdba74",
};
