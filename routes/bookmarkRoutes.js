import { Router } from "express";
const router = Router();
import { bookmarkPost } from "../controllers/bookmarkController.js";


router.post("/:id", bookmarkPost);

export default router;