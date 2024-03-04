import express from "express";
import feedController from "../controllers/feed.js";
import { asyncHandler } from "../utils/helpers.js";
import feedValidator from "../validation/feed.js";
import { isAuth } from "../middlewares/is-auth.js";
const feedRouter = express.Router();

// GET /feed/posts
feedRouter.get(
  "/posts",
  asyncHandler(isAuth),
  asyncHandler(feedController.getPosts)
);

// POST /feed/post
feedRouter.post(
  "/post",
  asyncHandler(isAuth),
  feedValidator.postValidation,
  asyncHandler(feedController.createPost)
);

// GET /feed/posts/:postId
feedRouter.get(
  "/posts/:postId",
  asyncHandler(isAuth),
  asyncHandler(feedController.getPost)
);

// PUT /feed/posts/:postId
feedRouter.put(
  "/posts/:postId",
  asyncHandler(isAuth),
  feedValidator.postValidation,
  asyncHandler(feedController.updatePost)
);

// DELETE /feed/posts/:postId
feedRouter.delete(
  "/posts/:postId",
  asyncHandler(isAuth),
  asyncHandler(feedController.deletePost)
);

// GET /feed/status
feedRouter.get(
  "/status",
  asyncHandler(isAuth),
  asyncHandler(feedController.getStatus)
);

// PUT /feed/status
feedRouter.put(
  "/status",
  asyncHandler(isAuth),
  feedValidator.statusValidation,
  asyncHandler(feedController.updateStatus)
);

export default feedRouter;
