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
import multer from "multer";
import { checkAuth } from "../middleware/checkAuth.js";

const userRouter = express.Router();

// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// ROUTES

// REGISTER ROUTE
userRouter.post(
  "/register",
  [check("email").not().isEmpty(), check("password").isLength({ min: "7" })],
  upload.single("picture"),
  register
);

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
userRouter.patch("/friends/remove/:id/:friendId", checkAuth, removeFriends);
userRouter.patch("/friends/add/:id/:friendId", checkAuth, addFriends);

export default userRouter;
