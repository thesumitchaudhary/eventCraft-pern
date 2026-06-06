import { AdminSidebar } from "../../../components/admin-sidebar";
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
} from "@/components/ui/sidebar";
import { Users, Calendar, CircleUser, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type BookingEvent = {
  _id?: string;
  eventName?: string;
  eventType?: string;
  eventDate?: string;
  bookingStatus?: string;
  progress?: number;
  totalPaid?: number;
  totalAmount?: number | number[];
};

type BookingCustomer = {
  events?: BookingEvent[];
};

type BookingResponse = {
  customers?: BookingCustomer[];
};

type EmployeeTask = {
  status?: string;
};

type EmployeeUser = {
  _id?: string;
};

type EmployeeDetail = {
  userId?: string;
  user?: {
    _id?: string;
  };
  tasks?: EmployeeTask[];
};

type EmployeeResponse = {
  users?: EmployeeUser[];
  details?: EmployeeDetail[];
};

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL;
const API_EMPLOYEE_BACKEND_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });

  const body: T & { message?: string } = await res.json();

  if (!res.ok) {
    throw new Error(body.message || "Request Failed");
  }

  return body as T;
};

export default function AdminDashboardPage() {
  const { data } = useQuery<BookingResponse>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<BookingResponse>(`${API_ADMIN_BACKEND_URL}/showBookedEvent`),
  });

  // console.log(
  //   data?.result?.flatMap((user) =>
  //     user.customers?.flatMap((eventsDetails) =>
  //       eventsDetails?.events?.map((event) => event.eventName),
  //     ),
  //   ),
  // );


  const customers =
    data?.result?.flatMap(
      (user) =>
        user.customers?.flatMap((customer) => customer.events ?? []) ?? [],
    ) ?? [];

  const paidByCustomer = customers
    .flatMap((customer) => customer.events ?? [])
    .reduce((sum, eventDetail) => sum + (eventDetail.totalPaid ?? 0), 0);

  // Calculate total revenue across all events
  const totalRevenue = customers
    .flatMap((customer) => customer?.events || [])
    .reduce((total, event) => {
      const eventTotal = Array.isArray(event?.totalAmount)
        ? event.totalAmount.reduce((sum, amount) => sum + (amount || 0), 0)
        : event?.totalAmount || 0;
      return total + eventTotal;
    }, 0);

  // remaining amount
  const remaining: number = totalRevenue - paidByCustomer;

  const { data: data1 } = useQuery<EmployeeResponse>({
    queryKey: ["showemployee"],
    queryFn: () =>
      fetcher<EmployeeResponse>(`${API_EMPLOYEE_BACKEND_URL}/findEmployee`),
  });

  console.log(data1?.result)

  // normalize response safely
  const users: EmployeeUser[] = Array.isArray(data1?.users) ? data1.users : [];
  const details: EmployeeDetail[] = Array.isArray(data1?.details)
    ? data1.details
    : [];

  // merge users + details (match by userId if available, else by index)
  const employees = users.map((user, index) => {
    const detail =
      details.find((d) => d.userId === user._id || d.user?._id === user._id) ||
      details[index] ||
      {};

    return {
      ...user,
      ...detail,
    };
  });

  // console.log(users.map((user) => user.firstname));
  const completed = details
    .flatMap((detail) => detail?.tasks || [])
    .filter((task) => task?.status === "in-progress").length;
  // console.log(completed);

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
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-4 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div className="flex gap-1">
                <Users className="h-4 w-4" />
                <h3>Total Customers</h3>
              </div>
              <span>
                {data?.result?.flatMap((users) => users.customers).length}
              </span>
            </div>
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div className="flex gap-1">
                <Calendar className="h-4 w-4" />
                <h3>Active Bookings</h3>
              </div>
              <span>
                {data?.result?.flatMap((users) =>
                  users.customers?.map(
                    (eventDetails) => eventDetails.events.length,
                  ),
                )}
              </span>
            </div>
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div className="flex gap-1">
                <CircleUser className="h-4 w-4" />
                <h3>Total Employees</h3>
              </div>
              <span>{employees.length}</span>
            </div>
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div className="flex gap-1">
                <IndianRupee className="h-4 w-4 mt-1" />
                <h3>Total Revenue</h3>
              </div>
              <span className="flex">
                <IndianRupee className="h-5 w-5 mt-1" /> {paidByCustomer}
              </span>
            </div>
          </div>

          <div className="grid auto-rows-4 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div>
                <h4>Task Distribution</h4>
                <p>Overview of task status</p>
                <div className="grid grid-cols-3 my-3">
                  <div className="flex flex-col">
                    {/* <span>
                      {
                        details
                          .flatMap((detail) => detail?.tasks || [])
                          .filter((task) => task?.status === "pending").length
                      }
                    </span> */}
                    <span>pending</span>
                  </div>
                  <div className="flex flex-col">
                    {/* <span>
                      {
                        details
                          .flatMap((detail) => detail?.tasks || [])
                          .filter((task) => task?.status === "in-progress")
                          .length
                      }
                    </span> */}
                    <span>in progress</span>
                  </div>
                  <div className="flex flex-col">
                    {/* <span>
                      {
                        details
                          .flatMap((detail) => detail?.tasks || [])
                          .filter((task) => task?.status === "completed").length
                      }
                    </span> */}
                    <span>completed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-[#fefdfe]  p-5">
              <div>
                <h4>Revenue Summary</h4>
                <p>Payment status overview</p>
                <div className="grid grid-rows-3 gap-3 mt-3">
                  <div className="flex justify-between">
                    <p>Total Received</p>
                    <div className="flex">
                      <IndianRupee className="h-5 w-5 mt-1" />
                      {/* {paidByCustomer} */}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <p>Pending Amount</p>
                    <div className="flex">
                      <IndianRupee className="h-5 w-5 mt-1" />
                      {/* {remaining} */}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <p>Total Expected</p>
                    <div className="flex">
                      {/* <IndianRupee className="h-5 w-5 mt-1" />
                      {totalRevenue?.toLocaleString() || 0} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-screen flex-1 rounded-xl bg-[#fefdfe] p-5 md:min-h-min">
            <div>
              <h4> Recent Bookings</h4>
              <p>Latest event bookings</p>
            </div>
            <table className="w-full my-3 border-collapse p-1">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-2">Event Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status From Admin</th>
                  <th className="py-2">Status From Work</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data?.result?.flatMap((user) =>
                  user.customers?.flatMap((eventsDetails) =>
                    eventsDetails?.events?.map((event) => (
                      <tr key={event.id} className="border-b border-black">
                        <td className="py-2 border-b  p-1">
                          {event?.eventName}
                        </td>
                        <td className="border-b p-1">{event?.eventType}</td>
                        <td className="border-b p-1">
                          {new Date(event?.eventDate).toLocaleDateString()}
                        </td>
                        <td className="border-b  p-1">
                          <span className="bg-black text-white text-xs p-1 rounded-md">
                            {event?.bookingStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="border-b p-1">
                          <span className="text-xs bg-black p-1 text-white rounded-md">
                            {event?.progress !== 0 ? "in-progress" : "pending"}
                          </span>
                        </td>
                        <td className="border-b p-1">
                          <span className="flex">
                            <IndianRupee className="h-5 w-5 mt-1" />{" "}
                            {event?.budget}
                          </span>
                        </td>
                      </tr>
                    )),
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
