import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as ctrl from "../controllers/projects.controller";

export type Project = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  metrics: string[];
};

function isUploadImagePath(value: string): boolean {
  // Accept relative API-served path or absolute URL that points to uploads.
  return (
    value.startsWith("/uploads/") || /^https?:\/\/.+\/uploads\/.+/.test(value)
  );
}

const imageSchema = z
  .string()
  .optional()
  .refine(
    (value) => value == null || value === "" || isUploadImagePath(value),
    {
      message:
        "image must be an upload path or URL (use /api/upload first, then pass returned path)",
    },
  );

const postSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  image: imageSchema,
  tags: z.array(z.string()).optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  metrics: z.array(z.string()).optional(),
});

const putSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  image: imageSchema,
  tags: z.array(z.string()).optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  metrics: z.array(z.string()).optional(),
});

export const projectsRouter = Router();

projectsRouter.get("/projects", ctrl.getAll);
projectsRouter.post("/projects", validateBody(postSchema), ctrl.createOne);
projectsRouter.put("/projects", validateBody(putSchema), ctrl.updateOne);
projectsRouter.delete("/projects", ctrl.deleteOne);
