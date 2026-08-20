class RevenueTrendCalculator
  DEFAULT_DAY = {
    pos_revenue: "0.0",
    eatclub_revenue: "0.0",
    labour_costs: "0.0",
    covers: 0,
    event_impact: nil
  }.freeze

  def self.call(start_date:)
    new(start_date: start_date).call
  end

  def initialize(start_date:)
    @start_date = start_date.is_a?(Date) ? start_date : Date.parse(start_date.to_s)
  end

  def call
    validate_monday!

    current_days = build_period(@start_date)
    previous_start = @start_date - 7.days
    previous_days = build_period(previous_start)

    {
      data: {
        current_period: build_period_payload(@start_date, current_days, previous_days),
        previous_period: build_period_payload(previous_start, previous_days, current_days)
      }
    }
  end

  private

  def validate_monday!
    return if @start_date.monday?

    raise ArgumentError, "start_date must be a valid Monday (YYYY-MM-DD)"
  end

  def build_period_payload(period_start, days, comparison_days)
    {
      start_date: period_start.iso8601,
      days: days,
      summary: build_summary(days, comparison_days)
    }
  end

  def build_period(period_start)
    period_end = period_start + 6.days
    entries = RevenueEntry.where(date: period_start..period_end).index_by(&:date)

    (0..6).map do |offset|
      date = period_start + offset.days
      entry = entries[date]
      entry ? entry.as_public_api_json : default_day_json(date)
    end
  end

  def default_day_json(date)
    DEFAULT_DAY.merge(date: date.iso8601)
  end

  def build_summary(days, comparison_days)
    current = aggregate(days)
    previous = aggregate(comparison_days)

    {
      total_revenue: current[:total_revenue],
      average_per_day: current[:average_per_day],
      total_covers: current[:total_covers],
      change: build_change(current, previous)
    }
  end

  def aggregate(days)
    total_revenue = days.sum do |day|
      day[:pos_revenue].to_d + day[:eatclub_revenue].to_d
    end
    total_covers = days.sum { |day| day[:covers] }

    {
      total_revenue: total_revenue.round(2).to_s("F"),
      average_per_day: (total_revenue / 7).round(2).to_s("F"),
      total_covers: total_covers
    }
  end

  def percent_change(current, previous)
    return nil if previous.zero?

    (((current - previous) / previous) * 100).round(1)
  end

  def build_change(current, previous)
    {
      total_revenue_pct: percent_change(current[:total_revenue].to_d, previous[:total_revenue].to_d),
      average_per_day_pct: percent_change(current[:average_per_day].to_d, previous[:average_per_day].to_d),
      total_covers_pct: percent_change(current[:total_covers].to_f, previous[:total_covers].to_f)
    }
  end
end
