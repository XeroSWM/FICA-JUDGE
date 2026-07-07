import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaz exacta que coincide con lo que nos envía el nuevo Ranking Service
interface RankingUser {
  _id: string;
  studentId: string;
  name: string;
  courseSection: string;
  totalScore: number;
  problemsSolved: number;
  attempts: number;
  effectiveness: number;
}

const RankingsGlobales: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('fj_token'); 
        
        if (!token) {
          setErrorMsg("No hay token de sesión. Por favor, vuelve a iniciar sesión.");
          setLoading(false);
          return;
        }

        // PETICIÓN REAL AL API GATEWAY
        const response = await axios.get('http://localhost:3000/api/ranking/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // ¡MAGIA PURA! Ya no calculamos nada en React. 
        // Inyectamos la data del backend directamente al estado.
        setLeaderboard(response.data);

      } catch (error: any) {
        console.error("❌ Error conectando al API Gateway:", error);
        setErrorMsg(error.message || "Error al conectar con el servidor. Verifica el CORS y tu token.");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="text-white p-5 text-center mt-5">
        <div className="spinner-border text-success mb-3" role="status"></div>
        <h5>Descargando métricas de la base de datos...</h5>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-danger p-5 text-center mt-5">
        <h5>⚠️ {errorMsg}</h5>
      </div>
    );
  }

  // Separamos el Top 2 para las tarjetas dorada y plateada
  const top2 = leaderboard.slice(0, 2);

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' }}>
      
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Tabla de Posiciones Global</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Evaluación de rendimiento para el semestre académico de Ingeniería en Ciencias Aplicadas.
        </p>
      </div>

      {/* ========================================== */}
      {/* TARJETAS DEL PODIO (TOP 2)                 */}
      {/* ========================================== */}
      <div className="row mb-5">
        {top2.map((user, index) => (
          <div className="col-md-6 mb-3" key={user._id}>
            <div 
              className="card h-100 shadow-sm" 
              style={{ 
                backgroundColor: '#161b22', 
                border: index === 0 ? '1px solid #d4af37' : '1px solid #30363d',
                borderRadius: '8px'
              }}
            >
              <div className="card-body text-center position-relative p-4">
                <span 
                  className="position-absolute fw-bold" 
                  style={{ top: '15px', right: '20px', fontSize: '1.2rem', color: index === 0 ? '#d4af37' : '#8b949e' }}
                >
                  #{index + 1}
                </span>
                
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 fw-bold"
                  style={{ width: '55px', height: '55px', backgroundColor: '#21262d', fontSize: '1.3rem', color: '#c9d1d9', border: '1px solid #30363d' }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                
                <h6 className="text-white fw-bold mb-0">{user.name}</h6>
                <p className="text-muted mb-4 mt-1" style={{ fontSize: '0.75rem' }}>{user.courseSection}</p>
                
                <div className="d-flex justify-content-center gap-5">
                  <div>
                    <p className="mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#8b949e' }}>RESUELTOS</p>
                    <h5 className="text-white fw-bold mb-0">{user.problemsSolved}</h5>
                  </div>
                  <div>
                    <p className="mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#8b949e' }}>INTENTOS</p>
                    <h5 className="fw-bold mb-0" style={{ color: '#8b949e' }}>{user.attempts}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* TABLA INFERIOR CON TODOS LOS COMPETIDORES    */}
      {/* ========================================== */}
      <div className="card shadow-sm" style={{ backgroundColor: '#010409', border: '1px solid #30363d', borderRadius: '8px' }}>
        <div className="card-body p-0">
          <h6 className="text-white fw-bold p-4 pb-2 m-0" style={{ fontSize: '0.9rem' }}>Competidores Universitarios</h6>
          
          <div className="table-responsive">
            <table className="table table-borderless table-dark mb-0 align-middle" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ borderBottom: '1px solid #30363d' }}>
                <tr>
                  <th className="px-4 py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>POSICIÓN</th>
                  <th className="py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>NOMBRE</th>
                  <th className="py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>SECCIÓN DE CURSO</th>
                  <th className="py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>PROBLEMAS RESUELTOS</th>
                  <th className="py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>INTENTOS REALES</th>
                  <th className="py-3" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>SCORE TOTAL</th>
                  <th className="px-4 py-3 text-end" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#8b949e' }}>EFECTIVIDAD</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #30363d', backgroundColor: 'transparent', transition: 'background-color 0.2s' }} className="hover-row">
                    <td className="px-4 py-3" style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>#{index + 1}</td>
                    
                    <td className="py-3 text-white fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {user.name}
                    </td>
                    
                    <td className="py-3" style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                      {user.courseSection}
                    </td>
                    
                    <td className="py-3 fw-bold" style={{ color: '#3fb950', fontSize: '0.85rem' }}>
                      {user.problemsSolved}
                    </td>
                    
                    <td className="py-3" style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>
                      {user.attempts}
                    </td>

                    <td className="py-3 fw-bold text-warning" style={{ fontSize: '0.85rem' }}>
                      {user.totalScore} pts
                    </td>
                    
                    <td className="px-4 py-3 text-end fw-bold" style={{ color: '#3fb950', fontSize: '0.85rem' }}>
                      {user.effectiveness}%
                    </td>
                  </tr>
                ))}
                
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No hay competidores registrados aún. ¡Sé el primero en enviar una solución!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RankingsGlobales;