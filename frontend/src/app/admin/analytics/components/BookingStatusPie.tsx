import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetcher, getBookingEvents, type ShowBookingsResponse } from "./api";

const colors = ["#f59e0b", "#0ea5e9", "#10b981"];

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL ?? "http://localhost:4041/api/admin";

export default function BookingStatusPie() {
  const { data, isLoading, error } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowBookingsResponse>(
        `${API_ADMIN_BACKEND_URL}/showBookedEvent`,
      ),
  });

  const events = getBookingEvents(data);

  const counts = events.reduce(
    (acc, event) => {
      const status = String(event?.bookingStatus || "")
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (["pending"].includes(status)) {
        acc.pending += 1;
      } else if (["in progress", "inprogress"].includes(status)) {
        acc.inProgress += 1;
      } else {
        acc.completed += 1;
      }

      return acc;
    },
    { pending: 0, inProgress: 0, completed: 0 },
  );

  const chartData = [
    { name: "Pending", value: counts.pending },
    { name: "In Progress", value: counts.inProgress },
    { name: "Completed", value: counts.completed },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading chart...</p>;
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;
  if (total === 0)
    return <p className="text-sm text-muted-foreground">No booking status data available.</p>;

  return (
    <div className="rounded-2xl border border-sky-100/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-900">Booking Status</h2>
      <p className="mb-4 text-sm text-slate-500">
        Pending, in-progress, and completed split
      </p>

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(220px,1fr)_minmax(140px,180px)]">
        <div className="relative h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={92}
                stroke="#ffffff"
                strokeWidth={3}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0)}`, "Bookings"]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{total}</p>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
