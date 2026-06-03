import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "../libs/prisma.ts";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import { EmployeeScalarFieldEnum } from "../generated/prisma/internal/prismaNamespace";
import { dot } from "node:test/reporters";
import { request } from "node:http";

dotenv.config();
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("hey it's working");
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
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

    const response = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        verified_at: new Date(),
        role: "EMPLOYEE",
      },
    });

    const token = jwt.sign(
      {
        firstname: response.firstname,
        lastname: response.lastname,
        email: response.email,
      },
      process.env.JWT_SECRET,
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      result: error.message,
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(401).json({
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
      res
        .status(401)
        .json({ success: false, message: "hey employee is not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingEmployee.password);

    if (isMatch) {
      res.status(401).json({ success: false, message: "Invalid Credential" });
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
      error: error.message,
    });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;

    const employee = await prisma.user.findFirst({
      where: {
        id,
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
    const employee = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "employee not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "employee fetched successfully",
        result: employee,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
