"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "../../../components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { FileText, TrendingUp, IndianRupee } from "lucide-react";

type EventDetail = {
  id?: string;
  _id?: string;
  eventName?: string;
  eventType?: string;
  eventTheme?: string;
  theme?: string;
  eventVenue?: string;
  venue?: string;
  guestCount?: number;
  budget?: number;
  totalAmount?: number | number[];
  totalPaid?: number;
  paymentStatus?: string;
  bookingStatus?: string;
  progress?: number;
  eventDate?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BookingCustomer = {
  id?: string;
  _id?: string;
  phone?: string;
  address?: string;
  events?: EventDetail[];
};

type BookingUser = {
  id?: string;
  _id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  customers?: BookingCustomer[];
};

type ShowBookingsResponse = {
  customers?: BookingCustomer[];
  result?: BookingUser[];
  message?: string;
};

type BookingRow = {
  user?: BookingUser;
  customer?: BookingCustomer;
  event: EventDetail;
};

const API_ADMIN_BACKEND_URL =
  import.meta.env.VITE_ADMIN_BACKEND_URL ?? "http://localhost:4041/api/admin";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  const body: T & { message?: string } = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request Failed");
  }

  return body as T;
};

const toNumber = (value?: number | string | null) => {
  const parsedValue = Number(value ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getEventTotal = (event: EventDetail) => {
  if (Array.isArray(event.totalAmount)) {
    return event.totalAmount.reduce(
      (sum, amount) => sum + toNumber(amount),
      0,
    );
  }

  return toNumber(event.totalAmount ?? event.budget);
};

const getEventPaid = (event: EventDetail) => {
  const totalPaid = toNumber(event.totalPaid);

  if (totalPaid > 0) {
    return totalPaid;
  }

  const paymentStatus = event.paymentStatus?.toUpperCase();
  return paymentStatus === "COMPLETED" || paymentStatus === "PAID"
    ? getEventTotal(event)
    : 0;
};

const formatNumber = (value: number) => value.toLocaleString("en-IN");

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "N/A"
    : parsedDate.toLocaleDateString();
};

const formatLabel = (value?: string) => {
  if (!value) return "N/A";

  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const statusClassName = (status?: string) => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "COMPLETED" || normalizedStatus === "PAID") {
    return "bg-[#dcfce7] text-[#166534]";
  }

  if (normalizedStatus === "PARTIAL" || normalizedStatus === "ACCEPTED") {
    return "bg-[#dbeafe] text-[#193cba]";
  }

  if (normalizedStatus === "REJECTED") {
    return "bg-[#fee2e2] text-[#991b1b]";
  }

  return "bg-black text-white";
};

