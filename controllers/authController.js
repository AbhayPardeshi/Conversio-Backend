import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  // Register new user
  try {
    const user = req.body;
    console.log(user.email, user.password, user.username);

    // Check if user already exists
    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(
      user.password + process.env.PEPPER,
      parseInt(process.env.SALT_ROUNDS, 10) || 10
    );

    const newUser = new User({
      username: user.name,
      email: user.email,
      password: hashedPassword,
      bio: "This is my bio",
    });
    

    res.status(201).json({
      action: "register",
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password (plain comparison)
    if (
      bcrypt.compareSync(password + process.env.PEPPER, user.password) === false
    ) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const encodedToken = jwt.sign( { id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });

    res.status(200).json({
      action: "login",
      message: "Logged in successfully",
      encodedToken: encodedToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  // Handle user logout (if using sessions or tokens, invalidate them here)
  res.send("Logout endpoint - to be");
};
