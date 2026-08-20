require "rails_helper"

RSpec.describe "Api::V1::Admin::RevenueEntries", type: :request do
  let(:admin) { create(:admin) }
  let(:token) { JwtService.encode(admin_id: admin.id) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }
  let(:attributes) do
    {
      revenue_entry: {
        date: "2026-08-17",
        pos_revenue: 10_000,
        eatclub_revenue: 2_000,
        labour_costs: 4_000,
        covers: 100,
        event_impact: "positive"
      }
    }
  end

  describe "GET /api/v1/admin/revenue_entries" do
    it "rejects requests without a valid bearer token" do
      get "/api/v1/admin/revenue_entries"

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)["errors"]).to include("Unauthorized")
    end

    it "returns paginated entries with optional date filters" do
      create_list(:revenue_entry, 2)

      get "/api/v1/admin/revenue_entries", params: { page: 1, per_page: 1 }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].length).to eq(1)
      expect(body["pagination"]).to include("page" => 1, "per_page" => 1, "total" => 2)
    end
  end

  describe "POST /api/v1/admin/revenue_entries" do
    it "rejects requests without a valid bearer token" do
      post "/api/v1/admin/revenue_entries", params: attributes

      expect(response).to have_http_status(:unauthorized)
    end

    it "creates an entry with a valid bearer token" do
      post "/api/v1/admin/revenue_entries", params: attributes, headers: headers

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["date"]).to eq("2026-08-17")
    end

    it "returns a validation error for a duplicate date" do
      create(:revenue_entry, date: "2026-08-17")

      post "/api/v1/admin/revenue_entries", params: attributes, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to include("Date has already been taken")
    end
  end

  describe "PATCH /api/v1/admin/revenue_entries/:id" do
    it "returns 404 for a missing entry" do
      patch "/api/v1/admin/revenue_entries/999999", params: { revenue_entry: { covers: 1 } }, headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it "updates an entry with a valid bearer token" do
      entry = create(:revenue_entry, date: "2026-08-17")

      patch "/api/v1/admin/revenue_entries/#{entry.id}",
            params: { revenue_entry: { covers: 125 } },
            headers: headers

      expect(response).to have_http_status(:ok)
      expect(entry.reload.covers).to eq(125)
    end
  end

  describe "DELETE /api/v1/admin/revenue_entries/:id" do
    it "deletes an entry with a valid bearer token" do
      entry = create(:revenue_entry, date: "2026-08-17")

      delete "/api/v1/admin/revenue_entries/#{entry.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(RevenueEntry.exists?(entry.id)).to be(false)
    end
  end
end
