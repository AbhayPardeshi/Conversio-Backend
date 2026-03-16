import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postsRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDirectory = path.join(__dirname, env.uploadDir);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: env.nodeEnv,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(uploadsDirectory));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
