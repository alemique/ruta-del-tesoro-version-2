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


// --- COMPONENTES DE REACT (RESTANTES, AÚN DENTRO DE APP.JS) ---
// NOTA: Estos son los componentes que moveremos en los siguientes pasos.

const DistortionEventPage = ({ event, onComplete }) => {
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

const EnRutaPage = ({ nextLocation, onArrival, department, onFinishEarly }) => {
    const [isTraveling, setIsTraveling] = React.useState(true);
    React.useEffect(() => {
        const travelTimer = setTimeout(() => {
            setIsTraveling(false);
        }, 10000); 
        return () => clearTimeout(travelTimer);
    }, []);
    return (
        <div className="en-ruta-container">
            <img src="imagenes/VIAJANDO.png" alt="Portal Temporal Estilizado" className="portal-image" onError={(e) => { e.target.onerror = null; e.target.src='https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=800&auto=format&fit=crop'; }} />
            <h3>VIAJANDO A TRAVÉS DEL TIEMPO...</h3>
            <p>Próxima Sincronización: <strong>{nextLocation}</strong> ({department})</p>
            <p className="progress-info">Sincronizando coordenadas temporales...</p>
            <div className="progress-bar-container"><div className="progress-bar-filler"></div></div>
            <p>¡Mantén el rumbo, Guardián! Evita las 'distorsiones temporales' (¡y las multas de tránsito!).</p>
            <button className="primary-button" onClick={onArrival} disabled={isTraveling}>{isTraveling ? 'SINCRONIZANDO...' : 'LLEGADA CONFIRMADA'}</button>
            <button className="finish-early-button" onClick={onFinishEarly}>Terminar Aquí</button>
        </div>
    );
};

const LongTravelPage = ({ onArrival, nextDepartment, onFinishEarly }) => {
    const [isTraveling, setIsTraveling] = React.useState(true);
    
    React.useEffect(() => {
        const travelTimer = setTimeout(() => {
            setIsTraveling(false);
        }, 10000);

        return () => {
            clearTimeout(travelTimer);
        }
    }, []);
    
    const imageUrl = nextDepartment === 'Capital' ? 'imagenes/VIAJANDO1.png' : nextDepartment === 'Rivadavia' ? 'imagenes/VIAJANDO2.png' : 'imagenes/VIAJANDO.png';
    return (
        <div className="en-ruta-container">
            <img src={imageUrl} alt={`Viajando a ${nextDepartment}`} className="portal-image" />
            <h3>HORA DE VIAJAR MÁS LEJOS</h3>
            <p>Rápido, debemos movernos a <strong>{nextDepartment}</strong>, han aparecido nuevos fragmentos de la historia que debemos recoger.</p>
            <p className="progress-info">Abriendo portal de largo alcance...</p>
            <div className="progress-bar-container"><div className="progress-bar-filler"></div></div>
            <p style={{fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.8}}>Es importante que respetes las señales de tránsito, hay controles secretos que pueden restarte puntos.</p>
            <button className="primary-button" onClick={onArrival} disabled={isTraveling}>{isTraveling ? 'VIAJANDO...' : 'HEMOS LLEGADO'}</button>
            <button className="finish-early-button" onClick={onFinishEarly}>Terminar Aquí</button>
        </div>
    );
};

const EndGamePage = ({ score, finalTime, teamName }) => (
    <div className="end-container">
        <img src="https://cdn-icons-png.flaticon.com/512/784/784408.png" alt="Medalla o Trofeo Guardián" className="medal-image"/>
        <h3>¡MISIÓN TEMPORAL COMPLETADA, {teamName}!</h3>
        <p>Has estabilizado la línea del tiempo de San Juan. ¡La 'Amenaza del Olvido' ha sido contenida gracias a tu escuadrón!</p>
        <p><strong>Fragmentos de Historia Restaurados: {score}</strong></p>
        <p><strong>Tiempo Total de la Misión: {finalTime}</strong></p>
        <p>¡Has ganado tu Medalla "Guardián del Tiempo"! 🏅 Los "Custodios Mayores" y otros reconocimientos serán anunciados en el Concilio de Guardianes.</p>
        <p style={{fontSize: "0.9rem", marginTop: "20px"}}><em>No olvides compartir tu hazaña y prepararte para la celebración.</em></p>
        
        <Leaderboard />
    </div>
);

const AbortedGamePage = ({ score, finalTime, teamName }) => (
    <div className="end-container">
        <img src="https://cdn-icons-png.flaticon.com/512/784/784408.png" alt="Medalla o Trofeo Guardián" className="medal-image"/>
        <h3>MISION TEMPORAL DETENIDA</h3>
        <p><strong>{teamName}</strong></p>
        <p>Has estabilizado sólo una parte del tiempo de San Juan. ¡La ´Amenaza del Olvido´ ha logrado avanzar en la línea del tiempo.</p>
        
        <p><strong>Fragmentos de Historia Restaurados: {score}</strong></p>
        <p><strong>Tiempo Total de la Misión: {finalTime}</strong></p>
        
        <p>¡Has hecho un gran esfuerzo, tu Medalla de "Guardián del Tiempo"! 🏅 Los "Custodios Mayores" y otros reconocimientos serán anunciados en el Concilio de Guardianes.</p>
        <p style={{fontSize: "0.9rem", marginTop: "20px"}}><em>No olvides compartir tu hazaña y prepararte para la celebración.</em></p>
        
        <Leaderboard />
    </div>
);

const TriviaSection = ({ stage, onComplete }) => {
    const { challenge, missionName } = stage.trivia;
    const [selectedOption, setSelectedOption] = React.useState('');
    const [feedback, setFeedback] = React.useState({ message: '', type: ''});
    const [triviaTimer, setTriviaTimer] = React.useState(0);
    const [glowClass, setGlowClass] = React.useState('');
    React.useEffect(() => {
        const interval = setInterval(() => setTriviaTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);
    const calculatePoints = (timeInSeconds) => {
        if (timeInSeconds <= 30) return 50;
        if (timeInSeconds <= 60) return 35;
        if (timeInSeconds <= 90) return 20;
        return 10;
    };
    const handleSubmit = () => {
        const finalTime = triviaTimer;
        const isCorrect = selectedOption.toUpperCase() === challenge.correctAnswer.toUpperCase();
        const pointsWon = isCorrect ? calculatePoints(finalTime) : 0;
        
        setGlowClass(isCorrect ? 'success-glow' : 'error-glow');
        setFeedback({
            message: isCorrect ? `✔️ ¡Respuesta Correcta! Has recuperado ${pointsWon} Fragmentos.` : `❌ Respuesta Incorrecta. No se han recuperado Fragmentos.`,
            type: isCorrect ? 'success' : 'error'
        });

        setTimeout(() => {
            onComplete({ points: pointsWon, time: finalTime });
        }, 2500);

        if (isCorrect) {
            triggerVibration();
            animatePoints(pointsWon, 'trivia-button');
        }
    };
    return (
        <div className={`challenge-container ${glowClass}`}>
            <h3>{missionName}</h3>
            <div className="challenge-timer">⏱️ {triviaTimer}s</div>
            <p>{challenge.question}</p>
            <ul className="trivia-options">
                {challenge.options.map(option => (
                    <li key={option} className={selectedOption === option ? 'selected' : ''} onClick={() => !feedback.message && setSelectedOption(option)}>
                        {option}
                    </li>
                ))}
            </ul>
            <button id="trivia-button" className="primary-button" onClick={handleSubmit} disabled={!selectedOption || feedback.message}>VERIFICAR TRANSMISIÓN</button>
            {feedback.message && <p className={`feedback ${feedback.type}`}>{feedback.message}</p>}
        </div>
    );
};

const AnchorSection = ({ stage, onComplete, onHintRequest, score }) => {
    const { anchor } = stage;
    const [keyword, setKeyword] = React.useState('');
    const [error, setError] = React.useState('');
    const [anchorTimer, setAnchorTimer] = React.useState(0);
    const [isLocked, setIsLocked] = React.useState(false);
    const [feedback, setFeedback] = React.useState({ message: '', type: '' });
    const [glowClass, setGlowClass] = React.useState('');
    const [pistaGenerada, setPistaGenerada] = React.useState(null);
    const [incorrectAttempts, setIncorrectAttempts] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (!isLocked) setAnchorTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLocked]);
    
    const handleHintRequest = () => {
        if (score >= 25 && !pistaGenerada) {
            onHintRequest();
            const pista = generarPistaDinamica(anchor.enablerKeyword);
            setPistaGenerada(pista);
        }
    };

    const calculateAnchorPoints = (timeInSeconds) => {
        if (timeInSeconds <= 60) return 100;
        if (timeInSeconds <= 120) return 80;
        if (timeInSeconds <= 180) return 60;
        if (timeInSeconds <= 240) return 40;
        if (timeInSeconds <= 300) return 20;
        return 0;
    };

    const handleUnlockInternal = () => {
        if (isLocked) return;

        if (keyword.toUpperCase().trim() === anchor.enablerKeyword.toUpperCase().trim()) {
            const points = calculateAnchorPoints(anchorTimer);
            
            setIsLocked(true);
            setError('');
            setGlowClass('success-glow');
            setFeedback({ message: `✔️ ¡Ancla estabilizada! Has recuperado ${points} Fragmentos.`, type: 'success' });
            
            setTimeout(() => onComplete({ points: points, time: anchorTimer }), 2500);

            triggerVibration();
            animatePoints(points, 'anchor-button');

        } else {
            const newAttemptCount = incorrectAttempts + 1;
            setIncorrectAttempts(newAttemptCount);
            setGlowClass('error-glow');
            setTimeout(() => setGlowClass(''), 1500);

            if (newAttemptCount >= 3) {
                setError('');
                setIsLocked(true);
                setFeedback({ message: `❌ ¡Se agotaron los intentos! La distorsión se consolida. Avanzando...`, type: 'error' });
                setTimeout(() => onComplete({ points: 0, time: anchorTimer }), 2500);
            } else {
                const attemptsLeft = 3 - newAttemptCount;
                setError(`🚫 Ancla Temporal incorrecta. Quedan ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'}.`);
            }
        }
    };

    const handleSkip = () => {
        if (isLocked) return;
        setIsLocked(true);
        setError('');
        setGlowClass('error-glow');
        setFeedback({ message: `Misión de anclaje omitida. No se han recuperado Fragmentos.`, type: 'error' });
        setTimeout(() => onComplete({ points: 0, time: anchorTimer }), 2500);
    };

    const handleInputChange = (e) => {
        if (error) setError('');
        if (glowClass) setGlowClass('');
        setKeyword(e.target.value);
    };

    return (
    <div className={`stage-container ${glowClass}`}>
        <h3>{anchor.missionName}</h3>
        <div className="challenge-timer">⏱️ {anchorTimer}s</div>
        <p><strong>Departamento:</strong> {stage.department}</p>
        {anchor.transmission && <div className="transmission-box"><p><strong>📡 Transmisión Interceptada:</strong> {anchor.transmission}</p></div>}
        <p><strong>Objetivo de la Coordenada:</strong> {anchor.enabler}</p>

        {error && <p className="feedback error">{error}</p>}
        
        {!pistaGenerada && (
            <div className="hint-request-container">
                <button
                    className="primary-button"
                    onClick={handleHintRequest}
                    disabled={score < 25 || isLocked}>
                    SOLICITAR PISTA (-25 Fragmentos)
                </button>
            </div>
        )}
        
        {pistaGenerada && (
            <div className="hint-box hint-dynamic">
                <p><strong>💡 Pista Recuperada:</strong> {pistaGenerada}</p>
            </div>
        )}

        <input type="text" placeholder="Ingresa el 'Ancla Temporal'" value={keyword} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && handleUnlockInternal()} disabled={isLocked} />
        
        <div className="button-group-vertical"> 
            <button id="anchor-button" className="primary-button" onClick={handleUnlockInternal} disabled={isLocked}>🗝️ ANCLAR RECUERDO</button>
            
            <button className="skip-button" onClick={handleSkip} disabled={isLocked}>No sé</button>
        </div>
        
        {feedback.message && <p className={`feedback ${feedback.type}`}>{feedback.message}</p>}
    </div>
);
};


