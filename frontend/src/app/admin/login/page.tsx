"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin, ApiError } from "@/lib/api/revenueTrends";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminLogin(email, password);
      router.push("/revenue-trend");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f8] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.1)] sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#172033] text-lg font-bold text-[#f4bd27]">
            V
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Venue Analytics</p>
            <p className="mt-1 text-sm font-medium text-slate-600">Admin workspace</p>
          </div>
        </div>

        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to view revenue performance and manage entries.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#172033] focus:bg-white focus:ring-2 focus:ring-[#172033]/10"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#172033] focus:bg-white focus:ring-2 focus:ring-[#172033]/10"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#172033] py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link href="/" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-slate-900">
          Back to home
        </Link>
      </div>
    </main>
  );
}
