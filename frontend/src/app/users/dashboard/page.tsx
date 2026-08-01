import { AppSidebar } from "../../../components/app-siderbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";

import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const API_INDEX_BASE_URL = import.meta.env.VITE_INDEX_BACKEND_URL;

type Booking = {
  id?: string;
  _id?: string;
  eventName?: string;
  eventDate?: string;
  eventTheme?: string;
  bookingStatus?: string;
  progress?: number;
  totalPaid?: number;
};

type MyBookingsResponse = {
  events?: Booking[];
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body as T;
};

export default function Page() {
  const { data, isLoading } = useQuery<MyBookingsResponse>({
    queryKey: ["my-bookings"],
    queryFn: async () =>
      await fetcher<MyBookingsResponse>(`${API_INDEX_BASE_URL}/my-booking`),
  });

  const bookings = data?.events ?? [];
  const totalPaidByCustomer = bookings.reduce(
    (total, event) => total + Number(event.totalPaid ?? 0),
    0,
  );

  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbLink href="#">Customer dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-10">
              <h3>Total Bookings</h3>
              <span>{bookings.length}</span>
            </div>
            <div className="rounded-xl bg-muted/50 p-10">
              <h3>Upcoming Events</h3>
              <span>
                {" "}
                {bookings.length}
                {/* {
                  data?.events.filter(
                    (event) => event.bookingStatus == "accepted",
                  ).length
                } */}
              </span>
            </div>
            <div className="rounded-xl bg-muted/50 p-10">
              <h3>Total Spent</h3>
              <span className="flex gap-1">
                <IndianRupee className="h-5 w-5 mt-1" />{" "}
                {totalPaidByCustomer.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min p-5">
            <table className="w-full my-3 border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-2">Event</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Theme</th>
                  <th className="py-2">
                    Status for Conformation <br /> from Admin
                  </th>
                  <th className="py-2">
                    Status for work update <br /> from employee
                  </th>
                  <th className="py-2">Work Progress</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}

                {bookings.map((booking) => (
                  <tr
                    key={booking.id ?? booking._id ?? booking.eventName}
                    className="border-b border-black"
                  >
                    <td className="py-2">{booking.eventName}</td>
                    <td>
                      {booking.eventDate
                        ? new Date(booking.eventDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span className="text-md"> {booking.eventTheme} </span>
                    </td>
                    <td>
                      {" "}
                      <span className="text-xs font-semibold text-white bg-gray-600 p-1 rounded-md">
                        {" "}
                        {booking.bookingStatus?.toLowerCase() ?? "pending"}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-white bg-black p-1 rounded-md">
                        {booking.progress !== 0 ? "in-progress" : "pending"}
                      </span>
                    </td>
                    <td>{booking.progress ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
