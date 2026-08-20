require "rails_helper"

RSpec.describe RevenueTrendCalculator do
  let(:start_date) { Date.new(2026, 8, 10) } # Monday

  describe ".call" do
    context "with full week data" do
      before do
        (0..6).each do |i|
          create(:revenue_entry,
                 date: start_date + i.days,
                 pos_revenue: 10_000,
                 eatclub_revenue: 2_000,
                 labour_costs: 4_000,
                 covers: 100)
        end

        (0..6).each do |i|
          create(:revenue_entry,
                 date: start_date - 7.days + i.days,
                 pos_revenue: 8_000,
                 eatclub_revenue: 1_000,
                 labour_costs: 3_000,
                 covers: 80)
        end
      end

      it "returns 7 days for current and previous periods" do
        result = described_class.call(start_date: start_date)

        expect(result[:data][:current_period][:days].length).to eq(7)
        expect(result[:data][:previous_period][:days].length).to eq(7)
      end

      it "calculates summaries and percentage change" do
        result = described_class.call(start_date: start_date)
        summary = result[:data][:current_period][:summary]

        expect(summary[:total_revenue]).to eq("84000.0")
        expect(summary[:average_per_day]).to eq("12000.0")
        expect(summary[:total_covers]).to eq(700)
        expect(summary[:change][:total_revenue_pct]).to eq(33.3)
      end
    end

    context "with partial week data" do
      before do
        create(:revenue_entry, date: start_date, pos_revenue: 5_000, eatclub_revenue: 1_000, covers: 50)
        create(:revenue_entry, date: start_date + 1.day, pos_revenue: 6_000, eatclub_revenue: 1_200, covers: 60)
        create(:revenue_entry, date: start_date + 2.days, pos_revenue: 7_000, eatclub_revenue: 1_400, covers: 70)
      end

      it "zero-fills missing days" do
        result = described_class.call(start_date: start_date)
        days = result[:data][:current_period][:days]

        expect(days.length).to eq(7)
        expect(days[3][:pos_revenue]).to eq("0.0")
        expect(days[3][:covers]).to eq(0)
      end
    end

    it "raises when start_date is not a Monday" do
      expect {
        described_class.call(start_date: Date.new(2026, 8, 11))
      }.to raise_error(ArgumentError, /Monday/)
    end
  end
end
