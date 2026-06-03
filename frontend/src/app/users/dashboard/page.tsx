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

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
};

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => await fetcher(`${API_INDEX_BASE_URL}/my-booking`),
  });

  console.log(data?.events.length);

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
              <span>{data?.events.length}</span>
            </div>
            <div className="rounded-xl bg-muted/50 p-10">
              <h3>Upcoming Events</h3>
              <span>
                {" "}
                {data?.events.length}
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
                {/* <IndianRupee className="h-5 w-5 mt-1" /> {data?.events.reduce(
                  (total, event) => total + event.totalPaid,
                  0,
                )} */}
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
                    <td colSpan={5} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}

                {data?.events?.map((booking) => (
                  <tr key={booking._id} className="border-b border-black">
                    <td className="py-2">{booking.eventName}</td>
                    <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
                    <td>
                      <span className="text-md"> {booking.eventTheme} </span>
                    </td>
                    <td>
                      {" "}
                      <span className="text-xs font-semibold text-white bg-gray-600 p-1 rounded-md">
                        {" "}
                        {booking.bookingStatus.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-white bg-black p-1 rounded-md">
                        {booking.progress !== 0 ? "in-progress" : "pending"}
                      </span>
                    </td>
                    <td>{/* {booking.progress}  */} 10%</td>
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
