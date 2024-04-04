import express from "express";
import {
  createPost,
  getPostFeed,
  getUserPosts,
  likePost,
} from "../controllers/post-controller.js";
import { checkAuth } from "../middleware/checkAuth.js";

const postRouter = express.Router();

postRouter.get("/feed", getPostFeed);
postRouter.patch("/like/:id", likePost);
postRouter.get("user-posts/:id", getUserPosts);

export default postRouter;
