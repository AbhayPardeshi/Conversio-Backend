import dotenv from "dotenv";

dotenv.config();

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(
  process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:3000,http://localhost:3002",
);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  pepper: process.env.PEPPER || "",
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  allowedOrigins,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  uploadBaseUrl: process.env.UPLOAD_BASE_URL || "",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 5,
};

export const validateEnv = () => {
  const required = ["mongoUri", "jwtSecret", "pepper"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
