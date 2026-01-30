import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  const message = (err as { expose?: boolean }).expose
    ? err.message
    : "Internal Server Error";
  res.status(status).json({ error: message });
}