const FinalSection = ({stage, onComplete}) => {
    const [keyword, setKeyword] = React.useState('');
    const [error, setError] = React.useState('');
    const [glowClass, setGlowClass] = React.useState('');
    
    const handleUnlockInternal = () => {
        if (keyword.toUpperCase().trim() === stage.enablerKeyword.toUpperCase().trim()) {
            setGlowClass('success-glow');
            onComplete(200);
        } else {
            setError('🚫 Código final incorrecto.');
            setGlowClass('error-glow');
            setTimeout(() => setGlowClass(''), 1500);
        }
    };

    const handleInputChange = (e) => {
        if (error) setError('');
        if (glowClass) setGlowClass('');
        setKeyword(e.target.value);
    };
    
    return (
        <div className={`stage-container ${glowClass}`}>
            <h3>{stage.missionName}</h3>
            {stage.transmission && <div className="transmission-box"><p><strong>📡 Transmisión Prioritaria:</strong> {stage.transmission}</p></div>}
            <p><strong>Misión de Sellado:</strong> {stage.enabler}</p>
            <input type="text" placeholder="Ingresa el Ancla Temporal Final" value={keyword} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && handleUnlockInternal()}/>
            <div className="button-group">
                <button className="primary-button" onClick={handleUnlockInternal}>✨ SELLAR BRECHA TEMPORAL ✨</button>
            </div>
            {error && <p className="feedback error">{error}</p>}
        </div>
    );
};

