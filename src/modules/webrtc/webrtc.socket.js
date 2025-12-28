const registerWebRTCSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(" WebRTC Socket Connected:", socket.id);

    socket.on("join-video-room", ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined-video", socket.id);
    });

    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });
  });
};

export default registerWebRTCSocket;
