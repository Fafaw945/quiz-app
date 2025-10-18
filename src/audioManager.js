// src/audioManager.js (CORRIGÉ - Ajout des fonctions playSound/stopSound)

// 1. Musique de fond (Lobby)
const gameMusic = new Audio('/game-music.mp3'); 
gameMusic.loop = true;
gameMusic.volume = 0.3;

// 2. Son pour le minuteur (Quiz)
// ⚠️ Assurez-vous d'avoir un fichier 'beep.mp3' dans votre dossier public/
const timerSound = new Audio('/beep.mp3'); 
timerSound.volume = 0.5;

// Flag pour savoir si la lecture de la musique est en cours
let isMusicPlaying = false; 

// === Fonctions pour la Musique de Fond (Utilisées dans Lobby.jsx) ===

const playMusic = () => {
    if (isMusicPlaying) return;

    gameMusic.play()
        .then(() => {
            isMusicPlaying = true;
            console.log("Musique de fond démarrée.");
        })
        .catch(error => {
            console.warn("Lecture audio musique bloquée, attente d'interaction.");
        });
};

const stopMusic = () => {
    gameMusic.pause();
    gameMusic.currentTime = 0;
    isMusicPlaying = false;
    console.log("Musique de fond arrêtée.");
};

// === Fonctions pour les Sons Spécifiques (Utilisées dans Quiz.jsx) ===

const playSound = (soundName) => {
    if (soundName === 'timer') {
        // Redémarre le son s'il est déjà en cours
        timerSound.play().catch(e => console.warn("Erreur lecture son minuteur:", e));
    }
};

const stopSound = (soundName) => {
    if (soundName === 'timer') {
        timerSound.pause();
        timerSound.currentTime = 0; // Remet à zéro
    }
};

// Exporter toutes les fonctions
export { 
    gameMusic, 
    playMusic, 
    stopMusic, 
    playSound, 
    stopSound,
    isMusicPlaying as isPlaying 
};