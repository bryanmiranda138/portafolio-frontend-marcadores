import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// URL de producción en Render
const SOCKET_URL = 'https://api-marcadores-sv.onrender.com'; 
const socket = io(SOCKET_URL);

// --- COMPONENTE: TARJETA DE PARTIDO INDIVIDUAL ---
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

  // Evaluamos si el partido está en juego activo
  const estaEnJuego = partido.estado !== 'HT' && partido.estado !== 'FT' && partido.estado !== 'AET' && partido.estado !== 'PEN';

  return (
    <div className={`tarjeta-partido ${hayGol ? 'animacion-gol' : ''}`}>
      {/* Cabecera del contenedor */}
      <div className="tarjeta-header">
        <span className={`badge-minuto ${!estaEnJuego ? 'badge-pausado' : ''}`}>
          {estaEnJuego && <span className="punto-vivo"></span>} {partido.minuto}
        </span>
      </div>

      {/* Cuerpo central: Equipos y Marcador */}
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

      {/* Pie: Anotadores de Gol */}
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

// --- COMPONENTE PRINCIPAL ---
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
      
      {/* 🧭 NAVBAR SUPERIOR */}
      <nav className="navbar">
        <div className="navbar-contenido">
          <div className="brand">
            <span className="logo-icon">⚽</span>
            <span className="brand-title">
              LiveScores <small className="badge-pro">PRO</small>
            </span>
          </div>

          <div className="navbar-acciones">
            <div className="estado-conexion">
              {conectado ? (
                <span className="online"><span className="dot"></span> En línea</span>
              ) : (
                <span className="offline"><span className="dot"></span> Desconectado</span>
              )}
            </div>

            <button className="btn-tema" onClick={toggleTema} title="Cambiar Tema">
              {modoOscuro ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </div>
      </nav>

      {/* 🏟️ CONTENIDO PRINCIPAL */}
      <main className="contenedor-principal">
        <div className="seccion-encabezado">
          <h2>Marcadores en Vivo</h2>
          <p className="subtitulo">Sincronización en tiempo real vía WebSockets</p>
        </div>

        <div className="grid-partidos">
          {partidos.length === 0 ? (
            <div className="caja-vacia">
              <div className="spinner"></div>
              <p className="cargando">Buscando partidos en vivo en este momento...</p>
            </div>
          ) : (
            partidos.map((partido) => (
              <TarjetaPartido key={partido.id} partido={partido} />
            ))
          )}
        </div>
      </main>

      {/* 👣 FOOTER */}
      <footer className="footer">
        <div className="footer-contenido">
          <p className="footer-creditos">
            Estadísticas y datos deportivos proporcionados en tiempo real por{' '}
            <a href="https://www.api-football.com/" target="_blank" rel="noopener noreferrer">
              API-Football
            </a>
          </p>
          <p className="footer-subtext">
            Proyecto desarrollado con <strong>React</strong>, <strong>Node.js</strong> y <strong>Socket.io</strong> para portafolio.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;