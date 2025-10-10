import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

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
