import { Router } from "express";
import upload from "../middlewares/upload.js";
const router = Router();
import { feedPosts, createPost, getPost, deletePost,likePost } from "../controllers/postsController.js";

router.get("/", feedPosts);
router.post("/", upload.single("file"), createPost);
router.get("/:id", getPost);
router.post("/:id/like", likePost);

router.delete("/:id", deletePost);


export default router;
