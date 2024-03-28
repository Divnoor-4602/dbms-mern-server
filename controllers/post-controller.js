import HttpError from "../models/http-error.js";
import Post from "../models/Posts.js";
import User from "../models/User.js";

// POST CONTROLLERS

// CREATE POST
const createPost = async (req, res, next) => {
  console.log("Creating a post");
  const { userId, description, picturePath } = req.body;

  // get the user from userId
  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Could not find user, please try again", 500);
    return next(err);
  }

  // if the user does not exist throw an error
  if (!user) {
    const err = new HttpError("User does not exist", 404);
    return next(err);
  }

  // create a new post
  const newPost = Post({
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    location: user.location,
    userPicturePath: user.picturePath,
    description,
    picturePath,
    likes: {},
    comments: [],
  });

  try {
    await newPost.save();
  } catch (error) {
    const err = new HttpError("Could not create post, please try again", 500);
    return next(err);
  }

  //   return the post data if created successfully
  res.status(200).json({ message: "Successfully created the post", newPost });
};

// READING AND GETTING THE POSTS

// GETTING ALL THE POSTS
const getPostFeed = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    const err = new HttpError("Could not fetch any posts", 500);
    return next(err);
  }
};

// GETTING THE USER POSTS
const getUserPosts = async (req, res, next) => {
  const { userId } = req.params;

  // find the userId in the post database to get the posts made by this user
  let posts;
  try {
    posts = await Post.find({ userId });
  } catch (error) {
    const err = new HttpError("Could not fetch posts", 500);
    return next(err);
  }

  res.status(200).json({ posts });
};

// UPDATING POSTS
const likePost = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  // fetch the post using the post id
  let post;
  try {
    post = await Post.findById(id);
  } catch (error) {
    const err = new HttpError("Could not fetch the post", 500);
    return next(err);
  }

  // check if the post has been liked by this user
  const isLiked = post.likes.get(userId);
  isLiked ? post.likes.delete(userId) : post.likes.set(userId, true);

  //   update the current post with the new post likes
  let updatedPost;
  try {
    updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );
  } catch (error) {
    const err = new HttpError("Could not like the post", 500);
    return next(err);
  }

  // return success if like / unlike is successful
  res.status(200).json(updatedPost);
};

export { createPost, getPostFeed, getUserPosts, likePost };
