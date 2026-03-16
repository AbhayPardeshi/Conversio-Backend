import { Server } from "socket.io";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import { env } from "../config/env.js";

export function initChatSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.allowedOrigins,
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

    socket.on("joinDm", ({ selfUserId, otherUserId }) => {
      if (!selfUserId || !otherUserId) return;
      const roomId = makeDmRoomId(selfUserId, otherUserId);
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    });

    socket.on("sendDm", async ({ selfUserId, otherUserId, message }) => {
      try {
        if (!selfUserId || !otherUserId || !message?.text) return;

        const participants = [String(selfUserId), String(otherUserId)].sort();

        let conversation = await Conversation.findOne({
          participants: { $all: participants, $size: 2 },
        });

        if (!conversation) {
          conversation = await Conversation.create({ participants });
        }

        const savedMessage = await Message.create({
          conversation: conversation._id,
          sender: selfUserId,
          text: message.text,
        });

        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: message.text,
          updatedAt: new Date(),
        });

        const roomId = makeDmRoomId(selfUserId, otherUserId);
        const payload = {
          _id: savedMessage._id,
          roomId,
          conversationId: String(conversation._id),
          senderId: String(savedMessage.sender),
          text: savedMessage.text,
          createdAt: savedMessage.createdAt,
        };

        socket.to(roomId).emit("newMessage", payload);
        socket.emit("newMessage", payload);
      } catch (error) {
        console.error("Socket sendDm error", error);
        socket.emit("socketError", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ roomId, userId, isTyping }) => {
      if (!roomId || !userId) return;

      socket
        .to(roomId)
        .emit("typing", { roomId, userId, isTyping: Boolean(isTyping) });
    });
  });

  return io;
}
