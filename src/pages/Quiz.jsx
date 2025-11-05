// src/pages/Quiz.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { playSound, stopSound } from '../audioManager'; 

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

export default function Quiz() {
    const navigate = useNavigate();
    const currentSocketId = socket.id; 
    
    // 💡 AJOUT : Récupérer l'ID du participant pour l'envoyer avec la réponse
    const [participantId] = useState(sessionStorage.getItem("participantId"));

    const [questionsTotal, setQuestionsTotal] = useState(0);
    const [currentQuestionData, setCurrentQuestionData] = useState(null); 
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null); 
    const [correctAnswer, setCorrectAnswer] = useState(null); 
    const [allPlayers, setAllPlayers] = useState([]); 
    const [isFinished, setIsFinished] = useState(false);
    const [finalScores, setFinalScores] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    
    const myScore = useMemo(() => {
        const player = allPlayers.find(p => p.id === currentSocketId);
        return player ? player.score : 0;
    }, [allPlayers, currentSocketId]);
    
    const hasAnswered = useMemo(() => {
        const player = allPlayers.find(p => p.id === currentSocketId);
        return player ? player.has_answered_current_q || correctAnswer !== null : false;
    }, [allPlayers, currentSocketId, correctAnswer]);

    const startTimer = (limit) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(limit);
        playSound('timer'); 

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
        // Sécurité supplémentaire anti-double clic
        if (hasAnswered || !currentQuestionData || selectedAnswerIndex !== null) return;
        
        setSelectedAnswerIndex(answerIndex);
        
        // 💡 CORRECTION : On envoie aussi le participantId pour être sûr
        socket.emit("player_answer", { 
            question_id: currentQuestionData.id, 
            answer: answerText,
            participantId: parseInt(participantId)
        });
    };

    useEffect(() => {
        socket.on("new_question", (data) => {
            stopSound('timer');
            setCurrentQuestionData(data);
            setQuestionsTotal(data.totalQuestions);
            setSelectedAnswerIndex(null);
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
            // Feedback sonore optionnel ici
        });

        socket.on("quiz_end", () => {
            setIsFinished(true);
            stopSound('timer');
        });
        
        socket.on("final_scores", (scores) => {
            setFinalScores(scores);
        });

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopSound('timer'); 
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl animate-pulse">
                    <h1 className="text-4xl font-extrabold mb-4 text-yellow-400">QUIZ QUI VEUT GAGNER UNE PATISSERIE</h1>
                    <p className="text-xl">Chargement de la prochaine question...</p>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
                <h1 className="text-5xl font-extrabold mb-8 text-yellow-400">🎉 FIN DU JEU !</h1>
                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-yellow-500">
                    <h2 className="text-3xl font-bold mb-6 border-b border-gray-600 pb-3 text-white">🏆 CLASSEMENT FINAL</h2>
                    <ul className="space-y-4">
                        {finalScores.map((p, index) => (
                            <li key={index} className={`flex justify-between items-center p-4 rounded-xl transition ${index === 0 ? 'bg-yellow-500 text-gray-900 font-extrabold text-xl scale-105 shadow-yellow-800 shadow-lg' : 'bg-gray-700 font-semibold'}`}>
                                <span>{index + 1}. {p.pseudo}</span>
                                <span className="text-2xl">{p.score} pts</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={() => navigate('/lobby')} className="mt-10 bg-yellow-500 text-gray-900 px-8 py-4 rounded-full text-xl font-bold hover:bg-yellow-400 transition transform hover:scale-105 shadow-xl">
                    Retour au Lobby
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 p-8 text-white">
            <div className="w-full max-w-4xl flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-yellow-400">
                    Question {currentQuestionData.questionNumber} / {questionsTotal}
                </h1>
                <div className="text-3xl font-extrabold bg-yellow-500 text-gray-900 py-2 px-6 rounded-lg shadow-xl">
                    Score: {myScore}
                </div>
            </div>

            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-yellow-500 mb-10 text-center">
                <div className={`text-5xl font-extrabold mb-4 transition-colors ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    {timeLeft}s
                </div>
                <h3 className="text-3xl font-semibold text-white">
                    {currentQuestionData.questionText}
                </h3>
            </div>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestionData.options?.map((option, index) => {
                    const isSelected = selectedAnswerIndex === index;
                    const isCorrectOption = correctAnswer && option === correctAnswer;
                    const isSubmittedWrong = correctAnswer && isSelected && option !== correctAnswer;
                    const label = ANSWER_LABELS[index];

                    let buttonClass = "bg-gray-700 hover:bg-gray-600 border border-gray-600";
                    if (hasAnswered && !correctAnswer) {
                        buttonClass = isSelected ? "bg-blue-600 border-blue-400 shadow-blue-800 shadow-md animate-pulse" : "bg-gray-800 border-gray-700 cursor-not-allowed text-gray-400 opacity-50";
                    } else if (correctAnswer) {
                        if (isCorrectOption) buttonClass = "bg-green-600 border-green-400 shadow-green-800 shadow-lg text-white font-bold animate-none scale-105"; 
                        else if (isSubmittedWrong) buttonClass = "bg-red-600 border-red-400 shadow-red-800 shadow-lg text-white font-bold animate-none"; 
                        else buttonClass = "bg-gray-900 border-gray-800 cursor-default text-gray-600 opacity-50"; 
                    } else if (isSelected) {
                        buttonClass = "bg-blue-500 border-blue-400";
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option, index)}
                            disabled={hasAnswered}
                            className={`p-4 rounded-xl text-xl font-medium transition-all duration-200 transform ${!hasAnswered && !correctAnswer ? 'hover:scale-[1.02]' : ''} ${buttonClass} text-left`}
                        >
                            <span className="inline-block w-8 font-extrabold text-yellow-400 mr-4">{label}:</span>
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}