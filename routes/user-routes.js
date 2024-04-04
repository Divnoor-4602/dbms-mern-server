import express from "express";
import {
  register,
  login,
  getUser,
  getUserFriends,
  removeFriends,
  addFriends,
} from "../controllers/user-controller.js";
import { check } from "express-validator";

import { checkAuth } from "../middleware/checkAuth.js";

const userRouter = express.Router();

// ROUTES

// LOGIN ROUTE
userRouter.post(
  "/login",
  [check("email").not().isEmpty(), check("password").isLength({ min: "7" })],
  login
);

// GET A USER PROFILE ROUTE
userRouter.get("/:id", getUser);

// GET USER FRIENDS
userRouter.get("/friends/:id", getUserFriends);

// ADD REMOVE USER FRIENDS
userRouter.patch("/friends/add/:userId/:friendId", addFriends);
userRouter.patch("/friends/remove/:userId/:friendId", removeFriends);

export default userRouter;
