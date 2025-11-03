import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket"; 
import { playMusic, stopMusic } from '../audioManager';

// ==========================================================
// Composant 1: Le Mini-Jeu "Click & Catch" (modifié)
// ==========================================================
const ReflexGame = () => {
    const [gameState, setGameState] = useState('start'); // 'start', 'wait', 'catch', 'result'
    const [startTime, setStartTime] = useState(null);
    const [reactionTime, setReactionTime] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);

    const MIN_DELAY = 1500; // 1.5 secondes
    const MAX_DELAY = 4000; // 4 secondes

    const startGame = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        setGameState('wait');
        setReactionTime(null);

        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;

        const id = setTimeout(() => {
            setGameState('catch');
            setStartTime(performance.now()); 
        }, delay);

        setTimeoutId(id);
    }, [timeoutId]);

    const handleClick = useCallback(() => {
        if (gameState === 'wait') {
            clearTimeout(timeoutId);
            setReactionTime(0); 
            setGameState('result');
            
        } else if (gameState === 'catch') {
            const endTime = performance.now();
            const time = endTime - startTime;
            setReactionTime(Math.round(time));
            setGameState('result');

        } else if (gameState === 'start' || gameState === 'result') {
            startGame();
        }
    }, [gameState, startTime, timeoutId, startGame]);

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    let buttonClass = "w-full h-full rounded-2xl shadow-xl transition-all duration-100 ease-in-out";
    let message;

    switch (gameState) {
        case 'start':
            buttonClass += " bg-blue-500 hover:bg-blue-600 animate-pulse";
            message = "Cliquez ici pour démarrer le test !";
            break;
        case 'wait':
            buttonClass += " bg-gray-600 cursor-wait";
            message = "Attendez que le carré devienne VERT...";
            break;
        case 'catch':
            buttonClass += " bg-green-500 hover:bg-green-400 transform scale-105 active:scale-100";
            message = "CLIQUEZ MAINTENANT !";
            break;
        case 'result':
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
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
                Mini-Jeu : Test de Réflexes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                En attendant les autres, testez votre temps de réaction !
            </p>
            <div 
                className={`h-48 cursor-pointer overflow-hidden flex items-center justify-center ${buttonClass}`}
                onClick={handleClick}
            >
                <div className="text-white text-2xl font-extrabold p-4">
                    {gameState === 'result' ? (
                        <div className="flex flex-col items-center">
                            <p className="mb-2 text-xl md:text-2xl font-bold">{reactionTime === 0 ? "Trop tôt ! ❌" : `Réaction : ${reactionTime} ms ! ✅`}</p>
                            <button
                                className="mt-2 bg-indigo-700 hover:bg-indigo-600 text-white text-base py-2 px-4 rounded-lg shadow-md transition-colors"
                            >
                                Rejouer
                            </button>
                        </div>
                    ) : (
                        <span className="text-center">
                            {message}
                        </span>
                    )}
                </div>
            </div>
            {(gameState === 'wait' || gameState === 'catch') && (
                <p className="mt-2 text-sm text-gray-300">
                    {gameState === 'wait' ? "Préparez-vous à cliquer..." : "Temps de réaction actuel: En cours..."}
                </p>
            )}
        </div>
    );
};


// ==========================================================
// Composant Principal: Lobby
// ==========================================================

