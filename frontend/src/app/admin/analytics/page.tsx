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
  
import BookingStatusPie from "./components/BookingStatusPie";
import EventsByTypeChart from "./components/EventsByTypeChart";
import RevenueAreaChart from "./components/RevenueAreaChart";

export default function AdminThemePage() {
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
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-5 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.06),transparent_35%)] p-4 pt-0 lg:p-6">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BookingStatusPie />
            <EventsByTypeChart />
          </section>

          <section className="w-full">
            <RevenueAreaChart />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
