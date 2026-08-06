import { HttpError } from "../utils/httpError";

// Maps any thrown/rejected value into a {status, message} the client can
// see safely. HttpError instances are already author-curated (business
// errors, the zod-flattened validateRequest message, etc.) and pass
// through unchanged — everything else is an error type we didn't
// anticipate at the throw site, so it gets mapped to a generic, safe
// message here instead of leaking driver/library internals.
export function classifyError(err: any): { status: number; message: string } {
  if (err instanceof HttpError) {
    return { status: err.status, message: err.message };
  }

  if (err?.name === "CastError") {
    return {
      status: 400,
      message: "Invalid request — please check the provided ID and try again.",
    };
  }

  if (err?.name === "ValidationError" && err?.errors) {
    const message = Object.values(err.errors as Record<string, { message: string; path: string }>)
      .map((e) => `${e.path}: ${e.message}`)
      .join("; ");
    return { status: 400, message: message || "Invalid request data." };
  }

  if (err?.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "value";
    return {
      status: 409,
      message: `A record with that ${field} already exists.`,
    };
  }

  if (
    err?.name === "JsonWebTokenError" ||
    err?.name === "TokenExpiredError" ||
    err?.name === "NotBeforeError"
  ) {
    return { status: 401, message: "Your session has expired. Please log in again." };
  }

  if (err?.type === "entity.parse.failed") {
    return { status: 400, message: "The request body could not be read. Please try again." };
  }

  return { status: 500, message: "Something went wrong on our end. Please try again shortly." };
}
