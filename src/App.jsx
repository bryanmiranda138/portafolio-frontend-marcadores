import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// ⚠️ Cambia esto por tu URL de Render cuando vayas a producción
const SOCKET_URL = 'https://api-marcadores-sv.onrender.com'; 
const socket = io(SOCKET_URL);

// --- NUEVO COMPONENTE: TARJETA INDIVIDUAL ---
// Separar esto permite que cada tarjeta maneje su propia animación de gol
function TarjetaPartido({ partido }) {
  const [hayGol, setHayGol] = useState(false);
  const golesAnteriores = useRef({
    local: partido.golesLocal,
    visitante: partido.golesVisitante
  });

  useEffect(() => {
    if (
      partido.golesLocal > golesAnteriores.current.local || 
      partido.golesVisitante > golesAnteriores.current.visitante
    ) {
      setHayGol(true);
      setTimeout(() => setHayGol(false), 3000);
    }

    golesAnteriores.current = {
      local: partido.golesLocal,
      visitante: partido.golesVisitante
    };
  }, [partido.golesLocal, partido.golesVisitante]);

  return (
    <div className={`tarjeta-partido ${hayGol ? 'animacion-gol' : ''}`}>
      <div className="tiempo-partido">
        <span className="minuto-pulsante">{partido.minuto}</span>
      </div>
      
      <div className="marcador-equipos">
        <span className="equipo">{partido.local}</span>
        <span className="goles">{partido.golesLocal} - {partido.golesVisitante}</span>
        <span className="equipo">{partido.visitante}</span>
      </div>

      {/* ⚽ SECCIÓN DE ANOTADORES */}
      {partido.anotadores && partido.anotadores.length > 0 && (
        <div className="lista-anotadores">
          <h4>⚽ Goles</h4>
          <ul>
            {partido.anotadores.map((gol, index) => (
              <li key={index}>
                <span className="jugador-gol">
                  {gol.jugador} ({gol.minuto}') 
                  {gol.tipo === 'Penalty' ? ' (P)' : ''} 
                  {gol.tipo === 'Own Goal' ? ' (A.G.)' : ''}
                </span>
                <span className="equipo-gol">- {gol.equipo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hayGol && <div className="etiqueta-gol">¡GOL!</div>}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (La aplicación) ---
function App() {
  const [partidos, setPartidos] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'oscuro') setModoOscuro(true);
  }, []);

  const toggleTema = () => {
    setModoOscuro(!modoOscuro);
    localStorage.setItem('tema', !modoOscuro ? 'oscuro' : 'claro');
  };

  useEffect(() => {
    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));
    socket.on('marcadores_actualizados', (datosNuevos) => {
      setPartidos(datosNuevos);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('marcadores_actualizados');
    };
  }, []);

  return (
    <div className={`app-wrapper ${modoOscuro ? 'tema-oscuro' : 'tema-claro'}`}>
      <div className="contenedor">
        <header className="cabecera">
          <div className="titulo-container">
            <h1>⚽ Marcadores en Vivo</h1>
            <button className="btn-tema" onClick={toggleTema}>
              {modoOscuro ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
          <div className="estado-conexion">
            Estado: {conectado 
              ? <span className="online">🟢 En línea</span> 
              : <span className="offline">🔴 Desconectado</span>}
          </div>
        </header>

        <main className="grid-partidos">
          {partidos.length === 0 ? (
            <p className="cargando">Buscando partidos en vivo...</p>
          ) : (
            // Llamamos a nuestro nuevo componente por cada partido en la lista
            partidos.map((partido) => (
              <TarjetaPartido key={partido.id} partido={partido} />
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default App;