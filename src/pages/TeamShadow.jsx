import React, { useState } from 'react';

// Liste des collègues avec le nom de fichier (assumant un accès direct via le dossier public)
const TEAM_MEMBERS = [
    { name: "Alassane", file: "/Alassane.png", role: "Développeur Front-end" },
    { name: "Bao", file: "/Bao.png", role: "Architecte Logiciel" },
    { name: "Diey", file: "/Diey.png", role: "Scrum Master" },
    { name: "Fawzi", file: "/Fawzi.png", role: "Développeur Back-end" },
    { name: "Guillaume", file: "/Guillaume.png", role: "Chef de Projet" },
    { name: "Jacky", file: "/Jacky.png", role: "DevOps" },
    { name: "Morgane", file: "/Morgane.png", role: "UX/UI Designer" },
    { name: "Ratheesh", file: "/Ratheesh.png", role: "Analyste QA" },
    { name: "Sabrine", file: "/Sabrine.png", role: "Data Scientist" },
    { name: "Steecy", file: "/Steecy.png", role: "Spécialiste Cybersécurité" },
];

// Composant de carte individuelle
const TeamMemberCard = ({ member }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Placeholder image au cas où l'image réelle ne se charge pas
    const placeholderUrl = "https://placehold.co/400x400/1f2937/d1d5db?text=Image+Non+Trouvée";

    // Style pour l'effet de flip 3D
    const cardStyle = {
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.8s',
        willChange: 'transform',
    };

    return (
        <div 
            className="perspective-1000 w-full h-80 max-w-xs cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div style={cardStyle} className="relative w-full h-full">
                {/* Recto de la carte (Photo et Nom) */}
                <div 
                    className="absolute inset-0 backface-hidden bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center border-t-4 border-yellow-500"
                >
                    <img 
                        src={member.file} 
                        alt={`Photo de ${member.name}`} 
                        onError={(e) => { e.target.onerror = null; e.target.src=placeholderUrl }}
                        className="w-32 h-32 object-cover rounded-full mb-4 ring-4 ring-yellow-500 ring-opacity-50"
                    />
                    <h3 className="text-2xl font-bold text-yellow-400">{member.name}</h3>
                    <p className="text-sm text-gray-300 mt-1">{member.role}</p>
                    <div className="mt-4 text-xs text-gray-400 italic">Cliquez pour voir les détails !</div>
                </div>

                {/* Verso de la carte (Détails) */}
                <div 
                    className="absolute inset-0 backface-hidden bg-gray-900 rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center border-b-4 border-blue-500"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <h3 className="text-3xl font-extrabold text-blue-400 mb-4">{member.name}</h3>
                    <p className="text-lg text-gray-300 mb-2 font-semibold">Rôle: {member.role}</p>
                    <p className="text-sm text-gray-400 text-center mt-2">
                        {member.name} est un membre clé de notre équipe Shadow. Il/Elle excelle dans {member.role.toLowerCase()}.
                        <br/>(Détails personnalisés ici...)
                    </p>
                    <div className="mt-6 text-xs text-gray-400 italic">Cliquez pour voir la photo.</div>
                </div>
            </div>
        </div>
    );
};

// Composant principal
export default function TeamShadow() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-yellow-500 mb-2">
                    L'Équipe Shadow
                </h1>
                <p className="text-xl text-gray-400">
                    Découvrez les visages derrière notre projet (Qui veut gagner une pâtisserie).
                </p>
            </header>

            {/* Grille responsive des cartes 3D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto">
                {TEAM_MEMBERS.map(member => (
                    <TeamMemberCard key={member.name} member={member} />
                ))}
            </div>

            {/* Style pour le flip 3D (intégré car on est en fichier unique) */}
            <style jsx="true">{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden; /* For Safari */
                }
            `}</style>
        </div>
    );
}
