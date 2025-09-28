import { Router } from "express";
import {
  upsertDmConversation,
  getConversationMessages,
  sendMessage,
  getMessagedUsers,
} from "../controllers/chatController.js";

const router = Router();

// Create or get a DM conversation between two users
router.post("/dm", upsertDmConversation);

// Fetch messages for a conversation (paginated backwards)
router.get("/:conversationId/messages", getConversationMessages);

router.get("/conversation", getMessagedUsers);

// Send a message via REST (optional if using sockets only)
router.post("/message", sendMessage);

export default router;
