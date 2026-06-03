import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { TextInput } from "@mantine/core";

import { Context } from "../context/Context";
import { Button } from "../components/ui/button";

type CreateUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

type VerifyCodePayload = {
  code: string;
  email: string;
};

const CUSTOMER_API_URL = import.meta.env.VITE_CUSTOMER_BACKEND_URL;
// console.log(CUSTOMER_API_URL);

const userCreate = async ({
  firstname,
  lastname,
  email,
  password,
  confirmPassword,
  phone,
}: CreateUserPayload) => {
  try {
    const response = await fetch(`${CUSTOMER_API_URL}/createUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        phone,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("Fetch error:", error);
    throw error;
  }
};

const verifyCode = async ({ code, email }: VerifyCodePayload) => {
  try {
    const res = await fetch(`${CUSTOMER_API_URL}/verifyEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, email }),
    });

    if (!res.ok) throw new Error("Internal server Error");
    return res.json();
  } catch (error) {
    console.log("Fetch error:", error);
    throw error;
  }
};

const SignupForm = () => {
  const navigate = useNavigate();

  const {
    firstname,
    setFirstname,
    lastname,
    setLastname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    phone,
    setPhone,
    otp,
    setOtp,
  } = useContext(Context);

  const [errorMessage, setErrorMessage] = useState("");
  const [showVerifyFunctionality, setShowVerifyFunctionality] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const [focusedFirstname, setFocusedFirstname] = useState(false);
  const [focusedLastname, setFocusedLastname] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [focusedConfirmPassword, setFocusedConfirmPassword] = useState(false);
  const [focusedPhone, setFocusedPhone] = useState(false);
  const [focusedOtp, setFocusedOtp] = useState(false);

  const floatingFirstname = focusedFirstname || firstname?.length > 0;
  const floatingLastname = focusedLastname || lastname?.length > 0;
  const floatingEmail = focusedEmail || email?.length > 0;
  const floatingPassword = focusedPassword || password?.length > 0;
  const floatingConfirmedPassowrd =
    focusedConfirmPassword || confirmPassword?.length > 0;
  const floatingPhone = focusedPhone || phone?.length > 0;
  const floatingOtp = focusedOtp || otp?.length > 0;

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setOtp("");
    setShowVerifyFunctionality(false);
  };

  const userMutation = useMutation({
    mutationFn: () =>
      userCreate({
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        phone,
      }),
    onSuccess: () => {
      setErrorMessage("");
      setShowVerifyFunctionality(true);
      // Clear only the signup form fields, not the email (needed for verification)
      setFirstname("");
      setLastname("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setOtp("");
    },
    onError: (error) => {
      console.log("error", error);
      setErrorMessage("Email already exists or another error occurred.");
    },
  });

  const codeMutation = useMutation({
    mutationFn: () => verifyCode({ code: otp, email }),
    onSuccess: () => {
      setErrorMessage("");
      resetForm();
      navigate("/customer/dashboard");
    },
    onError: (error) => {
      console.log("error", error);
      setErrorMessage("There was a problem verifying the code.");
    },
  });

  const handleSubmit = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    userMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-3">
      <TextInput
        label="FirstName"
        value={firstname}
        onChange={(e) => setFirstname(e.currentTarget.value)}
        onFocus={() => setFocusedFirstname(true)}
        onBlur={() => setFocusedFirstname(false)}
        classNames={{
          root: "relative mt-1",
          input:
            "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
          label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
            floatingFirstname ? "-translate-y-5 text-xs text-foreground" : ""
          }`,
        }}
      />

      <TextInput
        label="LastName"
        value={lastname}
        onChange={(e) => setLastname(e.currentTarget.value)}
        onFocus={() => setFocusedLastname(true)}
        onBlur={() => setFocusedLastname(false)}
        classNames={{
          root: "relative mt-1",
          input:
            "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
          label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
            floatingLastname ? "-translate-y-5 text-xs text-foreground" : ""
          }`,
        }}
      />

      <TextInput
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        onFocus={() => setFocusedEmail(true)}
        onBlur={() => setFocusedEmail(false)}
        classNames={{
          root: "relative mt-1",
          input:
            "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
          label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
            floatingEmail ? "-translate-y-5 text-xs text-foreground" : ""
          }`,
        }}
      />

      <div className="relative">
        <TextInput
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onFocus={() => setFocusedPassword(true)}
          onBlur={() => setFocusedPassword(false)}
          classNames={{
            root: "relative mt-1",
            input:
              "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
            label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
              floatingPassword ? "-translate-y-5 text-xs text-foreground" : ""
            }`,
          }}
        />
        {showPassword ? (
          <button
            className="absolute top-0 left-96"
            onClick={() => setShowPassword(false)}
          >
            <Eye />
          </button>
        ) : (
          <button
            className="absolute top-0 left-96"
            onClick={() => setShowPassword(true)}
          >
            <EyeOff />
          </button>
        )}
      </div>

      <div className="relative">
        <TextInput
          label="Confirmed Password"
          type={showConfirmedPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          onFocus={() => setFocusedConfirmPassword(true)}
          onBlur={() => setFocusedConfirmPassword(false)}
          classNames={{
            root: "relative mt-1",
            input:
              "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
            label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
              floatingConfirmedPassowrd
                ? "-translate-y-5 text-xs text-foreground"
                : ""
            }`,
          }}
        />

        {showConfirmedPassword ? (
          <button
            className="absolute top-0 left-96"
            onClick={() => setShowConfirmedPassword(false)}
          >
            <Eye />
          </button>
        ) : (
          <button
            className="absolute top-0 left-96"
            onClick={() => setShowConfirmedPassword(true)}
          >
            <EyeOff />
          </button>
        )}
      </div>

      <TextInput
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.currentTarget.value)}
        onFocus={() => setFocusedPhone(true)}
        onBlur={() => setFocusedPhone(false)}
        classNames={{
          root: "relative mt-1",
          input:
            "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
          label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
            floatingPhone ? "-translate-y-5 text-xs text-foreground" : ""
          }`,
        }}
      />

      {showVerifyFunctionality && (
        <span className="text-sm font-bold text-foreground">
          Verify Your OTP
        </span>
      )}

      {showVerifyFunctionality && (
        <TextInput
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.currentTarget.value)}
          onFocus={() => setFocusedOtp(true)}
          onBlur={() => setFocusedOtp(false)}
          classNames={{
            root: "relative mt-1",
            input:
              "block w-full rounded-none !border-0 !border-b-2 border-solid bg-transparent px-0 pt-5 pb-1 focus:border-primary focus:outline-none",
            label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-muted-foreground transition-all duration-100 ease-in-out ${
              floatingOtp ? "-translate-y-5 text-xs text-foreground" : ""
            }`,
          }}
        />
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {!showVerifyFunctionality ? (
        <Button onClick={handleSubmit} className="w-full">
          {userMutation.isPending ? "Creating..." : "Create Account"}
        </Button>
      ) : (
        <Button
          onClick={() => codeMutation.mutate()}
          className="w-full"
          disabled={codeMutation.isPending}
        >
          {codeMutation.isPending ? "Verifying..." : "Verify OTP"}
        </Button>
      )}
    </div>
  );
};

export default SignupForm;
