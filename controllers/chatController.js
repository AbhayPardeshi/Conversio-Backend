import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const normalizeParticipants = (a, b) => [String(a), String(b)].sort();

export const upsertDmConversation = asyncHandler(async (req, res) => {
  const { userIdA, userIdB } = req.body;
  if (!userIdA || !userIdB) {
    throw new AppError("userIdA and userIdB are required", 400);
  }

  const participants = normalizeParticipants(userIdA, userIdB);
  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants });
  }

  res.status(200).json(conversation);
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, before } = req.query;

  const query = { conversation: conversationId };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(200).json(messages.reverse());
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, senderId, text } = req.body;
  if (!conversationId || !senderId || !text) {
    throw new AppError("conversationId, senderId, text are required", 400);
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

  res.status(201).json(message);
});

export const getMessagedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.query.userId;
  if (!currentUserId) {
    throw new AppError("user id is required", 400);
  }

  const conversations = await Conversation.find({
    participants: currentUserId,
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  })
    .populate("participants", "username profilePicture")
    .select("participants lastMessage");

  const usersWithLastMessage = conversations
    .map((conversation) => {
      const otherUser = conversation.participants.find(
        (participant) => participant._id.toString() !== currentUserId.toString(),
      );

      if (!otherUser) {
        return null;
      }

      return {
        ...otherUser.toObject(),
        lastMessage: conversation.lastMessage,
      };
    })
    .filter(Boolean);

  res.status(200).json({ users: usersWithLastMessage });
});
