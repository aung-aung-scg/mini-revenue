require "rails_helper"

RSpec.describe "Api::V1::RevenueTrends", type: :request do
  let(:monday) { Date.new(2026, 8, 10) }
  let(:admin) { create(:admin) }
  let(:headers) { { "Authorization" => "Bearer #{JwtService.encode(admin_id: admin.id)}" } }

  describe "GET /api/v1/revenue_trends" do
    it "rejects requests without authentication" do
      get "/api/v1/revenue_trends", params: { start_date: monday.iso8601 }

      expect(response).to have_http_status(:unauthorized)
    end

    context "with valid week and full data" do
      before do
        (0..6).each do |i|
          create(:revenue_entry,
                 date: monday + i.days,
                 pos_revenue: 10_000 + (i * 100),
                 eatclub_revenue: 2_000,
                 labour_costs: 4_000,
                 covers: 100 + i)
        end

        (0..6).each do |i|
          create(:revenue_entry,
                 date: monday - 7.days + i.days,
                 pos_revenue: 9_000,
                 eatclub_revenue: 1_500,
                 labour_costs: 3_500,
                 covers: 90)
        end
      end

      it "returns 200 with 7 days and summary" do
        get "/api/v1/revenue_trends", params: { start_date: monday.iso8601 }, headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.headers["Cache-Control"]).to include("no-store")

        body = JSON.parse(response.body)
        expect(body["data"]["current_period"]["start_date"]).to eq("2026-08-10")
        expect(body["data"]["current_period"]["days"].length).to eq(7)
        expect(body["data"]["previous_period"]["start_date"]).to eq("2026-08-03")
        expect(body["data"]["previous_period"]["days"].length).to eq(7)
        expect(body["data"]["current_period"]["summary"]).to include("total_revenue", "average_per_day", "total_covers")
        expect(body["data"]["current_period"]["summary"]["change"]).to include("total_revenue_pct")
      end

      it "does not expose internal database fields in days" do
        get "/api/v1/revenue_trends", params: { start_date: monday.iso8601 }, headers: headers

        day = JSON.parse(response.body).dig("data", "current_period", "days").first
        expect(day.keys).to contain_exactly("date", "pos_revenue", "eatclub_revenue", "labour_costs", "covers", "event_impact")
      end
    end

    context "with missing start_date" do
      it "returns 422" do
        get "/api/v1/revenue_trends", headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end
    end

    context "with invalid start_date" do
      it "returns 422 if not Monday" do
        get "/api/v1/revenue_trends", params: { start_date: "2026-08-11" }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 422 for malformed date" do
        get "/api/v1/revenue_trends", params: { start_date: "not-a-date" }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with partial week data" do
      before do
        create(:revenue_entry, date: monday, pos_revenue: 5_000, eatclub_revenue: 1_000, covers: 50)
        create(:revenue_entry, date: monday + 1.day, pos_revenue: 6_000, eatclub_revenue: 1_200, covers: 60)
        create(:revenue_entry, date: monday + 2.days, pos_revenue: 7_000, eatclub_revenue: 1_400, covers: 70)
      end

      it "returns 7 zero-filled days and correct partial summary" do
        get "/api/v1/revenue_trends", params: { start_date: monday.iso8601 }, headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["data"]["current_period"]["days"].length).to eq(7)
        expect(body["data"]["current_period"]["summary"]["total_revenue"]).to eq("21600.0")
      end
    end

    context "with an empty week" do
      it "returns seven zero-filled days and zero summary values" do
        get "/api/v1/revenue_trends", params: { start_date: monday.iso8601 }, headers: headers

        expect(response).to have_http_status(:ok)
        summary = JSON.parse(response.body).dig("data", "current_period", "summary")
        expect(summary).to include(
          "total_revenue" => "0.0",
          "average_per_day" => "0.0",
          "total_covers" => 0
        )
      end
    end
  end
end
