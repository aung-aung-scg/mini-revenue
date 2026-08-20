class JwtService
  SECRET = ENV.fetch("JWT_SECRET") { Rails.application.credentials.secret_key_base }
  ALGORITHM = "HS256"

  def self.encode(admin_id:, exp: 24.hours.from_now.to_i)
    JWT.encode({ admin_id: admin_id, exp: exp }, SECRET, ALGORITHM)
  end

  def self.decode(token)
    JWT.decode(token, SECRET, true, algorithm: ALGORITHM).first
  end
end
