import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  type: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxScore: number;
  penaltyPerAttempt: number;
  problemIds: string[];
}

const AssignmentsList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Reloj en tiempo real para el "Reloj del Servidor"
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('fj_token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignments(response.data);
      } catch (error) {
        console.error('Error cargando asignaciones', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const isAssignmentOpen = (startDate: string, endDate: string) => {
    const now = new Date();
    return now >= new Date(startDate) && now <= new Date(endDate);
  };

  const getTimeRemaining = (endDate: string) => {
    const total = Date.parse(endDate) - Date.parse(new Date().toString());
    if (total <= 0) return 'Plazo Concluido';
    
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    return `Cierra en: ${days}d ${hours}h ${minutes}m`;
  };

  // Filtrado de pestañas
  const filteredAssignments = assignments.filter(a => {
    if (activeTab === 'DEBERES') return a.type === 'DEBER';
    if (activeTab === 'EXAMENES') return a.type === 'EXAMEN';
    if (activeTab === 'ACTIVOS') return isAssignmentOpen(a.startDate, a.endDate);
    return true; // 'TODOS'
  });

  const countDeberes = assignments.filter(a => a.type === 'DEBER').length;
  const countExamenes = assignments.filter(a => a.type === 'EXAMEN').length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '80vh', color: '#c9d1d9' }}>
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <div className="w-100 h-100 d-flex flex-column" style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* BARRA SUPERIOR DE PESTAÑAS (TABS) Y RELOJ */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid #30363d', backgroundColor: '#0d1117' }}>
        <div className="d-flex align-items-center gap-4" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
          <div 
            onClick={() => setActiveTab('TODOS')}
            style={{ cursor: 'pointer', paddingBottom: '4px', borderBottom: activeTab === 'TODOS' ? '2px solid #c9d1d9' : '2px solid transparent', color: activeTab === 'TODOS' ? '#c9d1d9' : '#8b949e' }}
          >
            Todos ({assignments.length})
          </div>
          <div 
            onClick={() => setActiveTab('DEBERES')}
            style={{ cursor: 'pointer', paddingBottom: '4px', borderBottom: activeTab === 'DEBERES' ? '2px solid #c9d1d9' : '2px solid transparent', color: activeTab === 'DEBERES' ? '#c9d1d9' : '#8b949e' }}
          >
            Solo Deberes ({countDeberes})
          </div>
          <div 
            onClick={() => setActiveTab('EXAMENES')}
            style={{ cursor: 'pointer', paddingBottom: '4px', borderBottom: activeTab === 'EXAMENES' ? '2px solid #c9d1d9' : '2px solid transparent', color: activeTab === 'EXAMENES' ? '#c9d1d9' : '#8b949e' }}
          >
            Solo Exámenes ({countExamenes})
          </div>
          <div 
            onClick={() => setActiveTab('ACTIVOS')}
            style={{ cursor: 'pointer', paddingBottom: '4px', borderBottom: activeTab === 'ACTIVOS' ? '2px solid #3fb950' : '2px solid transparent', color: activeTab === 'ACTIVOS' ? '#3fb950' : '#8b949e' }}
          >
            Plazo Activo
          </div>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: 'monospace' }}>
          Reloj del Servidor: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}
        </div>
      </div>

      {/* CONTENEDOR DE TARJETAS (GRID) */}
      <div className="p-4" style={{ overflowY: 'auto', flexGrow: 1 }}>
        <div className="row g-4">
          
          {filteredAssignments.length === 0 ? (
            <div className="col-12 text-center py-5" style={{ color: '#8b949e' }}>
              No hay evaluaciones en esta categoría.
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const isOpen = isAssignmentOpen(assignment.startDate, assignment.endDate);
              const isDeber = assignment.type === 'DEBER';
              const problemsCount = assignment.problemIds ? assignment.problemIds.length : 1;
              const timeLeft = getTimeRemaining(assignment.endDate);

              return (
                <div className="col-md-6" key={assignment.id}>
                  <div className="d-flex flex-column h-100" style={{ 
                    backgroundColor: '#161b22', 
                    border: isOpen ? '1px solid #30363d' : '1px solid #21262d', 
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    
                    {/* CABECERA DE LA TARJETA (BADGES) */}
                    <div className="d-flex justify-content-between align-items-center p-3">
                      <span style={{ 
                        backgroundColor: isDeber ? 'rgba(56, 139, 253, 0.1)' : 'rgba(248, 81, 73, 0.1)', 
                        color: isDeber ? '#58a6ff' : '#ff7b72',
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}>
                        {isDeber ? 'DEBER SEMANAL' : 'EXAMEN PRÁCTICO'}
                      </span>
                      
                      {isOpen ? (
                        <span style={{ color: '#3fb950', border: '1px solid rgba(63, 185, 80, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', backgroundColor: 'rgba(63, 185, 80, 0.1)' }}>
                          HABILITADO ⚡
                        </span>
                      ) : (
                        <span style={{ color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', backgroundColor: 'rgba(248, 81, 73, 0.1)' }}>
                          PLAZO CERRADO 🔒
                        </span>
                      )}
                    </div>
                    
                    {/* CUERPO Y DESCRIPCIÓN */}
                    <div className="px-3 pb-3 flex-grow-1">
                      <p style={{ color: isOpen ? '#c9d1d9' : '#8b949e', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                        <strong className="text-white d-block mb-1">{assignment.title}</strong>
                        {assignment.description || `Evaluación correspondiente al ciclo actual. Se calificará la complejidad algorítmica y optimización de recursos. Apertura oficial registrada en el sistema.`}
                      </p>
                    </div>

                    {/* CAJA INTERNA DE ESTADO Y NOTAS */}
                    <div className="mx-3 mb-3 p-3 rounded" style={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <div style={{ fontSize: '0.6rem', color: '#8b949e', fontWeight: 'bold', letterSpacing: '1px' }}>EJERCICIOS</div>
                          <div style={{ fontSize: '0.8rem', color: '#484f58', marginTop: '2px' }}>{problemsCount} Problemas asignados</div>
                        </div>
                        <div className="text-end">
                          <div style={{ fontSize: '0.6rem', color: '#8b949e', fontWeight: 'bold', letterSpacing: '1px' }}>NOTA ACADÉMICA</div>
                          <div style={{ fontSize: '0.8rem', color: '#484f58', marginTop: '2px' }}>Sin Entregas</div>
                        </div>
                      </div>
                      
                      <div style={{ borderTop: '1px solid #21262d', paddingTop: '8px', marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                        <span className="me-2" style={{ color: isOpen ? '#3fb950' : '#8b949e', fontSize: '0.9rem' }}>⏱</span>
                        <span style={{ fontSize: '0.75rem', color: isOpen ? '#8b949e' : '#484f58', fontWeight: '500', fontFamily: 'monospace' }}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#30363d', width: '100%' }}></div>

                    {/* FOOTER CON BOTÓN DE ACCIÓN */}
                    <div className="p-3 d-flex justify-content-between align-items-center">
                      <div style={{ display: 'flex', alignItems: 'center', color: '#3fb950', fontSize: '0.75rem', fontWeight: '500' }}>
                        <span className="me-1">✔️</span> Entregado
                      </div>
                      
                      <button
                        onClick={() => isOpen && navigate(`/assignments/${assignment.id}`)}
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: isOpen ? '#f0f6fc' : 'transparent', 
                          color: isOpen ? '#010409' : '#8b949e',
                          border: isOpen ? 'none' : '1px solid #30363d',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          padding: '6px 16px',
                          cursor: isOpen ? 'pointer' : 'default'
                        }}
                      >
                        {isOpen ? 'Abrir y Resolver ⟩' : 'Ver Detalles ⟩'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsList;