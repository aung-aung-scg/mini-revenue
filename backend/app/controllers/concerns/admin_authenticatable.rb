module AdminAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_admin!
  end

  private

  def authenticate_admin!
    token = bearer_token || cookies[:admin_session]
    return render json: { errors: ["Unauthorized"] }, status: :unauthorized unless token

    payload = JwtService.decode(token)
    @current_admin = ::Admin.find_by(id: payload["admin_id"])
    render json: { errors: ["Unauthorized"] }, status: :unauthorized unless @current_admin
  rescue JWT::DecodeError
    render json: { errors: ["Unauthorized"] }, status: :unauthorized
  end

  def bearer_token
    header = request.headers["Authorization"]
    return unless header&.start_with?("Bearer ")

    header.split(" ", 2).last
  end

  def admin_session_cookie_options
    {
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: 24.hours.from_now
    }
  end
end
