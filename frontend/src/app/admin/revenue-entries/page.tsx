"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ApiError,
  adminLogout,
  createRevenueEntry,
  deleteRevenueEntry,
  fetchRevenueEntries,
  updateRevenueEntry,
} from "@/lib/api/revenueTrends";
import { AdminRevenueEntry } from "@/types/revenueTrend";

const EMPTY_FORM = {
  date: "",
  pos_revenue: "",
  eatclub_revenue: "",
  labour_costs: "",
  covers: "",
  event_impact: "",
};

export default function AdminRevenueEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<AdminRevenueEntry[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    const data = await fetchRevenueEntries();
    setEntries(data);
  };

  useEffect(() => {
    loadEntries()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.replace("/admin/login");
        setError(err instanceof ApiError ? err.message : "Load failed");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      date: form.date,
      pos_revenue: parseFloat(form.pos_revenue) || 0,
      eatclub_revenue: parseFloat(form.eatclub_revenue) || 0,
      labour_costs: parseFloat(form.labour_costs) || 0,
      covers: parseInt(form.covers, 10) || 0,
      event_impact: form.event_impact || null,
    };

    try {
      if (editingId) {
        await updateRevenueEntry(undefined, editingId, payload);
      } else {
        await createRevenueEntry(undefined, payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadEntries();
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  };

  const handleEdit = (entry: AdminRevenueEntry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      pos_revenue: String(entry.pos_revenue),
      eatclub_revenue: String(entry.eatclub_revenue),
      labour_costs: String(entry.labour_costs),
      covers: String(entry.covers),
      event_impact: entry.event_impact || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteRevenueEntry(undefined, id);
      await loadEntries();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Entries</h1>
          <p className="text-sm text-slate-500">Create and update daily revenue data</p>
        </div>
        <div className="flex gap-3">
          <Link href="/revenue-trend" className="text-sm text-blue-600 hover:underline">
            View Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          >
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-3">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="POS Revenue"
          value={form.pos_revenue}
          onChange={(e) => setForm({ ...form, pos_revenue: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Eatclub Revenue"
          value={form.eatclub_revenue}
          onChange={(e) => setForm({ ...form, eatclub_revenue: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Labour Costs"
          value={form.labour_costs}
          onChange={(e) => setForm({ ...form, labour_costs: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="number"
          placeholder="Covers"
          value={form.covers}
          onChange={(e) => setForm({ ...form, covers: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          value={form.event_impact}
          onChange={(e) => setForm({ ...form, event_impact: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">No event impact</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 md:col-span-3"
        >
          {editingId ? "Update Entry" : "Create Entry"}
        </button>
      </form>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">POS</th>
              <th className="px-4 py-3">Eatclub</th>
              <th className="px-4 py-3">Labour</th>
              <th className="px-4 py-3">Covers</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-100">
                <td className="px-4 py-3">{entry.date}</td>
                <td className="px-4 py-3">{entry.pos_revenue}</td>
                <td className="px-4 py-3">{entry.eatclub_revenue}</td>
                <td className="px-4 py-3">{entry.labour_costs}</td>
                <td className="px-4 py-3">{entry.covers}</td>
                <td className="px-4 py-3">{entry.event_impact || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(entry)}
                    className="mr-2 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
