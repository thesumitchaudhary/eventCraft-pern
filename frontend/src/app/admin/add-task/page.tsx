import { useState } from "react";
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
import { Button } from "../../../components/ui/button";
import { ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AssignTaskModal from "../../../components/assign-task";

const API_EMPLOYEE_URL =
  import.meta.env.VITE_EMPLOYEE_BACKEND_URL ??
  "http://localhost:4041/api/employee";

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: "include" });

  const body = await res.json();

  if (!res.ok) {
    throw new Error("Request Failed");
  }

  return body;
};

export default function AdminThemePage() {
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["allTaskDetails"],
    queryFn: () => fetcher(`${API_EMPLOYEE_URL}/findEmployee`),
  });

  const users = Array.isArray(data)
    ? data
    : Array.isArray(data?.users)
      ? data.users
      : [];
  const details = Array.isArray(data?.details) ? data.details : [];

  // merge users + details (match by userId if available, else by index)
  const employees = users.map((user, index) => {
    const detail =
      details.find((d) => d.userId === user._id || d.user?._id === user._id) ||
      details[index] ||
      {};

    return { ...user, ...detail };
  });

  const taskRows = employees.flatMap((employee) =>
    (employee?.tasks || []).map((task, idx) => ({
      rowKey: `${employee._id || employee.userId || "emp"}-${task?._id || idx}`,
      taskTitle: task?.taskTitle || "-",
      taskDescription: task?.taskDescription || "-",
      assignedTo:
        `${employee?.firstname || ""} ${employee?.lastname || ""}`.trim() ||
        "-",
      priority: task?.priority || "-",
      status: task?.status || "-",
      dueDate: task?.selectDate,
      createdAt: task?.createdAt,
    })),
  );

  const formatDate = (value) => {
    const d = value ? new Date(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : "-";
  };

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
                  <BreadcrumbPage>Assign Task</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-250">
          <div className="rounded-xl flex justify-between bg-muted/50 p-4">
            <div>
              <h2 className="text-lg font-semibold">Task Management</h2>
            </div>
            <div>
              <Button
                variant="outline"
                className="flex bg-black text-white hover:bg-black hover:text-white"
                onClick={() => setIsAssignTaskOpen(true)}
              >
                <ClipboardList /> Assign Task
              </Button>
            </div>
          </div>

          <div className="min-h-[60vh] rounded-xl bg-[#fefdfe] p-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead className="  text-sm uppercase tracking-wide">
                  <tr className="border-b-2 border-black  text-left">
                    <th className="w-[22%] px-4 py-3 text-left">Task</th>
                    <th className="w-[28%] px-4 py-3 text-left">Description</th>
                    <th className="w-[14%] px-4 py-3 text-left">Assigned To</th>
                    <th className="w-[10%] px-4 py-3 text-left">Priority</th>
                    <th className="w-[10%] px-4 py-3 text-left">Status</th>
                    <th className="w-[8%] px-4 py-3 text-left">Due Date</th>
                    <th className="w-[8%] px-4 py-3 text-left">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {taskRows.map((row) => (
                    <tr
                      key={row.rowKey}
                      className="border-b border-black hover:bg-gray-50 transition"
                    >
                      {/* Task */}
                      <td className="px-4 py-3 font-medium text-gray-800 truncate">
                        {row.taskTitle}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-sm text-gray-600 line-clamp-2">
                        {row.taskDescription}
                      </td>

                      {/* Assigned */}
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap capitalize">
                        {row.assignedTo}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full
                ${
                  row.priority === "High"
                    ? "bg-red-100 text-red-600"
                    : row.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-600"
                }`}
                        >
                          {row.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-3">
                        <span className="text-xs font-medium px-1 py-1 rounded-full bg-gray-900 text-white">
                          {row.status}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(row.dueDate)}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AssignTaskModal
          open={isAssignTaskOpen}
          closeTaskModal={() => setIsAssignTaskOpen(false)}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
