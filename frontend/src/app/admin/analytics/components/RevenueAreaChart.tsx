import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {IndianRupee} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetcher, type ShowBookingsResponse } from "./api";

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL ?? "http://localhost:4041/api/admin";

export default function RevenueAreaChart() {
  const { data: apiData, isLoading, error } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowBookingsResponse>(
        `${API_ADMIN_BACKEND_URL}/showBookedEvent`,
      ),
  });

  const chartData = useMemo(() => {
    if (!Array.isArray(apiData?.customers)) return [];

    const revenueByMonth = new Map<string, { date: Date; revenue: number }>();

    apiData.customers.forEach((customer) => {
      if (!Array.isArray(customer?.events)) return;

      customer.events.forEach((event) => {
        const eventTotal = Array.isArray(event?.totalAmount)
          ? event.totalAmount.reduce((sum, amount) => sum + (amount || 0), 0)
          : Number(event?.totalAmount || 0);

        const parsedDate = new Date(event?.createdAt || event?.date || Date.now());
        const monthKey = parsedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });

        const existing = revenueByMonth.get(monthKey);
        if (existing) {
          existing.revenue += eventTotal;
        } else {
          revenueByMonth.set(monthKey, {
            date: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1),
            revenue: eventTotal,
          });
        }
      });
    });

    return Array.from(revenueByMonth.entries())
      .map(([month, value]) => ({ month, revenue: value.revenue, date: value.date }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ month, revenue }) => ({ month, revenue }));
  }, [apiData]);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-sm text-destructive">Error: {error.message}</div>;

  return (
    <div className="rounded-2xl border border-sky-100/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-900">Monthly Revenue</h2>
      <p className="mb-4 text-sm text-slate-500">
        Revenue trend across all booked events
      </p>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value: number) => `₹ ${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [
                <span className="inline-flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {Number(value ?? 0).toLocaleString()}
                </span>,
                "Revenue",
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0284c7"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenue (INR)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
