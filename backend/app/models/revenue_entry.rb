# == Schema Information
#
# Table name: revenue_entries
#
#  id              :integer          not null, primary key
#  date            :date             not null
#  pos_revenue     :decimal(12, 2)   default(0.0), not null
#  eatclub_revenue :decimal(12, 2)   default(0.0), not null
#  labour_costs    :decimal(12, 2)   default(0.0), not null
#  covers          :integer          default(0), not null
#  event_impact    :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class RevenueEntry < ApplicationRecord
  enum :event_impact, { positive: "positive", negative: "negative" }, validate: { allow_nil: true }

  EVENT_IMPACTS = %w[positive negative].freeze

  validates :date, presence: true, uniqueness: true
  validates :pos_revenue, :eatclub_revenue, :labour_costs,
            numericality: { greater_than_or_equal_to: 0 }
  validates :covers, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :event_impact, inclusion: { in: EVENT_IMPACTS }, allow_nil: true

  def total_revenue
    pos_revenue.to_d + eatclub_revenue.to_d
  end

  def as_api_json
    {
      id: id,
      date: date.iso8601,
      pos_revenue: pos_revenue.to_s("F"),
      eatclub_revenue: eatclub_revenue.to_s("F"),
      labour_costs: labour_costs.to_s("F"),
      covers: covers,
      event_impact: event_impact
    }
  end

  def as_public_api_json
    as_api_json.except(:id)
  end
end
