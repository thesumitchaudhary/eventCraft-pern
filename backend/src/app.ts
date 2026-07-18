import http from "http";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { prisma } from "./libs/prisma.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

import { Server } from "socket.io";

import adminRouter from "./routes/adminRouter.ts";
import customerRouter from "./routes/customerRouter.ts";
import employeeRouter from "./routes/employeeRouter.ts";
import index from "./routes/index.ts";

dotenv.config();

const PORT = Number(process.env.PORT) || 4041;
const app = express();
const server = http.createServer(app);

type JwtUserPayload = {
  id?: string;
  role?: string;
};

type ConnectedUser = {
  ticketId: string;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  userId: string;
};

type AuthSocket = Socket & {
  user?: {
    id: string;
    role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  };
};

const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  "http://localhost:5173,http://127.0.0.1:5173,https://eventyfycraft-frontend.onrender.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOriginHandler = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  // Allow REST tools/server-side calls with no browser origin header.
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Not allowed by CORS: ${origin}`));
};

const corsOptions = {
  origin: corsOriginHandler,
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

const users: Record<string, ConnectedUser> = {};
const admins = new Set<string>();

const getTokenFromCookieHeader = (cookieHeader: string): string | null => {
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return token ? decodeURIComponent(token) : null;
};

io.use((socket: AuthSocket, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      next(new Error("JWT secret is not configured"));
      return;
    }

    const authToken =
      typeof socket.handshake.auth?.token === "string"
        ? socket.handshake.auth.token
        : null;
    const cookieHeader = socket.handshake.headers?.cookie ?? "";
    const cookieToken = getTokenFromCookieHeader(cookieHeader);
    const token = authToken || cookieToken;

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtUserPayload;
    const role = (decoded.role ?? "").toUpperCase();
    const id = decoded.id ?? "";

    if (
      !id ||
      (role !== "CUSTOMER" && role !== "EMPLOYEE" && role !== "ADMIN")
    ) {
      next(new Error("Invalid token payload"));
      return;
    }

    socket.user = {
      id,
      role: role as "CUSTOMER" | "EMPLOYEE" | "ADMIN",
    };

    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket: AuthSocket) => {
  console.log("Socket connected:", socket.id);

  if (socket.user?.role === "ADMIN") {
    admins.add(socket.id);
  }

  socket.on("join_ticket", async ({ ticketId }: { ticketId?: string }) => {
    try {
      const authUser = socket.user;

      if (!authUser || !ticketId) {
        socket.emit("error", "Invalid join request");
        return;
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        socket.emit("error", "Ticket not found");
        return;
      }

      if (authUser.role === "CUSTOMER" && ticket.cusotmerId !== authUser.id) {
        socket.emit("error", "Unauthorized access");
        return;
      }

      if (authUser.role === "EMPLOYEE" && ticket.employeeId !== authUser.id) {
        socket.emit("error", "Unauthorized access");
        return;
      }

      socket.join(ticketId);
      users[socket.id] = {
        ticketId,
        role: authUser.role,
        userId: authUser.id,
      };

      if (authUser.role === "EMPLOYEE" && ticket.status !== "ACTICE") {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "ACTICE" },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Join failed";
      socket.emit("error", message);
    }
  });

  socket.on(
    "send_message",
    async ({ ticketId, message }: { ticketId?: string; message?: string }) => {
      try {
        const joinedUser = users[socket.id];
        const text = (message ?? "").trim();

        if (!joinedUser || !ticketId || !text) {
          socket.emit("error", "Invalid message payload");
          return;
        }

        if (joinedUser.ticketId !== ticketId) {
          socket.emit("error", "Join ticket before sending messages");
          return;
        }

        const createdMessage = await prisma.message.create({
          data: {
            ticketId,
            senderId: joinedUser.userId,
            senderRole: joinedUser.role,
            message: text,
          },
        });

        io.to(ticketId).emit("receive_message", createdMessage);
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : "Message send failed";
        socket.emit("error", messageText);
      }
    },
  );

  socket.on("escalate", async ({ ticketId }: { ticketId?: string }) => {
    try {
      const joinedUser = users[socket.id];

      if (!joinedUser || !ticketId) {
        socket.emit("error", "Invalid escalate request");
        return;
      }

      if (joinedUser.role !== "EMPLOYEE" && joinedUser.role !== "CUSTOMER") {
        socket.emit("error", "Unauthorized action");
        return;
      }

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "ESCALATED" },
      });

      admins.forEach((adminSocketId) => {
        io.to(adminSocketId).emit("admin_notification", {
          ticketId,
          message: "Ticket needs admin support",
        });
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Escalate failed";
      socket.emit("error", message);
    }
  });

  socket.on("disconnect", () => {
    if (socket.user?.role === "ADMIN") {
      admins.delete(socket.id);
    }

    delete users[socket.id];
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors(corsOptions),
);
app.options(/.*/, cors(corsOptions));
app.use(cookieParser());
app.disable("etag");

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hey it's worinking" });
});

app.use("/api/admin", adminRouter);
app.use("/api/customer", customerRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/index", index);

const start = async () => {
  try {
    await prisma.$connect();
    console.log("hey database is connected successfully");
  } catch (error) {
    console.error(
      "Database connection failed — continuing to start server:",
      error,
    );
  }

  server.listen(PORT, () => {
    console.log(`hey server is running on port ${PORT}`);
    console.log("Allowed CORS origins:", allowedOrigins.join(", "));
  });
};

start();
