import type { Metadata } from "next";
import RevenueTrendDashboard from "@/components/revenue-trend/RevenueTrendDashboard";

export const metadata: Metadata = {
  title: "Revenue Trend Dashboard",
  description: "Weekly revenue, labour, and covers trend analysis",
};

export default function RevenueTrendPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RevenueTrendDashboard />
    </main>
  );
}
