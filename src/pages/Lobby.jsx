import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket"; // Assure-toi que le path est correct
import { playMusic, stopMusic } from "../audioManager"; // Assure-toi que ces fonctions existent

// =======================
// Mini-jeu Test de Réflexes
// =======================
const ReflexGame = () => {
  const [gameState, setGameState] = useState("start"); // 'start' | 'wait' | 'catch' | 'result'
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const MIN_DELAY = 1500;
  const MAX_DELAY = 4000;

  const startGame = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);

    setGameState("wait");
    setReactionTime(null);

    const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    const id = setTimeout(() => {
      setGameState("catch");
      setStartTime(performance.now());
    }, delay);

    setTimeoutId(id);
  }, [timeoutId]);

  const handleClick = useCallback(() => {
    if (gameState === "wait") {
      if (timeoutId) clearTimeout(timeoutId);
      setReactionTime(0); // trop tôt
      setGameState("result");
    } else if (gameState === "catch") {
      const end = performance.now();
      const time = Math.round(end - startTime);
      setReactionTime(time);
      setGameState("result");
    } else {
      startGame();
    }
  }, [gameState, timeoutId, startTime, startGame]);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  let buttonClass = "w-full h-full rounded-2xl shadow-xl transition-all duration-100 ease-in-out";
  let message = "";

  switch (gameState) {
    case "start":
      buttonClass += " bg-blue-500 hover:bg-blue-600 animate-pulse";
      message = "Cliquez ici pour démarrer le test !";
      break;
    case "wait":
      buttonClass += " bg-gray-600 cursor-wait";
      message = "Attendez que le carré devienne VERT...";
      break;
    case "catch":
      buttonClass += " bg-green-500 hover:bg-green-400 transform scale-105 active:scale-100";
      message = "CLIQUEZ MAINTENANT !";
      break;
    case "result":
      buttonClass += " cursor-pointer transform hover:scale-[1.01]";
      if (reactionTime === 0) {
        buttonClass += " bg-red-500 hover:bg-red-600";
        message = "Trop tôt ! Faux départ. Cliquez pour réessayer. ⏱️";
      } else {
        buttonClass += " bg-yellow-500 hover:bg-yellow-600";
        message = `Réaction : ${reactionTime} ms ! Cliquez pour rejouer. 🚀`;
      }
      break;
    default:
      buttonClass += " bg-gray-500";
      message = "Appuyez pour commencer";
  }

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg mx-auto text-center border-b-4 border-l-4 border-yellow-500">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Mini-Jeu : Test de Réflexes</h3>
      <p className="text-sm text-gray-400 mb-4">En attendant les autres, testez votre temps de réaction !</p>
      <div
        className={`h-48 cursor-pointer overflow-hidden flex items-center justify-center ${buttonClass}`}
        onClick={handleClick}
      >
        <div className="text-white text-2xl font-extrabold p-4">
          {gameState === "result" ? (
            <div className="flex flex-col items-center">
              <p className="mb-2 text-xl md:text-2xl font-bold">{reactionTime === 0 ? "Trop tôt ! ❌" : `Réaction : ${reactionTime} ms ! ✅`}</p>
              <button
                onClick={startGame}
                className="mt-2 bg-indigo-700 hover:bg-indigo-600 text-white text-base py-2 px-4 rounded-lg shadow-md transition-colors"
              >
                Rejouer
              </button>
            </div>
          ) : (
            <span className="text-center">{message}</span>
          )}
        </div>
      </div>

      {(gameState === "wait" || gameState === "catch") && (
        <p className="mt-2 text-sm text-gray-300">
          {gameState === "wait" ? "Préparez-vous à cliquer..." : "Temps de réaction actuel: En cours..."}
        </p>
      )}
    </div>
  );
};

