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
      {/* 1. Cabecera del contenedor: Minuto y Estado */}
      <div className="tarjeta-header">
        <span className="badge-minuto">
          <span className="punto-vivo"></span> {partido.minuto}
        </span>
      </div>

      {/* 2. Cuerpo del contenedor: Equipos alineados y marcador al centro */}
      <div className="tarjeta-cuerpo">
        <div className="equipo equipo-local">
          <span className="nombre-equipo">{partido.local}</span>
        </div>

        <div className="caja-marcador">
          <span className="goles-num">{partido.golesLocal}</span>
          <span className="separador">-</span>
          <span className="goles-num">{partido.golesVisitante}</span>
        </div>

        <div className="equipo equipo-visitante">
          <span className="nombre-equipo">{partido.visitante}</span>
        </div>
      </div>

      {/* 3. Pie del contenedor: Anotadores de Gol */}
      {partido.anotadores && partido.anotadores.length > 0 && (
        <div className="tarjeta-footer">
          <div className="titulo-anotadores">⚽ Goles</div>
          <ul className="lista-goles">
            {partido.anotadores.map((gol) => (
              <li key={`${gol.jugador}-${gol.minuto}`} className="item-gol">
                <span className="jugador-nombre">
                  {gol.jugador} <small>({gol.minuto}')</small>
                  {gol.tipo === 'Penalty' && <span className="tipo-gol"> (P)</span>}
                  {gol.tipo === 'Own Goal' && <span className="tipo-gol"> (A.G.)</span>}
                </span>
                <span className="equipo-nombre">{gol.equipo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Etiqueta flotante de GOL */}
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