require "rails_helper"

RSpec.describe "Api::V1::Admin::Sessions", type: :request do
  before { Rails.cache.clear }

  let!(:admin) do
    create(
      :admin,
      email: "admin@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  describe "POST /api/v1/admin/login" do
    it "returns admin details and establishes a session for valid credentials" do
      post "/api/v1/admin/login",
           params: { email: "admin@example.com", password: "password123" }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["admin"]).to include(
        "id" => admin.id,
        "email" => "admin@example.com"
      )
    end

    it "sets an HttpOnly session cookie" do
      post "/api/v1/admin/login",
           params: { email: "admin@example.com", password: "password123" }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Set-Cookie"]).to include("admin_session=")
      expect(response.headers["Set-Cookie"]).to match(/path=\/.*httponly.*samesite=lax/i)
    end

    it "accepts email addresses case-insensitively" do
      post "/api/v1/admin/login",
           params: { email: "ADMIN@EXAMPLE.COM", password: "password123" }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Set-Cookie"]).to include("admin_session=")
    end

    it "rejects invalid credentials" do
      post "/api/v1/admin/login",
           params: { email: "admin@example.com", password: "wrong-password" }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)["errors"]).to include("Invalid email or password")
    end

    it "rate limits repeated invalid credentials" do
      5.times do
        post "/api/v1/admin/login", params: { email: "throttle@example.com", password: "wrong-password" }
      end

      post "/api/v1/admin/login", params: { email: "throttle@example.com", password: "wrong-password" }

      expect(response).to have_http_status(:too_many_requests)
    end

    it "resets failed attempts after a successful login" do
      4.times do
        post "/api/v1/admin/login", params: { email: "admin@example.com", password: "wrong-password" }
      end

      post "/api/v1/admin/login", params: { email: "admin@example.com", password: "password123" }
      expect(response).to have_http_status(:ok)

      5.times do
        post "/api/v1/admin/login", params: { email: "admin@example.com", password: "wrong-password" }
      end

      expect(response).to have_http_status(:unauthorized)
    end

    it "clears the session cookie on logout" do
      post "/api/v1/admin/login", params: { email: "admin@example.com", password: "password123" }
      expect(response).to have_http_status(:ok)

      delete "/api/v1/admin/login"

      expect(response).to have_http_status(:no_content)
      expect(response.headers["Set-Cookie"]).to include("admin_session=", "expires=")
    end
  end
end
