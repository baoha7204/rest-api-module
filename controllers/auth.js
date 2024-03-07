import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });
  const result = await user.save();
  res.status(201).json({ message: "User created!", userId: result._id });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("A user with this email could not be found.");
    error.statusCode = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Email or password is incorrect.");
    error.statusCode = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ token, userId: user._id.toString() });
};

export default {
  signup,
  login,
};
