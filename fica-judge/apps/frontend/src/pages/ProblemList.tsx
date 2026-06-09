import axios from 'axios';
import { useEffect, useState } from 'react';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('http://localhost:3002/problems');
        setProblems(response.data);
      } catch (error) {
        console.error("Error al cargar problemas:", error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <h1>Lista de Problemas</h1>
      {problems.length > 0 ? (
        <ul>
          {problems.map((problem: any) => (
            <li key={problem._id} style={{ marginBottom: '10px' }}>
              <strong>{problem.title}</strong> - {problem.difficulty}
            </li>
          ))}
        </ul>
      ) : (
        <p>Cargando problemas...</p>
      )}
    </div>
  );
};

// ESTA LÍNEA SOLUCIONA EL ERROR QUE TENÍAS
export default ProblemList;