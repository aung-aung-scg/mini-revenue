export type EventImpact = "positive" | "negative" | null;

export interface RevenueDay {
  date: string;
  pos_revenue: number | string;
  eatclub_revenue: number | string;
  labour_costs: number | string;
  covers: number;
  event_impact: EventImpact;
}

export interface AdminRevenueEntry extends RevenueDay {
  id: number;
}

export interface PeriodSummary {
  total_revenue: number | string;
  average_per_day: number | string;
  total_covers: number;
  change?: {
    total_revenue_pct: number | null;
    average_per_day_pct: number | null;
    total_covers_pct: number | null;
  };
}

export interface RevenueTrendPeriod {
  start_date: string;
  days: RevenueDay[];
  summary: PeriodSummary;
}

export interface RevenueTrendResponse {
  data: {
    current_period: RevenueTrendPeriod;
    previous_period: RevenueTrendPeriod;
  };
}

export interface VisibleSeries {
  posRevenue: boolean;
  eatclubRevenue: boolean;
  labourCosts: boolean;
}

export interface ChartRow {
  label: string;
  date: string;
  event_impact: EventImpact;
  current_pos: number;
  current_eatclub: number;
  current_labour: number;
  prev_pos: number;
  prev_eatclub: number;
  prev_labour: number;
}
