import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { IAdmin } from "../models/adminModel";
import { HttpError } from "../utils/httpError";
import { authLogger } from "../logger/devLogger";

class AuthController {
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, email, phone, password, role } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !role) {
      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      // check is user already exists
      const exists = await authService.getAdminByEmail(email);
      if (exists) {
        throw new HttpError(400, "Admin with this email already exists");
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
      next(error);
      return;
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    const { email, password, rememberMe } = req.body;

    authLogger.info("Login attempt initiated", {
      email: email,
      action: "LOGIN_ATTEMPT",
    });

    if (!email || !password) {
      authLogger.error("Login attempt failed", {
        email: email,
        action: "LOGIN_FAILURE",
        error: "Missing fields",
      });

      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      // check if the admin exists
      const admin = await authService.getAdminByEmail(email);
      if (!admin) {
        authLogger.error("Login attempt failed", {
          email: email,
          action: "LOGIN_FAILURE",
          error: "Email not found",
        });
        throw new HttpError(404, "Email not found");
      }

      if (admin && admin.status === "blocked") {
        authLogger.error("Login attempt failed", {
          email: email,
          action: "LOGIN_FAILURE",
          error: "Account Blocked",
        });

        throw new HttpError(
          403,
          "Account blocked and is no longer accessible!"
        );
      }

      // check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        authLogger.error("Login attempt failed", {
          email: email,
          action: "LOGIN_FAILURE",
          error: "Invalid Password",
        });

        throw new HttpError(401, "Invalid password");
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

        authLogger.info("Login attempt successful", {
        email: email,
        action: "LOGIN_SUCCESS",
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getLoggedInUser(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      next(new HttpError(401, "Unauthorized access"));
      return;
    }

    try {
      // get the admin from DB
      const admin = await authService.getAdminByID(user.userId);

      if (!admin) {
        throw new HttpError(404, "Admin not found");
      }

      res.status(200).json({ user: admin });
      return;
    } catch (error) {
      next(error);
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
      next(error);
      return;
    }
  }
}

const authController = new AuthController();
export default authController;
