import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProblem: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados base del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIO');
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [tags, setTags] = useState('');
  const [constraints, setConstraints] = useState('');
  const [starterCode, setStarterCode] = useState('def solution(input_data):\n    pass');

  // 👇 NUEVO ESTADO: Manejo dinámico de los casos de prueba
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isSample: true }
  ]);

  // Funciones para manejar los casos de prueba
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isSample: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    const newTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(newTestCases);
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación rápida: Al menos debe haber un caso de prueba válido
    if (testCases.length === 0 || testCases[0].input.trim() === '' || testCases[0].expectedOutput.trim() === '') {
      setError('Debes agregar al menos un caso de prueba con entrada y salida esperada.');
      return;
    }

    setLoading(true);
    setError(null);

    // Formatear los datos para el backend
    const payload = {
      title,
      description,
      difficulty,
      timeLimit: Number(timeLimit),
      memoryLimit: Number(memoryLimit),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      constraints: constraints.split('\n').filter(c => c.trim() !== ''),
      templates: [
        {
          language: "python",
          starterCode: starterCode
        }
      ],
      testCases: testCases // 👈 Ahora enviamos los casos creados en la UI
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.post(`${apiUrl}/problems`, payload);
      navigate('/problems');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el problema en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: '#c9d1d9', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Agregar Nuevo Problema</h2>
          <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>
            Añade un nuevo reto algorítmico y sus casos de evaluación.
          </p>
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/problems')}>
          Cancelar
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ backgroundColor: '#f8514922', color: '#ff7b72', border: '1px solid #f85149' }}>{error}</div>}

      <div className="card p-4" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
        <form onSubmit={handleSubmit}>
          
          {/* ... (Tus campos anteriores de Título, Descripción, Dificultad, etc. se mantienen igual) ... */}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Título del Problema</label>
            <input type="text" className="form-control bg-dark text-white border-secondary" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Alerta de Fallo Térmico" />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Descripción</label>
            <textarea className="form-control bg-dark text-white border-secondary" rows={4} required value={description} onChange={e => setDescription(e.target.value)} placeholder="El modelo de predicción recibe una serie temporal..." />
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Dificultad</label>
              <select className="form-select bg-dark text-white border-secondary" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="FÁCIL">FÁCIL</option>
                <option value="MEDIO">MEDIO</option>
                <option value="DIFÍCIL">DIFÍCIL</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Tiempo Límite (ms)</label>
              <input type="number" className="form-control bg-dark text-white border-secondary" required value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Memoria (MB)</label>
              <input type="number" className="form-control bg-dark text-white border-secondary" required value={memoryLimit} onChange={e => setMemoryLimit(Number(e.target.value))} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Etiquetas (Tags) - Separadas por coma</label>
            <input type="text" className="form-control bg-dark text-white border-secondary" value={tags} onChange={e => setTags(e.target.value)} placeholder="ALGORITMOS, SERIES TEMPORALES" />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Restricciones (Constraints) - Una por línea</label>
            <textarea className="form-control bg-dark text-white border-secondary" rows={3} value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="La serie temporal tendrá un mínimo de 1...&#10;Las temperaturas pueden ser números negativos..." />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#8b949e' }}>Código Base (Python)</label>
            <textarea className="form-control border-secondary" rows={3} value={starterCode} onChange={e => setStarterCode(e.target.value)} style={{ backgroundColor: '#0d1117', color: '#79c0ff', fontFamily: 'monospace' }} />
          </div>

          {/* ========================================================= */}
          {/* NUEVA SECCIÓN DINÁMICA: CASOS DE PRUEBA                   */}
          {/* ========================================================= */}
          <div className="mb-5 pt-3" style={{ borderTop: '1px solid #30363d' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="form-label fw-bold mb-0" style={{ fontSize: '0.9rem', color: '#c9d1d9' }}>Casos de Prueba (Evaluación)</label>
              <button type="button" className="btn btn-sm text-dark" style={{ backgroundColor: '#c9d1d9', fontWeight: 'bold' }} onClick={handleAddTestCase}>
                + Añadir Caso
              </button>
            </div>

            {testCases.map((tc, index) => (
              <div key={index} className="p-3 mb-3 rounded" style={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 'bold' }}>CASO #{index + 1}</span>
                  {testCases.length > 1 && (
                    <span style={{ color: '#f85149', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleRemoveTestCase(index)}>
                      ✕ Eliminar
                    </span>
                  )}
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '0.75rem', color: '#8b949e' }}>Entrada Estándar (Input)</label>
                    <textarea 
                      className="form-control form-control-sm bg-dark text-white border-secondary" 
                      rows={2} required
                      value={tc.input} 
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      placeholder="Ej: 25 28 35 34 36"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '0.75rem', color: '#8b949e' }}>Salida Esperada (Expected Output)</label>
                    <textarea 
                      className="form-control form-control-sm bg-dark text-white border-secondary" 
                      rows={2} required
                      value={tc.expectedOutput} 
                      onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                      placeholder="Ej: 5"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div className="mt-2 form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={tc.isSample}
                    onChange={(e) => handleTestCaseChange(index, 'isSample', e.target.checked)}
                  />
                  <label className="form-check-label" style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                    Mostrar como ejemplo público al estudiante
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn text-white px-4" style={{ backgroundColor: '#238636', fontWeight: 'bold' }} disabled={loading}>
              {loading ? 'Registrando en Mongo...' : 'Guardar Problema y Respuestas'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProblem;