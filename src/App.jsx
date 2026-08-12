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
  
  // useRef nos permite recordar los goles anteriores sin provocar que la pantalla parpadee
  const golesAnteriores = useRef({
    local: partido.golesLocal,
    visitante: partido.golesVisitante
  });

  useEffect(() => {
    // Si los goles nuevos son mayores a los que teníamos guardados... ¡GOL!
    if (
      partido.golesLocal > golesAnteriores.current.local || 
      partido.golesVisitante > golesAnteriores.current.visitante
    ) {
      setHayGol(true); // Encendemos la animación
      
      // La apagamos después de 3 segundos
      setTimeout(() => {
        setHayGol(false);
      }, 3000);
    }

    // Actualizamos nuestra memoria para la próxima vez
    golesAnteriores.current = {
      local: partido.golesLocal,
      visitante: partido.golesVisitante
    };
  }, [partido.golesLocal, partido.golesVisitante]); // Solo revisamos cuando cambian los goles

  return (
    // Si hayGol es true, le inyectamos la clase 'animacion-gol' a la tarjeta
    <div className={`tarjeta-partido ${hayGol ? 'animacion-gol' : ''}`}>
      <div className="tiempo-partido">
        <span className="minuto-pulsante">{partido.minuto}</span>
      </div>
      <div className="marcador-equipos">
        <span className="equipo">{partido.local}</span>
        <span className="goles">{partido.golesLocal} - {partido.golesVisitante}</span>
        <span className="equipo">{partido.visitante}</span>
      </div>
      
      {/* Etiqueta de GOL dinámica */}
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