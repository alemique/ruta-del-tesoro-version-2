export const distortionEventsData = [
    {
        id: 'distorsion_1',
        trigger: { onMissionComplete: 3 },
        visual: { type: 'video', src: 'imagenes/AMENAZA2.mp4' },
        challenge: {
            type: 'corrupt_transmission',
            title: "¡Transmisión Corrupta!",
            message: "La Amenaza del Olvido intercepta tu señal. Responde rápido o la conexión se perderá...",
            question: "Mis espías dicen que el Libertador se alojó en la celda del convento en 181... ¿Cuál es el último dígito? ¡Rápido!",
            correctAnswer: "5",
            timeLimit: 15,
            bonusPoints: 30,
            penaltyPoints: -10
        }
    },
    {
        id: 'distorsion_2',
        trigger: { onMissionComplete: 8 },
        visual: { type: 'video', src: 'imagenes/AMENAZA.mp4' },
        challenge: {
            type: 'multiple_choice',
            title: "Estática Temporal",
            message: "No creas que un simple viaje te mantendrá a salvo. Siento tu presencia moviéndose por mis dominios. Cada paso que das... lo escucho. Pero seguro olvidaste esto:",
            question: "¿Con qué motivo se dispuso la creación del Parque de Mayo mediante la ley provincial sancionada el 17 de mayo de 1910?",
            options: [
                "Honrar al presidente Domingo F. Sarmiento",
                "Conmemorar el Centenario de la Revolución de Mayo",
                "Celebrar la fundación de la ciudad de San Juan",
                "Establecer la sede de la Feria Nacional del Vino"
            ],
            correctAnswer: "Conmemorar el Centenario de la Revolución de Mayo",
            bonusPoints: 30,
            penaltyPoints: 0
        }
    },
    {
        id: 'distorsion_3',
        trigger: { onMissionComplete: 24 },
        visual: { type: 'video', src: 'imagenes/amenaza1.mp4' },
        challenge: {
            type: 'narrative_echo',
            title: "Eco del Olvido...",
            message: "Te acercas a un lugar de poder. Un lugar que me pertenece. Ten cuidado, Guardián, o te convertirás en otro recuerdo olvidado."
        }
    }
];