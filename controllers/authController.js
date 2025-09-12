import User from "../models/users.js";
import bcrypt from "bcryptjs";

// let User = [
//   {
//     _id: "12345",
//     username: "john_doe",
//     email: "john@example.com",
//     password: "password123",
//   },
//   {
//     _id: "67890",
//     username: "jane_doe",
//     email: "jane@example.com",
//     password: "password456",
//   },
// ];

export const register = async (req, res) => {
  // Register new user
  try {
    const user = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(
      user.password + process.env.PEPPER,
      10
    );
   
    // Create new user (store plain password for learning only)
    const newUser = new User({
      ...user,
      password: hashedPassword,
      bio : "This is my bio",
    });
    await newUser.save();

    // const user = await newUser.save();
    res.status(201).json({
      message: "User created successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = User.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password (plain comparison)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Logged in successfully",
      userId: user._id,
    });

    res.send("Login endpoint - to be implemented");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  // Handle user logout (if using sessions or tokens, invalidate them here)
  res.send("Logout endpoint - to be");
};
