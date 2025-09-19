import { Router } from "express";
const router = Router();
import { bookmarkPost,getUserBookmarks } from "../controllers/bookmarkController.js";


router.post("/:id", bookmarkPost);
router.get("/:id", getUserBookmarks)

export default router;