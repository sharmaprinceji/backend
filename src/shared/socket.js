import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    path: "/socket.io",     // ✅ IMPORTANT
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
