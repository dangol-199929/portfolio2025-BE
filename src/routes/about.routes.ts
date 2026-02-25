import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as ctrl from "../controllers/about.controller";

function isUploadImagePath(value: string): boolean {
  return (
    value.startsWith("/uploads/") || /^https?:\/\/.+\/uploads\/.+/.test(value)
  );
}

const putSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  education: z.string().optional(),
  availability: z.string().optional(),
  bio: z.array(z.string()).optional(),
  image: z
    .string()
    .optional()
    .refine(
      (value) => value == null || value === "" || isUploadImagePath(value),
      {
        message:
          "image must be an upload path or URL (use /api/upload first, then pass returned path)",
      },
    ),
});

export const aboutRouter = Router();

aboutRouter.get("/about", ctrl.getAboutHandler);
aboutRouter.put("/about", validateBody(putSchema), ctrl.putAboutHandler);
