import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as ctrl from "../controllers/experiences.controller";

export type Experience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  side: "left" | "right";
};

const postSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  description: z.string().optional(),
  side: z.enum(["left", "right"]).optional(),
});

const putSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  description: z.string().optional(),
  side: z.enum(["left", "right"]).optional(),
});

export const experiencesRouter = Router();

experiencesRouter.get("/experiences", ctrl.getAll);
experiencesRouter.post(
  "/experiences",
  validateBody(postSchema),
  ctrl.createOne,
);
experiencesRouter.put("/experiences", validateBody(putSchema), ctrl.updateOne);
experiencesRouter.delete("/experiences", ctrl.deleteOne);
