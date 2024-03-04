import { validationResult } from "express-validator";
import Post from "../models/post.js";
import User from "../models/user.js";
import { deleteFile } from "../utils/helpers.js";

const PER_PAGE = 2;

export const getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const totalItems = await Post.find().countDocuments();
  const posts = await Post.find()
    .skip((currentPage - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .populate("creator", "name");
  res.status(200).json({
    message: "Fetched posts successfully.",
    posts,
    totalItems,
  });
};

export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed, form data is incorrect!");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const { title, content } = req.body;
  const userId = req.userId;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: userId,
  });
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  user.posts.push(post);
  await user.save();
  const result = await post.save();
  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: result,
    creator: {
      _id: user._id,
      name: user.name,
    },
  });
};

export const getPost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ message: "Post fetched.", post: post });
};

const updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed, form data is incorrect!");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;
    throw error;
  }
  if (post.creator.toString() !== req.userId) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    throw error;
  }
  if (imageUrl !== post.imageUrl) {
    deleteFile(post.imageUrl, next);
  }
  post.title = title;
  post.imageUrl = imageUrl;
  post.content = content;
  const result = await post.save();
  res.status(200).json({ message: "Post updated!", post: result });
};

export const deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;
    throw error;
  }
  if (post.creator.toString() !== req.userId) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    throw error;
  }
  deleteFile(post.imageUrl, next);
  const result = await Post.findByIdAndDelete(postId);
  const user = await User.findById(req.userId);
  user.posts.pull(postId);
  await user.save();
  res.status(200).json({ message: "Deleted post.", post: result });
};

export const getStatus = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ status: user.status });
};

export const updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed, form data is incorrect!");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  const newStatus = req.body.status;
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  user.status = newStatus;
  await user.save();
  res.status(200).json({ message: "Status updated.", status: user.status });
};

export default {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getStatus,
  updateStatus,
};