// =======================
// Composant Principal Lobby
// =======================
export default function Lobby() {
  const navigate = useNavigate();

  // session storage
  const [pseudo] = useState(sessionStorage.getItem("pseudo"));
  const [participantId] = useState(sessionStorage.getItem("participantId"));
  const [isAdmin] = useState(sessionStorage.getItem("is_admin") === "1");

  // état local
  const [players, setPlayers] = useState([]);
  const [currentSocketId, setCurrentSocketId] = useState(null);

  // actions
  const handleReady = () => {
    socket.emit("player_ready", { participantId: parseInt(participantId, 10) });
  };

  const handleUnready = () => {
    socket.emit("player_unready", { participantId: parseInt(participantId, 10) });
  };

  const handleStartGame = () => {
    socket.emit("start_game_request", { admin_id: parseInt(participantId, 10) });
  };

  const setupLobbyListeners = useCallback(() => {
    // éviter doublons en supprimant d'abord
    socket.off("players_update");
    socket.off("game_started");
    socket.off("error_message");
    socket.off("connected");

    // définir current socket id
    setCurrentSocketId(socket.id);
    console.log("Setup listeners — socket.id =", socket.id);

    // envoyer infos joueur au serveur
    socket.emit("player_info", {
      pseudo,
      participantId: parseInt(participantId, 10),
      is_admin: isAdmin
    });

    // recevoir liste des joueurs
    socket.on("players_update", (playersData) => {
      console.log("players_update reçu :", playersData);
      setPlayers(playersData);
    });

    // événement de démarrage : on navigue vers /quiz
    socket.on("game_started", () => {
      console.log("game_started reçu -> navigation /quiz");
      try { stopMusic(); } catch (e) {}
      navigate("/quiz");
    });

    // messages d'erreur depuis le serveur
    socket.on("error_message", (msg) => {
      console.warn("error_message serveur :", msg);
      alert(`Erreur du serveur : ${msg}`);
    });

    // confirmation de connexion (utile après reload)
    socket.on("connected", (data) => {
      if (data && data.socketId) {
        setCurrentSocketId(data.socketId);
      } else {
        setCurrentSocketId(socket.id);
      }
    });
  }, [navigate, pseudo, participantId, isAdmin]);

  useEffect(() => {
    // play ambient music
    try { playMusic(); } catch (e) {}

    if (!pseudo || !participantId) {
      console.log("Session manquante, redirection vers /");
      navigate("/");
      return;
    }

    // connect si nécessaire
    if (!socket.connected) {
      socket.connect();
      console.log("Socket connect demandé");
    }

    // bind connect -> setup
    socket.on("connect", setupLobbyListeners);

    // si déjà connecté (reload), setup de suite
    if (socket.connected) {
      setupLobbyListeners();
    }

    // cleanup : enlever listeners
    return () => {
      console.log("Cleanup Lobby listeners");
      socket.off("connect", setupLobbyListeners);
      socket.off("players_update");
      socket.off("game_started");
      socket.off("error_message");
      socket.off("connected");
      // on ne fait pas disconnect global ici pour garder la connexion si d'autres composants l'utilisent,
      // mais si tu veux forcer disconnect : socket.disconnect();
    };
  }, [navigate, setupLobbyListeners, pseudo, participantId]);

  // infos calculées
  const currentPlayer = players.find((p) => p.id === currentSocketId);
  const isCurrentPlayerAdmin = currentPlayer?.is_admin || isAdmin || false;
  const isMyStateReady = currentPlayer?.is_ready || false;

  const allPlayersReady = players.length > 0 && players.every((p) => p.is_ready);
  const canAdminStart = players.length >= 2 && allPlayersReady;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <header className="w-full text-center py-6 bg-indigo-900 shadow-xl mb-8 rounded-b-xl">
        <h1 className="text-4xl font-extrabold text-yellow-400">Salle d'Attente du Quiz</h1>
        <p className="text-indigo-200 mt-1">Vous êtes connecté en tant que: <span className="font-semibold">{pseudo}</span></p>
      </header>

      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 w-full bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">Joueurs connectés ({players.length})</h2>
          <p className="text-sm text-gray-400 mb-4">
            Prêts : <span className="font-semibold text-green-400">{players.filter(p => p.is_ready).length}</span> / {players.length}
          </p>

          <ul className="space-y-3 mb-6">
            {players.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between items-center p-3 rounded-lg font-medium transition duration-200 ${
                  p.is_ready ? "bg-green-900 border border-green-700" : "bg-gray-700 border border-gray-600"
                } ${p.id === currentSocketId ? "ring-2 ring-yellow-500 scale-[1.02]" : ""}`}
              >
                <span className="truncate">
                  {p.pseudo}
                  {p.is_admin && <span className="ml-2 text-red-400 font-extrabold">(ADMIN)</span>}
                  {p.id === currentSocketId && <span className="ml-1 text-xs text-yellow-500">(Moi)</span>}
                </span>
                <span>{p.is_ready ? "✅ Prêt" : "❌ Pas prêt"}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4 border-gray-700">
            {!isMyStateReady && (
              <button
                onClick={handleReady}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
              >
                Je suis prêt pour le Quiz !
              </button>
            )}

            {isMyStateReady && (
              <div className="space-y-3">
                <p className="text-center p-3 text-lg font-semibold text-green-500 bg-green-900/50 rounded-lg">✅ Vous êtes prêt ! En attente des autres...</p>
                <button onClick={handleUnready} className="w-full bg-yellow-600 text-white px-6 py-2 rounded-lg text-base hover:bg-yellow-700 transition">Annuler Prêt</button>
              </div>
            )}

            {isCurrentPlayerAdmin && (
              <div className="mt-4 text-center border-t border-gray-700 pt-4">
                <button
                  onClick={handleStartGame}
                  disabled={!canAdminStart}
                  className={`w-full text-white px-6 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-[1.01] shadow-lg ${
                    !canAdminStart ? "bg-red-500/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {players.length < 2 ? "Il faut au moins 2 joueurs" : (allPlayersReady ? "Lancer la Partie Maintenant !" : "Tous les joueurs doivent être prêts")}
                </button>
                {!canAdminStart && players.length >= 2 && (
                  <p className="mt-2 text-sm text-red-300">Tous les joueurs connectés doivent être prêts pour commencer.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 w-full">
          <ReflexGame />
        </div>
      </main>
    </div>
  );
}
