import { useEffect, useState } from "react";

export default function Quiz() {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [timer, setTimer] = useState(3);
  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const playerId = localStorage.getItem("participantId");

  // ======== Étape 1 : préparation ========
  const handleReady = () => {
    setIsReady(true);
    let t = 3;
    setTimer(t);
    const interval = setInterval(() => {
      t--;
      setTimer(t);
      if (t === 0) {
        clearInterval(interval);
        fetchQuestion();
      }
    }, 1000);
  };

  // ======== Étape 2 : récupérer une question ========
  const fetchQuestion = async () => {
    if (questionCount >= 10) {
      setIsFinished(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/quiz/question");
      const data = await res.json();

      // Si la question a déjà été posée, on relance la fonction
      if (questionsAsked.includes(data.id)) {
        return fetchQuestion();
      }

      setQuestion(data);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setQuestionsAsked((prev) => [...prev, data.id]);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // ======== Étape 3 : gestion de la réponse ========
  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    try {
      const res = await fetch("http://localhost:8000/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          question_id: question.id,
          answer,
        }),
      });

      const data = await res.json();
      setCorrectAnswer(data.correct_answer);

      if (data.is_correct) {
        setScore((prev) => prev + 1);
      }

      // passe à la question suivante après 1,5s
      setTimeout(() => {
        if (questionCount < 10) fetchQuestion();
        else setIsFinished(true);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // ======== Écran d'attente avant de commencer ========
  if (!isReady)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
        <h1 className="text-3xl font-bold mb-6">Prêt à jouer ? 😎</h1>
        <button
          onClick={handleReady}
          className="bg-green-500 hover:bg-green-600 text-lg px-6 py-3 rounded-xl transition"
        >
          Je suis prêt !
        </button>
      </div>
    );

  // ======== Compte à rebours avant la première question ========
  if (timer > 0 && !question)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white text-center">
        <h2 className="text-6xl font-bold mb-4 animate-pulse">{timer}</h2>
        <p className="text-lg">Prépare-toi...</p>
      </div>
    );

  // ======== Écran de fin ========
  if (isFinished)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 to-purple-700 text-white text-center p-6">
        <h1 className="text-4xl font-bold mb-6">🎉 Bravo !</h1>
        <p className="text-xl mb-4">
          Ton score final est de <span className="font-bold">{score}/10</span>
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-lg font-semibold transition"
        >
          Rejouer
        </button>
      </div>
    );

  // ======== Chargement ========
  if (!question)
    return (
      <p className="text-center mt-10 text-gray-600">
        Chargement ou plus de questions 😴
      </p>
    );

  // ======== Écran du quiz ========
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">
          Question {questionCount} / 10
        </h2>
        <h3 className="text-lg mb-4">{question.question}</h3>
        <p className="mb-4 text-gray-600">Score : {score}</p>

        <div className="flex flex-col gap-3">
          {question.answers.map((a, i) => {
            let color = "bg-blue-500";
            if (selectedAnswer) {
              if (a === correctAnswer) color = "bg-green-500";
              else if (a === selectedAnswer && a !== correctAnswer)
                color = "bg-red-500";
              else color = "bg-gray-400";
            }

            return (
              <button
                key={i}
                disabled={!!selectedAnswer}
                onClick={() => handleAnswer(a)}
                className={`${color} text-white p-3 rounded-lg hover:opacity-90 transition text-lg`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
