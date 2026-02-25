import { Request, Response, NextFunction } from "express";
import { getAbout, updateAbout, AboutRecord } from "../db/about.repository";

export async function getAboutHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getAbout();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

export async function putAboutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const body = req.body as Partial<AboutRecord>;
  try {
    const updated = await updateAbout(body);
    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
}
