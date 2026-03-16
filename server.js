import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initChatSockets } from "./sockets/chat.js";

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initChatSockets(server);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
