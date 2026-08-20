admin_email = ENV.fetch("ADMIN_EMAIL")
admin_password = ENV.fetch("ADMIN_PASSWORD")
admin = Admin.find_or_initialize_by(email: admin_email)
admin.password = admin_password
admin.password_confirmation = admin_password
admin.save!

current_monday = Date.today.beginning_of_week(:monday)
previous_monday = current_monday - 7.days

def seed_week(start_date, multiplier: 1.0)
  impacts = [ nil, "positive", "negative", nil, "positive", nil, nil ]
  (0..6).each do |offset|
    date = start_date + offset.days
    RevenueEntry.find_or_create_by!(date: date) do |entry|
      base = 10_000 + (offset * 500)
      entry.pos_revenue = (base * multiplier).round(2)
      entry.eatclub_revenue = (2_000 + (offset * 100) * multiplier).round(2)
      entry.labour_costs = (4_000 + (offset * 200) * multiplier).round(2)
      entry.covers = (120 + offset * 5 * multiplier).to_i
      entry.event_impact = impacts[offset]
    end
  end
end

seed_week(previous_monday, multiplier: 0.9)
seed_week(current_monday, multiplier: 1.0)

# Partial data example: only first 3 days of week before previous
partial_start = previous_monday - 7.days
RevenueEntry.where(date: (partial_start + 3.days)..(partial_start + 6.days)).delete_all

puts "Seeded admin (#{admin_email}) and revenue entries."
