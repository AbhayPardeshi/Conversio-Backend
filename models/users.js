import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    bookmarkedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    followersCount: { type: Number, default:0 },
    followingCount: { type: Number, default:0 },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
); 


const User = mongoose.model("User", userSchema);

export default User;
