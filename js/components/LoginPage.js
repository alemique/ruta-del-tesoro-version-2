// js/components/LoginPage.js

const LoginPage = ({ onLogin, setErrorMessage, errorMessage }) => {
    const [squadCode, setSquadCode] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const logoUrl = "imagenes/LOGO 3 (1).png";

    const handleLoginInternal = async () => {
        const enteredCode = squadCode.trim().toUpperCase();
        if (!enteredCode || isLoading) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const validationUrl = `${GOOGLE_SCRIPT_URL}?action=validateUser&squadCode=${enteredCode}`;
            
            const response = await fetch(validationUrl, { method: 'POST' });
            if (!response.ok) {
                 throw new Error('Error en la respuesta del servidor.');
            }
            const data = await response.json();

            if (data.valid) {
                onLogin(enteredCode, enteredCode);
            } else {
                setErrorMessage('⚠️ Código de Guardián no válido. Verifica tus credenciales.');
            }
        } catch (error) {
            console.error("Error de conexión al validar:", error);
            setErrorMessage('❌ Error de conexión. No se pudo verificar el código.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <img src={logoUrl} alt="Logo Guardianes del Tiempo" className="logo" onError={(e) => { e.target.onerror = null; e.target.src="https://i.imgur.com/ZKiX1mO.png"; }} />
            <h1>RUTA DEL TESORO:<br/>GUARDIANES DEL TIEMPO</h1>
            <p className="lema">"¡El legado de San Juan te necesita! ¿Aceptas la misión?"</p>
            <label htmlFor="squadCode">Código de Guardián:</label>
            <input 
                id="squadCode" 
                type="text" 
                placeholder="Ingresa tu código de Guardián" 
                value={squadCode} 
                onChange={(e) => setSquadCode(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleLoginInternal()} 
                disabled={isLoading}
            />
            <button 
                className="primary-button" 
                onClick={handleLoginInternal} 
                disabled={isLoading}
            >
                {isLoading ? 'VERIFICANDO...' : 'ACTIVAR GUÍA DEL TIEMPO'}
            </button>
            <div className="sponsors-section">
                <h2 className="sponsors-title">ASISTENTES DEL TIEMPO</h2>
                <p className="sponsors-description">Recuerda visitar nuestros Asistentes del Tiempo, tendrán sorpresas y puntos bonus para vos.</p>
                <div className="sponsors-grid">
                    <div className="sponsor-item"><img src="imagenes/muni cap.png" alt="Logo Municipalidad de la Capital" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/muni riv.png" alt="Logo Municipalidad de Rivadavia" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/muni santa lucia.jpg" alt="Logo Municipalidad de Santa Lucía" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/portho.jpg" alt="Logo Portho Gelatto" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/paseolib.png" alt="Logo Paseo Libre" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/mandina.png" alt="Logo Mandina" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/lavene.png" alt="Logo La Vene" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/la profecia.jpg" alt="Logo La Profecía" className="sponsor-logo" /></div>
                    <div className="sponsor-item"><img src="imagenes/cocacola.png" alt="Logo Coca-Cola" className="sponsor-logo" /></div>
                </div>
            </div>
            <div className="organizers-section">
                <h2 className="organizers-title">ORGANIZADORES</h2>
                <p className="organizers-description">Estamos en cada punto de interés para acompañarte en este gran desafío.</p>
                <div className="organizer-logo-container">
                    <img src="imagenes/logoasv.jpg" alt="Logo ASV - Organizador" className="organizer-logo" />
                </div>
            </div>
            {errorMessage && <p className="feedback error" style={{ marginTop: '15px' }}>{errorMessage}</p>}
        </div>
    );
};
