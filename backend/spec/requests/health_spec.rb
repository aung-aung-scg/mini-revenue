require "rails_helper"

RSpec.describe "Backend health", type: :request do
  describe "GET /" do
    it "returns a healthy backend response" do
      get "/"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        "status" => "ok",
        "service" => "backend"
      )
    end
  end
end