const Leaderboard = () => {
    const [ranking, setRanking] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
     const fetchRanking = async () => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('URL_QUE_COPIASTE')) {
          setError('URL del ranking no configurada.');
          setIsLoading(false);
          return;
        }
        
        try {
          const response = await fetch(GOOGLE_SCRIPT_URL);
          if (!response.ok) {
            throw new Error('La respuesta del servidor no fue correcta.');
          }
          const data = await response.json();
          if (data.error) {
           throw new Error(data.error);
          }
          setRanking(data);
        } catch (err) {
          setError('No se pudo cargar el ranking. Intenta más tarde.');
          console.error("Error al obtener el ranking:", err);
        } finally {
          setIsLoading(false);
        }
     };

     fetchRanking();
    }, []);

    if (isLoading) {
     return <p className="feedback">Cargando el Ranking de Guardianes...</p>;
    }

    if (error) {
     return <p className="feedback error">{error}</p>;
    }

    return (
     <div className="leaderboard-container">
        <h3>CONCILIO DE GUARDIANES</h3>
        <table className="leaderboard-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Guardián</th>
                    <th>Fragmentos</th>
                    <th>Tiempo</th>
                </tr>
            </thead>
            <tbody>
                {ranking.slice(0, 10).map((team, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{team.teamName}</td>
                        <td>{team.score}</td>
                        <td>{team.time}</td>
                    </tr>
                ))}
            </tbody>
        </table>
     </div>
    );
};

