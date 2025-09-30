import { Router } from "express";
import upload from "../middlewares/upload.js";
const router = Router();
import {
  feedPosts,
  createPost,
  getPost,
  deletePost,
  likePost,
  createComment,
  fetchComments,
} from "../controllers/postsController.js";

router.get("/", feedPosts);
router.post("/", upload.single("file"), createPost);
router.get("/:id", getPost);
router.post("/:id/like", likePost);
router.post("/:postId/comments", createComment);
router.get("/:postId/comments", fetchComments);

router.delete("/:id", deletePost);

export default router;
