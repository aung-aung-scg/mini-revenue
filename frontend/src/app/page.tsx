import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Venue Analytics</h1>
      <p className="mt-4 text-lg text-slate-600">
        Revenue trend dashboard with week-over-week comparison and admin data management.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/revenue-trend"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          View Revenue Trend
        </Link>
        <Link
          href="/admin/login"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Admin Login
        </Link>
      </div>
    </main>
  );
}
