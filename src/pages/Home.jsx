import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
// Les imports d'icônes externes (lucide-react) sont supprimés et remplacés par du SVG intégré.

// ==========================================================
// 1. DÉFINITION DES ICÔNES SVG INTÉGRÉES
// ==========================================================
// Remplacement de Volume2 (Son activé)
const Volume2 = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 5L6 9H2V15H6L11 19V5Z" />
        <path d="M15.54 8.46A5 5 0 0 1 18.04 12A5 5 0 0 1 15.54 15.54" />
    </svg>
);

// Remplacement de VolumeX (Son coupé)
const VolumeX = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 5L6 9H2V15H6L11 19V5Z" />
        <line x1="22" y1="9" x2="16" y2="15" />
        <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
);

// Remplacement de AlertTriangle (Alerte Autoplay)
const AlertTriangle = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
);


// Le chemin d'accès au fichier audio (doit être dans le dossier public)
const AUDIO_PATH = "/game-music.mp3"; 

// Composant de carte individuelle (inchangé)
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
                    className="absolute inset-0 backface-hidden bg-gray-900 rounded-xl shadow-2xl p-6 flex flex-col justify-center border-b-4 border-blue-500"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <h3 className="text-3xl font-extrabold text-blue-400 mb-4 text-center">{member.name}</h3>
                    <p className="text-lg text-gray-300 mb-2 font-semibold text-center">Rôle: {member.role}</p>
                    <p className="text-sm text-gray-400 text-center mt-2 px-2">
                        {/* AFFICHAGE DE LA DESCRIPTION PERSONNALISÉE ICI */}
                        {member.description} 
                    </p>
                    <div className="mt-6 text-xs text-gray-400 italic text-center">Cliquez pour voir la photo.</div>
                </div>
            </div>
        </div>
    );
};

// ==========================================================
// 3. LOGIQUE DU COMPOSANT TEAM SHADOW (TEAM_MEMBERS est inclus)
// ==========================================================

// Liste des collègues avec le nom de fichier (assumant un accès direct via le dossier public)
const TEAM_MEMBERS = [
    { 
        name: "Alassane", 
        file: "/Alassane.png", 
        role: "Le streamer tressé",
        description: "Maître des jeux en tout genre, il saura mener à bien chaque partie qu'il lancera. Doté d'un humour hors norme, il pourrait faire rire un ours. En plus, il est noir !"
    },
    { 
        name: "Bao", 
        file: "/Bao.png", 
        role: "Le Faux fabricant de nems maison",
        description: "Nous pouvons qualifier cet homme, avec un grand H, de 'raciste originel'. Toujours de bonne humeur, petit, mais aussi doux et frais !"
    },
    { 
        name: "Diey", 
        file: "/Diey.png", 
        role: "L'avocate",
        description: "Alors elle, je n'ai pas encore assez de données. En même temps, elle ne veut pas me voir, celle-là, alors tant pis, elle aura une description détaillée plus tard !"
    },
    { 
        name: "Fawzi", 
        file: "/Fawzi.png", 
        role: "Sans qui tout cela n'aurait pas été possible",
        description: "Que dire de cet être exceptionnel ? Beau, drôle, gentil, intelligent, fort, Arabe... Bref, que des qualités ! Sans lui, l'équipe ne serait pas la même."
    },
    { 
        name: "Guillaume", 
        file: "/Guillaume.png", 
        role: "Le chauve originel",
        description: "Notre cher Guig's, ce fabuleux étalon à la crinière inexistante est également rempli de qualités... mais il est fan de l'OM. Le pauvre..."
    },
    { 
        name: "Jacky", 
        file: "/Jacky.png", 
        role: "Yes, it's a Jacky",
        description: "Vraiment, ayez une Jacky dans vos vies ! Cet être exceptionnel a toujours le sourire et aime tout le monde. Elle ment souvent, mais on l'aime quand même !"
    },
    { 
        name: "Morgane", 
        file: "/Morgane.png", 
        role: "Dog Friend",
        description: "Momo, encore une personne au grand cœur, qui rit toute seule. Contrairement à Alassane, elle dispose d'un humour assez particulier, mais sa personnalité, son Koa et sa petite taille font qu'on l'aime !"
    },
    { 
        name: "Ratheesh", 
        file: "/Ratheesh.png", 
        role: "Le R",
        description: "Fondateur de Foodles, Robot, Vampire, Cousin de ChatGPT... Cet être aussi exceptionnel que discret nous rend tous amoureux de ce type !"
    },
    { 
        name: "Sabrine", 
        file: "/Sabrine.png", 
        role: "El Professor",
        description: "DZ originelle, super-héroïne du service client, une bonne humeur à toute épreuve ! Mais faites gaffe à ne pas trop la chercher : elle est Algérienne, et les Algériens, ça mord, et ça vole des Macbooks !"
    },
    { 
        name: "Steecy", 
        file: "/Steecy.png", 
        role: "Arrow",
        description: "Première et dernière Antillaise pro du tir à l'arc, elle nous impressionne par sa précision, sa tyrannie, et sa capacité à ne pas vomir en traitant le canal Qualité-Care."
    },
];


