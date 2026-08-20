FactoryBot.define do
  factory :revenue_entry do
    sequence(:date) { |n| Date.new(2026, 8, 10) + n.days }
    pos_revenue { 10_000 }
    eatclub_revenue { 2_000 }
    labour_costs { 4_000 }
    covers { 120 }
    event_impact { nil }
  end

  factory :admin do
    sequence(:email) { |n| "admin#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
  end
end
