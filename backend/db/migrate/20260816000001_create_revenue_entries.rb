class CreateRevenueEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :revenue_entries do |t|
      t.date :date, null: false
      t.decimal :pos_revenue, precision: 12, scale: 2, default: 0, null: false
      t.decimal :eatclub_revenue, precision: 12, scale: 2, default: 0, null: false
      t.decimal :labour_costs, precision: 12, scale: 2, default: 0, null: false
      t.integer :covers, default: 0, null: false
      t.string :event_impact

      t.timestamps
    end

    add_index :revenue_entries, :date, unique: true
  end
end
