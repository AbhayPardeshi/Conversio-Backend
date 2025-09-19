import User from "../models/users.js";
import jwt from "jsonwebtoken";

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
    { new: true } // return updated document
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
    }
  );

  res.status(200).json({
    action: "userUpdated",
    user: updatedUser,
    encodedToken: encodedToken,
  });
};

export const deleteUser = (req, res) => {
  res.send("Delete user profile");
};



export const followUser = (req, res) => {
  res.send("Follow a user");
};
export const unfollowUser = (req, res) => {
  res.send("Unfollow a user");
};
export const getFollowers = (req, res) => {
  res.send("Get followers of a user");
};

export const getFollowing = (req, res) => {
  res.send("Get following of a user");
};
