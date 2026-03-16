import mongoose from "mongoose";
import Post from "../models/posts.js";
import User from "../models/users.js";
import { buildStoredFilePath } from "../services/storageService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const feedPosts = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalPosts = await Post.countDocuments({ parentPost: null });
  const totalPages = Math.ceil(totalPosts / limit);
  const hasMore = page < totalPages;

  const posts = await Post.aggregate([
    { $match: { parentPost: null } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "posts",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$parentPost", "$$postId"] } } },
          { $count: "count" },
        ],
        as: "commentsCount",
      },
    },
    {
      $addFields: {
        commentsCount: {
          $ifNull: [{ $arrayElemAt: ["$commentsCount.count", 0] }, 0],
        },
      },
    },
    {
      $project: {
        user: {
          _id: 1,
          username: 1,
          email: 1,
          profilePicture: 1,
        },
        text: 1,
        media: 1,
        likes: 1,
        parentPost: 1,
        createdAt: 1,
        updatedAt: 1,
        commentsCount: 1,
        __v: 1,
      },
    },
  ]);

  res.status(200).json({
    action: "feedPosts",
    posts,
    pagination: { page, limit, totalPosts, totalPages, hasMore },
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const newPost = new Post({
    user: user._id,
    text: req.body.text,
    media: req.file ? [buildStoredFilePath(req.file.filename)] : [],
    likes: [],
    parentPost: req.body.parentPostId || null,
  });

  const savedPost = await newPost.save();
  const populatedPost = await savedPost.populate(
    "user",
    "username email profilePicture",
  );

  res.status(201).json({
    action: "postAdded",
    savedPost: populatedPost,
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "username email profilePicture",
  );

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json({
    action: "getPost",
    post,
  });
});

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.likes.includes(req.body.userId)) {
    post.likes.pull(req.body.userId);
  } else {
    post.likes.push(req.body.userId);
  }

  const updatedPost = await post.save();
  await updatedPost.populate("user", "username email profilePicture");

  res.status(200).json({
    action: "postLiked",
    posts: updatedPost,
  });
});

export const deletePost = (_req, res) => {
  res.status(501).json({ message: "Delete a specific post is not implemented yet" });
};

export const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId, text, parentPostId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const parentId = parentPostId || postId;
  const parentPost = await Post.findById(parentId);
  if (!parentPost) {
    throw new AppError("Parent not found", 404);
  }

  const comment = await Post.create({
    user: user._id,
    text,
    parentPost: parentId,
    media: req.file ? [buildStoredFilePath(req.file.filename)] : [],
    likes: [],
  });

  const populatedComment = await comment.populate(
    "user",
    "username profilePicture",
  );

  res.status(201).json({
    action: "commentAdded",
    comment: populatedComment,
  });
});

export const fetchComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const data = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(postId) } },
    {
      $graphLookup: {
        from: "posts",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentPost",
        as: "comments",
        depthField: "depth",
      },
    },
    { $project: { comments: 1 } },
    { $unwind: "$comments" },
    {
      $lookup: {
        from: "users",
        localField: "comments.user",
        foreignField: "_id",
        as: "comments.user",
      },
    },
    { $unwind: "$comments.user" },
    {
      $group: {
        _id: null,
        comments: { $push: "$comments" },
      },
    },
  ]);

  const comments = data[0]?.comments || [];
  res.status(200).json({ action: "allPostComments", comments });
});
