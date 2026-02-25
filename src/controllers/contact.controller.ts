import { Request, Response, NextFunction } from "express";
import {
  getContact,
  updateContact,
  ContactItem,
} from "../db/contact.repository";

export async function getContactHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const items = await getContact();
    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
}

export async function putContactHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const body = req.body as ContactItem[];
  if (!Array.isArray(body)) {
    const err = new Error("Body must be an array of contact items") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  try {
    const updated = await updateContact(body);
    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
}
