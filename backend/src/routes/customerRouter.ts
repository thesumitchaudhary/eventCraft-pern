import express from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.ts";
import { SendVerificationCode } from "../helper/sendMail.ts";
import { WellcomeEmail } from "../helper/sendMail.ts";
import authMiddleware from "../middleware/authMiddleware.ts";

const router = express.Router();

router.post("/createUser", async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, confirmPassword, phone } =
      req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(401).json({ message: "All field is mandatory" });
    }

    if (password != confirmPassword) {
      return res.json({ message: "password doesn't match" });
    }

    const existingCustomer = await prisma.user.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return res.json("you are already registered please sign in");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 99999);

    const response = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hash,
        otp: verificationCode,
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: response.id,
        phone: (phone || "").toString(),
        address: "",
      },
    });

    // Send verification email asynchronously without blocking response
    SendVerificationCode(email, verificationCode).catch((emailError) => {
      console.error("Failed to send verification email:", emailError);
    });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

    let token = jwt.sign(
      {
        firstname: response.firstname,
        lastname: response.lastname,
        email: response.email,
        role: response.role,
      },
      process.env.JWT_SECRET as string,
    );

    res.cookie("token", token);

    res.status(200).json({ message: "user is created", response, customer });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error",
      result: (error as Error).message,
    });
  }
});

router.post("/verifyEmail", async (req: Request, res: Response) => {
  try {
    const { code, email } = req.body;

    const verificationCode = Number(code);

    if (Number.isNaN(verificationCode)) {
      return res.status(400).json({
        success: false,
        message: "Valid verification code is required",
      });
    }

    if (code) {
      const user = await prisma.user.findFirst({
        where: email
          ? {
              email,
              otp: verificationCode,
            }
          : {
              otp: verificationCode,
            },
      });

      if (!user) {
        return res.status(400).json({
          sucess: false,
          message: "Invalid or Expired Code",
        });
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified_at: new Date(),
          otp: null,
        },
      });

      await WellcomeEmail(user.email, user.firstname, user.lastname);

      return res.status(200).json({
        success: true,
        message: "Email Exists",
        user,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Email or code required",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      result: (error as Error).message,
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ success: false, message: "Email and Password are required  " });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentails" });
    }

    const isMatch = bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json({
      message: "customer is login successfully",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      result: (error as Error).message,
    });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.user.id;

    const customer = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: "custoemr is not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "user is found", result: customer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: (error as Error).message,
    });
  }
});

router.get("/logout", (req, res) => {
  try {
    res.cookie("token", "");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      result: (error as Error).message,
    });
  }
});

export default router;
