import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// 🚨 CORRECTION FINALE DES CHEMINS (basée sur ta capture d'écran)
import { socket } from "./socket"; // Il est dans le MÊME dossier 'pages'
import { playMusic, stopMusic } from '../audioManager'; // Il est dans le dossier parent 'src'

// ==========================================================
// Composant 1: Le Mini-Jeu "Click & Catch"
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
    
    // On utilise useState pour pseudo et participantId
    const [pseudo] = useState(sessionStorage.getItem("pseudo"));
    const [participantId] = useState(sessionStorage.getItem("participantId")); 

    const [players, setPlayers] = useState([]);
    const [currentSocketId, setCurrentSocketId] = useState(null); 

    const handleReady = () => {
        socket.emit("player_ready", { participantId: parseInt(participantId) }); 
    };

    const handleStartGame = () => {
        socket.emit("start_game_request", { admin_id: parseInt(participantId) }); 
    };

    const setupLobbyListeners = useCallback(() => {
        const id = socket.id;
        setCurrentSocketId(id);
        
        console.log("Setup listeners pour socket ID:", id);
        
        socket.emit("player_info", { 
            pseudo, 
            participantId: parseInt(participantId), 
            is_admin: sessionStorage.getItem("is_admin") === "1"
        }); 
        
        socket.on("players_update", (playersData) => {
            console.log("Reçu players_update:", playersData);
            setPlayers(playersData);
        });

        // ==========================================================
        // 💡 CORRECTION : Écouter "game_started" (avec un "d")
        // ==========================================================
        socket.on("game_started", () => {
            console.log("Événement 'game_started' reçu, navigation vers /quiz");
            stopMusic(); 
            navigate("/quiz"); 
        });

        socket.on('error_message', (message) => {
            alert(`Erreur du serveur: ${message}`);
        });
    }, [navigate, pseudo, participantId]);

    useEffect(() => {
        playMusic(); 
        
        if (!pseudo || !participantId) {
            console.log("Pas de session, redirection vers login...");
            navigate("/");
            return;
        }

        if (!socket.connected) {
            console.log("Socket non connecté, tentative de connexion...");
            socket.connect(); 
        }

        socket.on("connect", setupLobbyListeners);
        
        if (socket.connected) {
            console.log("Socket déjà connecté, setup des listeners.");
            setupLobbyListeners();
        }
        
        return () => {
            console.log("Nettoyage des listeners du Lobby");
            socket.off("connect", setupLobbyListeners);
            socket.off("players_update");
            // ==========================================================
            // 💡 CORRECTION : Nettoyer le bon listener
            // ==========================================================
            socket.off("game_started");
            socket.off('error_message');
        };
    }, [navigate, setupLobbyListeners, pseudo, participantId]);
    
    const currentPlayer = players.find(p => p.id === currentSocketId);
    const isCurrentPlayerAdmin = currentPlayer?.is_admin || false;
    const isMyStateReady = currentPlayer?.is_ready || false;
    
    const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
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
                        Prêts : <span className="font-semibold text-green-400">{players.filter(p => p.is_ready).length}</span> / {players.length}
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                        {players.map((p) => (
                            <li
                                key={p.id} 
                                className={`flex justify-between items-center p-3 rounded-lg font-medium transition duration-200 ${
                                    p.is_ready ? "bg-green-900 border border-green-700" : "bg-gray-700 border border-gray-600"
                                } ${p.id === currentSocketId ? "ring-2 ring-yellow-500 scale-[1.02]" : ""}`}
                  S         >
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
                        
                        {/* Si JE ne suis PAS prêt, montrer le bouton "Prêt" */}
                        {!isMyStateReady && (
                            <button
                                onClick={handleReady}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
s                         >
                                Je suis prêt pour le Quiz !
                            </button>
                   )}
                        
                        {/* Si JE suis prêt, montrer le message d'attente */}
                        {isMyStateReady && (
                            <p className="text-center p-3 text-lg font-semibold text-green-500 bg-green-900/50 rounded-lg">
                                ✅ Vous êtes prêt ! En attente des autres...
                            </p>
                        )}

                        {/* Bloc SUPPLÉMENTAIRE pour l'ADMIN */}
                        {isCurrentPlayerAdmin && (
                            <div className="mt-4 text-center border-t border-gray-700 pt-4">
                                <button
                                    onClick={handleStartGame}
                                    disabled={!canAdminStart} 
                                    className={`w-full text-white px-6 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-[1.01] shadow-lg ${
                                        !canAdminStart ? "bg-red-500/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
D                                 {players.length < 2 ? "Il faut au moins 2 joueurs" : (allPlayersReady ? "Lancer la Partie Maintenant !" : "Tous les joueurs doivent être prêts")}
                                </button>
                                {!canAdminStart && players.length >= 2 && (
                                    <p className="mt-2 text-sm text-red-300">
                                        Tous les joueurs connectés doivent être prêts pour commencer.
s                               </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne du Mini-Jeu (Droite) */}
                {/* 💡 CORRECTION DES 2 ERREURS FINALES ICI */}
                <div className="md:w-1/2 w-full"> {/* C'était "md:w/1/2" */}
                    <ReflexGame />
                </div> {/* Le '_' parasite a été supprimé d'ici */}
            </main>

        </div>
    );
}