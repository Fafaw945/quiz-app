import { io } from "socket.io-client";

// 1. Récupérer l'URL du WebSocket avec la syntaxe Create React App
const WS_URL = process.env.REACT_APP_WS_URL;

export const socket = io(WS_URL, {
  // transports: ["websocket"], // 💡 <-- SUPPRIME CETTE LIGNE
  autoConnect: false,
});

// NOTE : Les logs de connect/disconnect sont gérés dans Lobby.jsx pour plus de contrôle.