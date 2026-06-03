import { createContext, useState } from "react";
import type { ReactNode } from "react";

type EventContextValue = {
  eventName: string;
  setEventName: (value: string) => void;
  eventType: string;
  setEventType: (value: string) => void;
  selectTheme: string;
  setSelectTheme: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  venue: string;
  setVenue: (value: string) => void;
  guestCount: string;
  setGuestCount: (value: string) => void;
  budget: string;
  setBudget: (value: string) => void;
};

const defaultEventContextValue: EventContextValue = {
  eventName: "",
  setEventName: () => {},
  eventType: "",
  setEventType: () => {},
  selectTheme: "",
  setSelectTheme: () => {},
  date: "",
  setDate: () => {},
  venue: "",
  setVenue: () => {},
  guestCount: "",
  setGuestCount: () => {},
  budget: "",
  setBudget: () => {},
};

export const EventContext = createContext<EventContextValue>(defaultEventContextValue);

export const EventProvider = (props: { children: ReactNode }) => {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectTheme, setSelectTheme] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");
  return (
    <EventContext.Provider
      value={{
        eventName,
        setEventName,
        eventType,
        setEventType,
        selectTheme,
        setSelectTheme,
        date,
        setDate,
        venue,
        setVenue,
        guestCount,
        setGuestCount,
        budget,
        setBudget,
      }}
    >
      {props.children}
    </EventContext.Provider>
  );
};
