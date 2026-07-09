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
  const [output, setOutput] = useState('Esperando ejecución...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignment(res.data);
        
        // Cargar el código inicial del primer problema
        if (res.data.problemsData?.length > 0) {
          const starterCode = res.data.problemsData[0].templates?.find((t: any) => t.language === 'python')?.starterCode || '';
          setSourceCode(starterCode);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          alert('Este examen está fuera de fecha.');
          navigate('/assignments');
        }
      }
    };
    fetchAssignmentData();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!assignment || !assignment.problemsData) return;
    setIsSubmitting(true);
    setOutput('Enviando código al servidor...');

    const token = localStorage.getItem('token');
    const studentEmail = localStorage.getItem('userEmail'); // O de donde saques el ID del estudiante en el front
    const currentProblem = assignment.problemsData[currentProblemIndex];

    try {
      // 1. Enviar al microservicio de Submissions (Sandbox)
      const submitRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/submissions`, 
        {
          sourceCode,
          language: 'python',
          problemId: currentProblem.id,
          studentId: studentEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Simulación de polling rápido para el ejemplo (Ajusta a tu lógica real de websockets o polling)
      setOutput('Evaluando casos de prueba en Docker...');
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      // Asumimos que obtienes el veredicto final aquí. Simularemos un WRONG_ANSWER para probar la gamificación.
      // Cambia esta variable dinámicamente con la respuesta de tu servidor real.
      const isSuccess = false; 

      if (isSuccess) {
        setOutput('✅ ACCEPTED: Todos los casos pasaron.');
      } else {
        setOutput('❌ WRONG_ANSWER: Falló en algunos casos de prueba.');
      }

      // 2. Registrar el intento en el microservicio de Assignments
      const attemptRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/assignments/attempt`,
        {
          studentId: studentEmail,
          assignmentId: assignment.id,
          problemId: currentProblem.id,
          isSuccess: isSuccess
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { failedAttempts, finalScore, isSolved } = attemptRes.data;
      
      let statusMsg = `\n\n--- REPORTE DE CALIFICACIÓN ---\nIntentos fallidos: ${failedAttempts}`;
      if (isSolved) {
        statusMsg += `\n¡Problema Resuelto! Nota final: ${finalScore} / ${assignment.maxScore}`;
      } else {
        statusMsg += `\nPenalización acumulada. Te quedan menos puntos potenciales.`;
      }
      
      setOutput(prev => prev + statusMsg);

    } catch (error) {
      setOutput('Error del sistema al evaluar la entrega.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return <div className="bg-[#0d1117] text-white p-8">Cargando entorno...</div>;

  const problem = assignment.problemsData[currentProblemIndex];

  return (
    <div className="flex h-screen flex-col bg-[#0d1117] text-gray-300 font-sans">
      {/* Top Header - FICA-JUDGE Style */}
      <header className="flex items-center justify-between bg-[#161b22] p-4 border-b border-gray-700">
        <div>
          <span className="text-xs font-bold text-green-500 tracking-widest uppercase">Entorno de Evaluación Oficial</span>
          <h1 className="text-xl font-bold text-white mt-1">{assignment.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-yellow-500 font-medium">Penalización: -{assignment.penaltyPerAttempt} pts por fallo</p>
          <p className="text-xs text-gray-500 mt-1">Cierra: {new Date(assignment.endDate).toLocaleString()}</p>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-[#0d1117] p-6">
          <div className="mb-4 flex space-x-2">
            {assignment.problemsData.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`px-3 py-1 rounded text-sm ${currentProblemIndex === idx ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                Ejercicio {idx + 1}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{problem?.title}</h2>
          
          <div className="flex space-x-4 mb-6 text-xs text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded">Límite: {problem?.timeLimit}ms</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Memoria: {problem?.memoryLimit}MB</span>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-gray-300">
            <p>{problem?.description}</p>
            
            <h3 className="text-white mt-6 mb-2 font-semibold border-b border-gray-700 pb-1">Restricciones:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              {problem?.constraints?.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>

        {/* Right Panel: Editor & Terminal */}
        <div className="flex flex-1 flex-col">
          {/* Editor */}
          <div className="flex-1 border-b border-gray-700">
            <Editor
              height="100%"
              theme="vs-dark"
              language="python"
              value={sourceCode}
              onChange={(value) => setSourceCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>

          {/* Terminal / Output */}
          <div className="h-64 bg-[#010409] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 tracking-wider">SALIDA DE TERMINAL</span>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 font-bold rounded ${isSubmitting ? 'bg-gray-600 text-gray-400 cursor-wait' : 'bg-green-600 text-white hover:bg-green-500 transition-colors'}`}
              >
                {isSubmitting ? 'Ejecutando...' : 'Enviar Solución'}
              </button>
            </div>
            <pre className="flex-1 p-3 rounded bg-black border border-gray-800 text-gray-300 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;