const registerChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // ---------------- CHAT ----------------

        socket.on("send-message", ({ roomId, user, message }) => {
            io.to(roomId).emit("receive-message", {
                user,
                message,
                time: new Date().toISOString(),
            });
        });

        socket.on("camera-state", ({ roomId, cameraOff }) => {
            //console.log('46===>',roomId,cameraOff)
            socket.to(roomId).emit("camera-state", {
                socketId: socket.id,
                cameraOff,
            });
        });

       // ---------------- Vedio ----------------


        socket.on("join-room", ({ roomId }) => {
            socket.join(roomId);
           // console.log('56----->',roomId,socket.id)
            socket.to(roomId).emit("user-joined", socket.id);
        });

        socket.on("offer", ({ to, offer }) => {
            io.to(to).emit("offer", { from: socket.id, offer });
        });

        socket.on("answer", ({ to, answer }) => {
            io.to(to).emit("answer", { from: socket.id, answer });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", { from: socket.id, candidate });
        });

        socket.on("media-action", (data) => {
            socket.to(data.roomId).emit("media-action", data);
        });

        socket.on("leave-room", ({ roomId }) => {
            // console.log("remove--->",roomId, socket.id)
            socket.leave(roomId);
            socket.to(roomId).emit("user-left", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};

export default registerChatSocket;




