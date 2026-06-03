"use client";

import { EmployeeSidebar } from "../../../components/employee-sidebar";
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
import { CircleAlert, CircleCheck, Clock4, ClipboardList } from "lucide-react";

type TaskPriority = "Low" | "Medium" | "High";
type TaskStatus = "pending" | "in-progress" | "in progress" | "completed" | string;

type Task = {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  priority: TaskPriority;
  status: TaskStatus;
  selectDate: string;
  completionNotes?: string;
};

type EmployeeTaskResponse = {
  employee?: {
    tasks?: Task[];
  };
  message?: string;
};

const API_EMPLOYEE_BACKEND_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;

const fetcher = async (url: string): Promise<EmployeeTaskResponse> => {
  const res = await fetch(url, { credentials: "include" });
  const body: EmployeeTaskResponse = await res.json();

  if (!res.ok) {
    throw new Error(body.message || "Request Failed");
  }

  return body;
};

export default function Page() {
  const { data } = useQuery<EmployeeTaskResponse>({
    queryKey: ["employee-my-task"],
    queryFn: () => fetcher(`${API_EMPLOYEE_BACKEND_URL}/myTask`),
  });

  const tasks = data?.employee?.tasks ?? [];
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress" || task.status === "in progress",
  );
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <SidebarProvider>
      <EmployeeSidebar />
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
                  <BreadcrumbLink href="#">Employee dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Completed</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="w-full rounded-2xl border border-gray-300 border-l-4 border-l-gray-600 bg-gray-50 p-8">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-gray-600" />
                <p>Total Tasks</p>
              </div>
              <h1 className="text-xl font-bold text-gray-700">{tasks.length}</h1>
            </div>
            <div className="w-full rounded-2xl border border-gray-300 border-l-4 border-l-[#f54a00] bg-gray-50 p-8">
              <div className="flex items-center gap-2">
                <Clock4 className="h-5 w-5 text-[#f54a00]" />
                <p>Pending</p>
              </div>
              <h1 className="text-xl font-bold text-[#f54a00]">{pendingTasks.length}</h1>
            </div>
            <div className="w-full rounded-2xl border border-gray-300 border-l-4 border-l-[#155dfc] bg-gray-50 p-8">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-5 w-5 text-[#155dfc]" />
                <p>In Progress</p>
              </div>
              <h1 className="text-xl font-bold text-[#155dfc]">{inProgressTasks.length}</h1>
            </div>
            <div className="w-full rounded-2xl border border-gray-300 border-l-4 border-l-[#00a63e] bg-gray-50 p-8">
              <div className="flex items-center gap-2">
                <CircleCheck className="h-5 w-5 text-[#00a63e]" />
                <p>Completed</p>
              </div>
              <h1 className="text-xl font-bold text-[#00a63e]">{completedTasks.length}</h1>
            </div>
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-5 md:min-h-min">
            {completedTasks.length === 0 ? (
            <div className="bg-gray-50 p-40 rounded-2xl grid place-items-center">
              <div>
                <CircleCheck className="text-green-500 h-20 w-30" />
                No completed tasks!
              </div>
            </div>
          ) : (
            <div>
              {completedTasks.map((task) => {
                return (
                  <div
                    key={task._id}
                    className="bg-green-50 p-5 border border-green-300 rounded-2xl"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4>{task.taskTitle}</h4>
                      </div>
                      <div className="bg-green-300 max-w-max px-3 p-1 rounded-2xl flex gap-1">
                        <CircleCheck className="fill-green-300 text-green-400" />
                        <span>Completed</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span>{task.taskDescription}</span>
                    </div>
                    <div className="grid grid-rows-2 mt-4 bg-white p-2 rounded-2xl">
                      <h5 className="text-2xs font-bold">Completion Notes:</h5>
                      <span className="text-gray-600">
                        {task.completionNotes || "No completion notes provided."}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
