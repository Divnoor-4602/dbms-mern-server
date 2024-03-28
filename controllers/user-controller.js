import HttpError from "../models/http-error.js";
import User from "../models/User.js";
import { checkAuth } from "../middleware/checkAuth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// USER CONTROLLERS

// REGISTER USER
const register = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    location,
    occupation,
    picturePath,
  } = req.body;

  // check if the user already exists
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Registration failed, please try again", 500);
    return next(err);
  }

  // throw an error if the user exists
  if (user) {
    const error = new HttpError("User already exists, please login", 422);
    return next(error);
  }

  // if the user does not exist hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    const err = new HttpError("Could not create user, please try again", 500);
    return next(err);
  }

  //  create a new user in the database
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    location,
    occupation,
    picturePath,
    viewedProfile: 0,
    impression: 0,
  });

  try {
    await newUser.save();
  } catch (error) {
    const err = new HttpError("Saving the user failed", 500);
    return next(err);
  }

  // create a jwt token on successfully saving the user
  let token;
  try {
    token = jwt(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1hr" }
    );
  } catch (error) {
    const err = new HttpError("Signing up failed, try again later", 500);
  }

  res.status(201).json({ message: "User created successfullyl" });
};

// LOGIN USER
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // check if the email exists
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Login failed, please try again", 500);
    return next(err);
  }

  // throw an error if the email does not exist
  if (!user) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  //   if the user exists compare the password using bcrypt
  let isPasswordValid;
  try {
    isPasswordValid = bcrypt.compare(password, user.password);
  } catch (error) {
    const err = new HttpError("Password could not be matched", 500);
    return next(err);
  }

  //   throw an error if the password match fails
  if (!isPasswordValid) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  // jwt token on successful password matching
  let token;

  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, try again later", 500);
    return next(error);
  }

  // if the password matches return a success json
  res
    .status(200)
    .json({ message: "Successfully logged in!", user: user, token: token });
};

// GET USER
const getUser = async (req, res, next) => {
  const userIdToFetch = req.params.id;

  // get the user from the database
  let user;
  try {
    user = await User.findById(userIdToFetch);
  } catch (err) {
    const error = new HttpError("Could not fetch the user", 500);
    return next(error);
  }

  // throw an error if the user does not exist
  if (!user) {
    const error = new HttpError("User does not exist", 404);
    return next(error);
  }

  //  otherwise return the user
  res.status(200).json({ user: user });
};

// GET USER FRIENDS
const getUserFriends = async (req, res, next) => {
  // find all the friends of a user
  const userIdToFetch = req.params.id;

  //   get the user from the database
  let user;
  try {
    user = await User.findById(userIdToFetch);
  } catch (error) {
    const err = new HttpError("Could not fetch the user", 500);
    return next(err);
  }

  //   if the user does not exist throw an error
  if (!user) {
    const error = new HttpError("User does not exist", 404);
    return next(error);
  }

  //   if the user exists fetch its friends
  let friends;
  try {
    friends = await Promise.all(user.friends.map((id) => User.findById(id)));
  } catch (error) {
    const err = new HttpError("Could not fetch the friends", 500);
    return next(err);
  }

  const formattedFriends = friends.map((friend) => {
    return {
      id: friend.id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      email: friend.email,
      picturePath: friend.picturePath,
      occupation: friend.occupation,
      location: friend.location,
    };
  });
  res.status(200).json({ friends: formattedFriends });
};

// REMOVE FRIENDS
const removeFriends = async (req, res, next) => {
  // get the user by user id
  const { userId, friendId } = req.params;

  //   fetch the user from the database
  let user;
  let friend;
  try {
    user = await User.findById(userId);
    friend = await User.findById(friendId);
  } catch (error) {
    const err = new HttpError("Could not fetch the user", 500);
    return next(err);
  }

  // throw an error if the user does not exist
  if (!user || !friend) {
    const error = new HttpError("User does not exist", 404);
    return next(error);
  }

  // remove the friend if the user exists
  if (user.friends.include(friend)) {
    user.friends = user.friends.filter((id) => id !== friend.id);
    friend.friends = friend.friend.filter((id) => id !== user.id);
  }

  try {
    await user.save();
    await friend.save();
  } catch (error) {
    const err = new HttpError("Could not update friends", 500);
    return next(err);
  }

  res.status(200).json({
    message: "Friend removed successfully",
    userFriends: user.friends,
  });
};

// ADD FRIENDS
const addFriends = async (req, res, next) => {
  // get the user by user id
  const { userId, friendId } = req.params;

  //   fetch the user from the database
  let user;
  let friend;
  try {
    user = await User.findById(userId);
    friend = await User.findById(friendId);
  } catch (error) {
    const err = new HttpError("Could not fetch the user", 500);
    return next(err);
  }

  // throw an error if the user does not exist
  if (!user || !friend) {
    const error = new HttpError("User does not exist", 404);
    return next(error);
  }

  // add the friend if the user exists
  if (!user.friends.include(friend)) {
    user.friends.push(friend);
    friend.friends.push(user);
  }

  try {
    await user.save();
    await friend.save();
  } catch (error) {
    const err = new HttpError("Could not update friends", 500);
    return next(err);
  }

  res.status(200).json({
    message: "Friend added successfully",
    userFriends: user.friends,
  });
};

export { register, login, getUser, getUserFriends, removeFriends, addFriends };