export default function Lobby() {
    const navigate = useNavigate();
    
    // 🚨 CORRECTION : Lire depuis sessionStorage
    const pseudo = sessionStorage.getItem("pseudo");
    const participantId = sessionStorage.getItem("participantId"); 

    const [players, setPlayers] = useState([]);
    const [currentSocketId, setCurrentSocketId] = useState(null); 

    const handleReady = () => {
        // 🔑 Envoi de l'ID BDD au serveur Node.js quand on clique sur "Prêt"
        // (Il faut s'assurer que le serveur WebSocket gère cet événement "player_ready")
        socket.emit("player_ready", { participantId });
    };

    const handleStartGame = () => {
        // 🔑 Envoi de l'ID BDD de l'admin au serveur Node.js
        socket.emit("start_game_request", { admin_id: participantId });
    };


    const setupLobbyListeners = () => {
        const id = socket.id;
        setCurrentSocketId(id);
        
        // 🔑 Envoi de l'ID BDD (participantId) lors de la connexion
        socket.emit("player_info", { 
            pseudo, 
            participantId, 
            is_admin: sessionStorage.getItem("is_admin") === "1" // 🚨 CORRECTION
        }); 
        
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
        
        // 🚨 CORRECTION : Vérifier le pseudo et l'ID depuis sessionStorage
        const storedPseudo = sessionStorage.getItem("pseudo");
        const storedParticipantId = sessionStorage.getItem("participantId");

        if (!storedPseudo || !storedParticipantId) {
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
            // Ne pas déconnecter le socket ici, le laisser persister
        };
    // 🚨 CORRECTION : Retirer pseudo et participantId des dépendances, 
    // car ils sont lus une seule fois au montage.
    }, [navigate]); 
    
    const readyCount = players.filter((p) => p.is_ready).length; // 🚨 CORRECTION : p.is_ready
    const currentPlayer = players.find(p => p.id === currentSocketId);
    const isCurrentPlayerAdmin = currentPlayer?.is_admin || false;
    const isMyStateReady = currentPlayer?.is_ready || false; // 🚨 CORRECTION : p.is_ready
    
    // 🚨 CORRECTION : Logique admin
    // L'admin doit-il être "prêt" ? Si oui, canAdminStart est correct.
    // Si l'admin n'a pas besoin d'être "prêt" (ce qui est le cas dans ton server.js) :
    const allPlayersReady = players.every(p => p.is_ready);
    // On vérifie qu'il y a au moins 2 joueurs (l'admin inclus) ET que tout le monde est prêt
    const canAdminStart = players.length >= 2 && allPlayersReady; 

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
            
            <header className="w-full text-center py-6 bg-indigo-900 shadow-xl mb-8 rounded-b-xl">
                <h1 className="text-4xl font-extrabold text-yellow-400">Salle d'Attente du Quiz</h1>
                <p className="text-indigo-200 mt-1">Vous êtes connecté en tant que: <span className="font-semibold">{pseudo}</span></p>
            </header>
            
            <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
                
                {/* Colonne de la liste des joueurs et du contrôle (Gauche) */}
                <div className="md:w-1/2 w-full bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-blue-500">
                    <h2 className="text-2xl font-bold mb-4 text-blue-300">
                        Joueurs connectés ({players.length})
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Prêts : <span className="font-semibold text-green-400">{readyCount}</span> / {players.length}
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

                    {/* Zone d'action */}
                    <div className="mt-6 border-t pt-4 border-gray-700">
                        {/* Affichage du bouton "Je suis prêt" */}
                        {!isMyStateReady && !isCurrentPlayerAdmin && (
                            <button
                                onClick={handleReady}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
                            >
                                Je suis prêt pour le Quiz !
                            </button>
                        )}
                        
                        {/* Message d'attente */}
                        {isMyStateReady && !isCurrentPlayerAdmin && (
                            <p className="text-center p-3 text-lg font-semibold text-green-500 bg-green-900/50 rounded-lg">
                                ✅ En attente de l'administrateur pour commencer.
                            </p>
                        )}

                        {/* Interface Admin */}
                        {isCurrentPlayerAdmin && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleStartGame}
                                    disabled={!canAdminStart} 
                                    className={`w-full text-white px-6 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-[1.01] shadow-lg ${
                                        !canAdminStart ? "bg-red-500/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {canAdminStart ? "Lancer la Partie Maintenant !" : "Attendre 2 joueurs ou que tous soient prêts"}
                                </button>
                                {!canAdminStart && (
                                    <p className="mt-2 text-sm text-red-300">
                                        Il faut au moins deux joueurs ET que tous les joueurs connectés soient prêts.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne du Mini-Jeu (Droite) */}
                <div className="md:w-1/2 w-full">
                    <ReflexGame />
                </div>
            </main>

        </div>
    );
}
