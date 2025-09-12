import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./db/db.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON requests
app.use(json());

// Middleware to parse form (URL-encoded) requests
app.use(urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
