import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// ⚠️ IMPORTANTE: 
// Mientras pruebas en tu computadora, usa localhost:4000
// Cuando lo subas a internet, cámbialo por tu URL de Render (ej. 'https://tu-backend.onrender.com')
const SOCKET_URL = 'https://api-marcadores-sv.onrender.com'; 
const socket = io(SOCKET_URL);

function App() {
  const [partidos, setPartidos] = useState([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // Detectar cuando nos conectamos exitosamente al backend
    socket.on('connect', () => {
      setConectado(true);
      console.log('Conectado al servidor de WebSockets');
    });

    // Detectar si perdemos la conexión
    socket.on('disconnect', () => {
      setConectado(false);
      console.log('Desconectado del servidor');
    });

    // Escuchar el evento que envía el backend con los resultados
    socket.on('marcadores_actualizados', (datosNuevos) => {
      setPartidos(datosNuevos);
    });

    // Limpieza al cerrar el componente
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('marcadores_actualizados');
    };
  }, []);

  return (
    <div className="contenedor">
      <header className="cabecera">
        <h1>⚽ Marcadores en Vivo</h1>
        <div className="estado-conexion">
          Estado: {conectado 
            ? <span className="online">🟢 En línea</span> 
            : <span className="offline">🔴 Desconectado</span>}
        </div>
      </header>

      <main className="grid-partidos">
        {partidos.length === 0 ? (
          <p className="cargando">Esperando datos de los partidos...</p>
        ) : (
          partidos.map((partido) => (
            <div key={partido.id} className="tarjeta-partido">
              <div className="tiempo-partido">
                <span className="minuto-pulsante">{partido.minuto}</span>
              </div>
              <div className="marcador-equipos">
                <span className="equipo">{partido.local}</span>
                <span className="goles">{partido.golesLocal} - {partido.golesVisitante}</span>
                <span className="equipo">{partido.visitante}</span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;