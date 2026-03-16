import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Follows from "../models/follows.js";
import User from "../models/users.js";
import { env } from "../config/env.js";
import { buildPublicFileUrl } from "../services/storageService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -__v").lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    action: "setUser",
    status: "success",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followers: user.followers,
      following: user.following,
      bookmarkedPosts: user.bookmarkedPosts,
    },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updateData = {};
  if (req.body.username) updateData.username = req.body.username;
  if (req.body.bio) updateData.bio = req.body.bio;
  if (req.file) {
    updateData.profilePicture = buildPublicFileUrl(req, req.file.filename);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true },
  );

  const encodedToken = jwt.sign(
    {
      id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
    },
    env.jwtSecret,
    { expiresIn: "10h" },
  );

  res.status(200).json({
    action: "userUpdated",
    user: updatedUser,
    encodedToken,
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    throw new AppError("Query cannot be empty", 400);
  }

  const userList = await User.find(
    { username: { $regex: query.trim(), $options: "i" } },
    "username profilePicture _id",
  )
    .limit(10)
    .sort({ username: 1 });

  res.status(200).json({
    action: "searchedUsers",
    userList,
  });
});

export const deleteUser = (_req, res) => {
  res.status(501).json({ message: "Delete user profile is not implemented yet" });
};

export const followUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.params.id;
    const currentUserId = req.headers["x-user-id"];

    if (!currentUserId) {
      throw new AppError("x-user-id header is required", 400);
    }

    if (userId === currentUserId) {
      throw new AppError("Cannot follow yourself", 400);
    }

    const userToFollow = await User.findById(userId).session(session);
    if (!userToFollow) {
      throw new AppError("User not found", 404);
    }

    const alreadyFollowing = await Follows.findOne({
      followerId: currentUserId,
      followingId: userId,
    }).session(session);

    if (alreadyFollowing) {
      throw new AppError("Already following", 409);
    }

    await Follows.create(
      [
        {
          followerId: currentUserId,
          followingId: userId,
        },
      ],
      { session },
    );

    await User.updateOne(
      { _id: currentUserId },
      { $inc: { followingCount: 1 } },
      { session },
    );

    await User.updateOne(
      { _id: userId },
      { $inc: { followersCount: 1 } },
      { session },
    );

    await session.commitTransaction();

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    session.endSession();
  }
});

export const unfollowUser = (_req, res) => {
  res.status(501).json({ message: "Unfollow a user is not implemented yet" });
};

export const getFollowing = asyncHandler(async (req, res) => {
  const follows = await Follows.find({ followerId: req.params.id })
    .select("followingId")
    .limit(20);

  const followingIds = follows.map((follow) => follow.followingId);
  const users = await User.find({ _id: { $in: followingIds } }).select(
    "username profilePicture followersCount",
  );

  res.status(200).json({ action: "followingFetched", users });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const follows = await Follows.find({ followingId: req.params.id })
    .select("followerId")
    .limit(20);

  const followerIds = follows.map((follow) => follow.followerId);
  const users = await User.find({ _id: { $in: followerIds } }).select(
    "username profilePicture followersCount",
  );

  res.status(200).json({ action: "followersFetched", users });
});
