import express from "express";
import type { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../libs/prisma.ts";
import {
  PaymentModelPaymentStatus,
  PaymentStatus,
  paymentMethod,
} from "../generated/prisma/enums.ts";

import authMiddleware from "../middleware/authMiddleware.ts";

const router = express.Router();

const KEY_ID = process.env.KEY_ID;
const KEY_SECRET = process.env.KEY_SECRET;

const razorpay =
  KEY_ID && KEY_SECRET
    ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
    : null;

function getReadableErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: string;
      error?: {
        description?: string;
        reason?: string;
        code?: string;
      };
    };

    return (
      maybeError.message ||
      maybeError.error?.description ||
      maybeError.error?.reason ||
      maybeError.error?.code ||
      fallback
    );
  }

  return fallback;
}

function parseAmount(rawAmount: unknown) {
  const amount = Number(String(rawAmount).replace(/[^0-9.]/g, ""));

  return Number.isFinite(amount) ? amount : 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getAlreadyPaid(eventId: string) {
  const previousPayment = await prisma.payment.aggregate({
    where: {
      eventId,
      status: PaymentModelPaymentStatus.SUCCESS,
    },
    _sum: {
      paymentAmount: true,
    },
  });

  return previousPayment._sum.paymentAmount || 0;
}

router.get("/", (req: Request, res: Response) => {
  res.json("hey it's working");
});

router.post(
  "/payment/create-order",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          success: false,
          message: "Razorpay keys are missing in environment",
        });
      }

      const eventId = req.body.bookingId || req.body.eventId;
      const { paymentAmount } = req.body;

      if (!eventId || typeof eventId !== "string" || !isUuid(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Valid bookingId is required",
        });
      }

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const amount = parseAmount(paymentAmount);

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid paymentAmount is required",
        });
      }

      const alreadyPaid = await getAlreadyPaid(eventId);
      const pendingAmount = Number(event.budget || 0) - alreadyPaid;

      if (pendingAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Booking is already fully paid",
        });
      }

      if (amount > pendingAmount) {
        return res.status(400).json({
          success: false,
          message: `Payment cannot exceed pending amount (${pendingAmount})`,
        });
      }

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `ev_${String(eventId).slice(-12)}_${Date.now().toString().slice(-10)}`,
        notes: {
          bookingId: String(eventId),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Razorpay order created",
        data: {
          key: KEY_ID,
          order,
          bookingId: eventId,
          paymentAmount: amount,
          pendingAmount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: getReadableErrorMessage(
          error,
          "Unable to create Razorpay order",
        ),
      });
    }
  },
);

router.post(
  "/payment/verify",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Razorpay key secret is missing in environment",
        });
      }

      const eventId = req.body.bookingId || req.body.eventId;
      const {
        paymentAmount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (!eventId || typeof eventId !== "string" || !isUuid(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Valid bookingId is required",
        });
      }

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Razorpay verification fields are required",
        });
      }

      const expectedSignature = crypto
        .createHmac("sha256", KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid Razorpay signature",
        });
      }

      const amount = parseAmount(paymentAmount);

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid paymentAmount is required",
        });
      }

      const alreadyPaid = await getAlreadyPaid(eventId);
      const totalPaid = alreadyPaid + amount;

      if (totalPaid > Number(event.budget || 0)) {
        return res.status(400).json({
          success: false,
          message: "Payment exceeds the remaining booking amount",
        });
      }

      const makePayment = await prisma.$transaction(async (tx) => {
        const createdPayment = await tx.payment.create({
          data: {
            eventId,
            paymentAmount: amount,
            paymentMethod: paymentMethod.RAZORPAY,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: PaymentModelPaymentStatus.SUCCESS,
            cardNumber: "",
            expiryMonth: 0,
            expiryYear: 0,
            cvv: "",
          },
        });

        await tx.event.update({
          where: {
            id: eventId,
          },
          data: {
            paymentStatus:
              totalPaid >= Number(event.budget || 0)
                ? PaymentStatus.COMPLETED
                : totalPaid > 0
                  ? PaymentStatus.PARTIAL
                  : PaymentStatus.PENDING,
          },
        });

        return createdPayment;
      });

      return res.status(201).json({
        success: true,
        message: "Payment verified successfully",
        data: makePayment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: getReadableErrorMessage(error, "Unable to verify payment"),
      });
    }
  },
);

router.post(
  "/createEvent",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const {
        eventName,
        eventType,
        eventTheme,
        eventDate,
        eventVenue,
        guestCount,
        budget,
      } = req.body;

      if (
        !eventName ||
        !eventType ||
        !eventTheme ||
        !eventDate ||
        !eventVenue ||
        !guestCount ||
        !budget
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are mandatory",
        });
      }

      const customer = await prisma.customer.findFirst({
        where: {
          userId: userId,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer profile not found",
        });
      }

      const parsedDate = new Date(eventDate);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date",
        });
      }

      const response = await prisma.event.create({
        data: {
          customerId: customer.id,
          eventName,
          eventType,
          eventTheme,
          eventDate: parsedDate,
          eventVenue,
          guestCount: Number(guestCount),
          budget: Number(budget),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Event booked successfully",
        result: response,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        result: (error as Error).message,
      });
    }
  },
);

router.get(
  "/my-booking",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      const customer = await prisma.customer.findFirst({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          events: true,
        },
      });

      if (!customer) {
        res.status(404).json({ success: false, message: "customer not found" });
      }

      const eventIds = customer.events.map((event) => event.id);

      const payments = await prisma.payment.groupBy({
        by: ["eventId"],
        where: {
          eventId: {
            in: eventIds,
          },
          status: "SUCCESS",
        },
        _sum: {
          paymentAmount: true,
        },
      });

      const paymentMap = {};

      payments.forEach((payment) => {
        if (payment.eventId) {
          paymentMap[payment.eventId] = payment._sum.paymentAmount || 0;
        }
      });

      const eventsWithPayment = customer.events.map((event) => ({
        ...event,
        totalPaid: paymentMap[event.id] || 0,
      }));

      res.status(200).json({
        success: true, customer: {
          name: `${customer.user.firstname} ${customer.user.lastname}`,
          email: customer.user.email,
          phone: customer.phone,
          address: customer.address,
        },
         events: eventsWithPayment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server Error",
        error: (error as Error).message,
      });
    }
  },
);

export default router;
