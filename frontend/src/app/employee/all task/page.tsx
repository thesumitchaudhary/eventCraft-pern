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
} from "../../../components/ui/breadcrumb";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { CircleAlert, CircleCheck, ClipboardList, Clock4, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UpdateTaskModal from "../../../components/update-task-modal";

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
  createdAt: string;
  selectDate: string;
  eventId?: EventSummary;
}

interface EmployeeTasksResponse {
  employee?: {
    tasks?: EmployeeTask[];
  };
  message?: string;
}

const API_EMPLOYEE_BACKEND_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });

  const body = (await res.json()) as EmployeeTasksResponse;

  if (!res.ok) {
    throw new Error(body.message || "Request Failed");
  }

  return body as T;
};

export default function AdminDashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);

  const { data } = useQuery<EmployeeTasksResponse, Error>({
    queryKey: ["employee-my-task"],
    queryFn: () =>
      fetcher<EmployeeTasksResponse>(
        `${API_EMPLOYEE_BACKEND_URL}/myTask`,
      ),
  });

  const tasks = data?.employee?.tasks ?? [];
  const pendingTasks = tasks.filter((task) => task.status.toLowerCase() === "pending");
  const inProgressTasks = tasks.filter((task) => {
    const status = task.status.toLowerCase();
    return status === "in-progress" || status === "in progress";
  });
  const completedTasks = tasks.filter((task) => task.status.toLowerCase() === "completed");

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
                  <BreadcrumbPage>All Tasks</BreadcrumbPage>
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
                {" "}
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
                {pendingTasks.length > 0 ? (
                  <span className="bg-[#f54a00] text-white rounded-3xl p-1 w-25 text-xs font-semibold animate-pulse">
                    Action Needed
                  </span>
                ) : (
                  <span></span>
                )}
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

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-5 md:min-h-min">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-gray-50 p-5 rounded-2xl grid grid-rows-2"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <h4 className="text-lg ">{task.taskTitle}</h4>
                    <div className="flex gap-5">
                      <span className="text-sm px-3 p-1 rounded-full">
                        {task.priority === "Medium" ? (
                          <span className="bg-[#fef9c2] text-[#90550b] p-1 px-5 rounded-md">
                            Medium
                          </span>
                        ) : task.priority === "High" ? (
                          <span className="text-red-500 bg-red-200  p-1 px-5 rounded-md">
                            High
                          </span>
                        ) : (
                          <span className="bg-[#dbfce7] text-[#157441]  p-1 px-5 rounded-md">
                            Low
                          </span>
                        )}
                      </span>
                      <span className="flex gap-1 text-xs bg-black text-white px-3 py-1 rounded-xl">
                        <Clock4 className="h-4 w-4" /> {task.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400">
                    {/* Arrange floral decorations for the Johnson wedding at Grand
                   Hotel */}
                    {task.taskDescription}
                  </p>
                </div>

                <div className="p-4 bg-purple-100 rounded-md border border-purple-500">
                  <div>
                    <span>Event Details</span>
                  </div>
                  <div>
                    <p className="grid grid-cols-2">
                      <span className="text-gray-600">
                        Event:{" "}
                        <span className="text-black ">
                          {task?.eventId?.eventName}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        Progress:{" "}
                        <span className="text-blackl">
                          {task?.eventId?.progress}%
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 mt-7">
                  <div>
                    <p>Created</p>
                    <p className="font-bold text-xs">
                      {/* 2026-01-15 */}
                      {new Date(task?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>Due Date</p>
                    <p className="font-bold text-xs">
                      {/* 2026-01-25 */}
                      {new Date(task?.selectDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>Priority</p>
                    <p className="font-bold text-xs">
                      {task.priority === "Medium" ? (
                        <span>Medium</span>
                      ) : task.priority === "High" ? (
                        <span>High</span>
                      ) : (
                        <span>Low</span>
                      )}
                    </p>
                  </div>
                </div>
                {/* <div className="flex flex-col my-4 bg-gray-100 p-2 rounded-2xl">
                  <span className="text-gray-600 font-bold text-xs">
                    Work Updates:
                  </span>
                  <span className="text-gray-400">
                    Floral arrangements ordered. Setting up stage decorations.
                  </span>
                </div> */}
                <div className="my-5 flex justify-end">
                  <button
                    className="flex p-2 rounded-2xl bg-black text-white"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Upload />
                    <span>update Statues</span>
                  </button>
                </div>
              </div>
            ))}
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
