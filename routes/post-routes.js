import express from "express";
import {
  createPost,
  getPostFeed,
  getUserPosts,
  likePost,
} from "../controllers/post-controller.js";
import { checkAuth } from "../middleware/checkAuth.js";

const postRouter = express.Router();

postRouter.use(checkAuth);
postRouter.post("/create", createPost);
postRouter.get("/feed", getPostFeed);
postRouter.get("user-posts/:id", getUserPosts);
postRouter.patch("like/:id", likePost);

export default postRouter;
