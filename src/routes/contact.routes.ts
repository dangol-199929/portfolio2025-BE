import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as ctrl from "../controllers/contact.controller";

const contactItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  href: z.string(),
  target: z.string().optional(),
  download: z.string().optional(),
});

const putSchema = z.array(contactItemSchema);

export const contactRouter = Router();

contactRouter.get("/contact", ctrl.getContactHandler);
contactRouter.put("/contact", validateBody(putSchema), ctrl.putContactHandler);
