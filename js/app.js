// --- REFERENCIAS A DATOS Y COMPONENTES GLOBALES ---
const {
    eventData,
    distortionEventsData,
    allBonusData,
    bonusMissionData,
    bonusLaProfeciaData,
    bonusLaVeneData
} = GAME_DATA;

const {
    Header,
    LoginPage
} = GAME_COMPONENTS;


// --- CONFIGURACIÓN Y FUNCIONES DE AYUDA ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym5-onTOyzlqZn_G4O-5acxAZzReYjIOY5SF8tBh3TtT2jEFVw6IZ2MMMtkHGtRl0F/exec';

const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// ... Aquí va el resto de tus funciones de ayuda: generarPistaDinamica, triggerVibration, etc.
// El código de estas funciones NO cambia.
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


// --- COMPONENTES DE REACT (RESTANTES, AÚN DENTRO DE APP.JS) ---
// NOTA: DistortionEventPage, EnRutaPage, etc., siguen aquí por ahora. Los moveremos después.

const DistortionEventPage = ({ event, onComplete }) => { /* ...código sin cambios... */ };
const EnRutaPage = ({ nextLocation, onArrival, department, onFinishEarly }) => { /* ...código sin cambios... */ };
const LongTravelPage = ({ onArrival, nextDepartment, onFinishEarly }) => { /* ...código sin cambios... */ };
const EndGamePage = ({ score, finalTime, teamName }) => { /* ...código sin cambios... */ };
const AbortedGamePage = ({ score, finalTime, teamName }) => { /* ...código sin cambios... */ };
const TriviaSection = ({ stage, onComplete }) => { /* ...código sin cambios... */ };
const AnchorSection = ({ stage, onComplete, onHintRequest, score }) => { /* ...código sin cambios... */ };
const FinalSection = ({stage, onComplete}) => { /* ...código sin cambios... */ };
const Leaderboard = () => { /* ...código sin cambios... */ };
const BonusMissionModal = ({ bonusData, onComplete }) => { /* ...código sin cambios... */ };


// --- BLOQUE PRINCIPAL DE LA APP ---
const getInitialState = () => ({ 
    status: 'login', 
    squadCode: null, 
    teamName: '', 
    currentMissionId: eventData.length > 0 ? eventData[0].id : 1, 
    subStage: 'anchor', 
    score: 0, 
    mainTimer: 0, 
    finalTimeDisplay: '', 
    errorMessage: '', 
    missionResults: [], 
    pendingAnchorResult: null,
    activeDistortionEventId: null,
    postDistortionStatus: null,
    activeBonusMissionId: null,
    bonusPorthoOffered: false,
    bonusLaProfeciaOffered: false
});

