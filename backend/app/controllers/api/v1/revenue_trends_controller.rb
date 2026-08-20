module Api
  module V1
    class RevenueTrendsController < ApplicationController
      include AdminAuthenticatable

      def show
        start_date = params[:start_date]
        return render_invalid_start_date if start_date.blank?

        parsed_date = Date.iso8601(start_date)
        unless parsed_date.monday?
          return render json: { errors: ["start_date must be a valid Monday (YYYY-MM-DD)"] },
                        status: :unprocessable_content
        end

        result = RevenueTrendCalculator.call(start_date: parsed_date)
        response.headers["Cache-Control"] = "no-store"
        render json: result
      rescue Date::Error
        render_invalid_start_date
      rescue ArgumentError => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      rescue StandardError
        render json: { errors: ["Internal server error"] }, status: :internal_server_error
      end

      private

      def render_invalid_start_date
        render json: { errors: ["start_date must be a valid Monday (YYYY-MM-DD)"] },
               status: :unprocessable_content
      end
    end
  end
end
