"use client";

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
} from "../../../components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface CustomerUser {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  customers?: CustomerProfile[];
}

interface CustomerProfile {
  _id?: string;
  phone?: string;
  address?: string;
  events?: unknown[];
}

interface ShowCustomer {
  result?: CustomerUser[];
}

const API_ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL;

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request Failed");
  }

  return body;
};

export default function AdminThemePage() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading } = useQuery<ShowCustomer>({
    queryKey: ["showbookings"],
    queryFn: () =>
      fetcher<ShowCustomer>(`${API_ADMIN_BACKEND_URL}/showBookedEvent`),
  });

  const customers = data?.result ?? [];

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => {
      const fullName =
        `${customer?.firstname || ""} ${customer?.lastname || ""}`.toLowerCase();
      const email = customer?.email?.toLowerCase() || "";
      const profile = customer?.customers?.[0];
      const phone = profile?.phone?.toLowerCase() || "";
      const address = profile?.address?.toLowerCase() || "";

      return (
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        address.includes(keyword)
      );
    });
  }, [customers, searchTerm]);

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
                  <BreadcrumbPage>customer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between">
            <div>
              <h3>Customer Management</h3>
              <p>Total customers: {filteredCustomers.length}</p>
            </div>
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, address"
                className="rounded-md border px-3 py-2 w-70"
              />
            </div>
          </div>
          <div className="min-h-screen flex-1 rounded-xl bg-[#fefdfe] p-5 md:min-h-min">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-3" colSpan={5}>
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3" colSpan={5}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const profile = customer?.customers?.[0];
                    const bookingCount = (customer?.customers ?? []).reduce(
                      (count, item) => count + (item.events?.length ?? 0),
                      0,
                    );

                    return (
                      <tr
                        key={customer.id ?? customer.email}
                        className="border-b border-black"
                      >
                        <td className="py-2 border-b p-1">
                          {customer?.firstname} {customer?.lastname}
                        </td>

                        <td className="border-b p-1">{customer?.email}</td>

                        <td className="border-b p-1">{profile?.phone}</td>

                        <td className="border-b p-1">{profile?.address}</td>

                        <td>
                          <span className="bg-black mx-5 rounded-md px-2 py-1 text-white">
                            {bookingCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
