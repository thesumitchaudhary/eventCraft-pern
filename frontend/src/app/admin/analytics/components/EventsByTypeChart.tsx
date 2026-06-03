import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetcher, getBookingEvents, type ShowBookingsResponse } from "./api";

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL ?? "http://localhost:4041/api/admin";

export default function EventsByTypeChart() {
  const { data, isLoading, error } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowBookingsResponse>(
        `${API_ADMIN_BACKEND_URL}/showBookedEvent`,
      ),
  });

  const chartData = useMemo(() => {
    const rawBookings = getBookingEvents(data);

    return rawBookings.reduce<{ name: string; bookings: number }[]>(
      (acc, item) => {
        const type = item?.eventType || "Unknown";
        const existing = acc.find((x) => x.name === type);

        if (existing) {
          existing.bookings += 1;
        } else {
          acc.push({ name: type, bookings: 1 });
        }

        return acc;
      },
      [],
    );
  }, [data]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading chart...</p>;
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;

  return (
    <div className="rounded-2xl border border-sky-100/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-900">Events by Type</h2>
      <p className="mb-4 text-sm text-slate-500">
        Distribution of event categories
      </p>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="barBookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="bookings"
              fill="url(#barBookingsGradient)"
              radius={[6, 6, 0, 0]}
              name="Bookings"
              barSize={34}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
