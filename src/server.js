import app from "./app.js";
import connectMongo from "./config/mongo.js";
import { PORT, MONGO_URI } from "./config/env.js";
import { createServer } from "http";
import { initSocket } from "./shared/socket.js";
import registerChatSocket from "./modules/chat/chat.socket.js";
import registerSfuChatSocket from "./modules/chat/sfu.socket.js";

const httpServer = createServer(app);

const startServer = async () => {
  await connectMongo(MONGO_URI);

  const io = initSocket(httpServer);

  // register chat socket handlers
  //registerChatSocket(io);  //follow mesh architecture....
  registerSfuChatSocket(io);  //follow sfu... 

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server + Socket running on port ${PORT}`);
  });
};

startServer();
