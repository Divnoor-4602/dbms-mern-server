import jwt from "jsonwebtoken";
import HttpError from "../models/http-error.js";

export const checkAuth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization : bearer token
    if (!token) {
      const error = new HttpError("Authentication failed", 403);
      return next(error);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    const err = new HttpError("Authentication failed", 403);
    return next(err);
  }
};