const BonusMissionModal = ({ bonusData, onComplete }) => {
    const [view, setView] = React.useState('offer');
    const [feedback, setFeedback] = React.useState({ message: '', type: '' });
    const [glowClass, setGlowClass] = React.useState('');
    const [selectedOption, setSelectedOption] = React.useState('');

    const handleAccept = () => {
        setView('challenge');
    };

    const handleDecline = () => {
        onComplete({ points: 0, participated: false });
    };

    const handleSubmitChallenge = () => {
        if (feedback.message) return;

        const isCorrect = selectedOption === bonusData.challenge.correctAnswer;
        const pointsWon = isCorrect ? bonusData.challenge.points : 0;
        setGlowClass(isCorrect ? 'success-glow' : 'error-glow');
        setFeedback({
            message: isCorrect 
                ? `✔️ ¡Correcto! ¡Has ganado ${pointsWon} Fragmentos!` 
                : `❌ Respuesta Incorrecta. No has recuperado fragmentos.`,
            type: isCorrect ? 'success' : 'error'
        });
        setTimeout(() => {
            onComplete({ points: pointsWon, participated: true });
        }, 3000);
    };

    return (
        <div className="amenaza-modal-overlay">
            <div className={`amenaza-modal-content ${glowClass}`}>
                {view === 'offer' && (
                    <div className="stage-container">
                        <img src={bonusData.logoSrc} alt={`Logo ${bonusData.sponsorName}`} className="portal-image" style={{ width: '150px', borderRadius: '50%' }}/>
                        <h3>{bonusData.title}</h3>
                        <div className="transmission-box">
                            <p><strong>ALERTA DE OPORTUNIDAD TEMPORAL</strong></p>
                        </div>
                        <p>{bonusData.description}</p>
                        <a href={bonusData.mapsLink} target="_blank" rel="noopener noreferrer" className="primary-button" style={{display: 'block', textDecoration: 'none', marginBottom: '10px'}}>
                            📍 ABRIR EN GOOGLE MAPS
                        </a>
                        <div className="button-group">
                            <button className="secondary-button" onClick={handleDecline}>Rechazar Desvío</button>
                            <button className="primary-button" onClick={handleAccept}>¡ACEPTO EL DESAFÍO!</button>
                        </div>
                    </div>
                )}
                {view === 'challenge' && (
                    <div className="challenge-container">
                        <h3>{bonusData.sponsorName} - Desafío</h3>
                        <p>{bonusData.challenge.question}</p>
                        <ul className="trivia-options">
                            {bonusData.challenge.options.map(option => (
                                <li key={option} className={selectedOption === option ? 'selected' : ''} onClick={() => !feedback.message && setSelectedOption(option)}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                        <button className="primary-button" onClick={handleSubmitChallenge} disabled={!selectedOption || feedback.message}>
                            CONFIRMAR RESPUESTA
                        </button>
                        {feedback.message && <p className={`feedback ${feedback.type}`}>{feedback.message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};


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
