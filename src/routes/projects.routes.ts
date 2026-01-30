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

const postSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  image: z.string().optional(),
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
  image: z.string().optional(),
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
