// src/pages/Home.jsx (CORRIGÉ - Utilise audioManager)
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { playMusic, stopMusic } from '../audioManager'; // 🚨 Importation

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        playMusic(); // 🚨 Lance la lecture au chargement

        // Arrête la musique quand on quitte la page Home (vers Login/Register)
        return () => {
            // NOTE: On ne fait rien ici pour permettre la transition vers Lobby
            // La musique sera gérée par Lobby.jsx
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-center p-4">
            <h1 className="text-4xl font-bold mb-8">Bienvenue au Shadow de la Team ! 🌑</h1>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    onClick={() => navigate("/register")}
                    className="bg-green-500 hover:bg-green-600 py-3 rounded-xl text-lg font-semibold transition"
                >
                    Créer un compte
                </button>
                <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 hover:bg-blue-600 py-3 rounded-xl text-lg font-semibold transition"
                >
                    Se connecter
                </button>
            </div>
        </div>
    );
}