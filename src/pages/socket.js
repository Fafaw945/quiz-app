import { io } from "socket.io-client";

// 1. Récupérer l'URL du WebSocket depuis les variables d'environnement
// En production (Vercel), ce sera ton URL Render
// En local, ce sera ton localhost:3001
const WS_URL = process.env.REACT_APP_WS_URL;

// 2. Utiliser cette variable pour la connexion
export const socket = io(WS_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

// NOTE : Les logs de connect/disconnect sont gérés dans Lobby.jsx pour plus de contrôle.

