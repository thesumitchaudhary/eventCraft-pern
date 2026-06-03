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

import { FileText, TrendingUp, DollarSign, IndianRupee } from "lucide-react";

type EventDetail = {
  _id?: string;
  eventName?: string;
  eventType?: string;
  totalAmount?: number | number[];
  totalPaid?: number;
  paymentStatus?: "partial" | "pending" | string;
  eventDate?: string;
};

type BookingCustomer = {
  events?: EventDetail[];
};

type ShowBookingsResponse = {
  customers?: BookingCustomer[];
};

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL;

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  const body: T & { message?: string } = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request Failed");
  }

  return body as T;
};

export default function AdminThemePage() {
  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowBookingsResponse>(
        `${API_ADMIN_BACKEND_URL}/showBookedEvent`,
      ),
  });

  const customers = Array.isArray(apiData?.customers) ? apiData.customers : [];

  const grossRevenue = customers
    .flatMap((customer) => customer?.events ?? [])
    .reduce((total, event) => {
      const eventTotal = Array.isArray(event?.totalAmount)
        ? event.totalAmount.reduce((sum, amount) => sum + (amount || 0), 0)
        : Number(event?.totalAmount || 0);
      return total + eventTotal;
    }, 0);

  const paidByCustomer = customers
    .flatMap((customer) => customer?.events ?? [])
    .reduce((sum, event) => sum + Number(event?.totalPaid || 0), 0);

  const remaining = grossRevenue - paidByCustomer;

  const chartData = React.useMemo(() => {
    if (!Array.isArray(customers)) return [];

    const revenueByEventType = customers
      .flatMap((customer) =>
        Array.isArray(customer?.events) ? customer.events : [],
      )
      .reduce<Record<string, number>>((acc, event) => {
        const eventType = event?.eventType || "Unknown";
        const revenue = Number(event?.totalPaid || 0);

        acc[eventType] = (acc[eventType] || 0) + revenue;
        return acc;
      }, {});

    return Object.entries(revenueByEventType)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const topCategory = chartData[0];
  const averageRevenue = chartData.length ? totalRevenue / chartData.length : 0;

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#fefdfe] p-5  border border-gray-300 border-l-6 border-l-[#00a63e]">
              <p className="flex">
                <IndianRupee className="text-[#00a63e] h-4 w-4 mt-2" />
                Total Revenue
              </p>
              <h3 className="font-semibold text-2xl text-[#00a63e]">
                <span className="flex">
                  <IndianRupee className="text-[#00a63e] mt-1" />{" "}
                  {paidByCustomer}
                </span>
              </h3>
            </div>
            <div className="rounded-xl bg-[#fefdfe] p-5 border border-gray-300 border-l-6 border-l-[#f54a00] ">
              <p className="flex gap-1">
                <TrendingUp className="text-[#f54a00] h-5 w-5 mt-1" />
                Pending Amount
              </p>
              <h3 className="font-semibold text-2xl flex text-[#f54a00]">
                <IndianRupee className="text-[#f54a00] mt-1" /> {remaining}
              </h3>
            </div>
            <div className="rounded-xl bg-[#fefdfe] p-5 border border-gray-300 border-l-6 border-l-[#155dfc] ">
              <p className="flex gap-1">
                <FileText className="text-[#155dfc] h-5 w-5 mt-1" />
                Total Expected
              </p>
              <h3 className="font-semibold text-2xl text-[#155dfc] flex ">
                <IndianRupee className="text-[#155dfc] mt-1" /> {totalRevenue}
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">
                Loading revenue chart...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-[#fefdfe] p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Revenue by Event Type</h2>
                <p className="text-sm text-muted-foreground">
                  Total revenue generated per event category
                </p>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
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
          <div className="gap-4 md:grid-cols-4 bg-muted/70">
            <div className="bg-[#fefdfe] p-5 rounded-2xl">
              <h3 className="text-2xl font-bold">Payment Details</h3>
              <p>All bookings with payment information</p>
              <table className="w-full my-3 border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                    <th className="py-2">Event Name</th>
                    <th className="py-2">Customer Name</th>
                    <th className="py-2">Budget</th>
                    <th className="py-2">Amount Paid</th>
                    <th className="py-2">Balance</th>
                    <th className="py-2">Payment Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.flatMap((customer, customerIndex) =>
                    (customer?.events ?? []).map((event, eventIndex) => {
                      const totalAmount = Array.isArray(event?.totalAmount)
                        ? event.totalAmount.reduce(
                            (sum, amount) => sum + (amount || 0),
                            0,
                          )
                        : Number(event?.totalAmount || 0);

                      return (
                        <tr
                          key={event?._id ?? `${customerIndex}-${eventIndex}`}
                          className="border-b border-black"
                        >
                          <td className="py-2 border-b p-1">
                            {event?.eventName ?? "N/A"}
                          </td>
                          <td className="border-b p-1">
                            {event?.eventType ?? "N/A"}
                          </td>
                          <td className="border-b p-1">
                            <span className="flex gap-1">
                              {" "}
                              <IndianRupee className="h-4 w-4 mt-1" />{" "}
                              {totalAmount}{" "}
                            </span>
                          </td>
                          <td className="border-b p-1">
                            <span className="text-[#00a63e] font-bold flex">
                              <IndianRupee className="h-4 w-4 mt-1" />{" "}
                              {event?.totalPaid ?? 0}
                            </span>
                          </td>
                          <td className="border-b p-1">
                            <span className="text-[#f54a00] font-bold flex">
                              <IndianRupee className="h-4 w-4 mt-1" />{" "}
                              {totalAmount - Number(event?.totalPaid || 0)}
                            </span>
                          </td>
                          <td className="border-b p-1">
                            {event?.paymentStatus === "partial" ? (
                              <span className="bg-[#dbeafe] text-[#193cba] text-xs p-1 rounded-md">
                                Partial
                              </span>
                            ) : (
                              <span className="bg-black text-white text-xs p-1 rounded-md">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="border-b p-1">
                            {event?.eventDate
                              ? new Date(event.eventDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    }),
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
