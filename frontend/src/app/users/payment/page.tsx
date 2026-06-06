import { AppSidebar } from "../../../components/app-siderbar";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@mantine/core";
import { IndianRupee } from "lucide-react";

import { useState } from "react";

const INDEX_BACKEND_API_URL = import.meta.env.VITE_INDEX_BACKEND_URL;

interface Booking {
  id?: string;
  _id: string;
  eventName: string;
  eventType?: string;
  eventTheme?: string;
  theme?: string;
  eventDate: string;
  eventVenue?: string;
  venue?: string;
  guestCount: number;
  totalAmount: number;
  budget?: number;
  totalPaid: number;
  progress: number;
  bookingStatus?: string;
  paymentStatus?: string;
}

interface MyBookingsResponse {
  events: Booking[];
}

interface CreateOrderPayload {
  bookingId: string;
  paymentAmount: number;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    key: string;
    bookingId: string;
    paymentAmount: number;
    pendingAmount: number;
    order: {
      id: string;
      amount: number;
      currency: string;
    };
  };
}

interface VerifyPaymentPayload {
  bookingId: string;
  paymentAmount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: {
        ondismiss?: () => void;
      };
      theme?: {
        color: string;
      };
    }) => {
      open: () => void;
    };
  }
}

// this is for the show booked events
const fetcher = async (url: string): Promise<MyBookingsResponse> => {
  const res = await fetch(url, { credentials: "include" });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "There was a problem");
  }

  return body;
};

