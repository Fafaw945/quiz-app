import { useState } from "react";
// 💡 AJOUT : "Link" pour revenir au login
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    pseudo: "",
    email: "",
    password: "",
  });
  // 💡 AJOUT : État de chargement pour le bouton
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, pseudo, email, password } = formData;
    if (!name || !pseudo || !email || !password) {
      alert("Tous les champs sont requis !");
      return;
    }

    setIsLoading(true); // Active le chargement
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'inscription");
        setIsLoading(false); // Stoppe le chargement
        return;
      }

      sessionStorage.setItem("participantId", data.id);
      sessionStorage.setItem("pseudo", formData.pseudo);
      sessionStorage.setItem("is_admin", data.is_admin ? "1" : "0");

      navigate("/lobby");
    } catch (err) {
      console.error(err);
      alert("Impossible de contacter le serveur.");
      setIsLoading(false); // Stoppe le chargement
    }
  };

  return (
    // Fond dégradé sombre
    <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      {/* Carte effet "Glassmorphism" */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Rejoignez-nous
          </h1>
          <p className="text-gray-300 mt-2">Créez votre profil de joueur</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ligne Nom + Pseudo */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-1/2">
                <label className="text-gray-300 text-sm font-semibold ml-2">Nom complet</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required 
                    className="w-full mt-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
             </div>
             <div className="w-full md:w-1/2">
                <label className="text-gray-300 text-sm font-semibold ml-2">Pseudo</label>
                <input type="text" name="pseudo" placeholder="Gamer123" value={formData.pseudo} onChange={handleChange} required 
                    className="w-full mt-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
             </div>
          </div>

          <div>
            {/* 💡 CORRECTION : C'était </Llabel> */}
            <label className="text-gray-300 text-sm font-semibold ml-2">Email</label>
            <input type="email" name="email" placeholder="votre@email.com" value={formData.email} onChange={handleChange} required 
                className="w-full mt-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          
          <div>
            <label className="text-gray-300 text-sm font-semibold ml-2">Mot de passe</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required 
                className="w-full mt-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-6 w-full py-4 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold rounded-xl text-xl hover:scale-[1.02] active:scale-[0.98] transition-all transform shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Création..." : "S'inscrire et Jouer ! 🎮"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Déjà un compte ?{" "}
          <Link to="/" className="text-green-400 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}