const MoneyValue = ({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) => (
  <span className={`inline-flex items-center gap-1 ${className}`}>
    <IndianRupee className="h-4 w-4" />
    {formatNumber(value)}
  </span>
);

export default function AdminRevenuePage() {
  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowBookingsResponse>(`${API_ADMIN_BACKEND_URL}/showBookedEvent`),
  });

  const bookingRows = React.useMemo<BookingRow[]>(() => {
    const nestedRows =
      apiData?.result?.flatMap(
        (user) =>
          user?.customers?.flatMap(
            (customer) =>
              customer?.events?.map((event) => ({
                user,
                customer,
                event,
              })) ?? [],
          ) ?? [],
      ) ?? [];

    if (nestedRows.length > 0) {
      return nestedRows;
    }

    return (
      apiData?.customers?.flatMap(
        (customer) =>
          customer?.events?.map((event) => ({
            customer,
            event,
          })) ?? [],
      ) ?? []
    );
  }, [apiData]);

  const grossRevenue = bookingRows.reduce(
    (total, row) => total + getEventTotal(row.event),
    0,
  );

  const paidByCustomer = bookingRows.reduce(
    (sum, row) => sum + getEventPaid(row.event),
    0,
  );

  const remaining = Math.max(grossRevenue - paidByCustomer, 0);

  const chartData = React.useMemo(() => {
    const revenueByEventType = bookingRows.reduce<Record<string, number>>(
      (acc, row) => {
        const eventType = row.event?.eventType || "Unknown";
        const revenue = getEventTotal(row.event);

        acc[eventType] = (acc[eventType] || 0) + revenue;
        return acc;
      },
      {},
    );

    return Object.entries(revenueByEventType)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [bookingRows]);

  const errorMessage =
    error instanceof Error ? error.message : "Unable to load revenue data";

  return (
    <SidebarProvider className="">
      <AdminSidebar />
      <SidebarInset className="min-w-100 overflow-x-hidden bg-[#fefdfe] !m-0 !ml-0 !rounded-none !shadow-none">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Admin dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Revenue Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-0 bg-[#fefdfe] p-0">
          <div className="grid gap-0 border-y border-gray-300 md:grid-cols-3">
            <div className="bg-[#fefdfe] p-5 border-r border-gray-300 border-l-6 border-l-[#00a63e]">
              <p className="flex items-center gap-1">
                <IndianRupee className="text-[#00a63e] h-4 w-4" />
                Total Revenue
              </p>
              <h3 className="mt-2 font-semibold text-2xl text-[#00a63e]">
                <MoneyValue value={paidByCustomer} />
              </h3>
            </div>
            <div className="bg-[#fefdfe] p-5 border-r border-gray-300 border-l-6 border-l-[#f54a00]">
              <p className="flex items-center gap-1">
                <TrendingUp className="text-[#f54a00] h-5 w-5" />
                Pending Amount
              </p>
              <h3 className="mt-2 font-semibold text-2xl text-[#f54a00]">
                <MoneyValue value={remaining} />
              </h3>
            </div>
            <div className="bg-[#fefdfe] p-5 border-l-6 border-l-[#155dfc]">
              <p className="flex items-center gap-1">
                <FileText className="text-[#155dfc] h-5 w-5" />
                Total Expected
              </p>
              <h3 className="mt-2 font-semibold text-2xl text-[#155dfc]">
                <MoneyValue value={grossRevenue} />
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="border-b border-border bg-[#fefdfe] p-6">
              <p className="text-sm text-muted-foreground">
                Loading revenue chart...
              </p>
            </div>
          ) : error ? (
            <div className="border-b border-border bg-[#fefdfe] p-6">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          ) : (
            <div className="border-b border-border bg-[#fefdfe] p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Revenue by Event Type</h2>
                <p className="text-sm text-muted-foreground">
                  Total booking value per event category
                </p>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => formatNumber(value)}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(Number(value ?? 0)),
                        "Revenue",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="bg-[#fefdfe] px-5 py-5">
            <div>
              <h3 className="text-2xl font-bold">Payment Details</h3>
              <p className="text-sm text-muted-foreground">
                All customer bookings returned by the API
              </p>
            </div>

            <div className="mt-4 w-full overflow-x-auto">
              <table className="w-full min-w-[1280px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">Event Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Theme</th>
                    <th className="px-3 py-2">Venue</th>
                    <th className="px-3 py-2">Guests</th>
                    <th className="px-3 py-2">Budget</th>
                    <th className="px-3 py-2">Amount Paid</th>
                    <th className="px-3 py-2">Balance</th>
                    <th className="px-3 py-2">Payment Status</th>
                    <th className="px-3 py-2">Booking Status</th>
                    <th className="px-3 py-2">Progress</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={16}
                        className="px-3 py-4 text-center text-muted-foreground"
                      >
                        Loading payment details...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={16}
                        className="px-3 py-4 text-center text-destructive"
                      >
                        {errorMessage}
                      </td>
                    </tr>
                  ) : bookingRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={16}
                        className="px-3 py-4 text-center text-muted-foreground"
                      >
                        No booking data found.
                      </td>
                    </tr>
                  ) : (
                    bookingRows.map(({ user, customer, event }, index) => {
                      const totalAmount = getEventTotal(event);
                      const paidAmount = getEventPaid(event);
                      const balance = Math.max(totalAmount - paidAmount, 0);
                      const customerName = `${user?.firstname ?? ""} ${
                        user?.lastname ?? ""
                      }`.trim();

                      return (
                        <tr
                          key={
                            event?.id ??
                            event?._id ??
                            `${customer?.id ?? customer?._id ?? "customer"}-${index}`
                          }
                          className="border-b border-black last:border-b-0"
                        >
                          <td className="px-3 py-2">
                            {customerName || "N/A"}
                          </td>
                          <td className="px-3 py-2">{user?.email ?? "N/A"}</td>
                          <td className="px-3 py-2">
                            {customer?.phone ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {customer?.address ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {event?.eventName ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {event?.eventType ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {event?.eventTheme ?? event?.theme ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {event?.eventVenue ?? event?.venue ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {event?.guestCount ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            <MoneyValue value={totalAmount} />
                          </td>
                          <td className="px-3 py-2">
                            <MoneyValue
                              value={paidAmount}
                              className="font-bold text-[#00a63e]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <MoneyValue
                              value={balance}
                              className="font-bold text-[#f54a00]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-medium ${statusClassName(
                                event?.paymentStatus,
                              )}`}
                            >
                              {formatLabel(event?.paymentStatus)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-medium ${statusClassName(
                                event?.bookingStatus,
                              )}`}
                            >
                              {formatLabel(event?.bookingStatus)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {event?.progress ?? 0}%
                          </td>
                          <td className="px-3 py-2">
                            {formatDate(event?.eventDate)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
