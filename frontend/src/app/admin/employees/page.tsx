import { useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
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
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import AddEmployeeModal from "@/components/add-employee";

const API_EMPLOYEE_BACKEND_URL = import.meta.env.VITE_EMPLOYEE_BACKEND_URL;

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: "include" });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message || "Request Failed");
  }

  return body;
};

export default function AdminThemePage() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["showemployee"],
    queryFn: () => fetcher(`${API_EMPLOYEE_BACKEND_URL}/findEmployee`),
  });

  // normalize response safely
  const users = Array.isArray(data)
    ? data
    : Array.isArray(data?.result)
      ? data.result
      : [];
  const details = Array.isArray(data?.details) ? data.details : [];

  // merge users + details (match by userId if available, else by index)
  const employees = users.map((user, index) => {
    const detail =
      details.find((d) => d.userId === user._id || d.user?._id === user._id) ||
      details[index] ||
      {};

    return {
      ...user,
      ...detail,
    };
  });

  // console.log(users.map((user) => user.firstname));
  const completed = details
    .flatMap((detail) => detail?.tasks || [])
    .filter((task) => task?.status === "in-progress").length;
  console.log(completed);

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
                  <BreadcrumbPage>Employees</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between">
            <div>
              <h3>Employee Management</h3>
            </div>
            <div>
              <Button
                variant="outline"
                className="bg-black text-white hover:bg-black hover:text-white"
                onClick={() => setIsAddEmployeeOpen(true)}
              >
                <UserPlus /> Add Employee
              </Button>
            </div>
          </div>
          <div className="grid auto-rows-4 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#fefdfe] p-5">
              <div className="flex gap-1">
                <h3>Total Employees</h3>
              </div>
              <span>{employees.length}</span>
            </div>
            <div className="rounded-xl bg-[#fefdfe] p-5">
              <div className="flex gap-1">
                <h3>Active Tasks</h3>
              </div>
              <span>
                {
                  details
                    .flatMap((detail) => detail?.tasks || [])
                    .filter((task) => task?.status === "in-progress").length
                }
              </span>
            </div>
            <div className="rounded-xl bg-[#fefdfe] p-5">
              <div className="flex gap-1">
                <h3>Completed Tasks</h3>
              </div>
              <span>
                {
                  details
                    .flatMap((detail) => detail?.tasks || [])
                    .filter((task) => task?.status === "completed").length
                }
              </span>
            </div>
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl bg-[#fefdfe] p-5 md:min-h-min">
            <table className="w-full my-3 border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Designation</th>
                  <th className="py-2">Joining Date</th>
                  <th className="py-2">Assigned Tasks</th>
                </tr>
              </thead>
              <tbody>
                {employees?.length ? (
                  employees.map((employee, index) => (
                    <tr
                      key={employee?._id || employee?.userId || `emp-${index}`}
                      className="border-b border-black"
                    >
                      <td className="py-2 border-b p-1">
                        {[employee?.firstname, employee?.lastname]
                          .filter(Boolean)
                          .join(" ") || "N/A"}
                      </td>
                      <td className="border-b p-1">{employee?.email}</td>
                      <td className="border-b p-1">{employee?.phone}</td>
                      <td className="border-b p-1">{employee?.designation}</td>
                      <td className="border-b p-1">
                        {new Date(employee?.joiningDate).toLocaleDateString()}
                      </td>
                      <td className="border-b p-1">
                        <span>{Array.isArray(employee?.tasks) ? employee.tasks.length : 0}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 t ext-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>   
          </div>
        </div>

        {isAddEmployeeOpen && (
          <AddEmployeeModal
            closeAddEmployeeModal={() => setIsAddEmployeeOpen(false)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
