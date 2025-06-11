// Este es el archivo principal. Ahora está mucho más limpio porque
// los datos y algunos componentes se cargan desde otros archivos.

// --- REFERENCIAS A LOS DATOS GLOBALES DEL JUEGO ---
const {
    eventData,
    distortionEventsData,
    allBonusData,
    bonusMissionData,
    bonusLaProfeciaData,
    bonusLaVeneData
} = GAME_DATA;


// --- CONFIGURACIÓN DEL BACKEND ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym5-onTOyzlqZn_G4O-5acxAZzReYjIOY5SF8tBh3TtT2jEFVw6IZ2MMMtkHGtRl0F/exec';


// --- FUNCIONES GLOBALES DE AYUDA ---
// (Aquí van las funciones formatTime, generarPistaDinamica, triggerVibration, animatePoints, sendResultsToBackend, sendBonusResultToBackend)
const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const generarPistaDinamica = (respuesta) => {
    const respuestaSinEspacios = respuesta.replace(/ /g, '');
    const longitud = respuestaSinEspacios.length;
    let cantidadARevelar;

    if (longitud <= 4) {
        cantidadARevelar = 1;
    } else if (longitud <= 8) {
        cantidadARevelar = 2;
    } else if (longitud <= 12) {
        cantidadARevelar = 3;
    } else {
        cantidadARevelar = 4;
    }

    const indicesLetras = [];
    respuesta.split('').forEach((char, index) => {
        if (char !== ' ') {
            indicesLetras.push(index);
        }
    });

    for (let i = indicesLetras.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indicesLetras[i], indicesLetras[j]] = [indicesLetras[j], indicesLetras[i]];
    }

    const indicesARevelar = new Set(indicesLetras.slice(0, cantidadARevelar));

    const pistaGenerada = respuesta.split('').map((char, index) => {
        if (char === ' ') {
            return ' ';
        }
        if (indicesARevelar.has(index)) {
            return char;
        }
        return '_';
    }).join('');

    return pistaGenerada;
};

const triggerVibration = (duration = 100) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
};

const animatePoints = (points, originElementId) => {
    const destination = document.getElementById('score-display');
    const origin = document.getElementById(originElementId);

    if (!destination || !origin) {
        console.error("Elemento de destino u origen no encontrado para la animación.");
        return;
    }

    const pointsFlyer = document.createElement('div');
    pointsFlyer.textContent = `+${points}`;
    
    pointsFlyer.style.position = 'fixed';
    pointsFlyer.style.zIndex = '10000';
    pointsFlyer.style.padding = '8px 16px';
    pointsFlyer.style.backgroundColor = 'var(--color-feedback-success-dark, #2a9d8f)';
    pointsFlyer.style.color = '#FFFFFF';
    pointsFlyer.style.fontWeight = 'bold';
    pointsFlyer.style.fontSize = '1.5rem';
    pointsFlyer.style.borderRadius = '20px';
    pointsFlyer.style.border = '2px solid #FFFFFF';
    pointsFlyer.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
    pointsFlyer.style.pointerEvents = 'none';
    pointsFlyer.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(pointsFlyer);

    const destRect = destination.getBoundingClientRect();
    const originRect = origin.getBoundingClientRect();

    const startX = window.innerWidth / 2;
    const startY = originRect.top + originRect.height / 2;

    const endX = destRect.left + destRect.width / 2;
    const endY = destRect.top + destRect.height / 2;

    gsap.fromTo(pointsFlyer, 
        { 
            left: startX, 
            top: startY, 
            scale: 0,
            opacity: 0,
        }, 
        { 
            scale: 1.2,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            onComplete: () => {
                gsap.to(pointsFlyer, {
                    left: endX,
                    top: endY,
                    scale: 0.1,
                    opacity: 0,
                    duration: 1.0,
                    ease: 'power1.in',
                    delay: 0.4,
                    onComplete: () => {
                        pointsFlyer.remove();
                    }
                });
            }
        }
    );
};

async function sendResultsToBackend(data) {
    const timeToSend = data.finalTimeDisplay || formatTime(data.mainTimer);

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('URL_QUE_COPIASTE')) {
        console.warn("URL del script no configurada. No se enviarán los datos.");
        return;
    }
    const payload = {
        teamName: data.teamName,
        totalTime: timeToSend,
        totalScore: data.score,
        missionResults: data.missionResults
    };
    try {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        
        await fetch(`${GOOGLE_SCRIPT_URL}?action=saveResults`, {
            method: 'POST',
            body: formData,
        });
    } catch (error) {
        console.error("Error al enviar la actualización al backend:", error);
    }
}

async function sendBonusResultToBackend(data) {
    console.log('%c[ETAPA 3] Intentando enviar datos del bonus al backend.', 'color: #22CC22; font-size: 14px; font-weight: bold;');
    console.log('Datos que se enviarán:', data);

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('URL_QUE_COPIASTE')) {
        console.warn("URL del script no configurada. No se enviarán los datos del bonus.");
        return;
    }

    const params = new URLSearchParams({
        action: 'saveBonusResult',
        teamName: data.teamName,
        bonusId: data.bonusId,
        points: data.points
    });

    try {
        await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
            method: 'POST'
        });
        console.log(`%cResultado del bonus ${data.bonusId} enviado (supuestamente) con éxito.`, 'color: #22CC22;');
    } catch (error) {
        console.error("Error CRÍTICO al enviar el resultado del bonus al backend:", error);
    }
}

// --- COMPONENTES DE REACT (RESTANTES) ---

const DistortionEventPage = ({ event, onComplete }) => { /* ...código del componente... */ };
const EnRutaPage = ({ nextLocation, onArrival, department, onFinishEarly }) => { /* ...código del componente... */ };
const LongTravelPage = ({ onArrival, nextDepartment, onFinishEarly }) => { /* ...código del componente... */ };
const EndGamePage = ({ score, finalTime, teamName }) => { /* ...código del componente... */ };
const AbortedGamePage = ({ score, finalTime, teamName }) => { /* ...código del componente... */ };
const TriviaSection = ({ stage, onComplete }) => { /* ...código del componente... */ };
const AnchorSection = ({ stage, onComplete, onHintRequest, score }) => { /* ...código del componente... */ };
const FinalSection = ({stage, onComplete}) => { /* ...código del componente... */ };
const Leaderboard = () => { /* ...código del componente... */ };
const BonusMissionModal = ({ bonusData, onComplete }) => { /* ...código del componente... */ };

// --- BLOQUE PRINCIPAL DE LA APP ---
const getInitialState = () => ({ 
    // ...
});

const App = () => {
    // ... Todo el código del componente App se mantiene igual
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
