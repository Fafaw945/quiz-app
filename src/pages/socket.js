import { io } from "socket.io-client";

//  Mise à jour de l'URL du serveur Socket.io en production (Heroku)

export const socket = io("https://quiz-socket-304bcba7a1ee.herokuapp.com/", {
  transports: ["websocket"],
  autoConnect: false,
});

// NOTE : Les logs de connect/disconnect sont gérés dans Lobby.jsx pour plus de contrôle.