const App = () => {
    // El código de tu componente App principal no necesita cambios aquí.
    const [appState, setAppState] = React.useState(() => {
        const savedDataJSON = localStorage.getItem('guardianesAppState');
        
        if (!savedDataJSON) {
            return getInitialState();
        }

        try {
            const savedData = JSON.parse(savedDataJSON);

            if (savedData && savedData.state && savedData.timestamp) {
                const now = Date.now();
                const lastSavedTime = savedData.timestamp;
                const hours24inMs = 24 * 60 * 60 * 1000;

                if ((now - lastSavedTime) < hours24inMs) {
                    console.log("Restaurando sesión. Menos de 24hs transcurridas.");
                    return savedData.state; 
                } else {
                    console.log("Sesión expirada. Han pasado más de 24hs. Reiniciando.");
                    localStorage.removeItem('guardianesAppState');
                }
            }
        } catch (e) {
            console.error("Error al procesar datos guardados. Reiniciando.", e);
            localStorage.removeItem('guardianesAppState');
        }

        return getInitialState();
    });

    
    React.useEffect(() => {
    if (appState.status !== 'login') {
        const dataToSave = {
            state: appState,
            timestamp: Date.now()
        };
        localStorage.setItem('guardianesAppState', JSON.stringify(dataToSave));
    }
    }, [appState]);

    React.useEffect(() => {
        let interval;
        if (appState.status !== 'login' && appState.status !== 'finished' && appState.status !== 'aborted' && !appState.activeDistortionEventId && !appState.activeBonusMissionId) {
            interval = setInterval(() => {
                setAppState(prev => ({ ...prev, mainTimer: prev.mainTimer + 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [appState.status, appState.activeDistortionEventId, appState.activeBonusMissionId]);

    const currentStageData = eventData.find(m => m.id === appState.currentMissionId);
    const activeDistortionEvent = distortionEventsData.find(e => e.id === appState.activeDistortionEventId);
    const activeBonusData = appState.activeBonusMissionId ? allBonusData.find(b => b.id === appState.activeBonusMissionId) : null;


    const handleLogin = (code, name) => {
        const initialState = getInitialState();
        const fullState = { ...initialState, status: 'in_game', squadCode: code, teamName: name };
        setAppState(fullState);
        sendResultsToBackend(fullState);
    };
    
    const handleAnchorComplete = (anchorResult) => {
        if (!currentStageData) return;
        const newScore = appState.score + anchorResult.points;
        setAppState(prev => ({ ...prev, score: newScore, subStage: 'trivia', pendingAnchorResult: anchorResult }));
    };
    
    const handleRequestHint = () => {
        setAppState(prev => ({
            ...prev,
            score: Math.max(0, prev.score - 25)
        }));
    };
    
const handleTriviaComplete = (triviaResult) => {
    if (!currentStageData || !appState.pendingAnchorResult) return;

    const newScore = appState.score + triviaResult.points;
    const completeMissionRecord = {
        missionId: currentStageData.id,
        missionName: currentStageData.anchor.missionName.replace("Ancla: ", ""),
        anchorTime: appState.pendingAnchorResult.time,
        anchorPoints: appState.pendingAnchorResult.points,
        triviaTime: triviaResult.time,
        triviaPoints: triviaResult.points
    };
    const updatedResults = [...appState.missionResults, completeMissionRecord];

    let baseStateForNextStep = {
        ...appState,
        score: newScore,
        missionResults: updatedResults,
        pendingAnchorResult: null,
    };

    sendResultsToBackend(baseStateForNextStep);

    const triggeredBonus = allBonusData.find(b =>
        b.triggerMissionId === currentStageData.id &&
        (b.id === 'bonus_portho_1' ? !appState.bonusPorthoOffered : true) &&
        (b.id === 'bonus_la_profecia_1' ? !appState.bonusLaProfeciaOffered : true)
    );

    if (triggeredBonus) {
        console.log(`%c[ETAPA 1] Disparando Bonus: ${triggeredBonus.id}`, 'color: #00AACC; font-size: 14px; font-weight: bold;');
        setAppState({
            ...baseStateForNextStep,
            activeBonusMissionId: triggeredBonus.id,
            bonusPorthoOffered: triggeredBonus.id === 'bonus_portho_1' ? true : appState.bonusPorthoOffered,
            bonusLaProfeciaOffered: triggeredBonus.id === 'bonus_la_profecia_1' ? true : appState.bonusLaProfeciaOffered
        });
        return;
    }

    const nextMission = eventData.find(m => m.id === currentStageData.nextMissionId);
    const nextStatus = nextMission
        ? (nextMission.department !== currentStageData.department ? 'long_travel' : 'on_the_road')
        : 'finished';
    const triggeredEvent = distortionEventsData.find(e => e.trigger?.onMissionComplete === currentStageData.id);

    if (triggeredEvent && nextMission) {
        setAppState({
            ...baseStateForNextStep,
            status: 'distortion_event',
            activeDistortionEventId: triggeredEvent.id,
            postDistortionStatus: nextStatus,
        });
    } else {
        if (!nextMission) {
            handleFinalComplete(0);
            return;
        }
        setAppState({ ...baseStateForNextStep, status: nextStatus });
    }
};
    
    const handleDistortionComplete = (result) => {
        const newScore = Math.max(0, appState.score + (result?.points || 0));
        const newState = {
            ...appState,
            score: newScore,
            activeDistortionEventId: null, 
            status: appState.postDistortionStatus, 
            postDistortionStatus: null,
        }
        setAppState(newState);
        sendResultsToBackend(newState);
    };

    const handleFinalComplete = (bonusPoints) => {
        const totalSeconds = appState.mainTimer;
        const finalTime = formatTime(totalSeconds);
        const finalScore = (appState.score || 0) + (bonusPoints || 0);
        
        const finalState = { ...appState, score: finalScore, status: 'finished', finalTimeDisplay: finalTime };
        
        setAppState(finalState);
        sendResultsToBackend(finalState);
    };

    const handleArrival = () => {
        if (!currentStageData || typeof currentStageData.nextMissionId !== 'number') return;
        const nextMission = eventData.find(m => m.id === currentStageData.nextMissionId);
        if (nextMission) {
            setAppState(prev => ({ ...prev, currentMissionId: nextMission.id, status: 'in_game', subStage: 'anchor' }));
        } else {
            handleFinalComplete(0);
        }
    };
    
    const handleResetDevelopment = () => {
        if (window.confirm("¿Seguro que quieres reiniciar toda la misión y borrar los datos guardados? (Solo para desarrollo)")) {
            localStorage.removeItem('guardianesAppState');
            setAppState(getInitialState());
        }
    };

    const handleFinishEarly = () => {
        if (window.confirm('¿Estas seguro? Esto finalizará tu partida')) {
            const totalSeconds = appState.mainTimer;
            const finalTime = formatTime(totalSeconds);
            const finalScore = appState.score || 0;
            
            const finalState = { 
                ...appState, 
                score: finalScore, 
                status: 'aborted',
                finalTimeDisplay: finalTime 
            };
            
            setAppState(finalState);
            sendResultsToBackend(finalState);
        }
    };

const handleBonusModalClose = (result) => {
    console.log('%c[ETAPA 2] Se cierra el modal del bonus.', 'color: #FF6600; font-size: 14px; font-weight: bold;');
    console.log('Datos recibidos del modal:', result);

    const pointsWon = result?.points || 0;
    const participated = result?.participated || false;

    if (participated) {
        sendBonusResultToBackend({
            teamName: appState.teamName,
            bonusId: appState.activeBonusMissionId,
            points: pointsWon
        });
    }

    const newScore = appState.score + pointsWon;
    const baseStateAfterBonus = {
        ...appState,
        score: newScore,
        activeBonusMissionId: null
    };

    const missionThatTriggeredBonus = eventData.find(m => m.id === currentStageData.id);
    const nextMission = eventData.find(m => m.id === missionThatTriggeredBonus.nextMissionId);

    if (!nextMission) {
        handleFinalComplete(0);
        return;
    }

    const nextStatus = nextMission.department !== missionThatTriggeredBonus.department
        ? 'long_travel'
        : 'on_the_road';

    const triggeredEvent = distortionEventsData.find(e => e.trigger?.onMissionComplete === currentStageData.id);

    let finalState;
    if (triggeredEvent) {
        finalState = {
            ...baseStateAfterBonus,
            status: 'distortion_event',
            activeDistortionEventId: triggeredEvent.id,
            postDistortionStatus: nextStatus,
        };
    } else {
        finalState = {
            ...baseStateAfterBonus,
            status: nextStatus
        };
    }

    setAppState(finalState);
    sendResultsToBackend(finalState);
};
    
    const handleJumpToBonusPortho = () => {
        if (window.confirm("Saltar a la pantalla de viaje con el bonus Portho? (DEV)")) {
            setAppState(prev => ({
                ...prev,
                status: 'long_travel',
                currentMissionId: 26,
                activeBonusMissionId: bonusMissionData.id,
                bonusPorthoOffered: true,
            }));
        }
    };

    const handleJumpToBonusLaProfecia = () => {
        if (window.confirm("Saltar a la pantalla de viaje con el bonus La Profecía? (DEV)")) {
            setAppState(prev => ({
                ...prev,
                status: 'on_the_road',
                currentMissionId: 6,
                activeBonusMissionId: bonusLaProfeciaData.id,
                bonusLaProfeciaOffered: true,
            }));
        }
    };


    const renderContent = () => {
        if (appState.status === 'in_game' && !currentStageData) {
            return <p style={{padding: "20px"}}>Detectando anomalía temporal...</p>;
        }

        switch (appState.status) {
            case 'login':
                return <LoginPage onLogin={handleLogin} setErrorMessage={(msg) => setAppState(prev => ({ ...prev, errorMessage: msg }))} errorMessage={appState.errorMessage} />;
            
            case 'long_travel': {
                if (!currentStageData.nextMissionId) return null;
                const nextMission = eventData.find(m => m.id === currentStageData.nextMissionId);
                if (!nextMission) { handleFinalComplete(0); return null; }
                const toDept = nextMission.department;

                return <LongTravelPage 
                            nextDepartment={toDept} 
                            onArrival={handleArrival} 
                            onFinishEarly={handleFinishEarly}
                        />;
            }
            
            case 'on_the_road': {
                const nextMission = eventData.find(m => m.id === currentStageData.nextMissionId);
                if (!nextMission) {
                    return <EndGamePage score={appState.score} finalTime={appState.finalTimeDisplay} teamName={appState.teamName} />;
                }
                return <EnRutaPage 
                            nextLocation={nextMission.location} 
                            department={nextMission.department} 
                            onArrival={handleArrival}
                            onFinishEarly={handleFinishEarly}
                        />;
            }

            case 'in_game': {
                if(currentStageData.type === 'final') return <FinalSection stage={currentStageData} onComplete={handleFinalComplete} />;
                
                if (appState.subStage === 'anchor') return <AnchorSection stage={currentStageData} onComplete={handleAnchorComplete} onHintRequest={handleRequestHint} score={appState.score} />;
                
                if (appState.subStage === 'trivia') return <TriviaSection stage={currentStageData} onComplete={handleTriviaComplete} />;
                break;
            }

            case 'finished':
                return <EndGamePage score={appState.score} finalTime={appState.finalTimeDisplay} teamName={appState.teamName} />;
            
            case 'aborted':
                return <AbortedGamePage score={appState.score} finalTime={appState.finalTimeDisplay} teamName={appState.teamName} />;
            
            default:
                return <p>Error: Estado desconocido.</p>;
        }
    };

    return (
        <div className="app-container">
            {appState.status !== 'login' && <Header teamName={appState.teamName} score={appState.score} timer={appState.mainTimer} />}
            
            <div className="dashboard-content">
                {renderContent()}
            </div>
            
            {activeDistortionEvent && <DistortionEventPage event={activeDistortionEvent} onComplete={handleDistortionComplete} />}
            {activeBonusData && <BonusMissionModal bonusData={{...activeBonusData, teamName: appState.teamName}} onComplete={handleBonusModalClose} />}

            <div className="dev-controls-container">
                {appState.status !== 'login' && (
                    <>
                        <button className="dev-reset-button dev-bonus" onClick={handleJumpToBonusPortho}>
                            B.PORTHO
                        </button>
                        <button className="dev-reset-button dev-bonus" onClick={handleJumpToBonusLaProfecia}>
                            B.PROFECIA
                        </button>
                        <button className="dev-reset-button dev-reset" onClick={handleResetDevelopment}>
                            RESET
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
