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
        const token = localStorage.getItem('token');
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
    return <div className="flex h-screen items-center justify-center bg-[#0d1117] text-white">Cargando evaluaciones...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-8 text-gray-300">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Deberes y Exámenes Prácticos</h1>
        <p className="mt-2 text-sm text-gray-400">Selecciona una evaluación para comenzar. Ten en cuenta las fechas límite.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => {
          const isOpen = isAssignmentOpen(assignment.startDate, assignment.endDate);
          
          return (
            <div key={assignment.id} className="flex flex-col rounded-lg border border-gray-700 bg-[#161b22] p-6 shadow-lg transition-transform hover:-translate-y-1">
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-xs font-semibold tracking-wider ${assignment.type === 'EXAMEN' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                  {assignment.type}
                </span>
                <span className="text-sm font-medium text-gray-400">Max: {assignment.maxScore} pts</span>
              </div>
              
              <h2 className="mb-4 text-xl font-bold text-white">{assignment.title}</h2>
              
              <div className="mb-6 flex flex-col space-y-2 text-sm text-gray-400">
                <p><strong>Apertura:</strong> {new Date(assignment.startDate).toLocaleString()}</p>
                <p><strong>Cierre:</strong> {new Date(assignment.endDate).toLocaleString()}</p>
                <p className="text-yellow-500"><strong>Penalización:</strong> -{assignment.penaltyPerAttempt} pts por fallo</p>
              </div>

              <button
                onClick={() => navigate(`/assignments/${assignment.id}`)}
                disabled={!isOpen}
                className={`mt-auto rounded-md px-4 py-2 font-bold transition-colors ${
                  isOpen 
                    ? 'bg-green-600 text-white hover:bg-green-500' 
                    : 'cursor-not-allowed bg-gray-700 text-gray-500'
                }`}
              >
                {isOpen ? 'Ingresar a la Evaluación' : 'Fuera de Fecha'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsList;