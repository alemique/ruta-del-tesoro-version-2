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
    LoginPage,
    // Próximamente añadiremos más componentes aquí
} = GAME_COMPONENTS;


// --- COMPONENTES DE REACT (RESTANTES, AÚN DENTRO DE APP.JS) ---
// NOTA: DistortionEventPage, EnRutaPage, etc., siguen aquí por ahora. Los moveremos después.

const DistortionEventPage = ({ event, onComplete }) => {
    // ...código del componente...
    const [view, setView] = React.useState('visual');
    const videoRef = React.useRef(null);

    React.useEffect(() => {
        if (view !== 'visual') return;

        if (event.visual.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => {
                console.error("Error al auto-reproducir video:", e);
                setView('challenge'); 
            });
        } else if (event.visual.type === 'image') {
            const timer = setTimeout(() => {
                setView('challenge');
            }, event.visual.duration);
            return () => clearTimeout(timer);
        }
    }, [event, view]);

    const handleVisualEnd = () => {
        setView('challenge');
    };

    const ChallengeRenderer = () => {
        const { challenge } = event;
        const [feedback, setFeedback] = React.useState({ message: '', type: '' });
        const [isLocked, setIsLocked] = React.useState(false);
        const [answer, setAnswer] = React.useState('');
        const [selectedOption, setSelectedOption] = React.useState('');
        const [timer, setTimer] = React.useState(challenge.timeLimit || 0);

        React.useEffect(() => {
            if (challenge.type !== 'corrupt_transmission' || isLocked) return;
            if (timer <= 0) {
                handleSubmit(true); return;
            }
            const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
            return () => clearInterval(interval);
        }, [timer, isLocked]);

        const handleSubmit = (isTimeout = false) => {
            if (isLocked) return;
            setIsLocked(true);
            const isCorrect = !isTimeout && answer.trim() === challenge.correctAnswer;
            const points = isCorrect ? challenge.bonusPoints : (isTimeout ? challenge.penaltyPoints : 0);
            const message = isCorrect
                ? `✔️ Señal recuperada. ¡Has ganado ${points} Fragmentos extra!`
                : (isTimeout
                    ? `❌ ¡Tiempo agotado! La Amenaza te ha costado ${Math.abs(points)} Fragmentos.`
                    : '❌ Respuesta incorrecta. La conexión se perdió.');

            setFeedback({ message, type: isCorrect ? 'success' : 'error' });
            setTimeout(() => onComplete({ points }), 3000);
        };
        
        const handleMultipleChoiceSubmit = () => {
            if (isLocked || !selectedOption) return;
            setIsLocked(true);
            const isCorrect = selectedOption === challenge.correctAnswer;
            const points = isCorrect ? challenge.bonusPoints : challenge.penaltyPoints;
            const message = isCorrect 
                ? `✔️ ¡Memoria intacta! Recuperas ${points} Fragmentos.` 
                : `❌ Respuesta incorrecta. No has recuperado fragmentos.`;
            
            setFeedback({ message, type: isCorrect ? 'success' : 'error' });
            setTimeout(() => onComplete({ points }), 3000);
        };

        const handleNarrativeContinue = () => {
             if (isLocked) return;
             setIsLocked(true);
             onComplete({ points: 0 });
        }

        switch (challenge.type) {
            case 'corrupt_transmission':
                return (
                    <div className="distortion-container">
                        <h3>{challenge.title}</h3>
                        <p>{challenge.message}</p>
                        <div className="distortion-timer">⏳ {timer}s</div>
                        <p className="distortion-challenge-text">{challenge.question}</p>
                        <input type="text" placeholder="Último dígito" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={isLocked} />
                        <button className="primary-button" onClick={() => handleSubmit(false)} disabled={isLocked}>RESPONDER</button>
                        {feedback.message && <p className={`feedback ${feedback.type}`}>{feedback.message}</p>}
                    </div>
                );
            case 'multiple_choice':
                return (
                    <div className="distortion-container">
                        <h3>{challenge.title}</h3>
                        <p>{challenge.message}</p>
                        <p className="distortion-challenge-text">{challenge.question}</p>
                        <ul className="trivia-options">
                            {challenge.options.map(option => (
                                <li 
                                    key={option} 
                                    className={selectedOption === option ? 'selected' : ''} 
                                    onClick={() => !isLocked && setSelectedOption(option)}
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                        <button className="primary-button" onClick={handleMultipleChoiceSubmit} disabled={isLocked || !selectedOption}>
                            VERIFICAR
                        </button>
                        {feedback.message && <p className={`feedback ${feedback.type}`}>{feedback.message}</p>}
                    </div>
                );
            case 'narrative_echo':
                 return (
                         <div className="distortion-container">
                                 <h3>{challenge.title}</h3>
                                 <p className="distortion-narrative-text">{challenge.message}</p>
                                 <button className="primary-button" onClick={handleNarrativeContinue} disabled={isLocked}>CONTINUAR MISIÓN...</button>
                       </div>
                 );
            default:
                onComplete({ points: 0 });
                return null;
        }
    };

    return (
        <div className="amenaza-modal-overlay">
            <div className="amenaza-modal-content">
                {view === 'visual' && event.visual.type === 'video' && (
                    <video ref={videoRef} className="amenaza-visual" src={event.visual.src} onEnded={handleVisualEnd} muted playsInline />
                )}
                {view === 'visual' && event.visual.type === 'image' && (
                    <img className="amenaza-visual" src={event.visual.src} alt="Interrupción de la Amenaza" />
                )}
                {view === 'challenge' && <ChallengeRenderer />}
            </div>
        </div>
    );
};

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
    // El código de tu componente App principal no necesita cambios.
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
