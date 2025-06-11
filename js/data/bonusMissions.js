export const bonusMissionData = {
    id: 'bonus_portho_1',
    triggerMissionId: 26,
    sponsorName: 'Portho Gelatto',
    title: 'Misión Bonus: El Sabor del Tiempo',
    logoSrc: 'imagenes/portho.jpg',
    description: 'Guardián, hemos detectado una anomalía placentera en Portho Gelatto. Tienes la oportunidad de desviarte de tu ruta para conseguir una recompensa masiva de 200 fragmentos. ¡Pero cuidado! El cronómetro principal no se detendrá. La decisión es tuya.',
    mapsLink: 'https://maps.app.goo.gl/htvnw6Dbowx1PEw46',
    challenge: {
        question: 'Portho tiene un famoso sabor que refleja un dulce muy característico de San Juan. ¿Cuál es?',
        options: ['Uva', 'Pistacho', 'Membrillo', 'Dulce de Leche'],
        correctAnswer: 'Membrillo',
        points: 200
    }
};

export const bonusLaProfeciaData = {
    id: 'bonus_la_profecia_1',
    triggerMissionId: 6,
    sponsorName: 'Familia Monserrat - La Profecía',
    title: 'Misión Bonus: El Sabor del Terruño',
    logoSrc: 'imagenes/la profecia.jpg',
    description: "Guardián, hemos detectado una poderosa concentración de memoria ancestral en 'La Profecía' de Familia Monserrat. Sus sabores son un ancla al pasado sanjuanino. Desvíate de tu ruta para probar un dulce tradicional y reclama una recompensa de 200 fragmentos. El tiempo sigue corriendo. ¿Aceptas el desafío?",
    mapsLink: 'https://maps.app.goo.gl/cbffANJXPhTGh3nDA',
    challenge: {
        question: 'El maestro dulcero de La Profecía te ha dado a probar una de sus creaciones más emblemáticas, un sabor que define la tradición sanjuanina. ¿Qué dulce has probado?',
        options: ['Dulce de Uva', 'Dulce de Tomate', 'Dulce de Membrillo', 'Mermelada de Naranja'],
        correctAnswer: 'Dulce de Membrillo',
        points: 200
    }
};

export const bonusLaVeneData = {
    id: 'bonus_la_vene_1',
    triggerMissionId: 20,
    sponsorName: 'La Vene',
    title: 'Misión Bonus: El Sabor de la Tradición',
    logoSrc: 'imagenes/lavene.png',
    description: "Guardián, detectamos una anomalía temporal exquisita proveniente de 'La Vene'. Desde 1959, han perfeccionado sus recetas. Desvíate de tu ruta para descifrar el secreto de uno de sus platos más codiciados y reclama una recompensa de 200 fragmentos. ¡El tiempo corre!",
    mapsLink: 'https://maps.app.goo.gl/mCBt6hLp1yaikzyv8',
    challenge: {
        question: 'Has interceptado una receta secreta de los famosos sorrentinos premium de La Vene. ¿Qué combinación de ingredientes le da su sabor inconfundible?',
        options: ['Salmón y queso azul', 'Carne braseada y provolone', 'Camarones y muzzarella', 'Espinaca y ricota de oveja'],
        correctAnswer: 'CAMARONES Y MUZZARELLA',
        points: 200
    }
};

export const allBonusData = [bonusMissionData, bonusLaProfeciaData, bonusLaVeneData];