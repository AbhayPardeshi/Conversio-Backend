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
import http from "http";
import { initChatSockets } from "./sockets/chat.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"], // your React app
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
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize Socket.IO
initChatSockets(server, {
  corsOrigin: ["http://localhost:3000", "http://localhost:3002"],
});

server.listen(port, () => {
  console.log(`HTTP and Socket.IO server listening on port ${port}`);
});

export default app;
