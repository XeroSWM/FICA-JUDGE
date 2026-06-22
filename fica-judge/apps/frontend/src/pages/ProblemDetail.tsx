import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ProblemTemplate {
  language: string;
  starterCode: string;
}

interface Problem {
  _id?: string;
  title: string;
  difficulty: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  constraints?: string[];
  templates?: ProblemTemplate[];
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      // 👇 DEFINIMOS LA URL BASE DINÁMICA AQUÍ
      const apiUrl = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3002';
      
      try {
        // Usamos apiUrl para la petición principal
        const response = await axios.get(`${apiUrl}/problems/${id}`);
        setProblem(response.data);
        if (response.data.templates && response.data.templates.length > 0) {
          setCode(response.data.templates[0].starterCode);
        }
      } catch (error) {
        console.warn("No se pudo obtener por ID, buscando en la lista completa...");
        try {
          // Usamos apiUrl también para el fallback
          const fallbackRes = await axios.get(`${apiUrl}/problems`);
          const found = fallbackRes.data.find((p: any) => p._id === id);
          if (found) {
            setProblem(found);
            if (found.templates && found.templates.length > 0) {
              setCode(found.templates[0].starterCode);
            }
          }
        } catch (fallbackError) {
          console.error("Fallo completo al cargar:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  if (loading) return <div className="p-4" style={{ color: '#8b949e' }}>Cargando entorno de evaluación...</div>;
  if (!problem) return <div className="p-4" style={{ color: '#f85149' }}>Problema no encontrado. Revisa si el ID es correcto.</div>;

  const getDockerImageName = () => {
    if (problem.templates && problem.templates.length > 0) {
      const lang = problem.templates[0].language.toLowerCase();
      return `fica-comp-${lang}.v2`;
    }
    return 'fica-comp-default.v2';
  };

  return (
    <div style={{ color: '#c9d1d9' }}>
      
      {/* Barra Superior */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: '1px solid #30363d' }}>
        <span 
          style={{ color: '#58a6ff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }} 
          onClick={() => navigate('/problems')}
        >
          ◀ Volver al Listado
        </span>
        <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
          ID: {problem._id ? problem._id.slice(-6) : 'N/A'} — Creado por: Admin
        </span>
      </div>

      <div className="row g-4">
        {/* ========================================================== */}
        {/* COLUMNA IZQUIERDA: ENUNCIADO                               */}
        {/* ========================================================== */}
        <div className="col-lg-5">
          <div className="d-flex mb-3" style={{ borderBottom: '1px solid #30363d' }}>
            <div className="px-3 py-2 fw-bold" style={{ borderBottom: '2px solid #3fb950', color: '#3fb950', fontSize: '0.85rem' }}>
              1. Enunciado
            </div>
            <div className="px-3 py-2" style={{ color: '#8b949e', fontSize: '0.85rem', cursor: 'pointer' }}>
              2. Ejemplos Públicos (2)
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-white mb-0">{problem.title}</h4>
            <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#f85149' }}>
              {problem.difficulty}
            </span>
          </div>

          <p className="mb-4" style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {problem.description}
          </p>

          <div className="d-flex p-3 mb-4 rounded" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
            <div className="w-50">
              <div style={{ fontSize: '0.65rem', color: '#8b949e', letterSpacing: '1px', fontWeight: 'bold' }}>LÍMITE COMPUTACIONAL</div>
              <div className="text-white" style={{ fontSize: '0.85rem' }}>{problem.timeLimit} ms</div>
            </div>
            <div className="w-50">
              <div style={{ fontSize: '0.65rem', color: '#8b949e', letterSpacing: '1px', fontWeight: 'bold' }}>LÍMITE MEMORIA</div>
              <div className="text-white" style={{ fontSize: '0.85rem' }}>{problem.memoryLimit} megabytes</div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RESTRICCIONES ACADÉMICAS DINÁMICAS                         */}
          {/* ========================================================== */}
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem', color: '#8b949e' }}>RESTRICCIONES ACADÉMICAS</h6>
          <ul className="ps-3 mb-5" style={{ color: '#8b949e', fontSize: '0.85rem' }}>
            
            {/* Iteramos sobre el arreglo de 'constraints' que viene de Mongo */}
            {problem.constraints && problem.constraints.length > 0 ? (
              problem.constraints.map((restriccion: string, index: number) => (
                <li key={index} className="mb-1">{restriccion}</li>
              ))
            ) : (
              <li className="mb-1">No hay restricciones adicionales registradas.</li>
            )}
            
            {/* El límite de tiempo siempre se calcula automáticamente */}
            <li className="mb-1 text-white">
              El tiempo máximo aceptable para responder es {(problem.timeLimit / 1000).toFixed(1)} segundos.
            </li>
          </ul>

          <div className="mt-5 pt-3" style={{ borderTop: '1px solid #30363d', fontSize: '0.75rem' }}>
            <div className="fw-bold text-white mb-1">FICA-JUDGE SANDBOX VIRTUAL</div>
            <div className="d-flex justify-content-between" style={{ color: '#8b949e' }}>
              <span>Docker Image: {getDockerImageName()}</span>
              <span>Capa de Hardware: Sandbox VM</span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLUMNA DERECHA: EDITOR Y CONSOLA                          */}
        {/* ========================================================== */}
        <div className="col-lg-7 d-flex flex-column">
          
          <div className="card flex-grow-1 mb-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
            <div className="d-flex justify-content-between align-items-center p-2" style={{ borderBottom: '1px solid #30363d' }}>
              <span className="ms-2" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px' }}>EDITOR INTEGRADO</span>
              <select className="form-select form-select-sm bg-dark text-white border-secondary" style={{ width: 'auto', fontSize: '0.75rem' }}>
                {problem.templates && problem.templates.map((tpl: any, i: number) => (
                  <option key={i} value={tpl.language}>{tpl.language.toUpperCase()}</option>
                ))}
                {!problem.templates && <option>PYTHON</option>}
              </select>
            </div>
            
            <div className="p-0 position-relative flex-grow-1" style={{ minHeight: '300px' }}>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                style={{ 
                  width: '100%', height: '100%', minHeight: '300px', backgroundColor: '#0d1117', color: '#79c0ff', 
                  border: 'none', padding: '15px', fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace', 
                  fontSize: '0.85rem', outline: 'none', resize: 'none'
                }}
              />
            </div>

            <div className="p-2 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #30363d', backgroundColor: '#161b22' }}>
              <button className="btn btn-sm" style={{ backgroundColor: '#0d1117', color: '#8b949e', border: '1px solid #30363d', fontSize: '0.75rem' }}>
                &gt;_ CONSOLA TERMINAL
              </button>
              <div>
                <button className="btn btn-sm text-dark me-2" style={{ backgroundColor: '#c9d1d9', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  ▶ Ejecutar Código
                </button>
                <button className="btn btn-sm text-white" style={{ backgroundColor: '#238636', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  Enviar Solución
                </button>
              </div>
            </div>
          </div>

          <div className="card p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
             <span className="mb-2" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px' }}>&gt;_ SALIDA TERMINAL & CASOS EVALUADOS</span>
             
             <div className="mb-2">
               <label className="text-white mb-1" style={{ fontSize: '0.75rem' }}>ENTRADA ESTÁNDAR EN CALIENTE:</label>
               <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" defaultValue="2 3" style={{ fontFamily: 'monospace' }} />
             </div>

             <div className="p-2 rounded mt-2" style={{ backgroundColor: '#0d1117', border: '1px dashed #30363d', minHeight: '60px' }}>
               <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                 &gt; Presiona "Ejecutar Código" para compilar sobre tus casos o "Enviar Solución" para correr los pools de RabbitMQ.
               </span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;