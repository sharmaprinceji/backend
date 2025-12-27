import registerChatSocket from "../modules/chat/chat.socket.js";
import registerWebRTCSocket from "../modules/webrtc/webrtc.socket.js";

const socketHandler = (io) => {
  registerChatSocket(io);
  registerWebRTCSocket(io);
};

export default socketHandler;
