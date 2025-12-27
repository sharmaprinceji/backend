const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);
      console.log(`👤 ${user} joined room ${roomId}`);

      socket.to(roomId).emit("user-joined", {
        user,
        message: `${user} joined the chat`,
      });
    });

    socket.on("send-message", ({ roomId, user, message }) => {
      io.to(roomId).emit("receive-message", {
        user,
        message,
        time: new Date().toISOString(),
      });
    });


    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};

export default registerChatSocket;
