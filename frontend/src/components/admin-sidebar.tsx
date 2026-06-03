"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  IndianRupee,
  ChartColumn,
  Palette,
  Shield,
  TrendingUp,
  Users,
  CircleUser,
  ClipboardList,
  LifeBuoy,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { ProfileEditorAdmin } from "@/components/profile-editor-admin";
import { TeamSwitcher } from "@/components/team-switcher";
import LiveChatLayoutAdmin from "@/components/live-chat-layout-admin";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminUserShape = {
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  email?: string;
  profileImageUrl?: string;
  profileImage?: string;
};

type AdminMeResponse = {
  success?: boolean;
  user?: AdminUserShape;
  admin?: {
    userId?: AdminUserShape;
  };
  result?: AdminUserShape;
};

const ADMIN_API_URL = `${import.meta.env.VITE_BACKEND_URL}/admin`;
const fetchAdminMe = async (): Promise<AdminMeResponse> => {
  const res = await fetch(`${ADMIN_API_URL}/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch admin profile: ${res.status}`);
  }

  return res.json();
};

const logoutAdmin = async () => {
  const res = await fetch(`${ADMIN_API_URL}/logout`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
};

const data = {
  teams: [
    {
      name: "Event Craft",
      logo: Shield,
      plan: "Control Center",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/admin/",
      icon: ChartColumn,
      isActive: true,
      items: [
        { title: "Today", url: "#" },
        { title: "Weekly", url: "#" },
        { title: "Monthly", url: "#" },
      ],
    },
        {
      title: "Analytics",
      url: "/admin/analytics",
      icon: TrendingUp,
      isActive: true,
      items: [
        { title: "Today", url: "#" },
        { title: "Weekly", url: "#" },
        { title: "Monthly", url: "#" },
      ],
    },
    {
      title: "Customers",
      url: "/admin/customer",
      icon: Users,
      items: [
        { title: "Pending", url: "#" },
        { title: "Confirmed", url: "#" },
        { title: "Completed", url: "#" },
      ],
    },
       {
      title: "Bookings",
      url: "/admin/my-booking",
      icon: Calendar,
      items: [
        { title: "Pending", url: "#" },
        { title: "Confirmed", url: "#" },
        { title: "Completed", url: "#" },
      ],
    },
    {
      title: "Add Theme",
      url: "/admin/event-theme",
      icon: Palette,
      items: [
        { title: "Wedding", url: "#" },
        { title: "Corporate", url: "#" },
        { title: "Birthday", url: "#" },
      ],
    },
      {
      title: "Employees",
      url: "/admin/employees",
      icon: CircleUser,
      items: [
        { title: "Wedding", url: "#" },
        { title: "Corporate", url: "#" },
        { title: "Birthday", url: "#" },
      ],
    },
      {
      title: "Add Task",
      url: "/admin/add-tasks",
      icon: ClipboardList,
      items: [
        { title: "Wedding", url: "#" },
        { title: "Corporate", url: "#" },
        { title: "Birthday", url: "#" },
      ],
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: IndianRupee,
      items: [
        { title: "Invoices", url: "#" },
        { title: "Payouts", url: "#" },
        { title: "Disputes", url: "#" },
      ],
    },
  ],
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { data: adminData } = useQuery({
    queryKey: ["admin-me-sidebar"],
    queryFn: fetchAdminMe,
  });


  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      navigate("/");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const queryUser = adminData?.user ?? adminData?.admin?.userId ?? adminData?.result;
  const user = {
    name:
      `${queryUser?.firstName || queryUser?.firstname || ""} ${queryUser?.lastName || queryUser?.lastname || ""}`.trim() ||
      "Admin User",
    email: queryUser?.email || "",
    avatar: queryUser?.profileImageUrl || queryUser?.profileImage || "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Sheet>
          <SidebarMenu>
            <SidebarMenuItem>
              <SheetTrigger asChild>
                <SidebarMenuButton tooltip="Need Help?" size="lg">
                  <LifeBuoy />
                  <span>Need Help?</span>
                </SidebarMenuButton>
              </SheetTrigger>
            </SidebarMenuItem>
          </SidebarMenu>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className="flex w-full items-center justify-center p-6 pt-14 sm:max-w-3xl"
          >
            <div className="w-full">
              <LiveChatLayoutAdmin />
            </div>
          </SheetContent>
        </Sheet>
        <NavUser
          user={user}
          onLogout={() => logoutMutation.mutate()}
          AccountEditor={ProfileEditorAdmin}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
