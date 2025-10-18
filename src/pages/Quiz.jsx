// src/pages/Quiz.jsx (Final avec correction esthétique et score)
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { playSound, stopSound } from '../audioManager'; 

export default function Quiz() {
    const navigate = useNavigate();
    
    const currentSocketId = socket.id; 
    
    const [questionsTotal, setQuestionsTotal] = useState(0);
    const [currentQuestionData, setCurrentQuestionData] = useState(null); 
    const [selectedAnswer, setSelectedAnswer] = useState(null); 
    const [correctAnswer, setCorrectAnswer] = useState(null); 
    const [allPlayers, setAllPlayers] = useState([]); // 🔑 SOURCE DE VÉRITÉ POUR LES SCORES
    const [isFinished, setIsFinished] = useState(false);
    const [finalScores, setFinalScores] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    
    // Calcule le score du joueur local (Synchronisé avec le serveur via players_update)
    const myScore = useMemo(() => {
        const player = allPlayers.find(p => p.id === currentSocketId);
        return player ? player.score : 0;
    }, [allPlayers, currentSocketId]);
    
    // Calcule le statut de réponse (pour désactiver le bouton)
    const hasAnswered = useMemo(() => {
        const player = allPlayers.find(p => p.id === currentSocketId);
        return player ? player.has_answered_current_q || correctAnswer !== null : false;
    }, [allPlayers, currentSocketId, correctAnswer]);


    const startTimer = (limit) => {
        if (timerRef.current) clearInterval(timerRef.current);

        setTimeLeft(limit);
        playSound('timer'); // Démarre le son du minuteur

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    stopSound('timer');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswer = (answerText, answerIndex) => {
        if (hasAnswered || !currentQuestionData) return;
        
        setSelectedAnswer(answerIndex);
        
        socket.emit("player_answer", { 
            question_id: currentQuestionData.id, 
            answer: answerText 
        });
    };


    // === Initialisation des Écouteurs de Socket ===
    useEffect(() => {
        
        socket.on("new_question", (data) => {
            stopSound('timer');
            setCurrentQuestionData(data);
            setQuestionsTotal(data.totalQuestions);
            setSelectedAnswer(null);
            setCorrectAnswer(null);
            startTimer(data.timeLimit);
        });

        socket.on("reveal_answer", (data) => {
            stopSound('timer');
            setCorrectAnswer(data.correctAnswer);
        });
        
        socket.on("players_update", (playersData) => {
            setAllPlayers(playersData); 
        });

        socket.on("feedback_answer", (data) => {
            // Le score a déjà été mis à jour via players_update, ceci est pour le feedback visuel/sonore immédiat
            console.log(`Réponse soumise. Correct : ${data.isCorrect}`);
            // if (data.isCorrect) playSound('correct'); else playSound('wrong');
        });

        socket.on("quiz_end", () => {
            setIsFinished(true);
        });
        
        socket.on("final_scores", (scores) => {
            setFinalScores(scores);
        });

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopSound('timer'); // Assure que le son est coupé au nettoyage
            socket.off("new_question");
            socket.off("reveal_answer");
            socket.off("players_update");
            socket.off("feedback_answer");
            socket.off("quiz_end");
            socket.off("final_scores");
        };
    }, [navigate]); 
    
    if (!currentQuestionData && !isFinished) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">En attente du début de la partie...</h1>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <h1 className="text-4xl font-bold mb-8 text-green-700">🎉 Quiz Terminé !</h1>
                <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Classement Final</h2>
                    <ul className="space-y-3">
                        {finalScores.map((p, index) => (
                            <li key={p.pseudo} className={`flex justify-between items-center p-3 rounded-lg ${index === 0 ? 'bg-yellow-100 font-bold' : 'bg-gray-50'}`}>
                                <span>{index + 1}. {p.pseudo}</span>
                                <span className="text-lg">{p.score} points</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <button 
                    onClick={() => navigate('/lobby')}
                    className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-600 transition"
                >
                    Retour au Lobby
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Question {currentQuestionData.questionNumber} / {questionsTotal}</h2>
                    <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`}>{timeLeft}s</p>
                </div>

                <h3 className="text-lg mb-4">{currentQuestionData.questionText}</h3>
                
                <p className="mb-4 text-gray-600">Score : **{myScore}**</p> 

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestionData.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption = correctAnswer && option === correctAnswer;
                        
                        let buttonClass = "bg-gray-200 hover:bg-gray-300";

                        if (hasAnswered && !correctAnswer) {
                            // Le joueur a répondu (mais pas encore révélé)
                            buttonClass = isSelected ? "bg-blue-600 text-white" : "bg-gray-200 cursor-not-allowed";
                        }
                        
                        // Style après révélation
                        if (correctAnswer) {
                            if (isCorrectOption) {
                                buttonClass = "bg-green-500 text-white font-bold"; 
                            } else if (isSelected) {
                                buttonClass = "bg-red-500 text-white font-bold"; 
                            } else {
                                buttonClass = "bg-gray-200 cursor-default"; 
                            }
                        }
                        // Style avant révélation, si le joueur sélectionne
                        else if (isSelected) {
                             buttonClass = "bg-blue-500 text-white hover:bg-blue-600";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option, index)}
                                disabled={hasAnswered}
                                className={`p-4 rounded-lg text-lg font-medium transition ${buttonClass}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}