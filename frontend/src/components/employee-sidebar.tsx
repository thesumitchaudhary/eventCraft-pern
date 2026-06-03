"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Frame,
  Map,
  PieChart,
  Calendar,
  CreditCard,
  TrendingUp,
  Palette,
  LifeBuoy,
} from "lucide-react";

import LiveChatLayoutEmployee from "@/components/live-chat-layout-employee";
import { NavMain } from "@/components/nav-main";
import { ProfileEditorEmployee } from "./profile-editor-employee";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const EMPLOYEE_API_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const sidebarData = {
  teams: [
    {
      name: "Event Craft",
      logo: Calendar,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "All Tasks",
      url: "/employee",
      icon: TrendingUp ,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Pending",
      url: "/employee/pending",
      icon: Calendar,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "In Progress",
      url: "/employee/in-progress",
      icon: Palette,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Completed",
      url: "/employee/completed",
      icon: CreditCard,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

type EmployeeUserShape = {
  firstname?: string;
  firstName?: string;
  lastname?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  profileImage?: string;
};

type EmployeeProfileResponse = {
  employee?: {
    userId?: EmployeeUserShape;
  };
};

const fetchMe = async (): Promise<EmployeeProfileResponse> => {
  const res = await fetch(`${EMPLOYEE_API_URL}/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch employee profile: ${res.status}`);
  }

  return res.json();
};

const logoutUser = async () => {
  const res = await fetch(`${BASE_URL}/employee/logout`, {
    method: "GET",
    credentials: "include",
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || "Logout failed");
  }

  return body;
};

export function EmployeeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["employee-sidebar-profile"],
    queryFn: fetchMe,
  });

  const employeeLogoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      navigate("/", { replace: true });
    },
    onError: (error) => {
      if (error instanceof Error) {
        console.error("Logout failed:", error.message);
        return;
      }

      console.error("Logout failed:", error);
    },
  });

  const queryUser = data?.employee?.userId;
  const user = {
    name:
      `${queryUser?.firstName || queryUser?.firstname || ""} ${queryUser?.lastName || queryUser?.lastname || ""}`.trim() ||
      "Employee",
    email: queryUser?.email || "",
    avatar: queryUser?.profileImageUrl || queryUser?.profileImage || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
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
          <SheetContent side={isMobile ? "bottom" : "right"} className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Need Help?</SheetTitle>
              <SheetDescription>
                Tell us what you are stuck on and we will help you quickly.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <LiveChatLayoutEmployee />
            </div>
          </SheetContent>
        </Sheet>
        <NavUser
          user={user}
          AccountEditor={ProfileEditorEmployee}
          onLogout={() => employeeLogoutMutation.mutate()}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
