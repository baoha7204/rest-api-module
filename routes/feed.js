import express from "express";
import feedController from "../controllers/feed.js";

const feedRouter = express.Router();

// GET /feed/posts
feedRouter.get("/posts", feedController.getPosts);

export default feedRouter;
