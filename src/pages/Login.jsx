import { useState } from "react";
// 💡 AJOUT : "Link" pour naviguer vers l'inscription
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  // 💡 AJOUT : État de chargement pour le bouton
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Tous les champs sont requis !");
      return;
    }

    setIsLoading(true); // Active le chargement
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Réponse serveur login :", data);

      if (!res.ok) {
        alert(data.error || "Erreur de connexion");
        setIsLoading(false); // Stoppe le chargement en cas d'erreur
        return;
      }

      if (!data.pseudo) {
        alert("Erreur : pseudo reçu invalide.");
        console.error("Login data incorrect :", data);
        setIsLoading(false); // Stoppe le chargement en cas d'erreur
        return;
      }

      sessionStorage.removeItem("participantId");
      sessionStorage.removeItem("is_admin");
      sessionStorage.removeItem("pseudo");
      
      if (data.participantId) {
        sessionStorage.setItem("participantId", data.participantId);
      }
      sessionStorage.setItem("pseudo", data.pseudo);
      sessionStorage.setItem("is_admin", data.is_admin ? "1" : "0");

      console.log("sessionStorage pseudo :", sessionStorage.getItem("pseudo"));
      console.log("sessionStorage is_admin :", sessionStorage.getItem("is_admin"));

      navigate("/lobby");
    } catch (err) {
      console.error("Erreur login :", err);
      alert("Impossible de contacter le serveur.");
      setIsLoading(false); // Stoppe le chargement en cas d'erreur
    }
  };

  return (
    // Fond dégradé sombre qui matche le lobby
    <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      {/* Carte effet "Glassmorphism" */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Bon Retour !
          </h1>
          <p className="text-gray-300 mt-2">Prêt pour une nouvelle partie ?</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-gray-300 text-sm font-semibold ml-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="text-gray-300 text-sm font-semibold ml-2">Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-xl hover:scale-[1.02] active:scale-[0.98] transition-all transform shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Connexion..." : "Se connecter 🚀"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-yellow-400 font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}