// Composant principal (Home)
export default function Home() {
    const navigate = useNavigate();
    
    // Déclaration d'un état d'erreur de chargement audio
    const [audioLoadError, setAudioLoadError] = useState(false);
    
    // Initialisation de l'objet Audio avec un useEffect pour gérer les erreurs de construction
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        try {
            const newAudio = new Audio(AUDIO_PATH);
            setAudio(newAudio);
            
            // Écouteur pour l'événement 'error' qui se déclenche si la ressource n'est pas chargée
            newAudio.onerror = () => {
                console.error(`[ERREUR FATALE AUDIO] Impossible de charger la ressource audio. Veuillez vérifier que le fichier ${AUDIO_PATH} existe bien et est un format MP3 valide.`);
                setAudioLoadError(true);
            };

            // Optionnel : Tentative de chargement explicite
            newAudio.load();
        } catch (error) {
            console.error("Erreur lors de la création de l'objet Audio:", error);
            setAudioLoadError(true);
        }
    }, []); // Se lance une seule fois au montage

    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [autoplayFailed, setAutoplayFailed] = useState(false);

    // Fonction pour démarrer/arrêter la musique
    const toggleMusic = useCallback((shouldPlay) => {
        if (!audio || audioLoadError) {
            console.warn("Musique non disponible à cause d'une erreur de chargement.");
            return;
        }

        if (shouldPlay) {
            audio.loop = true;
            audio.volume = 0.5; // Volume réduit pour ne pas être trop intrusif
            
            // Tente de jouer, attrape l'erreur si l'autoplay est bloqué
            audio.play()
                .then(() => {
                    setIsMusicPlaying(true);
                    setAutoplayFailed(false);
                })
                .catch((e) => {
                    // C'est l'erreur d'autoplay (interaction utilisateur requise)
                    console.error("Autoplay bloqué par le navigateur. Interaction utilisateur requise.", e);
                    setIsMusicPlaying(false);
                    setAutoplayFailed(true);
                });
        } else {
            audio.pause();
            setIsMusicPlaying(false);
            setAutoplayFailed(false);
        }
    }, [audio, audioLoadError]);

    useEffect(() => {
        // Tente de démarrer la musique seulement si l'objet audio a été créé sans erreur
        if (audio && !audioLoadError) {
            toggleMusic(true);
        }

        // Nettoyage : arrête la musique si le composant est démonté
        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, [audio, audioLoadError, toggleMusic]);

    return (
        <div className="min-h-screen bg-gray-900 text-white relative">
            
            {/* Contrôle du volume en haut à droite */}
            <button
                onClick={() => toggleMusic(!isMusicPlaying)}
                className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition duration-300 ${isMusicPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'} ${audioLoadError ? 'cursor-not-allowed opacity-50' : ''}`}
                title={isMusicPlaying ? "Arrêter la musique" : (audioLoadError ? "Musique non disponible" : "Démarrer la musique")}
                disabled={audioLoadError}
            >
                {/* Utilisation des composants SVG intégrés */}
                {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            
            {/* Message d'erreur d'autoplay (si nécessaire) */}
            {(autoplayFailed || audioLoadError) && (
                <div className="fixed top-20 right-4 z-40 p-3 bg-red-600 rounded-lg shadow-xl flex items-center space-x-2 text-sm animate-pulse">
                    {/* Utilisation du composant SVG intégré */}
                    <AlertTriangle size={20} />
                    {audioLoadError ? (
                        <span>Erreur: Le fichier '/music.mp3' est introuvable ou invalide.</span>
                    ) : (
                        <span>Cliquez sur l'icône de musique pour démarrer le son !</span>
                    )}
                </div>
            )}

            {/* Section 1: Connexion / Inscription */}
            <div className="flex flex-col items-center justify-center pt-24 pb-12 bg-gradient-to-br from-purple-800 to-indigo-900 text-center p-4">
                <h1 className="text-5xl font-extrabold mb-4 text-yellow-400">Bienvenue au Quiz de la Team !</h1>
                <p className="text-xl mb-8 text-gray-200">Prêt à affronter vos collègues pour la gloire (et la pâtisserie) ?</p>
                
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button
                        onClick={() => navigate("/register")}
                        className="bg-green-500 hover:bg-green-600 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                        Créer un compte
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 hover:bg-blue-600 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                        Se connecter
                    </button>
                </div>
            </div>

            {/* Section 2: Team Shadow Display */}
            <div className="py-16 p-8">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-yellow-500 mb-2">
                        L'Équipe Shadow
                    </h1>
                    <p className="text-xl text-gray-400">
                        Découvrez les visages derrière notre projet.
                    </p>
                </header>

                {/* Grille responsive des cartes 3D : 5 colonnes sur les très grands écrans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center max-w-7xl mx-auto">
                    {TEAM_MEMBERS.map(member => (
                        <TeamMemberCard key={member.name} member={member} />
                    ))}
                </div>
            </div>

            {/* Style pour le flip 3D (intégré pour le composant TeamMemberCard) */}
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
