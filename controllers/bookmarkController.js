import Post from "../models/posts.js";
import User from "../models/users.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const bookmarkPost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const post = await Post.findById(req.body.postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (user.bookmarkedPosts.includes(post._id)) {
    user.bookmarkedPosts.pull(post._id);
  } else {
    user.bookmarkedPosts.push(post._id);
  }

  await user.save();

  res.status(200).json({
    action: "postBookmarked",
    postId: post._id,
  });
});

export const getUserBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate({
    path: "bookmarkedPosts",
    populate: {
      path: "user",
      select: "username profilePicture email",
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    action: "userBookmarks",
    bookmarkedPosts: user.bookmarkedPosts,
  });
});
