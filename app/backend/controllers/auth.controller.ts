import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../modules/auth/service";
import { verifyAnyAuthToken } from "../auth/jwt";
import { ApiError } from "../middleware/errorHandler";

const service = new AuthService();

const signupSchema = z
  .object({
    organizationName: z.string().trim().min(1).max(160),
    regionCode: z.string().trim().min(1).max(64).optional(),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(200),
    fullName: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().email().max(320),
    password: z.string().min(1).max(200),
  })
  .strict();

const bootstrapSchema = z
  .object({
    organizationName: z.string().trim().min(1).max(160),
    regionCode: z.string().trim().min(1).max(64).optional(),
    fullName: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export const authController = {
  async signup(req: Request, res: Response) {
    const input = signupSchema.parse(req.body);
    res.status(201).json(await service.signup(input));
  },
  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    res.json(await service.login(input));
  },
  async bootstrap(req: Request, res: Response) {
    const input = bootstrapSchema.parse(req.body);
    const token = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new ApiError(401, "Missing bearer token");

    const claims = await verifyAnyAuthToken(token);
    if (!claims.email) throw new ApiError(400, "Authenticated identity is missing an email address");

    res.status(201).json(
      await service.bootstrapSupabaseIdentity({
        organizationName: input.organizationName,
        regionCode: input.regionCode,
        fullName: input.fullName,
        authSubject: claims.sub,
        email: claims.email,
      })
    );
  },
};
