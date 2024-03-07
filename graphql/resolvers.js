import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import Post from "../models/post.js";
import { deleteFile } from "../utils/helpers.js";

const PER_PAGE = 2;

const feedResolver = {
  getPosts: async ({ page }, { req }) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    const currentPage = +page || 1;
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * PER_PAGE)
      .sort({ createdAt: -1 })
      .limit(PER_PAGE)
      .populate("creator", "name");
    return {
      posts: posts.map((p) => ({
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      totalItems,
    };
  },
  getPost: async ({ id }, { req }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.status = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  getStatus: async (_, { req }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    return user.status;
  },
  createPost: async ({ userInput }, { req }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    // validations
    const { title, content, imageUrl } = userInput;
    const errors = [];
    if (!title || !content) {
      const error = new Error("Please enter all fields.");
      errors.push(error);
    }
    if (!validator.isLength(title, { min: 5 })) {
      const error = new Error("Title too short!");
      errors.push(error);
    }
    if (!validator.isLength(content, { min: 5 })) {
      const error = new Error("Content too short!");
      errors.push(error);
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.status = 422;
      throw error;
    }
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: user,
    });
    user.posts.push(post);
    await user.save();
    const result = await post.save();
    return {
      ...result._doc,
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },
  updatePost: async ({ id, userInput }, { req }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    // validations
    const { title, content, imageUrl } = userInput;
    const errors = [];
    if (!title || !content) {
      const error = new Error("Please enter all fields.");
      errors.push(error);
    }
    if (!validator.isLength(title, { min: 5 })) {
      const error = new Error("Title too short!");
      errors.push(error);
    }
    if (!validator.isLength(content, { min: 5 })) {
      const error = new Error("Content too short!");
      errors.push(error);
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.status = 422;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.status = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.status = 403;
      throw error;
    }
    post.title = title;
    post.content = content;
    if (imageUrl !== "undefined") {
      post.imageUrl = imageUrl;
    }
    const result = await post.save();
    return {
      ...result._doc,
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },
  deletePost: async ({ id }, { req, next }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("Could not find post.");
      error.status = 404;
      throw error;
    }
    const userId = req.userId;
    if (post.creator.toString() !== userId) {
      const error = new Error("Not authorized!");
      error.status = 403;
      throw error;
    }
    deleteFile(post.imageUrl.replace("/", "\\"), next);
    const result = await Post.findByIdAndDelete(id);
    const user = await User.findById(userId);
    user.posts.pull(id);
    await user.save();
    return {
      ...result._doc,
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },
  updateStatus: async ({ status }, { req }) => {
    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.status = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return status;
  },
};

const authResolver = {
  createUser: async ({ userInput }) => {
    let email = userInput.email;
    const { name, password } = userInput;
    // validations
    const errors = [];
    if (!email || !name || !password) {
      const error = new Error("Please enter all fields.");
      errors.push(error);
    }
    if (!validator.isEmail(email)) {
      const error = new Error("Email is invalid.");
      errors.push(error);
    }
    if (!validator.isLength(password, { min: 5 })) {
      const error = new Error("Password too short!");
      errors.push(error);
    }
    if (!validator.isLength(name, { min: 2 })) {
      const error = new Error("Name too short!");
      errors.push(error);
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.status = 422;
      throw error;
    }
    // check if user exists
    email = validator.normalizeEmail(email);
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      const error = new Error("User exists already!");
      throw error;
    }
    // create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const result = await user.save();
    return { ...result._doc, _id: result._id.toString() };
  },
  login: async ({ userInput }) => {
    let email = userInput.email;
    const { password } = userInput;
    // validations
    const errors = [];
    if (!email || !password) {
      const error = new Error("Please enter all fields.");
      errors.push(error);
    }
    if (!validator.isEmail(email)) {
      const error = new Error("Email is invalid.");
      errors.push(error);
    }
    if (!validator.isLength(password, { min: 5 })) {
      const error = new Error("Password too short!");
      errors.push(error);
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.status = 422;
      throw error;
    }
    // check if user exists or not
    email = validator.normalizeEmail(email);
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("A user with this email could not be found!");
      error.status = 401;
      throw error;
    }
    // check if password is correct
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Email or password is incorrect.");
      error.status = 401;
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
    return { token, userId: user._id.toString() };
  },
};

export default {
  ...feedResolver,
  ...authResolver,
};
