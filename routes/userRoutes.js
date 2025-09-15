import { Router } from "express";
import { getUser, updateUser, followUser, unfollowUser } from "../controllers/userController.js";
import upload from "../middlewares/upload.js";
const router = Router();


router.get("/:id", getUser);
router.patch("/:id", upload.single("file"), updateUser);
router.post("/:id/follow", followUser);
router.post("/:id/unfollow", unfollowUser);
export default router;