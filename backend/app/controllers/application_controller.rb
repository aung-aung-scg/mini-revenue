class ApplicationController < ActionController::API
  include ActionController::Cookies

  private

  def admin_session_cookie_options
    {
      path: "/",
      httponly: true,
      secure: Rails.env.production?,
      same_site: Rails.env.production? ? :none : :lax,
      expires: 24.hours.from_now
    }
  end
end
