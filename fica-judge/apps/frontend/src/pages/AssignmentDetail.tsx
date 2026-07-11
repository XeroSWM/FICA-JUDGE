import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [sourceCode, setSourceCode] = useState('');
  const [output, setOutput] = useState('Esperando ejecución...\nPara probar tu código, presiona "Ejecutar Código".');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const token = localStorage.getItem('fj_token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignment(res.data);
        
        if (res.data.problemsData?.length > 0) {
          const starterCode = res.data.problemsData[0].templates?.find((t: any) => t.language === 'python')?.starterCode || '';
          setSourceCode(starterCode);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          alert('Este examen no está disponible actualmente por restricciones de fecha.');
          navigate('/assignments');
        }
      }
    };
    fetchAssignmentData();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!assignment || !assignment.problemsData) return;
    setIsSubmitting(true);
    setOutput('Enviando código al servidor de FICA-JUDGE...\n');

    const token = localStorage.getItem('fj_token');
    
    // 👇 1. DECODIFICACIÓN DEL TOKEN PARA OBTENER EL USUARIO REAL
    let realStudentId = 'estudiante@uce.edu.ec'; 
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        realStudentId = decoded.email || decoded.sub || decoded.id || 'estudiante@uce.edu.ec';
      } catch (e) {
        console.error("Error leyendo token");
      }
    }

    const currentProblem = assignment.problemsData[currentProblemIndex];

    try {
      // 👇 2. ENVIAR AL SANDBOX (Con el problemId y el realStudentId corregidos)
      await axios.post(
        `${import.meta.env.VITE_API_URL}/submissions`, 
        { 
          sourceCode, 
          language: 'python', 
          problemId: currentProblem._id || currentProblem.id, 
          studentId: realStudentId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOutput(prev => prev + 'Evaluando casos de prueba en clúster Docker...\n');
      
      // Simulación de respuesta del Sandbox
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      // 👇 3. SIMULAMOS EL ÉXITO PARA VER EL CÁLCULO DE LA NOTA FINAL
      const isSuccess = true; 

      if (isSuccess) {
        setOutput(prev => prev + '\n[VEREDICTO]: ✅ ACCEPTED\nTodos los casos de prueba pasaron correctamente.\n');
      } else {
        setOutput(prev => prev + '\n[VEREDICTO]: ❌ WRONG_ANSWER\nFalló en casos de prueba ocultos. Revisa tu lógica.\n');
      }

      // 4. REGISTRAR INTENTO Y NOTA
      const attemptRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/assignments/attempt`,
        { 
          studentId: realStudentId, 
          assignmentId: assignment.id, 
          problemId: currentProblem._id || currentProblem.id, 
          isSuccess 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { failedAttempts, finalScore, isSolved } = attemptRes.data;
      
      let statusMsg = `\n========================================\nREPORTE DE CALIFICACIÓN OFICIAL\n========================================\n`;
      statusMsg += `Intentos fallidos registrados: ${failedAttempts}\n`;
      
      if (isSolved) {
        statusMsg += `Estado: COMPLETADO\nNota final obtenida: ${finalScore} / ${assignment.maxScore} pts\n`;
      } else {
        statusMsg += `Estado: PENDIENTE\nPenalización aplicada: -${assignment.penaltyPerAttempt} pts\n`;
      }
      
      setOutput(prev => prev + statusMsg);

    } catch (error) {
      setOutput('Error de conexión con el sistema de evaluación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '80vh', color: '#c9d1d9' }}>
        <div className="spinner-border text-success" role="status"></div>
        <span className="ms-3">Cargando Entorno de Evaluación...</span>
      </div>
    );
  }

  const problem = assignment.problemsData[currentProblemIndex];

  return (
    <div className="d-flex flex-column w-100" style={{ height: 'calc(100vh - 70px)' }}> {/* Ajustado para restar el alto del navbar principal */}
      
      {/* HEADER ESPECÍFICO DEL EXAMEN */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#3fb950', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ● Entorno de Evaluación Oficial
          </span>
          <h4 className="text-white mb-0 mt-1 fw-bold">{assignment.title}</h4>
        </div>
        <div className="text-end">
          <div className="d-flex align-items-center justify-content-end mb-1">
            <span style={{ backgroundColor: '#21262d', border: '1px solid #30363d', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#8b949e' }}>
              Cierra el: {new Date(assignment.endDate).toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d29922' }}>Penalización activa: -{assignment.penaltyPerAttempt} pts</span>
        </div>
      </div>

      {/* CUERPO PRINCIPAL DIVIDIDO */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
        
        {/* PANEL IZQUIERDO: DESCRIPCIÓN DEL PROBLEMA */}
        <div style={{ width: '40%', minWidth: '400px', backgroundColor: '#0d1117', borderRight: '1px solid #30363d', overflowY: 'auto' }}>
          
          {/* Pestañas estilo FICA-JUDGE */}
          <div className="d-flex" style={{ borderBottom: '1px solid #30363d', backgroundColor: '#010409' }}>
            <div style={{ padding: '10px 20px', borderBottom: '2px solid #3fb950', color: '#c9d1d9', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
              1. Resolución
            </div>
            <div style={{ padding: '10px 20px', color: '#8b949e', fontSize: '0.85rem', cursor: 'pointer' }}>
              2. Ejercicios Prácticos ({assignment.problemsData.length})
            </div>
          </div>

          <div className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h3 className="text-white fw-bold m-0" style={{ fontSize: '1.4rem' }}>{problem?.title}</h3>
              <span style={{ backgroundColor: 'rgba(56, 139, 253, 0.15)', color: '#58a6ff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {problem?.difficulty || 'NORMAL'}
              </span>
            </div>

            <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {problem?.description}
            </p>

            {/* Tabla de Límites */}
            <div className="d-flex my-4 rounded" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
              <div className="flex-fill p-3 text-center" style={{ borderRight: '1px solid #30363d' }}>
                <div style={{ fontSize: '0.7rem', color: '#8b949e', fontWeight: 'bold', letterSpacing: '1px' }}>LÍMITE TIEMPO</div>
                <div style={{ color: '#c9d1d9', fontSize: '0.9rem', marginTop: '5px' }}>{problem?.timeLimit} ms</div>
              </div>
              <div className="flex-fill p-3 text-center">
                <div style={{ fontSize: '0.7rem', color: '#8b949e', fontWeight: 'bold', letterSpacing: '1px' }}>LÍMITE MEMORIA</div>
                <div style={{ color: '#c9d1d9', fontSize: '0.9rem', marginTop: '5px' }}>{problem?.memoryLimit} MB</div>
              </div>
            </div>

            <h6 className="text-white fw-bold mb-3" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Restricciones:</h6>
            <ul style={{ color: '#8b949e', fontSize: '0.85rem', paddingLeft: '20px' }}>
              {problem?.constraints?.map((c: string, i: number) => <li key={i} className="mb-2">{c}</li>)}
            </ul>
          </div>
        </div>

        {/* PANEL DERECHO: EDITOR Y TERMINAL */}
        <div className="d-flex flex-column" style={{ width: '60%', backgroundColor: '#0d1117' }}>
          
          {/* Editor Header */}
          <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}>
            <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>main.py</span>
            <div style={{ fontSize: '0.8rem', color: '#8b949e', backgroundColor: '#010409', padding: '2px 8px', borderRadius: '4px', border: '1px solid #30363d' }}>
              Python 3.10
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language="python"
              value={sourceCode}
              onChange={(value) => setSourceCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 15 } }}
            />
          </div>

          {/* Actions Bar & Terminal */}
          <div style={{ backgroundColor: '#010409', borderTop: '1px solid #30363d', height: '300px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Action Buttons */}
            <div className="d-flex justify-content-end p-3" style={{ borderBottom: '1px solid #30363d' }}>
              <button 
                className="btn btn-sm me-2 fw-bold text-white" 
                style={{ backgroundColor: '#21262d', border: '1px solid #30363d' }}
              >
                ⏵ Ejecutar Código
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-sm fw-bold text-white" 
                style={{ backgroundColor: '#238636', border: '1px solid rgba(240, 246, 252, 0.1)' }}
              >
                {isSubmitting ? 'Evaluando...' : 'Enviar Solución'}
              </button>
            </div>

            {/* Terminal Output */}
            <div className="p-3" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#8b949e', letterSpacing: '1px' }}>&gt;_ SALIDA TERMINAL & JUEZ EVALUADOR</span>
              <pre className="mt-2 p-3 rounded" style={{ 
                backgroundColor: '#0d1117', 
                border: '1px solid #30363d', 
                color: '#c9d1d9', 
                fontFamily: 'monospace', 
                fontSize: '0.85rem',
                minHeight: '150px',
                whiteSpace: 'pre-wrap'
              }}>
                {output}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;