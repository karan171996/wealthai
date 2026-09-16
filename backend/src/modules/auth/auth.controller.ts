import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = credentialsSchema.parse(req.body);
    const result = await authService.register(email, password, name);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = credentialsSchema.pick({ email: true, password: true }).parse(req.body);
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
