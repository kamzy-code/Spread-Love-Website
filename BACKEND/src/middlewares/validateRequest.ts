import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { HttpError } from "../utils/httpError";

const formatIssues = (result: { error: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new HttpError(400, formatIssues(result)));
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(new HttpError(400, formatIssues(result)));
      return;
    }

    // Express 5's req.query is a getter-only property — reassigning it
    // throws. Mutate the existing object in place instead so downstream
    // code still sees the zod-parsed/coerced values.
    const parsed = result.data as Record<string, unknown>;
    for (const key of Object.keys(req.query)) {
      if (!(key in parsed)) delete (req.query as Record<string, unknown>)[key];
    }
    Object.assign(req.query, parsed);
    next();
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(new HttpError(400, formatIssues(result)));
      return;
    }

    req.params = result.data as typeof req.params;
    next();
  };
};
