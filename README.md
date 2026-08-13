# ⚽ LiveScoresBC - Frontend

![LiveScoresBC Preview](https://img.shields.io/badge/Status-BETA-success) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)

Una aplicación web de página única (SPA) diseñada para visualizar marcadores de fútbol en tiempo real y el calendario de próximos partidos de una selección de equipos y selecciones internacionales. Inspirada en la UI/UX de plataformas líderes como *Sofascore* y *Flashscore*.

Este repositorio contiene exclusivamente el **Frontend** del proyecto.

## ✨ Características Principales

- **🔴 Sincronización en Tiempo Real:** Conexión persistente mediante WebSockets (`socket.io-client`) para recibir actualizaciones de goles y estado del partido al instante, sin necesidad de recargar la página.
- **📅 Arquitectura de Datos Híbrida (Multi-API):** Consume datos consolidados por el backend provenientes de **API-Football** (eventos en vivo) y **TheSportsDB** (calendario), superando las limitaciones de los planes gratuitos (Rate Limits y Paywalls).
- **🎨 Diseño UI/UX Avanzado:**
  - Layout dinámico con **CSS Grid** de 2 columnas (En Vivo vs Próximos) en escritorio, adaptable a 1 columna en dispositivos móviles.
  - Efecto "espejo" en las tarjetas de partido (`Local -> Escudo | Marcador | Escudo <- Visitante`).
  - Animaciones de pulsación para partidos activos e indicadores de conexión en línea/offline.
- **🛡️ Programación Defensiva (Graceful Fallback):**
  - Si un equipo no tiene partido programado, la interfaz no se rompe ni queda en blanco; genera automáticamente una elegante tarjeta de *"Rival por definir"*.
  - Manejo de imágenes caídas: Si el escudo de un equipo falla al cargar, React inyecta un logo de balón por defecto usando el evento `onError`.
- **🌗 Modo Oscuro/Claro:** Implementado con Variables Nativas de CSS y persistencia de datos mediante `localStorage`.

## 🛠️ Tecnologías Utilizadas

- **Core:** [React](https://reactjs.org/) (Vite)
- **Estilos:** CSS3 Puro (con Variables CSS y Flexbox/Grid)
- **Comunicación en Tiempo Real:** [Socket.io-client](https://socket.io/)
- **Despliegue recomendado:** Vercel o Netlify

## 🚀 Instalación y Uso Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/bryanmiranda138/portafolio-frontend-marcadores.git](https://github.com/bryanmiranda138/portafolio-frontend-marcadores.git)
   cd portafolio-frontend-marcadores

## 🤝 Agradecimientos y Créditos
- **Datos en vivo proporcionados por API-Football.**

- **Calendario e imágenes de escudos proporcionados por TheSportsDB.**

Desarrollado para portafolio profesional.