const loadRazorpayScript = async (): Promise<boolean> => {
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existingScript = document.getElementById("razorpay-checkout-js");
    if (existingScript) {
      resolve(Boolean(window.Razorpay));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const createRazorpayOrder = async ({
  bookingId,
  paymentAmount,
}: CreateOrderPayload): Promise<CreateOrderResponse> => {
  const res = await fetch(`${INDEX_BACKEND_API_URL}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      bookingId,
      paymentAmount,
    }),
  });

  const data = await res.json();
  const errorMessage =
    data?.message || data?.error?.description || "Order creation failed";

  if (!res.ok || data?.success === false) {
    throw new Error(errorMessage);
  }

  return data as CreateOrderResponse;
};

const verifyRazorpayPayment = async (
  payload: VerifyPaymentPayload,
): Promise<void> => {
  const res = await fetch(`${INDEX_BACKEND_API_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  const errorMessage =
    data?.message || data?.error?.description || "Payment verification failed";

  if (!res.ok || data?.success === false) {
    throw new Error(errorMessage);
  }
};

export default function Page() {
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [focusedPaymentAmount, setFocusedPaymentAmount] = useState(false);

  const floatingPaymentAmount =
    focusedPaymentAmount || paymentAmount.length > 0;

  const handleOpenPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentAmount("");
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBooking(null);
    setPaymentAmount("");
    setFocusedPaymentAmount(false);
  };

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const bookingId = selectedBooking?.id ?? selectedBooking?._id;

      if (!bookingId) throw new Error("bookingId is required");
      if (!paymentAmount) throw new Error("paymentAmount is required");

      const paymentAmountNumber = Number(paymentAmount);
      const remainingAmount =
        (selectedBooking?.totalAmount ?? 0) - (selectedBooking?.totalPaid ?? 0);

      if (Number.isNaN(paymentAmountNumber) || paymentAmountNumber <= 0) {
        throw new Error("Payment amount must be a valid positive number");
      }
      if (paymentAmountNumber > remainingAmount) {
        throw new Error("Payment amount cannot exceed remaining balance");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      const orderResponse = await createRazorpayOrder({
        bookingId,
        paymentAmount: paymentAmountNumber,
      });

      const key = orderResponse?.data?.key;
      const order = orderResponse?.data?.order;

      if (!key || !order?.id || !window.Razorpay) {
        throw new Error("Unable to initialize Razorpay Checkout");
      }

      await new Promise<void>((resolve, reject) => {
        const razorpayInstance = new window.Razorpay({
          key,
          amount: order.amount,
          currency: order.currency,
          name: "EventyfyCraft",
          description: `Payment for ${selectedBooking?.eventName || "event booking"}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              await verifyRazorpayPayment({
                bookingId,
                paymentAmount: paymentAmountNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (verifyError) {
              reject(
                verifyError instanceof Error
                  ? verifyError
                  : new Error("Payment verification failed"),
              );
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled"));
            },
          },
          theme: {
            color: "#111827",
          },
        });

        razorpayInstance.open();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      handleClosePaymentModal();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { data, isLoading, error } = useQuery<MyBookingsResponse>({
    queryKey: ["my-bookings"],
    queryFn: () => fetcher(`${INDEX_BACKEND_API_URL}/my-booking`),
  });

  console.log(data)

  const getBookingTotal = (booking?: Booking | null) =>
    booking?.totalAmount ?? booking?.budget ?? 0;
  const remainingAmount =
    getBookingTotal(selectedBooking) - (selectedBooking?.totalPaid ?? 0);
  const bookings = data?.events ?? [];


  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbPage>Customer dashboard</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Payments</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[60vh] rounded-xl bg-muted/50 p-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-semibold">Payment History</h4>
              <p className="text-sm text-muted-foreground">
                Track your event payments and complete pending balances.
              </p>
            </div>

            {isLoading ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                Loading your bookings...
              </div>
            ) : error instanceof Error ? (
              <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
                {error.message}
              </div>
            ) : bookings.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No bookings found.
              </div>
            ) : (
              <table className="mt-5 w-full border-collapse rounded-xl bg-white">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left">Event</th>
                    <th className="border-b px-4 py-2 text-left">Date</th>
                    <th className="border-b px-4 py-2 text-left">Venue</th>
                    <th className="border-b px-4 py-2 text-left">
                      Total Budget
                    </th>
                    <th className="border-b px-4 py-2 text-left">
                      Amount Paid
                    </th>
                    <th className="border-b px-4 py-2 text-left">Remaining</th>
                    <th className="border-b px-4 py-2 text-left">Status</th>
                    <th className="border-b px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const bookingTotal = getBookingTotal(booking);
                    const bookingRemaining =
                      bookingTotal - (booking.totalPaid ?? 0);
                    const bookingId = booking.id ?? booking._id;
                    const paymentStatus =
                      booking.paymentStatus ||
                      (bookingRemaining <= 0 ? "paid" : "partial");

                    return (
                      <tr
                        key={bookingId}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{booking.eventName}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.eventType ??
                              booking.eventTheme ??
                              booking.theme ??
                              "Event booking"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {booking.eventVenue ?? booking.venue ?? "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex">
                            <IndianRupee className="h-5 w-5 mt-1" />
                            {Number(bookingTotal).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex">
                            <IndianRupee className="h-5 w-5 mt-1" />
                            {Number(booking.totalPaid || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex">
                            <IndianRupee className="h-5 w-5 mt-1" />
                            {Math.max(bookingRemaining, 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ${
                              paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : paymentStatus === "partial"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(booking)}
                            disabled={bookingRemaining <= 0}
                            className="rounded-xl bg-black px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {bookingRemaining <= 0 ? "Paid" : "Pay now"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {isPaymentModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClosePaymentModal}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold">Make Payment</h2>
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  paymentMutation.mutate();
                }}
              >
                <div>
                  <div className="mb-2 text-sm text-gray-600">
                    Total Amount:
                    <div className="flex">
                      <IndianRupee className="h-4 w-5 mt-1" />
                      {Number(getBookingTotal(selectedBooking)).toLocaleString()}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Paid:
                    <div className="flex">
                      <IndianRupee className="h-4 w-5 mt-1" />
                      {Number(selectedBooking?.totalPaid ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Remaining:{" "}
                    <div className="flex">
                      <IndianRupee className="h-4 w-5 mt-1" />
                      {Math.max(remainingAmount, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <TextInput
                  type="number"
                  label="Payment Amount"
                  value={paymentAmount}
                  min={1}
                  max={remainingAmount > 0 ? remainingAmount : undefined}
                  step="0.01"
                  onChange={(e) => setPaymentAmount(e.currentTarget.value)}
                  onFocus={() => setFocusedPaymentAmount(true)}
                  onBlur={() => setFocusedPaymentAmount(false)}
                  placeholder={focusedPaymentAmount ? "Enter amount" : ""}
                  mt="md"
                  classNames={{
                    root: "relative mt-1",
                    input:
                      "bg-transparent !border-0 !border-b-2 !border-gray-300 !rounded-none px-0 pt-5 pb-1 focus:!border-b-gray-900 focus:!ring-0 focus:!outline-none",
                    label: `absolute left-0 top-2 z-10 pointer-events-none text-sm font-normal text-gray-400 transition-all duration-100 ease-in-out ${
                      floatingPaymentAmount
                        ? "-translate-y-5 text-xs text-gray-900"
                        : ""
                    }`,
                  }}
                />

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  Secure payment powered by Razorpay Checkout.
                </div>

                {paymentMutation.error instanceof Error && (
                  <p className="mt-3 text-sm text-red-600">
                    {paymentMutation.error.message}
                  </p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClosePaymentModal}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
                    disabled={paymentMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={paymentMutation.isPending}
                  >
                    {paymentMutation.isPending
                      ? "Opening Razorpay..."
                      : "Pay with Razorpay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
