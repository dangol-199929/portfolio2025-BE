import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const msg =
          e.issues.map((err: { message: string }) => err.message).join("; ") ||
          "Validation failed";
        const err = new Error(msg) as Error & {
          statusCode?: number;
          expose?: boolean;
        };
        err.statusCode = 400;
        err.expose = true;
        next(err);
      } else {
        next(e);
      }
    }
  };
}
