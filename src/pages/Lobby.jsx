// src/pages/Lobby.jsx (Final)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket"; 
import { playMusic, stopMusic } from '../audioManager'; // Utilise les fonctions de musique de fond

export default function Lobby() {
    const navigate = useNavigate();
    
    const pseudo = localStorage.getItem("pseudo");
    // 🔑 Récupération de l'ID BDD
    const participantId = localStorage.getItem("participantId"); 

    const [players, setPlayers] = useState([]);
    const [currentSocketId, setCurrentSocketId] = useState(null); 

    const handleReady = () => {
        socket.emit("player_ready");
    };

    const handleStartGame = () => {
        socket.emit("start_game");
    };


    const setupLobbyListeners = () => {
        const id = socket.id;
        setCurrentSocketId(id);
        
        // 🔑 Envoi de l'ID BDD au serveur Node.js
        socket.emit("join_lobby", { pseudo, participantId }); 
        
        socket.on("players_update", (playersData) => {
            setPlayers(playersData);
        });

        socket.on("game_start", () => {
            stopMusic(); 
            navigate("/quiz"); 
        });
    }

    useEffect(() => {
        playMusic(); 
        
        // Contrôle de sécurité
        if (!pseudo || !participantId) {
            navigate("/");
            return;
        }

        if (!socket.connected) {
            socket.connect(); 
        }

        socket.on("connect", setupLobbyListeners);
        
        if (socket.connected) {
            setupLobbyListeners();
        }
        
        return () => {
            socket.off("connect", setupLobbyListeners);
            socket.off("players_update");
            socket.off("game_start");
        };
    }, [pseudo, participantId, navigate]); 
    
    const readyCount = players.filter((p) => p.ready).length;
    const isCurrentPlayerAdmin = players.find(p => p.id === currentSocketId)?.is_admin || false;
    const isMyStateReady = players.find(p => p.id === currentSocketId)?.ready || false;
    const canAdminStart = players.length >= 2 && readyCount === players.length;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
             <h1 className="text-3xl font-bold mb-6">Lobby</h1>

             <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Joueurs connectés ({players.length})
                </h2>
                <ul className="space-y-2">
                    {players.map((p) => (
                        <li
                            key={p.id} 
                            className={`flex justify-between p-2 rounded-lg ${
                                p.ready ? "bg-green-100" : "bg-gray-200"
                            } ${p.id === currentSocketId ? "ring-2 ring-blue-500" : ""}`}
                        >
                            <span>{p.pseudo} {p.is_admin ? "(Admin)" : ""}</span>
                            <span>{p.ready ? "✅ Prêt" : "❌ Pas prêt"}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Affichage du bouton "Je suis prêt" */}
            {!isMyStateReady && !isCurrentPlayerAdmin && (
                <button
                    onClick={handleReady}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-600 transition"
                >
                    Je suis prêt !
                </button>
            )}
            
            {/* Message d'attente */}
            {isMyStateReady && !isCurrentPlayerAdmin && (
                 <p className="text-lg font-semibold text-green-600">
                      ✅ En attente de l'administrateur pour commencer.
                 </p>
            )}

            {/* Interface Admin */}
            {isCurrentPlayerAdmin && (
                <div className="mt-4 text-center">
                    <p className="mb-2 text-lg">
                      Joueurs prêts : <span className="font-bold text-green-700">{readyCount}</span> / {players.length}
                    </p>
                    <button
                        onClick={handleStartGame}
                        disabled={!canAdminStart} 
                        className={`text-white px-6 py-3 rounded-xl text-lg font-semibold transition ${
                            !canAdminStart ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        Lancer la partie ({canAdminStart ? "Prêt" : "2 joueurs ou tous non prêts"})
                    </button>
                </div>
            )}
        </div>
    );
}