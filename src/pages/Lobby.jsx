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
        // Nettoyage en cas de double-clic ou de bug
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        setGameState('wait');
        setReactionTime(null);

        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;

        // Démarre un compte à rebours aléatoire avant de passer à l'état 'catch'
        const id = setTimeout(() => {
            setGameState('catch');
            setStartTime(performance.now()); // Démarre le chronomètre
        }, delay);

        setTimeoutId(id);
    }, [timeoutId]);

    // Gère le clic du joueur
    const handleClick = useCallback(() => {
        if (gameState === 'wait') {
            // Clic trop tôt !
            clearTimeout(timeoutId);
            setReactionTime(0); // Temps de réaction de 0 pour signaler le faux départ
            setGameState('result');
            // MODIFICATION: Suppression du redémarrage automatique ici.
            
        } else if (gameState === 'catch') {
            // Clic réussi
            const endTime = performance.now();
            const time = endTime - startTime;
            setReactionTime(Math.round(time));
            setGameState('result');
            // MODIFICATION: Suppression du redémarrage automatique ici.

        } else if (gameState === 'start' || gameState === 'result') {
            // Le joueur a cliqué sur le bouton de démarrage ou le résultat
            // Cela relance le jeu
            startGame();
        }
    }, [gameState, startTime, timeoutId, startGame]);

    // Nettoyage des timers lors du démontage
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    // Contenu affiché dans la zone de jeu
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
            // Rendre le bouton cliquable visuellement pour le rejeu
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

    // Le contenu du message peut être un React Fragment pour une meilleure mise en forme si nécessaire, 
    // mais ici, nous utilisons une simple chaîne de caractères pour la simplicité.
    return (
        <div className="mt-8 p-4 bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg mx-auto text-center border-b-4 border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
                Mini-Jeu : Test de Réflexes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                En attendant les autres, testez votre temps de réaction !
            </p>
            <div 
                // La div entière agit comme un bouton
                className={`h-48 cursor-pointer overflow-hidden flex items-center justify-center ${buttonClass}`}
                onClick={handleClick}
            >
                {/* Condition pour adapter l'affichage du message de résultat/relance */}
                <div className="text-white text-2xl font-extrabold p-4">
                    {/* Affichage adapté pour le résultat */}
                    {gameState === 'result' ? (
                        <div className="flex flex-col items-center">
                            <p className="mb-2 text-xl md:text-2xl font-bold">{reactionTime === 0 ? "Trop tôt ! ❌" : `Réaction : ${reactionTime} ms ! ✅`}</p>
                            <button
                                // Cette sous-bouton est purement visuel car le clic est géré par la div parente
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
                                    p.ready ? "bg-green-900 border border-green-700" : "bg-gray-700 border border-gray-600"
                                } ${p.id === currentSocketId ? "ring-2 ring-yellow-500 scale-[1.02]" : ""}`}
                            >
                                <span className="truncate">
                                    {p.pseudo} 
                                    {p.is_admin && <span className="ml-2 text-red-400 font-extrabold">(ADMIN)</span>}
                                    {p.id === currentSocketId && <span className="ml-1 text-xs text-yellow-500">(Moi)</span>}
                                </span>
                                <span>{p.ready ? "✅ Prêt" : "❌ Pas prêt"}</span>
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
