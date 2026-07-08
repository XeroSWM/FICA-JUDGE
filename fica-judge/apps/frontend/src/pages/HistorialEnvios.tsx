import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

interface TestCaseResult {
  passed: boolean;
  input?: string;
  output?: string;
}

interface Submission {
  id: string | number;
  problemId: string;
  language: string;
  status: string;
  createdAt?: string;
  results?: TestCaseResult[];
  sourceCode?: string; // 👈 Añadimos esto para leer el código de la base de datos
}

const HistorialEnvios: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problemDict, setProblemDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 👇 ESTADOS PARA LA VENTANA FLOTANTE (MODAL)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('fj_token');
      const headers = { Authorization: `Bearer ${token}` };

      // 👇 EXTRAEMOS TU CORREO REAL DE LA MEMORIA DEL NAVEGADOR
      const userLocal = JSON.parse(localStorage.getItem('fj_user') || '{}');
      const myEmail = userLocal.email || 'unknown_student'; 

      try {
        const [subsRes, probsRes] = await Promise.all([
          // 👇 LE ENVIAMOS EL CORREO EXACTO AL GATEWAY
          axios.get(`${apiUrl}/submissions/history/${myEmail}`, { headers }),
          axios.get(`${apiUrl}/problems`, { headers }).catch(() => ({ data: [] }))
        ]);

        const pDict: Record<string, string> = {};
        probsRes.data.forEach((p: any) => {
          pDict[p._id] = p.title;
        });
        setProblemDict(pDict);
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

  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) return submissions;
    const term = searchTerm.toLowerCase().trim();
    return submissions.filter(sub => {
      const title = problemDict[sub.problemId] || '';
      return title.toLowerCase().includes(term);
    });
  }, [submissions, problemDict, searchTerm]);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span style={{ color: '#3fb950', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.3px' }}>ACCEPTED</span>;
      case 'WRONG_ANSWER':
      case 'WRONG ANSWER':
        return <span style={{ color: '#f85149', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.3px' }}>WRONG ANSWER</span>;
      case 'PENDING':
        return <span style={{ color: '#d29922', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.3px' }}>PENDING...</span>;
      default:
        return <span style={{ color: '#8b949e', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.3px' }}>{status}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPassedCases = (results?: TestCaseResult[], status?: string) => {
    if (status === 'PENDING') return '-';
    if (!results || results.length === 0) return '0 / 0';
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const color = passed === total ? '#3fb950' : '#c9d1d9';
    return <span style={{ color }}>{passed} / {total}</span>;
  };

  // 👇 Función para copiar al portapapeles
  const handleCopyCode = () => {
    if (selectedSubmission?.sourceCode) {
      navigator.clipboard.writeText(selectedSubmission.sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div style={{ padding: '1rem', color: '#8b949e' }}>Cargando auditoría de despachos...</div>;

  return (
    <div style={{ color: '#c9d1d9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem', fontSize: '1.25rem' }}>Mi Historial de Despacho</h3>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Auditoría completa de todas tus sumisiones evaluadas asíncronamente en el sandbox.
          </p>
        </div>
        <div style={{ minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Buscar problemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#c9d1d9',
              borderRadius: '6px',
              padding: '0.375rem 0.75rem',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {error && <div style={{ color: '#f85149', padding: '0.5rem', border: '1px solid #f85149', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#0d1117',
          color: '#c9d1d9',
          fontSize: '0.8rem'
        }}>
          <thead style={{ borderBottom: '1px solid #30363d' }}>
            <tr>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>ID EVENTO</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>PROBLEMA EVALUADO</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>LENGUAJE</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>VEREDICTO FINAL</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>FECHA</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>CASOS SUPERADOS</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>DETALLES</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#8b949e' }}>
                  {searchTerm ? 'No se encontraron envíos que coincidan con la búsqueda.' : 'Aún no tienes sumisiones registradas en tu historial.'}
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub, index) => {
                const title = problemDict[sub.problemId] || `Problema Desconocido (${sub.problemId.slice(-6)})`;
                const displayId = `sub-${String(sub.id).slice(-4)}`;

                return (
                  <tr key={sub.id} style={{ borderBottom: index !== filteredSubmissions.length - 1 ? '1px solid #21262d' : 'none' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#8b949e' }}>{displayId}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 'bold', color: '#ffffff' }}>{title}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#8b949e' }}>{sub.language.toUpperCase()}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{renderStatus(sub.status)}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#c9d1d9' }}>{formatDate(sub.createdAt)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{getPassedCases(sub.results, sub.status)}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                      <span style={{
                        color: '#8b949e',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#58a6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#8b949e'}
                      onClick={() => setSelectedSubmission(sub)} // 👈 AQUI ABRIMOS EL MODAL
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

      {/* ========================================================= */}
      {/* 👇 MODAL FLOTANTE PARA VER EL CÓDIGO 👇                     */}
      {/* ========================================================= */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(1, 4, 9, 0.8)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}
        onClick={() => setSelectedSubmission(null)} // Cierra al hacer clic afuera
        >
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic adentro
          >
            {/* Cabecera del Modal */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#0d1117',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <div>
                <h5 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                  {problemDict[selectedSubmission.problemId] || 'Problema'}
                </h5>
                <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                  Lenguaje: {selectedSubmission.language.toUpperCase()} | Evento: sub-{String(selectedSubmission.id).slice(-4)}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                  onClick={handleCopyCode}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #30363d',
                    color: copied ? '#3fb950' : '#8b949e',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? '¡Copiado!' : 'Copiar Código'}
                </button>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    background: 'none', border: 'none', color: '#8b949e',
                    fontSize: '1.5rem', cursor: 'pointer', padding: 0, lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Cuerpo del Modal (Código Fuente) */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              backgroundColor: '#0d1117',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}>
              <pre style={{
                margin: 0,
                color: '#e6edf3',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {selectedSubmission.sourceCode || '# No se encontró código fuente para este envío.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialEnvios;