import express from "express";
import { protectRoute } from "../middleware/auth.js";

import {
  getMessage,
  getUserForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRoutes = express.Router();

messageRoutes.get("/users", protectRoute, getUserForSidebar);
messageRoutes.get("/:id", protectRoute, getMessage);
messageRoutes.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRoutes.post("/send/:id", protectRoute, sendMessage);

export default messageRoutes;
