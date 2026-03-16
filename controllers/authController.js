import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const user = req.body;
  const existingUser = await User.findOne({ email: user.email });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(
    user.password + env.pepper,
    env.saltRounds,
  );

  const newUser = new User({
    username: user.name,
    email: user.email,
    password: hashedPassword,
    bio: "This is my bio",
  });

  await newUser.save();

  res.status(201).json({
    action: "register",
    message: "User created successfully",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 400);
  }

  const isPasswordValid = bcrypt.compareSync(password + env.pepper, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 400);
  }

  const encodedToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
    },
    env.jwtSecret,
    { expiresIn: "10h" },
  );

  res.status(200).json({
    action: "login",
    message: "Logged in successfully",
    encodedToken,
  });
});

export const logout = (_req, res) => {
  res.status(200).json({
    action: "logout",
    message: "Logout endpoint - token invalidation should be handled client-side or via a token blocklist",
  });
};
