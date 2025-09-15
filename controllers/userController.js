import User from "../models/users.js";

export const getUser = (req, res) => {
  res.send("Get user profile");
}

export const updateUser = (req, res) => {
  console.log("hi");
  
  const email = req.body.userEmail;

  const user = User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.username = req.body.name;
  user.bio = req.body.bio;
  user.profilePicture = req.file ? `/uploads/${req.file.filename}` : user.profilePicture;
  user.coverPhoto = req.body.coverPhoto || user.coverPhoto;
  user.save();

  res.send("Update user profile");
}

export const deleteUser = (req, res) => {
    res.send("Delete user profile");
}

export const followUser = (req, res) => {
  res.send("Follow a user");
}
export const unfollowUser = (req, res) => {
    res.send("Unfollow a user");

}
export const getFollowers = (req, res) => {
    res.send("Get followers of a user");
}

export const getFollowing = (req, res) => {
    res.send("Get following of a user");
}