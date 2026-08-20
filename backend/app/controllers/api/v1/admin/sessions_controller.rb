module Api
  module V1
    module Admin
      class SessionsController < ApplicationController
        MAX_ATTEMPTS = 5
        WINDOW = 15.minutes

        def create
          throttle_key = "admin-login:#{request.remote_ip}:#{params[:email].to_s.downcase}"
          if Rails.cache.read(throttle_key).to_i >= MAX_ATTEMPTS
            return render json: { errors: ["Too many login attempts"] }, status: :too_many_requests
          end

          admin = ::Admin.find_by("LOWER(email) = ?", params[:email].to_s.downcase)

          if admin&.authenticate(params[:password])
            token = JwtService.encode(admin_id: admin.id)
            Rails.cache.delete(throttle_key)
            cookies[:admin_session] = admin_session_cookie_options.merge(value: token)
            render json: { admin: { id: admin.id, email: admin.email } }
          else
            attempts = Rails.cache.read(throttle_key).to_i + 1
            Rails.cache.write(throttle_key, attempts, expires_in: WINDOW)
            render json: { errors: ["Invalid email or password"] }, status: :unauthorized
          end
        end

        def destroy
          cookies.delete(:admin_session, path: "/")
          head :no_content
        end
      end
    end
  end
end
