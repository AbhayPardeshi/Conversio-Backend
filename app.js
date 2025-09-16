import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postsRoutes.js";
import { connectDB } from "./db/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import upload from "./middlewares/upload.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // your React app
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middleware to parse JSON requests
app.use(json());

// Middleware to parse form (URL-encoded) requests
app.use(urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
