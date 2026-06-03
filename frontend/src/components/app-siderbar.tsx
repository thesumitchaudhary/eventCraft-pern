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

import { NavMain } from "@/components/nav-main";
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
import LiveChatLayout from "@/components/live-chat-layout";

type UserShape = {
  _id?: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  email?: string;
  profileImageUrl?: string;
  profileImage?: string;
};

type CustomerShape = {
  userId?: UserShape;
};

type CustomerMeResponse = {
  result?: UserShape;
};

const API_URL = import.meta.env.VITE_BACKEND_URL as string;

const fetchMe = async (): Promise<CustomerMeResponse> => {
  const res = await fetch(`${API_URL}/customer/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }

  return res.json();
};

const logoutUser = async () => {
  const res = await fetch(`${API_URL}/customer/logout`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
};

const sidebarData = {
  user: {
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Event Craft",
      logo: Calendar,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/customer/dashboard",
      icon: TrendingUp,
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
      title: "My Bookings",
      url: "/customer/myBooking",
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
      title: "Event Themes",
      url: "/customer/EventTheme",
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
      title: "Payments",
      url: "/customer/payments",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchMe,
  });

  console.log(data?.result?.firstName ?? data?.result?.firstname);

  const queryUser = data?.result;
  const user = {
    name:
      `${queryUser?.firstName || queryUser?.firstname || ""} ${queryUser?.lastName || queryUser?.lastname || ""}`.trim() ||
      sidebarData.user.name,
    email: queryUser?.email || sidebarData.user.email,
    avatar:
      queryUser?.profileImageUrl ||
      queryUser?.profileImage ||
      sidebarData.user.avatar,
  };

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      navigate("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={sidebarData.projects} /> */}
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
            className="sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Need Help?</SheetTitle>
              <SheetDescription>
                Tell us what you are stuck on and we will help you quickly.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              <LiveChatLayout />
            </div>
          </SheetContent>
        </Sheet>
        <NavUser user={user} onLogout={() => logoutMutation.mutate()} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
