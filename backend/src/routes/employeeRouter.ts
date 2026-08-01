import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "../libs/prisma.ts";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import { EmployeeScalarFieldEnum } from "../generated/prisma/internal/prismaNamespace";
import { dot } from "node:test/reporters";
import { request } from "node:http";
import authMiddleware from "../middleware/authMiddleware.ts";

dotenv.config();
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("hey it's working");
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      designation,
      phone,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !designation
    ) {
      return res
        .status(401)
        .json({ success: false, message: "all field is mandatory" });
    }

    if (password != confirmPassword) {
      return res
        .status(401)
        .json({ success: false, message: "password is not match" });
    }

    const existingEmployee = await prisma.user.findUnique({ where: { email } });

    if (existingEmployee) {
      return res.status(401).json({
        success: false,
        message: "this employee is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const parsedPhone = Number(phone ?? 0);

    const response = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          verified_at: new Date(),
          role: "EMPLOYEE",
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          phone: Number.isFinite(parsedPhone) ? parsedPhone : 0,
          designation,
        },
      });

      return { user, employee };
    });

    return res.status(201).json({
      success: true,
      message: "employee created successfully",
      result: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      result: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "hey email and password is manddatory",
      });
    }

    const existingEmployee = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingEmployee) {
      return res
        .status(401)
        .json({ success: false, message: "hey employee is not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingEmployee.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credential" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "JWT secret is not configured" });
    }

    const token = jwt.sign(
      {
        id: existingEmployee?.id,
        firstname: existingEmployee?.firstname,
        lastname: existingEmployee?.lastname,
        email: existingEmployee?.email,
        role: existingEmployee?.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;

    if (!id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const employee = await prisma.user.findFirst({
      where: {
        id,
        role: "EMPLOYEE",
      },
    });

    if (!employee) {
      res
        .status(404)
        .json({ success: false, message: "employee is not found" });
    }

    res.status(200).json({
      success: false,
      message: "employee fetched successfully",
      result: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
});

router.get("/findEmployee", async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findMany({
      include: {
        user: true,
        tasks: true,
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "employee not found" });
    }

    const result = employee.map(({ user, ...employeeDetail }) => ({
      ...user,
      id: employeeDetail.id,
      _id: employeeDetail.id,
      userId: employeeDetail.userId,
      phone: employeeDetail.phone,
      designation: employeeDetail.designation,
      joiningDate: employeeDetail.joiningDate,
      tasks: employeeDetail.tasks,
      employee: employeeDetail,
    }));

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      result,
      users: result,
      details: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/myTask", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId },
      include: {
        tasks: {
          include: {
            event: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "employee not found" });
    }

    const priorityLabel: Record<string, string> = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
    };

    const statusLabel: Record<string, string> = {
      PENDING: "pending",
      INPROGRESS: "in-progress",
      COMPLETED: "completed",
    };

    const tasks = employee.tasks.map((task) => ({
      ...task,
      _id: task.id,
      createdAt: task.created_at,
      selectDate: task.assignDate,
      priority: priorityLabel[task.priority] ?? task.priority,
      status: statusLabel[task.status] ?? task.status,
      assignTo: task.assignedToEmpId,
      employeeId: task.assignedToEmpId,
      eventId: task.event,
    }));

    return res.status(200).json({
      success: true,
      message: "employee tasks fetched successfully",
      employee: {
        ...employee,
        tasks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
