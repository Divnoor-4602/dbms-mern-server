import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import HttpError from "./models/http-error.js";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet, { crossOriginResourcePolicy } from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/user-routes.js";
import postRouter from "./routes/post-routes.js";
import { register } from "./controllers/user-controller.js";
import { createPost } from "./controllers/post-controller.js";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// importing environment variables
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(helmet(crossOriginResourcePolicy({ policy: "cross-origin" })));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Setting up multer
// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// IMAGE UPLOAD ROUTES
app.post("/api/users/register", upload.single("picture"), register);
app.post("/api/posts/create", upload.single("picture"), createPost);

// importing routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

// error handler middlewear to handle custom http-error
app.use((error, req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.status(error.code || 500).json({
    message: error.message || "An unknown error occurred!",
  });
});

// 404 error handler
app.use((req, res, next) => {
  const error = new HttpError(404, "Route not found");
  throw error;
});

// MONGOOSE SETUP
const PORT = process.env.PORT || 6060;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((err) => {
    console.log(err);
  });
