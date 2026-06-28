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

  // ==========================================
  // NUEVOS ESTADOS PARA EL MOTOR DE EVALUACIÓN
  // ==========================================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('> Presiona "Ejecutar Código" para compilar sobre tus casos o "Enviar Solución" para correr los pools de RabbitMQ.');
  const [testResults, setTestResults] = useState<any[]>([]);
  
  // Estado para la Entrada Estándar en Caliente (Custom Input)
  const [customInput, setCustomInput] = useState("3\n2 7 11\n9"); 

  useEffect(() => {
    const fetchProblem = async () => {
      const apiUrl = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3002';
      
      try {
        const response = await axios.get(`${apiUrl}/problems/${id}`);
        setProblem(response.data);
        if (response.data.templates && response.data.templates.length > 0) {
          setCode(response.data.templates[0].starterCode);
        }
      } catch (error) {
        try {
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

  // ==========================================
  // LÓGICA MODO: "EJECUTAR CÓDIGO" (Síncrono)
  // ==========================================
  const handleRunCode = async () => {
    setIsSubmitting(true);
    setTestResults([]); // Limpiamos resultados anteriores
    setTerminalOutput("> Compilando y ejecutando código en entorno seguro...");

    try {
      // Hacemos el POST directo a la nueva ruta /run
      const response = await axios.post('http://localhost:3003/submissions/run', {
        language: 'python',
        sourceCode: code,
        input: customInput // Enviamos lo que haya escrito el usuario en la cajita
      });

      setIsSubmitting(false);
      
      // Imprimimos la salida cruda de la consola
      setTerminalOutput(`> Salida del programa:\n\n${response.data.output || '(Programa finalizado sin imprimir nada)'}`);

    } catch (error) {
      setIsSubmitting(false);
      setTerminalOutput("> [ERROR] No se pudo conectar con el motor de evaluación.");
    }
  };

  // ==========================================
  // LÓGICA MODO: "ENVIAR SOLUCIÓN" (Asíncrono / RabbitMQ)
  // ==========================================
  const handleSubmitSolution = async () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    setTestResults([]);
    setTerminalOutput("> Empaquetando código y enviando a la cola de RabbitMQ...");

    try {
      // 1. Enviamos el código al Submission Service (Sin los testCases quemados)
      const response = await axios.post('http://localhost:3003/submissions', {
        studentId: 'user_jefferson', // En el futuro saldrá de tu AuthContext
        problemId: problem._id || id,
        language: 'python',
        sourceCode: code
      });

      if (response.data.status === 'PENDING') {
        const subId = response.data.submissionId;
        setTerminalOutput(`> Código encolado (UUID: ${subId.split('-')[0]}...). Ejecutando en Sandbox...`);
        // 2. Iniciamos el sondeo
        pollSubmissionResult(subId);
      }
    } catch (error) {
      console.error(error);
      setTerminalOutput("> [ERROR] No se pudo conectar con el motor de evaluación (Puerto 3003).");
      setIsSubmitting(false);
    }
  };

  const pollSubmissionResult = (submissionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:3003/submissions/${submissionId}`);
        const data = res.data;

        // Si el Worker ya guardó el resultado final en Postgres
        if (data.status !== 'PENDING') {
          clearInterval(pollInterval);
          setIsSubmitting(false);
          
          if (data.status === 'ACCEPTED') {
            setTerminalOutput(`> ✅ ¡Aceptado! Veredicto Final: ACCEPTED`);
          } else if (data.status === 'WRONG_ANSWER') {
            setTerminalOutput(`> ❌ Respuesta Incorrecta. Veredicto Final: WRONG_ANSWER`);
          } else {
            setTerminalOutput(`> ⚠️ Error en tiempo de ejecución. Veredicto Final: ${data.status}`);
          }

          // Guardamos los resultados detallados para mostrarlos en la UI
          if (data.results) {
            setTestResults(data.results);
          }
        }
      } catch (error) {
        clearInterval(pollInterval);
        setTerminalOutput("> [ERROR] Falló la consulta de estado con la base de datos.");
        setIsSubmitting(false);
      }
    }, 1000); // Preguntar cada 1 segundo
  };

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
        {/* COLUMNA IZQUIERDA: ENUNCIADO */}
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

          <p className="mb-4" style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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

          <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem', color: '#8b949e' }}>RESTRICCIONES ACADÉMICAS</h6>
          <ul className="ps-3 mb-5" style={{ color: '#8b949e', fontSize: '0.85rem' }}>
            {problem.constraints && problem.constraints.length > 0 ? (
              problem.constraints.map((restriccion: string, index: number) => (
                <li key={index} className="mb-1">{restriccion}</li>
              ))
            ) : (
              <li className="mb-1">No hay restricciones adicionales registradas.</li>
            )}
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

        {/* COLUMNA DERECHA: EDITOR Y CONSOLA */}
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
                disabled={isSubmitting} // Deshabilitamos la edición mientras evalúa
                style={{ 
                  width: '100%', height: '100%', minHeight: '300px', backgroundColor: '#0d1117', color: '#79c0ff', 
                  border: 'none', padding: '15px', fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace', 
                  fontSize: '0.85rem', outline: 'none', resize: 'none',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              />
            </div>

            <div className="p-2 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #30363d', backgroundColor: '#161b22' }}>
              <button className="btn btn-sm" style={{ backgroundColor: '#0d1117', color: '#8b949e', border: '1px solid #30363d', fontSize: '0.75rem' }}>
                &gt;_ CONSOLA TERMINAL
              </button>
              <div>
                <button 
                  className="btn btn-sm text-dark me-2" 
                  onClick={handleRunCode}
                  disabled={isSubmitting} 
                  style={{ backgroundColor: '#c9d1d9', fontWeight: 'bold', fontSize: '0.75rem' }}
                >
                  ▶ Ejecutar Código
                </button>
                <button 
                  className="btn btn-sm text-white" 
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting} // Deshabilitar mientras procesa
                  style={{ backgroundColor: isSubmitting ? '#1f6a29' : '#238636', fontWeight: 'bold', fontSize: '0.75rem' }}
                >
                  {isSubmitting ? 'Evaluando...' : 'Enviar Solución'}
                </button>
              </div>
            </div>
          </div>

          {/* ÁREA DE TERMINAL Y RESULTADOS DINÁMICOS */}
          <div className="card p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
             <span className="mb-2" style={{ color: '#8b949e', fontSize: '0.7rem', letterSpacing: '1px' }}>&gt;_ SALIDA TERMINAL & CASOS EVALUADOS</span>
             
             <div className="mb-2">
               <label className="text-white mb-1" style={{ fontSize: '0.75rem' }}>ENTRADA ESTÁNDAR EN CALIENTE:</label>
               <textarea 
                 className="form-control form-control-sm bg-dark text-white border-secondary" 
                 value={customInput}
                 onChange={(e) => setCustomInput(e.target.value)}
                 disabled={isSubmitting} 
                 style={{ fontFamily: 'monospace', minHeight: '60px' }} 
               />
             </div>

             <div className="p-2 rounded mt-2" style={{ backgroundColor: '#0d1117', border: '1px dashed #30363d', minHeight: '60px' }}>
               <span style={{ 
                 color: terminalOutput.includes('✅') ? '#3fb950' : terminalOutput.includes('❌') ? '#f85149' : '#8b949e', 
                 fontSize: '0.75rem', 
                 whiteSpace: 'pre-wrap',
                 fontFamily: 'monospace'
                }}>
                 {terminalOutput}
               </span>

               {/* Renderizar casos de prueba si ya terminó (solo se usa en "Enviar Solución") */}
               {testResults.length > 0 && (
                 <div className="mt-3">
                   {testResults.map((res, i) => (
                     <div key={i} className="mb-1 d-flex align-items-center" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                       <span style={{ color: res.passed ? '#3fb950' : '#f85149', marginRight: '10px' }}>
                         {res.passed ? '[ PASS ]' : '[ FAIL ]'}
                       </span>
                       <span style={{ color: '#c9d1d9' }}>Caso {i + 1} </span>
                       {!res.passed && <span style={{ color: '#8b949e', marginLeft: '10px' }}>Salida: {res.output}</span>}
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;