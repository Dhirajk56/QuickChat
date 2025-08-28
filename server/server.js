import express from "express";
import cors from "cors";
import "dotenv/config.js";
import { Server } from "socket.io";
import http from "http";
const port = process.env.PORT || 4000;

//create express app and http server
const app = express();
const server = http.createServer(app);

//connect to database
import { ConnectDB } from "./lib/db.js";
ConnectDB();

//Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

//Store online users
export const userSocketMap = {}; //{ userId: socketId}

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  //emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors({ origin: "*" }));

//routes setup
import userRouter from "./Routes/userRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRoutes);
app.get("/", (req, res) => res.send("server is running at port 4000"));
server.listen(port, () => console.log(`server is started on PORT:${port}`));
