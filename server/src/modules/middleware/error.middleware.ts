import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = async (
  err,
  req,
  res,
  next
) =>
  res
    .status(err?.statusCode ?? 500)
    .json({ message: err?.message ?? "Internal Server Error" });
