import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    firstName: { type: String, require: true, min: 3, max: 50 },
    lastName: { type: String, require: true, min: 3, max: 50 },
    email: { type: String, require: true, unique: true, max: 50 },
    password: { type: String, require: true, min: 7 },
    picturePath: { type: String, default: "" },
    friends: { type: Array, default: [] },
    location: String,
    occupation: String,
    impressions: Number,
    viewedProfile: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
