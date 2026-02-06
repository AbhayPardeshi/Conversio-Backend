import { Router } from "express";
import {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  searchUsers,
  getFollowing,
  getFollowers
} from "../controllers/userController.js";
import upload from "../middlewares/upload.js";
const router = Router();

router.get("/:id", getUser);
router.get("/", searchUsers);
router.patch("/:id", upload.single("file"), updateUser);
router.post("/:id/follow", followUser);
router.post("/:id/unfollow", unfollowUser);
router.get("/:id/following", getFollowing);
router.get("/:id/followers", getFollowers);

export default router;
