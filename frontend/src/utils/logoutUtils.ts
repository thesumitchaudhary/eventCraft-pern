import { useNavigate } from "react-router-dom";

type UserRole = "customer" | "admin" | "employee";

const isUserRole = (value: string | null): value is UserRole => {
  return value === "customer" || value === "admin" || value === "employee";
};

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async (userRole?: UserRole) => {
    const roleEndpoints: Record<UserRole, string> = {
      customer: "/api/auth/logout",
      admin: "/api/admin/logout",
      employee: "/api/employee/logout",
    };

    const storedRole = localStorage.getItem("role");
    const resolvedRole = userRole ?? (isUserRole(storedRole) ? storedRole : "customer");

    try {
      const response = await fetch(roleEndpoints[resolvedRole], {
        method: "POST",
        credentials: "include", // Important: sends cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to home/login
        navigate("/");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return handleLogout;
};
