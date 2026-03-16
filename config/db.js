import mongoose from "mongoose";
import { env, validateEnv } from "./env.js";

export const connectDB = async () => {
  validateEnv();

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB");
};
