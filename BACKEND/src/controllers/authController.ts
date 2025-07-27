import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { IAdmin } from "../models/adminModel";
import { HttpError } from "../utils/httpError";
import { authLogger } from "../utils/logger";

class AuthController {
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, email, phone, password, role } = req.body;
    authLogger.info("Register admin initiated", {
      email,
      role,
      action: "REGISTER_ADMIN",
    });

    if (!firstName || !lastName || !email || !phone || !password || !role) {
      authLogger.warn("Registration failed: missing fields", {
        email: email,
        action: "REGISTRATION_FAILED",
      });

      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      // check is user already exists
      const exists = await authService.getAdminByEmail(email);
      if (exists) {
        authLogger.warn("Registration failed: email exists", {
          email: email,
          action: "REGISTRATION_FAILED",
        });
        next(new HttpError(400, "Admin with this email already exists"));
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

      if (!newAdmin) {
        authLogger.warn("Registration failed: admin creation error", {
          email,
          action: "REGISTRATION_FAILED",
        });
        next(new HttpError(500, "Failed to create admin"));
        return;
      }

      res
        .status(201)
        .json({ message: "Registration successful", admin: newAdmin });

      authLogger.info("Registration successful", {
        email: email,
        adminId: newAdmin._id,
        role: newAdmin.role,
        action: "REGISTRATION_SUCCESS",
      });
      return;
    } catch (error: any) {
      authLogger.error(`Registration error: ${error.message}`, {
        email,
        action: "REGISTRATION_FAILED",
        error,
      });

      next(error);
      return;
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    const { email, password, rememberMe } = req.body;

    authLogger.info("Login attempt initiated", {
      email,
      action: "LOGIN_ATTEMPT",
    });

    if (!email || !password) {
      authLogger.warn("Login failed: missing fields", {
        email: email,
        action: "LOGIN_FAILED",
      });

      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      // check if the admin exists
      const admin = await authService.getAdminByEmail(email);
      if (!admin) {
        authLogger.warn("Login failed: email not found", {
          email,
          action: "LOGIN_FAILED",
        });
        next(new HttpError(404, "Email not found"));
        return;
      }

      if (admin && admin.status === "blocked") {
        authLogger.warn("Login failed: account blocked", {
          email,
          action: "LOGIN_FAILED",
        });

        next(
          new HttpError(403, "Account blocked and is no longer accessible!")
        );
        return;
      }

      // check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        authLogger.warn("Login failed: invalid password", {
          email,
          action: "LOGIN_FAILED",
        });
        next(new HttpError(401, "Invalid password"));
        return;
      }

      // generate a token
      const token = generateToken(admin._id as string, admin.role);

      if (!token) {
        authLogger.error("Login failed: token generation error", {
          email,
          action: "LOGIN_FAILED",
        });
        next(new HttpError(500, "Failed to generate token"));
        return;
      }

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // only in production with HTTPS
          sameSite: "none",
          domain: ".spreadlovenetwork.com", // match frontend/backend
          path: "/",
          maxAge: (rememberMe as boolean) ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days
        })
        .status(200)
        .json({ message: "Login successful" });

      authLogger.info("Login successful", {
        email,
        adminId: admin._id,
        role: admin.role,
        action: "LOGIN_SUCCESS",
      });
      return;
    } catch (error: any) {
      authLogger.error(`Login error: ${error.message}`, {
        email,
        action: "LOGIN_FAILED",
        error,
      });

      next(error);
      return;
    }
  }

  async getLoggedInUser(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user;
    authLogger.info("Get logged in user initiated", {
      userId: user?.userId,
      action: "GET_LOGGED_IN_USER",
    });

    if (!user) {
      authLogger.warn("Get logged in user failed: unauthorized access", {
        action: "GET_LOGGED_IN_USER_FAILED",
      });
      next(new HttpError(401, "Unauthorized access"));
      return;
    }

    try {
      // get the admin from DB
      const admin = await authService.getAdminByID(user.userId);

      if (!admin) {
        authLogger.warn("Get logged in user failed: admin not found", {
          userId: user.userId,
          action: "GET_LOGGED_IN_USER_FAILED",
        });
        next(new HttpError(404, "Admin not found"));
        return;
      }

      res.status(200).json({ user: admin });
      authLogger.info("Get logged in user successful", {
        userId: user.userId,
        role: admin.role,
        action: "GET_LOGGED_IN_USER_SUCCESS",
      });
      return;
    } catch (error: any) {
      authLogger.error(`Get logged in user error: ${error.message}`, {
        userId: user?.userId,
        action: "GET_LOGGED_IN_USER_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async logoutAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    authLogger.info("Logout initiated", {
      userId: user.userId,
      action: "LOGOUT",
    });

    if (!user) {
      authLogger.warn("Logout failed: unauthorized access", {
        action: "LOGOUT_FAILED",
      });
      next(new HttpError(401, "Unauthorized access"));
      return;
    }

    try {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // only over HTTPS in production
          sameSite: "none",
          domain: ".spreadlovenetwork.com", // match frontend/backend
          path: "/",
        })
        .status(200)
        .json({ message: "Logout successful" });

      authLogger.info("Logout successful", {
        userId: user.userId,
        action: "LOGOUT_SUCCESS",
      });
      return;
    } catch (error: any) {
      authLogger.error(`Logout error: ${error.message}`, {
        userId: user.userId,
        action: "LOGOUT_FAILED",
        error,
      });
      next(error);
      return;
    }
  }
}

const authController = new AuthController();
export default authController;
