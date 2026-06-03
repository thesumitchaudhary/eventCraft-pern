"use client";

import React, { useState } from "react";
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
import { Button } from "../../../components/ui/button";
import UpdateTaskModal from "../../../components/update-task-modal";

type TaskPriority = "Low" | "Medium" | "High";
type TaskStatus = "pending" | "in-progress" | "in progress" | "completed" | string;

type Task = {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  priority: TaskPriority;
  status: TaskStatus;
  selectDate: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  

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
                  <BreadcrumbPage>In Progress</BreadcrumbPage>
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
            {activeTasks.length === 0 ? (
              <div className="bg-gray-50 p-40 rounded-2xl grid place-items-center">
                <div>
                  <CircleCheck className="text-green-500 h-20 w-30" />
                  No pending tasks!
                </div>
              </div>
            ) : (
              <div>
                {activeTasks.map((task) => {
                  return (
                    <div key={task._id} className="bg-gray-50 p-4 rounded-2xl">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{task.taskTitle}</h4>
                        <span className="text-xs p-1  rounded-2xl">
                          {task.priority === "Medium" ? (
                            <span className="bg-[#fef9c2] text-[#90550b] p-1 rounded-md px-5">
                              Medium
                            </span>
                          ) : task.priority === "High" ? (
                            <span className="text-red-500 bg-red-200 px-5">
                              High
                            </span>
                          ) : (
                            <span className="bg-[#dbfce7] text-[#157441] px-5">
                              Low
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span>{task.taskDescription}</span>
                      </div>
                      {/* <div className="flex flex-col p-4 bg-blue-50 mt-5 rounded-2xl">
                        <h5 className="text-blue-900 font-bold">
                          Latest Update:
                        </h5>
                        <span className="text-blue-600">
                          Floral arrangements ordered. Setting up stage
                          decorations.
                        </span>
                      </div> */}
                      <div className="flex justify-between mt-5">
                        <span>
                          Due: {new Date(task.selectDate).toLocaleDateString()}
                        </span>
                        <Button
                          className="bg-black text-white p-2 rounded-2xl"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsDialogOpen(true);
                          }}
                        >
                          Update Progress
                        </Button>
                      </div>
                    
                    </div>
                  );
                })}
              </div>
            )}
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
