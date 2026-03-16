import path from "path";
import { env } from "../config/env.js";

export const buildStoredFilePath = (fileName) => `/uploads/${fileName}`;

export const buildPublicFileUrl = (req, fileName) => {
  if (env.uploadBaseUrl) {
    return `${env.uploadBaseUrl.replace(/\/$/, "")}/${fileName}`;
  }

  return `${req.protocol}://${req.get("host")}${buildStoredFilePath(fileName)}`;
};

export const resolveUploadDirectory = (...segments) => path.join(process.cwd(), env.uploadDir, ...segments);
