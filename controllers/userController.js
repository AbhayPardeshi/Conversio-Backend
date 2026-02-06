import User from "../models/users.js";
import jwt from "jsonwebtoken";
import Follows from "../models/follows.js";
import mongoose from "mongoose";

export const getUser = async (req, res) => {
  try {
    const userID = req.params.id;

    // Find user and exclude sensitive fields
    const user = await User.findById(userID).select("-password -__v").lean();

    if (!user) {
      return res.status(404).json({
        action: "setUser",
        status: "error",
        message: "User not found",
      });
    }

    // Create safe user object with only necessary fields
    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followers: user.followers,
      following: user.following,
      bookmarkedPosts: user.bookmarkedPosts,
    };

    res.status(200).json({
      action: "setUser",
      status: "success",
      user: safeUser,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({
      action: "getUser",
      status: "error",
      message: "Failed to fetch user",
    });
  }
};

export const updateUser = async (req, res) => {
  const userID = req.params.id;
  const user = await User.findById(userID);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updateData = {};
  if (req.body.username) updateData.username = req.body.username;
  if (req.body.bio) updateData.bio = req.body.bio;
  if (req.file) {
    updateData.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  // Update user in DB
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }, // return updated document
  );

  const encodedToken = jwt.sign(
    {
      id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h",
    },
  );

  res.status(200).json({
    action: "userUpdated",
    user: updatedUser,
    encodedToken: encodedToken,
  });
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query cannot be empty" });
    }

    const userList = await User.find(
      { username: { $regex: query.trim(), $options: "i" } },
      "username profilePicture _id",
    )
      .limit(10)
      .sort({ username: 1 });

    return res.status(200).json({
      action: "searchedUsers",
      userList,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = (req, res) => {
  res.send("Delete user profile");
};

export const followUser = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // START FIRST

    const userId = req.params.id;
    const currentUserId = req.user.id;
    //const currentUserId = req.headers["x-user-id"];

    if (userId === currentUserId) {
      throw new Error("SELF_FOLLOW");
    }

    const userToFollow = await User.findById(userId).session(session);
    if (!userToFollow) {
      throw new Error("USER_NOT_FOUND");
    }

    const alreadyFollowing = await Follows.findOne({
      followerId: currentUserId,
      followingId: userId,
    }).session(session);

    if (alreadyFollowing) {
      throw new Error("ALREADY_FOLLOWING");
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

    return res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction(); // ✅ only abort if active
    }

    if (error.message === "SELF_FOLLOW") {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    if (error.message === "ALREADY_FOLLOWING") {
      return res.status(409).json({ message: "Already following" });
    }

    console.error("Follow error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const unfollowUser = (req, res) => {
  res.send("Unfollow a user");
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const follows = await Follows.find({ followerId: userId })
      .select("followingId")
      .limit(20);

    const followingIds = follows.map((f) => f.followingId);

    const users = await User.find({ _id: { $in: followingIds } }).select(
      "username avatar followersCount",
    );

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const follows = await Follows.find({ followingId: userId })
      .select("followerId")
      .limit(20);

    const followerIds = follows.map((f) => f.followerId);

    const users = await User.find({ _id: { $in: followerIds } }).select(
      "username avatar followersCount",
    );

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};