import { useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { IndianRupee, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Menu, ActionIcon } from "@mantine/core";
import { EllipsisVertical } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL;

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed";

type EventBooking = {
  _id?: string;
  eventName?: string;
  eventType?: string;
  theme?: string;
  eventDate?: string;
  venue?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  guestCount?: number;
  totalAmount?: number;
  progress?: number;
};

type BookingProfile = {
  events?: EventBooking[];
};

type BookingUser = {
  customers?: BookingProfile[];
};

type ShowBookingsResponse = {
  result?: BookingUser[];
};

type UpdateEventStatusPayload = {
  id: string;
  bookingStatus: BookingStatus;
};

const updateEventBookStatus = async (
  id: string,
  bookingStatus: BookingStatus,
): Promise<unknown> => {
  const res = await fetch(`${API_URL}/admin/updateStatus/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      bookingStatus,
    }),
  });

  if (!res.ok) {
    throw new Error("there was a problem so you can't update eventbook action");
  }

  return res.json();
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<ShowBookingsResponse>({
    queryKey: ["showbookings"],
    queryFn: async () =>
      await fetcher<ShowBookingsResponse>(
        `${API_ADMIN_BACKEND_URL}/showBookedEvent`,
      ),
  });

  const eventBookActionMutation = useMutation({
    mutationFn: ({ id, bookingStatus }: UpdateEventStatusPayload) =>
      updateEventBookStatus(id, bookingStatus),
    onSuccess: (data: unknown) => {
      console.log("success", data);
    },
    onError: (error: Error) => {
      console.log("error", error);
    },
  });

  const allBookings = data?.result?.flatMap((user: BookingUser) =>
    user.customers?.flatMap((customer) => customer.events ?? []) ?? [],
  ) ?? [];

  const filteredBookings = allBookings.filter((booking: EventBooking) => {
    const value = search.toLowerCase();

    return (
      booking.eventName?.toLowerCase().includes(value) ||
      booking.eventType?.toLowerCase().includes(value) ||
      booking.theme?.toLowerCase().includes(value) ||
      booking.venue?.toLowerCase().includes(value) ||
      booking.bookingStatus?.toLowerCase().includes(value) ||
      booking.paymentStatus?.toLowerCase().includes(value) ||
      booking.guestCount?.toString().includes(value)
    );
  });

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
                  <BreadcrumbPage>Admin dashboard</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bookings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-250">
          <div className="rounded-xl bg-muted/50 p-4 flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Booking Management</h2>
              <p className="text-sm text-muted-foreground">
                Total bookings: {allBookings.length}
              </p>
            </div>
            <div>
              <input
                type="text"
                className="rounded-md border px-3 py-2 w-70"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="grid auto-rows-4 gap-4 md:grid-cols-4">
            <div className="rounded-md bg-[#fefdfe]  p-5 border-gary-200 border-l-6 border-l-[#6a7282]">
              <div className="flex gap-1">
                <h3>Pending</h3>
              </div>
              <span className="text-[#6a7282] font-bold text-xl">
                {" "}
                {
                  allBookings.filter((b) => b.bookingStatus === "REQUESTED")
                    .length
                }
              </span>
            </div>
            <div className="rounded-md bg-[#fefdfe]  p-5 border-gary-200 border-l-6 border-l-[#155dfc]">
              <div className="flex gap-1">
                <h3>Confirmed</h3>
              </div>
              <span className="text-[#155dfc] font-bold text-xl">
                {" "}
                {
                  allBookings.filter((b) => b.bookingStatus === "accepted")
                    .length
                }
              </span>
            </div>
            <div className="rounded-md bg-[#fefdfe]  p-5 border-gary-200 border-l-6 border-l-[#fd0d0d]">
              <div className="flex gap-1">
                <h3>rejected</h3>
              </div>
              <span className="text-[#fd0d0d] font-bold text-xl">
                {" "}
                {
                  allBookings.filter((b) => b.bookingStatus === "rejected")
                    .length
                }
              </span>
            </div>
            <div className="rounded-md bg-[#fefdfe]  p-5 border-gary-200 border-l-6 border-l-[#00a63e]">
              <div className="flex gap-1">
                <h3>Completed</h3>
              </div>
              <span className="text-[#00a63e] font-bold text-xl">
                {" "}
                {
                  allBookings.filter((b) => b.bookingStatus === "completed")
                    .length
                }
              </span>
            </div>
          </div>

          <div className="min-h-[60vh] rounded-xl bg-[#fefdfe]  p-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full my-4 border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                    <th className="py-2 px-2">Event Name</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Theme</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Venue</th>
                    <th className="py-2 px-2">Guests</th>
                    <th className="py-2 px-2">Budget</th>
                    <th className="py-2 px-2">Payment</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Progress</th>
                    <th className="py-2 px-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        loading...
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-black">
                        <td className="py-2 px-2">{booking.eventName}</td>
                        <td className="py-2 px-2">{booking.eventType}</td>
                        <td className="py-2 px-2">{booking.eventTheme}</td>
                        <td className="py-2 px-2">
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-2 px-2">{booking.eventVenue}</td>
                        <td className="py-2 px-2">{booking.guestCount}</td>
                        <td className="py-2 px-2">
                          <span className="flex">
                            <IndianRupee className="h-3 w-3 mt-1" /> {booking.budget ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            {booking.paymentStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                            {booking.bookingStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-medium">
                          {booking.progress ?? 0}%
                        </td>

                        <td className="py-2 px-2 font-medium flex flex-col">
                          <Menu>
                            <Menu.Target>
                              <ActionIcon variant="transparent">
                                <EllipsisVertical size={18} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                onClick={() =>
                                  eventBookActionMutation.mutate({
                                    id: booking.id,
                                    bookingStatus: "REJECTED",
                                  })
                                }
                              >
                                Reject
                              </Menu.Item>

                              <Menu.Item
                                onClick={() =>
                                  eventBookActionMutation.mutate({
                                    id: booking.id,
                                    bookingStatus: "ACCEPTED",
                                  })
                                }
                              >
                                Accept
                              </Menu.Item>

                              <Menu.Item
                                onClick={() =>
                                  eventBookActionMutation.mutate({
                                    id: booking.id,
                                    bookingStatus: "COMPLETED",
                                  })
                                }
                              >
                                Completed
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </td>
                      </tr>
                    ))}

                   {/* NO RESULTS */}
                  {!isLoading && filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        No bookings found
                      </td>
                    </tr>
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
