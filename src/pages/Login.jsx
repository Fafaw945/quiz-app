// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Récupérer l'URL de l'API avec la syntaxe Create React App
const API_URL = process.env.REACT_APP_API_URL;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    try {
      // 2. Utiliser la variable API_URL
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Réponse serveur login :", data);

      if (!res.ok) {
        alert(data.error || "Erreur de connexion");
        return;
      }

      if (!data.pseudo) { 
        alert("Erreur : pseudo reçu invalide.");
        console.error("Login data incorrect :", data);
        return;
      }

      localStorage.removeItem("participantId"); 
      localStorage.removeItem("is_admin"); 
      
      if (data.participantId) {
           localStorage.setItem("participantId", data.participantId);
      } 
      localStorage.setItem("pseudo", data.pseudo);
      localStorage.setItem("is_admin", data.is_admin ? "1" : "0");

      console.log("LocalStorage pseudo :", localStorage.getItem("pseudo"));
      console.log("LocalStorage is_admin :", localStorage.getItem("is_admin"));

      navigate("/lobby");
    } catch (err) {
      console.error("Erreur login :", err);
      alert("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center text-gray-700">Se connecter</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Connexion
        </button>
      </form>
    </div>
  );
}

