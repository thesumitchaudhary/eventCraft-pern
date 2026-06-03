"use client";

import { useState } from "react";
import { EmployeeSidebar } from "../../../components/employee-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import UpdateTaskModal from "@/components/update-task-modal";
import {
  Calendar,
  CircleAlert,
  CircleCheck,
  Clock4,
  ClipboardList,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type TaskPriority = "Low" | "Medium" | "High";

interface EventSummary {
  eventName?: string;
  progress?: number;
}

interface EmployeeTask {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  priority: TaskPriority;
  status: string;
  selectDate: string;
  eventId?: EventSummary;
}

interface EmployeeTaskResponse {
  employee?: {
    tasks?: EmployeeTask[];
  };
  message?: string;
}

const API_EMPLOYEE_BACKEND_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;

type ApiError = Error & { status?: number };

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store", // prevents 304 cache validation flow
    headers: {
      Accept: "application/json",
    },
  });

  let body: EmployeeTaskResponse = {};
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      body = (await res.json()) as EmployeeTaskResponse;
    } catch {
      body = {};
    }
  }

  if (!res.ok) {
    const err: ApiError = new Error(
      body.message || `Request failed (${res.status})`,
    );
    err.status = res.status;
    throw err;
  }

  return body as T;
};

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);

  const { data, isLoading, isError, error } = useQuery<
    EmployeeTaskResponse,
    ApiError
  >({
    queryKey: ["employee-my-task"],
    queryFn: () =>
      fetcher<EmployeeTaskResponse>(
        `${API_EMPLOYEE_BACKEND_URL}/myTask`,
      ),
  });

  const pendingTasks =
    data?.employee?.tasks?.filter((task) => task.status !== "in-progress") || [];

    console.log(pendingTasks)

  const tasks = data?.employee?.tasks ?? [];
  // const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  );
  const completedTasks = tasks.filter((task) => task.status === "completed");

  if (isLoading) {
    return (
      <div className="bg-[#ededed] min-h-screen">
        <main className="my-10 mx-5">Loading...</main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#ededed] min-h-screen">
        <main className="my-10 mx-5 text-red-600">
          {error?.message || "Failed to load tasks"}
        </main>
      </div>
    );
  }

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
                  <BreadcrumbPage>Pending</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="w-full bg-gray-50 rounded-2xl p-10 border border-gray-300 border-l-6 border-l-gray-600">
              <div className="flex gap-1">
                <ClipboardList className="h-5 w-4 font-semibold text-gray-600" />
                <p>Total Tasks</p>
              </div>
              <h1 className="text-xl font-bold text-gray-600">
                {tasks.length}
              </h1>
            </div>
            <div className="w-full bg-gray-50 rounded-2xl p-10 border border-gray-300 border-l-6 border-l-[#f54a00]">
              <div className="flex gap-1">
                <Clock4 className="max-h-5 max-w-4 font-semibold" />
                <p>Pending</p>
              </div>
              <div className="flex gap-3">
                <h1 className="text-xl font-bold text-[#f54a00]">
                  {pendingTasks.length}
                </h1>
              </div>
            </div>
            <div className="w-full bg-gray-50 rounded-2xl p-10 border border-gray-300 border-l-6 border-l-[#155dfc]">
              <div className="flex gap-1">
                <CircleAlert className="max-h-5 max-w-4 font-semibold" />
                <p>In Progress</p>
              </div>
              <div className="flex gap-2">
                <h1 className="text-xl font-bold text-[#155dfc]">
                  {inProgressTasks.length}
                </h1>
            
              </div>
            </div>
            <div className="w-full bg-gray-50 rounded-2xl p-10 border border-gray-300 border-l-6 border-l-[#00a63e]">
              <div className="flex gap-1">
                <CircleCheck className="max-h-5 max-w-4 font-semibold" />
                <p>Completed</p>
              </div>
              <h1 className="text-xl font-bold text-[#00a63e]">
                {completedTasks.length}
              </h1>
            </div>
          </div>

          <div className="flex-1 rounded-xl bg-muted/50 p-5 md:min-h-min">

            <section className="my-10 mx-5">
              {pendingTasks.length === 0 ? (
                <div className="bg-gray-50 p-40 rounded-2xl grid place-items-center">
                  <div className="text-center">
                    <CircleCheck className="text-green-500 h-20 w-20 mx-auto" />
                    No pending tasks!
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingTasks.map((task, index) => {
                    const progress = task.eventId?.progress ?? 0;

                    return (
                      <div
                        key={task._id}
                        className="bg-gray-50 p-5 border border-[#ff6b00] rounded-2xl grid gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <h4 className="text-lg flex items-center gap-2">
                              <span className="h-9 w-8 bg-[#ffedd4] text-white p-1 rounded-full">
                                <ClipboardList className="text-[#ff6b00]" />
                              </span>
                              {task.taskTitle}
                            </h4>
                            <div className="flex gap-5">
                              <span className="bg-[#ff6b00] h-12 min-w-12 p-3 rounded-full text-xl font-semibold text-white text-center">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400">
                            {task.taskDescription}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm px-3 p-1 rounded-full">
                            {task.priority === "Medium" ? (
                              <span className="bg-[#fef9c2] text-[#90550b] p-1 rounded-md">
                                Medium
                              </span>
                            ) : task.priority === "High" ? (
                              <span className="text-red-500 bg-red-200 p-1 rounded-md">
                                High
                              </span>
                            ) : (
                              <span className="bg-[#dbfce7] text-[#157441] p-1 rounded-md">
                                Low
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="mt-4 rounded-3xl border border-[#cfb7f3] bg-[#f4f5fb] p-6 md:p-7">
                          <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#9d4edd]">
                              <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-[#3c147f] md:text-xl">
                              Linked Event
                            </h3>
                          </div>

                          <div className="mt-7 space-y-7 pl-1">
                            <div>
                              <p className="text-3xl text-[#415a77]">
                                Event Name
                              </p>
                              <p className="mt-2 text-xl font-semibold text-[#0b1d3a]">
                                {task.eventId?.eventName || "N/A"}
                              </p>
                            </div>

                            <div>
                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-xl text-[#415a77]">
                                  Overall Progress
                                </p>
                                <span className="text-xl font-semibold text-[#8a2be2]">
                                  {progress}%
                                </span>
                              </div>

                              <div className="h-5 w-full rounded-full bg-[#ececf4]">
                                <div
                                  className="h-full rounded-full bg-linear-to-r from-[#9d4edd] to-[#4361ee]"
                                  style={{
                                    width: `${Math.max(0, Math.min(progress, 100))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="my-5 flex justify-between p-3 border border-orange-400 rounded-2xl items-center">
                          <div>
                            <p>Due Date:</p>
                            <span>
                              {new Date(task.selectDate).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="flex gap-1 p-2 h-10 rounded-xl bg-linear-to-r from-[#ff6b00] to-[#fe9800] text-white"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDialogOpen(true);
                            }}
                          >
                            <CircleCheck />
                            <span>start task</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {isDialogOpen && selectedTask ? (
          <UpdateTaskModal
            task={selectedTask}
            closeUpdateModal={() => {
              setIsDialogOpen(false);
              setSelectedTask(null);
            }}
          />
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
