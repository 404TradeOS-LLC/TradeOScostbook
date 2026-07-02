import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authRateLimit } from "../middleware/authRateLimit";

export const authRouter = Router();

authRouter.post("/signup", authRateLimit, asyncHandler(authController.signup));
authRouter.post("/login", authRateLimit, asyncHandler(authController.login));
authRouter.post("/bootstrap", authRateLimit, asyncHandler(authController.bootstrap));
