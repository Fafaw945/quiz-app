import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Récupérer l'URL de l'API avec la syntaxe Create React App
const API_URL = process.env.REACT_APP_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    pseudo: "",
    email: "",
    password: "",
  });
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

    try {
      // 2. Utiliser la variable API_URL
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'inscription");
        return;
      }

      // 🚨 CORRECTION : Utiliser sessionStorage au lieu de localStorage
      sessionStorage.setItem("participantId", data.id);
      sessionStorage.setItem("pseudo", formData.pseudo);
      sessionStorage.setItem("is_admin", data.is_admin ? "1" : "0");

      navigate("/lobby");
    } catch (err) {
      console.error(err);
      alert("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center text-gray-700">Créer un compte</h1>
        <input type="text" name="name" placeholder="Nom complet" value={formData.name} onChange={handleChange} required className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="text" name="pseudo" placeholder="Pseudo" value={formData.pseudo} onChange={handleChange} required className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition">S'inscrire</button>
      </form>
    </div>
  );
}

