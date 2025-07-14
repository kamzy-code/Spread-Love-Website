import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { IAdmin } from "../models/adminModel";

class AuthController {
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, email, phone, password, role } = req.body;

    try {
      // check is user already exists
      const exists = await authService.getAdminByEmail(email);
      if (exists) {
        res
          .status(400)
          .json({ message: "Admin with this email already exists" });
        return;
      }

      // hash the user's password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create a new admin
      const newAdmin = await authService.createAdmin(
        firstName,
        lastName,
        email,
        phone,
        hashedPassword,
        role
      );

      res
        .status(201)
        .json({ message: "Registration successful", admin: newAdmin });
      return;
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Registration failed", error });
      }
      return;
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    const { email, password, rememberMe } = req.body;

    try {
      // check if the admin exists
      const admin = await authService.getAdminByEmail(email);
      if (!admin) {
        res.status(404).json({ message: "Email not found" });
        return;
      }

      if (admin && admin.status === "blocked") {
        res.status(400).json({ message: "Account blocked and is no longer accessible!" });
        return;
      }
      
      // check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }

      // generate a token
      const token = generateToken(admin._id as string, admin.role);
      // res.status(200).json({ token, admin });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // only in production with HTTPS
          sameSite: "strict",
          maxAge: (rememberMe as boolean) ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days
        })
        .status(200)
        .json({ message: "Login successful" });
      return;
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Login failed", error });
      }
      return;
    }
  }

  async getLoggedInUser(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "No logged in user" });
      return;
    }

    try {
      // get the admin from DB
      const admin = await authService.getAdminByID(user.userId);

      if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
      }

      res.status(200).json({ user: admin });
      return;
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching user", error });
      }
      return;
    }
  }

  async logoutAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // only over HTTPS in production
          sameSite: "strict",
        })
        .status(200)
        .json({ message: "Logged out successfully" });
      return;
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Logout failed", error });
      }
      return;
    }
  }
}

const authController = new AuthController();
export default authController;
