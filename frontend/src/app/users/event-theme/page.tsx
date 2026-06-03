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

const API_URL_ADMIN = import.meta.env.VITE_ADMIN_BACKEND_URL;

interface EventTheme {
  _id: string;
  themeName: string;
  themeType: string;
  themePrice: number;
}

const fetcher = async (url: string): Promise<EventTheme[]> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch event themes");
  }

  return res.json();
};

export default function Page() {
  const { data = [], isLoading } = useQuery<EventTheme[]>({
    queryKey: ["eventThemesDetails"],
    queryFn: () => fetcher(`${API_URL_ADMIN}/getAllEventTheme`),
  });

  // console.log(data?.result?.map((theme: EventTheme) => theme.themeName));

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
                  <BreadcrumbPage>Event Theme</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="my-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>Loading themes...</p>
            ) : (
              data?.result?.map((theme: EventTheme) => (
                <div
                  key={theme._id}
                  className="w-full rounded-2xl border border-gray-400 px-4 py-5"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold">{theme.themeName}</h3>
                    <p>{theme.themeType}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <h3 className="text-2xl font-bold text-purple-600 flex ">
                      <IndianRupee className="h-5 w-5 mt-1" />{" "}
                      {theme.themePrice}
                    </h3>
                    <p>Base package price</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
