import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Context } from "../context/Context";
import { TextInput } from "@mantine/core";
import { Eye, EyeOff } from "lucide-react";
import { syncSocketAuth } from "../socket-connection/socket";
import { Button } from "../components/ui/button";
import { API_BASE_URL } from "../lib/backend-url";

type LoginPayload = {
  email: string;
  password: string;
  role: string;
};

type LoginResponse = {
  token?: string;
  role?: string;
};

const loginUser = async ({
  email,
  password,
  role,
}: LoginPayload): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/${role}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Login failed");
  }

  return data;
};

const SigninForm = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword } = useContext(Context);

  const floatingEmail = focusedEmail || email.length > 0;
  const floatingPassword = focusedPassword || password.length > 0;

  // this is for reset form

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const pathname = location.pathname.toLowerCase();
  const role = pathname.includes("/admin")
    ? "admin"
    : pathname.includes("/employee")
      ? "employee"
      : "customer";

  const userMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      resetForm();
      setErrorMessage("");

      if (data?.token) {
        localStorage.setItem("token", data.token);
        syncSocketAuth(data.token);
      }

      const loggedInRole = (data?.role || role).toLowerCase();
      localStorage.setItem("role", loggedInRole);
      if (loggedInRole === "admin") navigate("/admin");
      else if (loggedInRole === "employee") navigate("/employee");
      else navigate("/customer/dashboard");
    },
    onError: (err: unknown) => {
      setErrorMessage(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    },
  });

  const handleSubmit = () => {
    const cleanEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setErrorMessage("");
    userMutation.mutate({ email: cleanEmail, password, role });
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="flex flex-col gap-3 w-80">
        <TextInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onFocus={() => setFocusedEmail(true)}
          onBlur={() => setFocusedEmail(false)}
          classNames={{
            root: "relative mt-1",
            input:
              "bg-transparent !border-0 !border-b-2  px-0 pt-5 pb-1 focus:outline-none focus:border-primary",
            label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
              floatingEmail ? "-translate-y-5 text-xs text-foreground" : ""
            }`,
          }}
        />
        <div className="relative">
          <TextInput
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            onFocus={() => setFocusedPassword(true)}
            onBlur={() => setFocusedPassword(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent !border-0 !border-b-2 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-primary",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
                floatingPassword ? "-translate-y-5 text-xs text-foreground" : ""
              }`,
            }}
          />
          {showPassword ? (
            <button className="absolute top-0 left-95" onClick={() => setShowPassword(false)}>
              <Eye />
            </button>
          ) : (
            <button className="absolute top-0 left-95" onClick={() => setShowPassword(true)}>
              <EyeOff />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 justify-end">
          <span className="text-xs"> If you forgot password? </span>
          <a
            href="#"
            className="text-blue-500 text-xs"
            onClick={() => setForgotPassword(true)}
          >
            forgot password
          </a>
          {forgotPassword === true ? (
            <div>
              <TextInput
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onFocus={() => setFocusedPassword(true)}
                onBlur={() => setFocusedPassword(false)}
                classNames={{
                  root: "relative mt-1",
                  input:
                    "bg-transparent !border-0 !border-b-2 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-primary",
                  label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
                    floatingPassword
                      ? "-translate-y-5 text-xs text-foreground"
                      : ""
                  }`,
                }}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button onClick={handleSubmit} disabled={userMutation.isPending}>
          {userMutation.isPending ? "Signing In..." : "Sign In"}
        </Button>
      </div>
    </div>
  );
};

export default SigninForm;
