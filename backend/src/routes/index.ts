import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../libs/prisma.ts";

import authMiddleware from "../middleware/authMiddleware.ts";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("hey it's working");
});

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
