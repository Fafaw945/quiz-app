// src/socket.js
import { io } from "socket.io-client";

// 🚨 CORRECTION : autoConnect: false. La connexion sera lancée manuellement dans Lobby.jsx.
export const socket = io("http://localhost:8001", {
  transports: ["websocket"],
  autoConnect: false,
});

// NOTE : Les logs de connect/disconnect sont gérés dans Lobby.jsx pour plus de contrôle.