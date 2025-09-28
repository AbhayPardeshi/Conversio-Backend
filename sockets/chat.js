import { Server } from "socket.io";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import mongoose from "mongoose";

/**
 * Initialize Socket.IO and register chat events.
 * - joinRoom: client joins a specific room (e.g., conversationId or user pair room)
 * - sendMessage: broadcast message to room
 */
export function initChatSockets(
  httpServer,
  { corsOrigin = ["http://localhost:3000", "http://localhost:3002"] } = {}
) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const makeDmRoomId = (a, b) => {
      const [x, y] = [String(a), String(b)].sort();
      return `dm:${x}:${y}`;
    };

    socket.on("joinRoom", ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    });

    // Join a DM between two users
    socket.on("joinDm", ({ selfUserId, otherUserId }) => {
      if (!selfUserId || !otherUserId) return;
      const roomId = makeDmRoomId(selfUserId, otherUserId);
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    });

    // Send a message to a room (roomId is conversationId)
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        if (!roomId || !message?.senderId || !message?.text) return;
        // validate conversation id
        if (!mongoose.isValidObjectId(roomId)) return;
        const saved = await Message.create({
          conversation: roomId,
          sender: message.senderId,
          text: message.text,
        });
        await Conversation.findByIdAndUpdate(roomId, {
          lastMessage: message.text,
          updatedAt: new Date(),
        });
        const payload = {
          _id: saved._id,
          roomId,
          senderId: String(saved.sender),
          text: saved.text,
          createdAt: saved.createdAt,
        };
        socket.to(roomId).emit("newMessage", payload);
        socket.emit("newMessage", payload);
      } catch (_) {
        // optional: emit error event
      }
    });

    // Send a DM (room inferred by user ids)
    socket.on("sendDm", async ({ selfUserId, otherUserId, message }) => {
      try {
        console.log("still here");

        if (!selfUserId || !otherUserId || !message?.text) return;
        console.log("here");

        const [a, b] = [String(selfUserId), String(otherUserId)].sort();
        // upsert conversation for the two participants
        let convo = await Conversation.findOne({
          participants: { $all: [a, b], $size: 2 },
        });
        if (!convo) {
          convo = await Conversation.create({ participants: [a, b] });
        }
        const saved = await Message.create({
          conversation: convo._id,
          sender: selfUserId,
          text: message.text,
        });
        await Conversation.findByIdAndUpdate(convo._id, {
          lastMessage: message.text,
          updatedAt: new Date(),
        });
        const roomId = makeDmRoomId(selfUserId, otherUserId);
        const payload = {
          _id: saved._id,
          roomId,
          conversationId: String(convo._id),
          senderId: String(saved.sender),
          text: saved.text,
          createdAt: saved.createdAt,
        };
        socket.to(roomId).emit("newMessage", payload);
        socket.emit("newMessage", payload);
      } catch (_) {
        // optional: emit error event
      }
    });

    // Typing indicators
    socket.on("typing", ({ roomId, userId, isTyping }) => {
      if (!roomId || !userId) return;
      socket
        .to(roomId)
        .emit("typing", { roomId, userId, isTyping: Boolean(isTyping) });
    });

    socket.on("disconnect", () => {
      // Cleanup or logging can be handled here
    });
  });

  return io;
}
