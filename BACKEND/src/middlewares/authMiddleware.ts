import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { adminRole } from "../types/genralTypes";

interface AuthRequest extends Request {
  user?: { userId: string; role: adminRole };
}

export const authMiddlewrare = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Get the Auth Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    //  Seperate token from Auth Header
    const token = authHeader?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: adminRole;
    };
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
    res.status(401).json({ message: "Token failed", error });
    return;
  }
};


export const checkRole = (...roles: adminRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        if (!roles.includes(req.user?.role as adminRole || "")) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

    }
}
