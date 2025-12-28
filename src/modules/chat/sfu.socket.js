import { getRouter } from "../../shared/sfu.js";
import { rooms, getOrCreateRoom } from "../../shared/room.js";

async function createWebRtcTransport(router) {
  return await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: null }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true
  });
}

const registerSfuChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* ---------------- CHAT ---------------- */
    socket.on("send-message", ({ roomId, user, message }) => {
      io.to(roomId).emit("receive-message", {
        user,
        message,
        time: new Date().toISOString(),
      });
    });

    socket.on("media-action", (data) => {
      socket.to(data.roomId).emit("media-action", data);
    });

    /* ---------------- SFU ---------------- */

    socket.on("join-room", async ({ roomId }, callback) => {
      const router = await getRouter();
      const room = getOrCreateRoom(roomId, router);

      socket.roomId = roomId;
      socket.join(roomId);

      room.peers.set(socket.id, {
        transports: [],
        producers: [],
        consumers: []
      });

      const existingProducers = [];
      for (const [id, peer] of room.peers.entries()) {
        if (id !== socket.id) {
          peer.producers.forEach(p => existingProducers.push(p.id));
        }
      }

      // 🔥 SAFE CALLBACK
      if (typeof callback === "function") {
        callback({
          rtpCapabilities: room.router.rtpCapabilities,
          existingProducers
        });
      }
    });

    socket.on("create-transport", async ({ direction }, callback) => {
      const room = rooms.get(socket.roomId);
      if (!room) return;

      const peer = room.peers.get(socket.id);
      if (!peer) return;

      const transport = await createWebRtcTransport(room.router);

      peer.transports.push({
        transport,
        direction,
        connected: false
      });

      if (typeof callback === "function") {
        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters
        });
      }
    });

    socket.on("connect-transport", async ({ transportId, dtlsParameters }) => {
      const room = rooms.get(socket.roomId);
      if (!room) return;

      const peer = room.peers.get(socket.id);
      if (!peer) return;

      const entry = peer.transports.find(
        t => t.transport.id === transportId
      );

      if (!entry || entry.connected) return;

      await entry.transport.connect({ dtlsParameters });
      entry.connected = true;
    });

 socket.on("produce", async ({ transportId, kind, rtpParameters }, callback) => {
  const room = rooms.get(socket.roomId);
  if (!room) return;

  const peer = room.peers.get(socket.id);

  const entry = peer.transports.find(
    t => t.transport.id === transportId && t.direction === "send"
  );

  if (!entry) return;

  const producer = await entry.transport.produce({
    kind,
    rtpParameters,
    appData: {
      peerId: socket.id   // 🔥 KEY FIX
    }
  });

  peer.producers.push(producer);

  socket.to(socket.roomId).emit("new-producer", {
    producerId: producer.id,
    peerId: socket.id,
    kind: producer.kind
  });

  callback?.({ id: producer.id });
});


  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
  const room = rooms.get(socket.roomId);
  if (!room) return;

  if (!room.router.canConsume({ producerId, rtpCapabilities })) return;

  const peer = room.peers.get(socket.id);
  const entry = peer.transports.find(t => t.direction === "recv");
  if (!entry) return;

  const producer = [...room.peers.values()]
    .flatMap(p => p.producers)
    .find(p => p.id === producerId);

  const consumer = await entry.transport.consume({
    producerId,
    rtpCapabilities,
    paused: false
  });

  peer.consumers.push(consumer);

  callback?.({
    id: consumer.id,
    producerId,
    peerId: producer.appData.peerId, // 🔥 KEY FIX
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters
  });
});


    socket.on("disconnect", () => {
      const room = rooms.get(socket.roomId);
      if (!room) return;

      const peer = room.peers.get(socket.id);
      if (!peer) return;

      peer.producers.forEach(p => p.close());
      peer.consumers.forEach(c => c.close());
      peer.transports.forEach(t => t.transport.close());

      room.peers.delete(socket.id);
      socket.to(socket.roomId).emit("peer-left", { peerId: socket.id });
    });
  });
};

export default registerSfuChatSocket;
