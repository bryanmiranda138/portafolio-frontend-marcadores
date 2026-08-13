import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// URL de producción en Render
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://api-marcadores-sv.onrender.com'; 
const socket = io(SOCKET_URL);

// Balón de fútbol limpio en formato SVG para los equipos sin escudo
const ESCUDO_DEFAULT = "https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg";

// --- COMPONENTE: TARJETA DE PARTIDO INDIVIDUAL ---
function TarjetaPartido({ partido }) {
  const [hayGol, setHayGol] = useState(false);
  
  const golesAnteriores = useRef({
    local: partido?.golesLocal ?? 0,
    visitante: partido?.golesVisitante ?? 0
  });

  useEffect(() => {
    if (partido?.esEnVivo) {
      if (
        (partido?.golesLocal ?? 0) > golesAnteriores.current.local || 
        (partido?.golesVisitante ?? 0) > golesAnteriores.current.visitante
      ) {
        setHayGol(true);
        const timer = setTimeout(() => setHayGol(false), 3000);
        return () => clearTimeout(timer);
      }
      golesAnteriores.current = { local: partido?.golesLocal ?? 0, visitante: partido?.golesVisitante ?? 0 };
    }
  }, [partido?.golesLocal, partido?.golesVisitante, partido?.esEnVivo]);

  if (!partido) return null; 
  const esProximo = partido?.estado === 'PROXIMO';
  const estaEnJuego = partido?.esEnVivo && !['HT', 'FT', 'AET', 'PEN'].includes(partido?.estado || ''); 

  return (
    <div className={`tarjeta-partido ${hayGol ? 'animacion-gol' : ''}`}>
      <div className="tarjeta-header">
        {esProximo ? (
          <span className="badge-minuto badge-proximo">
            📅 Próximo: {partido?.minuto || 'Por definir'}
          </span>
        ) : (
          <span className={`badge-minuto ${!estaEnJuego ? 'badge-pausado' : ''}`}>
            {estaEnJuego && <span className="punto-vivo"></span>} {partido?.minuto || '-'}
          </span>
        )}
      </div>

      {/* 🛡️ EFECTO ESPEJO TIPO SOFASCORE */}
      <div className="tarjeta-cuerpo">
        
        {/* Lado Izquierdo: Nombre Local -> Escudo */}
        <div className="equipo equipo-local">
          <span className="nombre-equipo">{partido?.local || 'Local'}</span>
          <img 
            src={partido?.logoLocal || ESCUDO_DEFAULT} 
            alt={`Escudo ${partido?.local}`} 
            className="escudo-equipo" 
            onError={(e) => { e.target.onerror = null; e.target.src = ESCUDO_DEFAULT; }} 
          />
        </div>

        {/* Centro: Marcador */}
        <div className="caja-marcador">
          {esProximo ? (
            <span className="texto-vs">VS</span>
          ) : (
            <>
              <span className="goles-num">{partido?.golesLocal ?? 0}</span>
              <span className="separador">-</span>
              <span className="goles-num">{partido?.golesVisitante ?? 0}</span>
            </>
          )}
        </div>

        {/* Lado Derecho: Escudo -> Nombre Visitante */}
        <div className="equipo equipo-visitante">
          <img 
            src={partido?.logoVisitante || ESCUDO_DEFAULT} 
            alt={`Escudo ${partido?.visitante}`} 
            className="escudo-equipo" 
            onError={(e) => { e.target.onerror = null; e.target.src = ESCUDO_DEFAULT; }} 
          />
          <span className="nombre-equipo">{partido?.visitante || 'Visitante'}</span>
        </div>
      </div>

      {Array.isArray(partido?.anotadores) && partido.anotadores.length > 0 && (
        <div className="tarjeta-footer">
          <div className="titulo-anotadores">⚽ Goles</div>
          <ul className="lista-goles">
            {partido.anotadores.map((gol, index) => (
              <li key={`${gol?.jugador}-${gol?.minuto}-${index}`} className="item-gol">
                <span className="jugador-nombre">
                  {gol?.jugador} <small>({gol?.minuto}')</small>
                </span>
                <span className="equipo-nombre">{gol?.equipo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
    if (socket.connected) {
      setConectado(true);
    }

    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));
    
    socket.on('marcadores_actualizados', (datosNuevos) => {
      if (Array.isArray(datosNuevos)) {
        setPartidos(datosNuevos);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('marcadores_actualizados');
    };
  }, []);

  // 🔍 SEPARACIÓN DE PARTIDOS EN DOS ARREGLOS DISTINTOS
  const partidosEnVivo = partidos.filter((p) => p?.esEnVivo);
  const partidosProximos = partidos.filter((p) => !p?.esEnVivo);

  return (
    <div className={`app-wrapper ${modoOscuro ? 'tema-oscuro' : 'tema-claro'}`}>
      
      {/* 🧭 NAVBAR SUPERIOR */}
      <nav className="navbar">
        <div className="navbar-contenido">
          <div className="brand">
            <span className="logo-icon">⚽</span>
            <span className="brand-title">
              LiveScoresBC <small className="badge-pro">BETA</small>
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

      {/* 🏟️ CONTENIDO PRINCIPAL EN 2 COLUMNAS */}
      <main className="contenedor-principal">
        <div className="seccion-encabezado">
          <h2>Panel de Marcadores</h2>
          <p className="subtitulo">Sincronización en tiempo real</p>
        </div>

        {/* 📐 CONTENEDOR GRID EN LA MISMA FILA */}
        <div className="layout-dos-columnas">

          {/* 🔴 CONTENEDOR 1: PARTIDOS EN VIVO */}
          <section className="columna-seccion columna-envivo">
            <div className="encabezado-columna">
              <span className="titulo-seccion">
                <span className="punto-rojo-vivo"></span> Partidos en Vivo
              </span>
              <span className="badge-contador">{partidosEnVivo.length}</span>
            </div>

            <div className="grid-partidos">
              {partidosEnVivo.length === 0 ? (
                <div className="caja-vacia-columna">
                  <p className="texto-vacio">No hay partidos en vivo en este momento</p>
                </div>
              ) : (
                partidosEnVivo.map((partido, index) => (
                  <TarjetaPartido key={partido?.id || `live-${index}`} partido={partido} />
                ))
              )}
            </div>
          </section>

          {/* 📅 CONTENEDOR 2: PRÓXIMOS PARTIDOS */}
          <section className="columna-seccion columna-proximos">
            <div className="encabezado-columna">
              <span className="titulo-seccion">📅 Próximos Partidos</span>
              <span className="badge-contador">{partidosProximos.length}</span>
            </div>

            <div className="grid-partidos">
              {partidosProximos.length === 0 ? (
                <div className="caja-vacia-columna">
                  <div className="spinner"></div>
                  <p className="texto-vacio">Buscando próximos partidos...</p>
                </div>
              ) : (
                partidosProximos.map((partido, index) => (
                  <TarjetaPartido key={partido?.id || `prox-${index}`} partido={partido} />
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      {/* 👣 FOOTER */}
      <footer className="footer">
        <div className="footer-contenido">
          <p className="footer-creditos">
            Estadísticas y datos deportivos proporcionados en tiempo real por{' '}
            <a href="https://www.api-football.com/" target="_blank" rel="noopener noreferrer">
              API-Football
            </a>{' '}
            y{' '}
            <a href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">
              TheSportsDB
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