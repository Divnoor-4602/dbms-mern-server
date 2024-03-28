import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet, { crossOriginResourcePolicy } from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/user-routes.js";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// importing environment variables
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet(crossOriginResourcePolicy({ policy: "cross-origin" })));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// importing routes
app.use("/api/users", userRouter);

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
  })
  .catch((err) => {
    console.log(err);
  });
