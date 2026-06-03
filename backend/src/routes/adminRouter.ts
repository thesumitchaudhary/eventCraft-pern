import express from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import { BookingStatus } from "../generated/prisma/enums.ts";

const router = express.Router();

type AuthedRequest = Request & {
  user?: {
    id: string;
  };
};

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ success: false, message: "Email and Password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credential" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credential" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Admin is login successfully",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/logout", (req: Request, res: Response) => {
  try {
    res.cookie("token", "");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server Error";
    res.status(501).json({ message: "Internal server Error", result: message });
  }
});

router.get("/me", authMiddleware,async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthedRequest;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentail" });
    }

    return res.status(200).json({ success: true, result: currentUser });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server Erorr";
    return res.status(501).json({ success: false, message });
  }
});

router.post(
  "/addEventTheme",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { themeName, themeType, themePrice } = req.body;
      const id = req.user?.id;

      if (!id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const admin = await prisma.admin.findFirst({
        where: {
          userId: id,
        },
      });

      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin profile not found" });
      }

      if (
        !themeName ||
        !themeType ||
        themePrice === undefined ||
        themePrice === null
      ) {
        return res.status(400).json({
          success: false,
          message: "themeName, themeType, and themePrice are required",
        });
      }

      const parsedThemePrice = Number(themePrice);

      if (Number.isNaN(parsedThemePrice)) {
        return res.status(400).json({
          success: false,
          message: "themePrice must be a valid number",
        });
      }

      const createTheme = await prisma.eventTheme.create({
        data: {
          themeName,
          themeType,
          themePrice: parsedThemePrice,
          adminId: admin.id,
        },
      });

      res.status(200).json({
        success: true,
        message: "theme create successfully",
        result: createTheme,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server Erorr";
      return res.status(500).json({
        success: false,
        message,
      });
    }
  },
);

router.get("/getAllEventTheme", async (req: Request, res: Response) => {
  try {
    const allTheme = await prisma.eventTheme.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    if (allTheme.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No themes available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Themes fetched successfully",
      result: allTheme,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/showBookedEvent", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      include: {
        customers: {
          include: {
            events: true,
          },
        },
      },
    });

    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }
    return res.status(200).json({
      success: true,
      message: "user fetched successfully",
      result: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
});

router.put(
  "/updateEventTheme/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { themeName, themePrice, themeType } = req.body;

      if (!themeName || !themePrice || !themePrice) {
        return res
          .status(401)
          .json({ success: false, message: "All field is mandatory" });
      }

      const existingTheme = await prisma.eventTheme.findUnique({
        where: { id },
      });

      if (!existingTheme) {
        return res
          .status(404)
          .json({ success: false, message: "Theme not found" });
      }

      const updateEventTheme = await prisma.eventTheme.update({
        where: {
          id,
        },
        data: {
          themeName,
          themePrice: Number(themePrice),
          themeType,
        },
      });

      res.status(200).json({
        success: true,
        message: "updated successfully",
        result: updateEventTheme,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  },
);

// this is for accept booked event

router.put("/updateStatus/:id", async (req: Request, res: Response) => {
  try {
    const { bookingStatus } = req.body;
    const id = req.params.id;

    await prisma.event.update({
      where: { id },
      data: {
        bookingStatus,
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "event status updated successfully",
        result: true,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
});

export default router;
