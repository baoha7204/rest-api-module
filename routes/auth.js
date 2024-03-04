import express from "express";
import authController from "../controllers/auth.js";
import authValidator from "../validation/auth.js";
import { asyncHandler } from "../utils/helpers.js";
const authRouter = express.Router();

// PUT /auth/signup
authRouter.put(
  "/signup",
  authValidator.signupValidation,
  asyncHandler(authController.signup)
);

// POST /auth/login
authRouter.post(
  "/login",
  authValidator.loginValidation,
  asyncHandler(authController.login)
);

export default authRouter;
