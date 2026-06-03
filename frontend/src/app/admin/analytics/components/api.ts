export type EventItem = {
  eventType?: string;
  bookingStatus?: string;
  totalAmount?: number | number[];
  createdAt?: string;
  date?: string;
};

export type BookingCustomer = {
  events?: EventItem[];
};

type BookingUser = {
  customers?: BookingCustomer[];
};

export type ShowBookingsResponse = {
  customers?: BookingCustomer[];
  result?: BookingUser[];
  message?: string;
};

export const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  const body = (await res.json()) as T & { message?: string };

  if (!res.ok) {
    throw new Error(body?.message || "Request Failed");
  }

  return body as T;
};

export const getBookingEvents = (data?: ShowBookingsResponse): EventItem[] => {
  const directCustomers = Array.isArray(data?.customers)
    ? data.customers.flatMap((customer) =>
        Array.isArray(customer?.events) ? customer.events : [],
      )
    : [];

  const nestedCustomers = Array.isArray(data?.result)
    ? data.result.flatMap((user) =>
        Array.isArray(user?.customers)
          ? user.customers.flatMap((customer) =>
              Array.isArray(customer?.events) ? customer.events : [],
            )
          : [],
      )
    : [];

  return [...directCustomers, ...nestedCustomers];
};
