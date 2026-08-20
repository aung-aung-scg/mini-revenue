Rails.application.config.middleware.insert_before 0, Rack::Cors do
  configured_origins = ENV.fetch("CORS_ORIGINS", "http://localhost:3000").split(",").map(&:strip).reject(&:empty?)
  raise "CORS_ORIGINS must not contain a wildcard" if configured_origins.include?("*")

  allow do
    origins configured_origins

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             credentials: true,
             expose: %w[Authorization]
  end
end
