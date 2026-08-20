Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resource :revenue_trends, only: [:show]

      namespace :admin do
        post "login", to: "sessions#create"
        delete "login", to: "sessions#destroy"
        resources :revenue_entries, except: %i[new edit]
      end
    end
  end
end
