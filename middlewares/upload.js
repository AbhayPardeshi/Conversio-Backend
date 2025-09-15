import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { log } from "console";

// __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);

const __dirname = dirname(__filename);
log(__dirname);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

export default upload;
