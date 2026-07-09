import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  maxScore: number;
  penaltyPerAttempt: number;
}

const AssignmentsList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '80vh', color: '#c9d1d9' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ color: '#c9d1d9' }}>
      <div className="mb-4" style={{ borderBottom: '1px solid #30363d', paddingBottom: '15px' }}>
        <h2 className="fw-bold text-white mb-1">Deberes y Exámenes Prácticos</h2>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Selecciona una evaluación para comenzar. Ten en cuenta las fechas límite marcadas por el sistema.</p>
      </div>

      <div className="row">
        {assignments.length === 0 ? (
          <div className="col-12">
            <div className="p-4 rounded text-center" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
              <p style={{ color: '#8b949e', margin: 0 }}>No hay deberes ni exámenes asignados en este momento.</p>
            </div>
          </div>
        ) : (
          assignments.map((assignment) => {
            const isOpen = isAssignmentOpen(assignment.startDate, assignment.endDate);
            
            return (
              <div className="col-md-6 col-lg-4 mb-4" key={assignment.id}>
                <div className="d-flex flex-column p-4 h-100" style={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid #30363d', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ 
                      backgroundColor: assignment.type === 'EXAMEN' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(56, 139, 253, 0.15)', 
                      color: assignment.type === 'EXAMEN' ? '#ff7b72' : '#58a6ff',
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      {assignment.type}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e', fontWeight: 'bold' }}>Max: {assignment.maxScore} pts</span>
                  </div>
                  
                  <h4 className="text-white fw-bold mb-3">{assignment.title}</h4>
                  
                  <div className="mb-4 flex-grow-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                    <div className="mb-2"><strong className="text-white">Apertura:</strong> {new Date(assignment.startDate).toLocaleString()}</div>
                    <div className="mb-2"><strong className="text-white">Cierre:</strong> {new Date(assignment.endDate).toLocaleString()}</div>
                    <div style={{ color: '#d29922' }}><strong>Penalización:</strong> -{assignment.penaltyPerAttempt} pts por fallo</div>
                  </div>

                  <button
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                    disabled={!isOpen}
                    className="btn w-100 fw-bold"
                    style={{ 
                      backgroundColor: isOpen ? '#238636' : '#21262d', 
                      color: isOpen ? '#ffffff' : '#8b949e',
                      border: isOpen ? '1px solid rgba(240, 246, 252, 0.1)' : '1px solid #30363d',
                      padding: '8px 16px',
                      cursor: isOpen ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isOpen ? 'Ingresar a la Evaluación' : 'Fuera de Fecha'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;