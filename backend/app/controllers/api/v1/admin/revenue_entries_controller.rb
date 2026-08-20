module Api
  module V1
    module Admin
      class RevenueEntriesController < ApplicationController
        include AdminAuthenticatable

        rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found
        rescue_from ActiveRecord::RecordNotUnique, with: :render_duplicate_record

        before_action :set_revenue_entry, only: %i[show update destroy]

        def index
          page = [ params.fetch(:page, 1).to_i, 1 ].max
          per_page = [ [ params.fetch(:per_page, 25).to_i, 1 ].max, 100 ].min
          scope = RevenueEntry.order(date: :desc)
          scope = scope.where("date >= ?", params[:start_date]) if params[:start_date].present?
          scope = scope.where("date <= ?", params[:end_date]) if params[:end_date].present?
          total = scope.count
          entries = scope.offset((page - 1) * per_page).limit(per_page)
          render json: {
            data: entries.map(&:as_api_json),
            pagination: { page: page, per_page: per_page, total: total, total_pages: (total / per_page.to_f).ceil }
          }
        end

        def show
          render json: @revenue_entry.as_api_json
        end

        def create
          entry = RevenueEntry.new(revenue_entry_params)
          if entry.save
            render json: entry.as_api_json, status: :created
          else
            render json: { errors: entry.errors.full_messages }, status: :unprocessable_content
          end
        end

        def update
          if @revenue_entry.update(revenue_entry_params)
            render json: @revenue_entry.as_api_json
          else
            render json: { errors: @revenue_entry.errors.full_messages }, status: :unprocessable_content
          end
        end

        def destroy
          @revenue_entry.destroy!
          head :no_content
        end

        private

        def set_revenue_entry
          @revenue_entry = RevenueEntry.find(params[:id])
        end

        def revenue_entry_params
          params.require(:revenue_entry).permit(
            :date, :pos_revenue, :eatclub_revenue, :labour_costs, :covers, :event_impact
          )
        end

        def render_record_not_found
          render json: { errors: [ "Revenue entry not found" ] }, status: :not_found
        end

        def render_duplicate_record
          render json: { errors: [ "A revenue entry already exists for that date" ] }, status: :unprocessable_content
        end
      end
    end
  end
end
