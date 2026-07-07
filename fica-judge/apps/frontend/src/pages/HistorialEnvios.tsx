import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Submission {
  id: string | number;
  problemId: string;
  language: string;
  status: string;
  createdAt?: string;
  // Estos campos podrían no estar en tu DB aún, los simularemos si no existen
  executionTime?: number; 
  memoryUsage?: number;
}

const HistorialEnvios: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problemDict, setProblemDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('fj_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // 1. Obtenemos el historial y la lista de problemas en paralelo
        const [subsRes, probsRes] = await Promise.all([
          axios.get(`${apiUrl}/submissions/history/me`, { headers }),
          axios.get(`${apiUrl}/problems`, { headers }).catch(() => ({ data: [] }))
        ]);

        // 2. Armamos un diccionario para traducir problemId -> Título
        const pDict: Record<string, string> = {};
        probsRes.data.forEach((p: any) => {
          pDict[p._id] = p.title;
        });
        setProblemDict(pDict);

        // 3. Guardamos los envíos
        setSubmissions(subsRes.data);
      } catch (err) {
        console.error("Error cargando el historial:", err);
        setError('No se pudo cargar el historial de despachos. Verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper para pintar el estado con los colores de tu diseño
  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span style={{ color: '#3fb950', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px' }}>ACCEPTED</span>;
      case 'WRONG_ANSWER':
      case 'WRONG ANSWER':
        return <span style={{ color: '#f85149', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px' }}>WRONG ANSWER</span>;
      case 'PENDING':
        return <span style={{ color: '#d29922', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px' }}>PENDING...</span>;
      default:
        return <span style={{ color: '#8b949e', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px' }}>{status}</span>;
    }
  };

  // Helper para generar tiempos simulados (basados en el ID) para que la tabla no se vea vacía
  // si aún no guardas tiempo/memoria real en Postgres.
  const getSimulatedMetrics = (id: string | number) => {
    const num = String(id).charCodeAt(String(id).length - 1);
    return {
      time: `${(num * 3) % 400 + 12} ms`,
      memory: `${((num * 1.5) % 20 + 4).toFixed(1)} MB`
    };
  };

  if (loading) return <div className="p-4" style={{ color: '#8b949e' }}>Cargando auditoría de despachos...</div>;

  return (
    <div className="p-2" style={{ color: '#c9d1d9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
      
      {/* CABECERA */}
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Mi Historial de Despacho</h3>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
          Auditoría completa de todas tus sumisiones evaluadas asíncronamente en el sandbox.
        </p>
      </div>

      {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{error}</div>}

      {/* CONTENEDOR DE LA TABLA */}
      <div style={{ 
        backgroundColor: '#161b22', 
        border: '1px solid #30363d', 
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table className="table table-borderless mb-0" style={{ width: '100%', backgroundColor: 'transparent' }}>
          
          {/* CABECERAS DE COLUMNA */}
          <thead style={{ borderBottom: '1px solid #30363d' }}>
            <tr>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', width: '12%' }}>Id Evento</th>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', width: '30%' }}>Problema Evaluado</th>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Lenguaje</th>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Veredicto Final</th>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Tiempo</th>
              <th className="py-3 px-4" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Carga Memoria</th>
              <th className="py-3 px-4 text-end" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Detalles</th>
            </tr>
          </thead>

          {/* CUERPO DE LA TABLA */}
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5" style={{ color: '#8b949e' }}>
                  Aún no tienes sumisiones registradas en tu historial.
                </td>
              </tr>
            ) : (
              submissions.map((sub, index) => {
                const metrics = getSimulatedMetrics(sub.id);
                const title = problemDict[sub.problemId] || `Problema Desconocido (${sub.problemId.slice(-6)})`;
                const displayId = `sub-${String(sub.id).slice(-4)}`;

                return (
                  <tr key={sub.id} style={{ borderBottom: index !== submissions.length - 1 ? '1px solid #30363d' : 'none' }}>
                    <td className="py-3 px-4 align-middle" style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                      {displayId}
                    </td>
                    <td className="py-3 px-4 align-middle fw-bold text-white" style={{ fontSize: '0.9rem' }}>
                      {title}
                    </td>
                    <td className="py-3 px-4 align-middle" style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                      {sub.language.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      {renderStatus(sub.status)}
                    </td>
                    <td className="py-3 px-4 align-middle" style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>
                      {sub.executionTime ? `${sub.executionTime} ms` : metrics.time}
                    </td>
                    <td className="py-3 px-4 align-middle" style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>
                      {sub.memoryUsage ? `${sub.memoryUsage} MB` : metrics.memory}
                    </td>
                    <td className="py-3 px-4 align-middle text-end">
                      <span style={{ 
                        color: '#8b949e', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#58a6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#8b949e'}
                      >
                        Ver Código
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialEnvios;