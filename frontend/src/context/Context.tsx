import { createContext, useState } from "react";
import type { ReactNode } from "react";

type ContextValue = {
  firstname: string;
  setFirstname: (value: string) => void;
  lastname: string;
  setLastname: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  designation: string;
  setDesignation: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
};

const defaultContextValue: ContextValue = {
  firstname: "",
  setFirstname: () => {},
  lastname: "",
  setLastname: () => {},
  email: "",
  setEmail: () => {},
  password: "",
  setPassword: () => {},
  confirmPassword: "",
  setConfirmPassword: () => {},
  otp: "",
  setOtp: () => {},
  phone: "",
  setPhone: () => {},
  designation: "",
  setDesignation: () => {},
  address: "",
  setAddress: () => {},
};

export const Context = createContext<ContextValue>(defaultContextValue);

export const ContextProvider = (props: { children: ReactNode }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  return (
    <Context.Provider
      value={{
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
        address,
        setAddress,
        otp,
        setOtp,
        phone,
        setPhone,
        designation,
        setDesignation,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
