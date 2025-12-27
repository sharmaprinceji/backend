const registerChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("🔌 Socket connected:", socket.id);

        // ---------------- CHAT ----------------
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

        // ---------------- VIDEO ----------------
        socket.on("join-video-room", ({ roomId }) => {
            socket.join(roomId);

            // notify existing users only
            socket.to(roomId).emit("user-joined-video");
        });

        socket.on("offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("offer", { offer });
        });

        socket.on("answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("answer", { answer });
        });


        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", { candidate });
        });

        socket.on("camera-state", ({ roomId, cameraOff }) => {
            //console.log('46===>',roomId,cameraOff)
            socket.to(roomId).emit("camera-state", {
                socketId: socket.id,
                cameraOff,
            });
        });


        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected:", socket.id);
        });
    });
};

export default registerChatSocket;
