import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { prisma } from "./libs/prisma.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import adminRouter from "./routes/adminRouter.ts";
import customerRouter from "./routes/customerRouter.ts";
import employeeRouter from "./routes/employeeRouter.ts";
import index from "./routes/index.ts";

dotenv.config();

const PORT = Number(process.env.PORT) || 4041;
const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  "http://localhost:5173,http://127.0.0.1:5173,https://eventyfycraft-frontend.onrender.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
      origin: (
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

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());

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
    console.error("Database connection failed — continuing to start server:", error);
  }

  app.listen(PORT, () => {
    console.log(`hey server is running on port ${PORT}`);
    console.log("Allowed CORS origins:", allowedOrigins.join(", "));
  });
};

start();
