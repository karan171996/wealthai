import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, details: err.details ?? null },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { message: "Validation failed", details: err.flatten() },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
}
