// import app from "./app.js";
// import connectMongo from "./config/mongo.js";
// import { PORT, MONGO_URI } from "./config/env.js";

// const startServer = async () => {
//   await connectMongo(MONGO_URI);

//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// };

// startServer();
import app from "./app.js";
import connectMongo from "./config/mongo.js";
import { PORT, MONGO_URI } from "./config/env.js";
import { createServer } from "http";
import { initSocket } from "./shared/socket.js";
import registerChatSocket from "./modules/chat/chat.socket.js";

const httpServer = createServer(app);

const startServer = async () => {
  await connectMongo(MONGO_URI);

  const io = initSocket(httpServer);

  // register chat socket handlers
  registerChatSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server + Socket running on port ${PORT}`);
  });
};

startServer();
