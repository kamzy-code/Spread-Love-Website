import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { adminRole } from "../types/genralTypes";
import logger from "../utils/logger";
import { HttpError } from "../utils/httpError";

export interface AuthRequest extends Request {
  user?: { userId: string; role: adminRole };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("Verify token initiated", {
    service: "authMiddleware",
    action: "TOKEN_VERIFICATION",
  });

  try {
    const token = req.cookies.token;
    if (!token) {
      logger.warn("No token provided", {
        service: "authMiddleware",
        action: "NO_TOKEN_PROVIDED",
      });
      next( new HttpError(401, "Unauthorized: No token provided"));
      return;
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: adminRole;
    };

    if (!decoded) {
      logger.warn("Token verification failed", {
        service: "authMiddleware",
        action: "TOKEN_VERIFICATION_FAILED",
      });
      next(new HttpError(401, "Unauthorized: Token verification failed"));
      return;
    }

    req.user = decoded;
    logger.info("Token verified successfully", {
      service: "authMiddleware",
      action: "TOKEN_VERIFIED",
      userId: decoded.userId,
      role: decoded.role,
    });
    next();
  } catch (error: any) {
    logger.error(`Error in auth middleware: ${error.message}`, {
      service: "authMiddleware",
      action: "AUTH_MIDDLEWARE_ERROR",
      error: error,
    });
    next(error);
    return;
  }
};

export const checkRole = (...roles: adminRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes((req.user?.role as adminRole) || "")) {
      logger.warn(`Forbidden: User role ${req.user?.role} not allowed`, {
        service: "authMiddleware",
        action: "ROLE_CHECK_FAILED",
        userId: req.user?.userId,
        role: req.user?.role,
      });
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    logger.info(`Role check passed for user: ${req.user?.userId}`, {
      service: "authMiddleware",
      action: "ROLE_CHECK_PASSED",
      userId: req.user?.userId,
      role: req.user?.role,
    });
    next();
  };
};
