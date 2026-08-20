class HealthController < ActionController::API
  def show
    render json: { status: "ok", service: "backend" }
  end
end
