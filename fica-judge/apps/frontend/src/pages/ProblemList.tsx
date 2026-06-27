import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
}

const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const apiUrl = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3002';
        const response = await axios.get(`${apiUrl}/problems`);
        
        setProblems(response.data);
      } catch (error) {
        console.error("Error al cargar problemas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toUpperCase()) {
      case 'FÁCIL': return '#3fb950';
      case 'MEDIO': return '#d29922';
      case 'DIFÍCIL': return '#f85149';
      default: return '#8b949e';
    }
  };

  return (
    <div style={{ color: '#c9d1d9' }}>
      
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Banco Universitario de Problemas</h2>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: 0 }}>
            Material de optimización calificado asíncronamente por nuestros evaluadores Docker.
          </p>
        </div>
        
        {/* Contenedor de Búsqueda y Botón */}
        <div className="d-flex gap-2 align-items-center">
          <div style={{ width: '250px' }}>
            <input 
              type="text" 
              className="form-control form-control-sm text-light" 
              placeholder="🔍 Filtrar problemas..." 
              style={{ backgroundColor: '#010409', borderColor: '#30363d' }}
            />
          </div>
          <button 
            className="btn btn-sm text-white" 
            style={{ backgroundColor: '#238636', fontWeight: 'bold' }}
            onClick={() => navigate('/problems/new')}
          >
            + Crear Problema
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid #30363d' }}>
        <div className="d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
          <span className="me-3" style={{ color: '#8b949e' }}>⧨ FILTROS RÁPIDOS</span>
          <span className="me-3" style={{ color: '#3fb950', cursor: 'pointer' }}>Completo</span>
          <span className="me-3" style={{ color: '#8b949e', cursor: 'pointer' }}>Fácil</span>
          <span className="me-3" style={{ color: '#8b949e', cursor: 'pointer' }}>Medio</span>
          <span className="me-4" style={{ color: '#8b949e', cursor: 'pointer' }}>Difícil</span>
          <span style={{ color: '#8b949e', cursor: 'pointer' }}>Todas las Categorías ▼</span>
        </div>
        <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
          {problems.length} problemas indexados
        </div>
      </div>

      {/* Grid de Problemas */}
      {loading ? (
        <div className="text-center mt-5"><span style={{ color: '#8b949e' }}>Cargando problemas desde el catálogo...</span></div>
      ) : (
        <div className="row g-3">
          {problems.map((problem) => (
            <div className="col-md-6" key={problem._id}>
              <div 
                className="card h-100 p-3" 
                style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', transition: 'border 0.2s' }}
                onClick={() => navigate(`/problems/${problem._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b949e'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#30363d'}
              >
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: '0.65rem', color: '#8b949e', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {problem.tags && problem.tags.length > 0 ? problem.tags[0] : 'ALGORITMIA'}
                  </span>
                  <span className="fw-bold" style={{ fontSize: '0.7rem', color: getDifficultyColor(problem.difficulty) }}>
                    {problem.difficulty}
                  </span>
                </div>

                <h6 className="text-white fw-bold mb-2">{problem.title}</h6>
                
                <p className="mb-4" style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {problem.description}
                </p>

                <div className="mt-auto d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: '#8b949e' }}>Aceptados: <span className="text-light">--% (--/--)</span></span>
                  <span style={{ color: '#8b949e' }}>Límite: <span className="text-light">{problem.timeLimit}ms / {problem.memoryLimit}MB</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemList;