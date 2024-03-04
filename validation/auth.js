import { body } from "express-validator";
import User from "../models/user.js";

export const signupValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        return Promise.reject("E-Mail address already exists!");
      }
      return true;
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
  body("name").trim().not().isEmpty(),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
];

export default {
  signupValidation,
  loginValidation,
};
