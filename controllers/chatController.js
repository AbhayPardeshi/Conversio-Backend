import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import mongoose from "mongoose";

// Ensure two participants array is stored sorted for deterministic uniqueness
const normalizeParticipants = (a, b) => [String(a), String(b)].sort();

export const upsertDmConversation = async (req, res) => {
  try {
    const { userIdA, userIdB } = req.body;
    if (!userIdA || !userIdB) {
      return res
        .status(400)
        .json({ message: "userIdA and userIdB are required" });
    }
    const participants = normalizeParticipants(userIdA, userIdB);

    let convo = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });
    if (!convo) {
      convo = await Conversation.create({ participants });
    }
    return res.json(convo);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return res.json(messages.reverse());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;
    if (!conversationId || !senderId || !text) {
      return res
        .status(400)
        .json({ message: "conversationId, senderId, text are required" });
    }
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: new Date(),
    });
    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
