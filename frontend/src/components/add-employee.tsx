import { useContext, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, TextInput } from "@mantine/core";

import { Context } from "@/context/Context";

type AddEmployeeModalProps = {
  closeAddEmployeeModal: () => void;
};

const API_URL =
  import.meta.env.VITE_EMPLOYEE_BACKEND_URL ||
  "http://localhost:4041/api/employee";

type EmployeePayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  designation: string;
};

const employeeCreate = async (payload: EmployeePayload) => {
  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create employee");
  }

  return data;
};

const AddEmployeeModal = ({ closeAddEmployeeModal }: AddEmployeeModalProps) => {
  const queryClient = useQueryClient();
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
    designation,
    setDesignation,
  } = useContext(Context);

  const [focusedFirstname, setFocusedFirstname] = useState(false);
  const [focusedLastname, setFocusedLastname] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [focusedConfirmPassword, setFocusedConfirmPassword] = useState(false);
  const [focusedDesignation, setFocusedDesignation] = useState(false);

  const floatingFirstname = focusedFirstname || firstname.length > 0;
  const floatingLastname = focusedLastname || lastname.length > 0;
  const floatingEmail = focusedEmail || email.length > 0;
  const floatingPassword = focusedPassword || password.length > 0;
  const floatingConfirmPassword =
    focusedConfirmPassword || confirmPassword.length > 0;
  const floatingDesignation = focusedDesignation || designation.length > 0;

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDesignation("");
  };

  const employeeMutation = useMutation({
    mutationFn: () =>
      employeeCreate({
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        designation,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["showemployee"] });
      resetForm();
      closeAddEmployeeModal();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeAddEmployeeModal}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-300 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex justify-between">
          <div>
            <h1 className="text-base font-bold">Add New Employee</h1>
            <p className="text-sm text-gray-600">
              Create a new employee account
            </p>
          </div>
          <button
            onClick={closeAddEmployeeModal}
            aria-label="Close add employee modal"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <TextInput
            label="First Name"
            placeholder={focusedFirstname ? "e.g. Johnson" : ""}
            value={firstname}
            onChange={(e) => setFirstname(e.currentTarget.value)}
            onFocus={() => setFocusedFirstname(true)}
            onBlur={() => setFocusedFirstname(false)}
            classNames={{
              root: "relative mt-1 mt-5",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingFirstname ? "-translate-y-5 text-xs text-gray-900" : ""
              }`,
            }}
          />

          <TextInput
            label="Last Name"
            placeholder={focusedLastname ? "e.g. Smith" : ""}
            value={lastname}
            onChange={(e) => setLastname(e.currentTarget.value)}
            onFocus={() => setFocusedLastname(true)}
            onBlur={() => setFocusedLastname(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingLastname ? "-translate-y-5 text-xs text-gray-900" : ""
              }`,
            }}
          />

          <TextInput
            label="Email"
            placeholder={focusedEmail ? "employee@gmail.com" : ""}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            onFocus={() => setFocusedEmail(true)}
            onBlur={() => setFocusedEmail(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingEmail ? "-translate-y-5 text-xs text-gray-900" : ""
              }`,
            }}
          />

          <TextInput
            label="Password"
            type="password"
            placeholder={focusedPassword ? "Enter a secure password" : ""}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            onFocus={() => setFocusedPassword(true)}
            onBlur={() => setFocusedPassword(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingPassword ? "-translate-y-5 text-xs text-gray-900" : ""
              }`,
            }}
          />

          <TextInput
            label="Confirmed Passowrd"
            type="password"
            placeholder={
              focusedConfirmPassword ? "Enter a secure password" : ""
            }
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            onFocus={() => setFocusedConfirmPassword(true)}
            onBlur={() => setFocusedConfirmPassword(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingConfirmPassword
                  ? "-translate-y-5 text-xs text-gray-900"
                  : ""
              }`,
            }}
          />

          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}

          <TextInput
            label="Designation"
            placeholder={focusedDesignation ? "Event Manager" : ""}
            value={designation}
            onChange={(e) => setDesignation(e.currentTarget.value)}
            onFocus={() => setFocusedDesignation(true)}
            onBlur={() => setFocusedDesignation(false)}
            classNames={{
              root: "relative mt-1",
              input:
                "bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pt-5 pb-1 focus:outline-none focus:border-gray-900",
              label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                floatingDesignation
                  ? "-translate-y-5 text-xs text-gray-900"
                  : ""
              }`,
            }}
          />

          {employeeMutation.isError && (
            <p className="text-sm text-red-600">
              {(employeeMutation.error as Error)?.message ||
                "Unable to add employee"}
            </p>
          )}

          <div className="w-full my-1">
            <Button
              onClick={() => employeeMutation.mutate()}
              className="w-full"
              variant="filled"
              color="black"
              loading={employeeMutation.isPending}
            >
              Add Employee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
