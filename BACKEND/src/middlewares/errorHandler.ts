import { Request, Response, NextFunction } from "express";
import { classifyError } from "./errorClassifier";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Global error handler:", err);

  if (res.headersSent) {
    return next(err);
  }

  const { status, message } = classifyError(err);

  res.status(status).json({
    message,
    error: process.env.NODE_ENV === "production" ? undefined : err,
  });
  return;
}
