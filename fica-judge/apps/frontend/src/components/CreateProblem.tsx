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

  // Estructuras complejas por defecto (basado en tu JSON)
  const defaultTemplate = `from typing import List\n\nclass Solution:\n    def longest_thermal_runaway(self, temps: List[int]) -> int:\n        pass`;
  const [starterCode, setStarterCode] = useState(defaultTemplate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Formatear los datos para que coincidan con tu esquema de Mongoose
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
      testCases: [
        { input: "25 28 35 34 36 40 45 50 49", expectedOutput: "5", isSample: true },
        { input: "50 40 30 20", expectedOutput: "1", isSample: true }
      ]
    };

    try {
      // Usamos la variable de entorno, si no existe, cae en localhost
      const apiUrl = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3002';
      
      await axios.post(`${apiUrl}/problems`, payload);
      
      // Si todo sale bien, redirigimos al listado de problemas
      navigate('/problems');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el problema en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: '#c9d1d9', maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Agregar Nuevo Problema</h2>
          <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>
            Añade un nuevo reto algorítmico al catálogo de MongoDB.
          </p>
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/problems')}>
          Cancelar
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ backgroundColor: '#f8514922', color: '#ff7b72', border: '1px solid #f85149' }}>{error}</div>}

      <div className="card p-4" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
        <form onSubmit={handleSubmit}>
          
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
            <textarea className="form-control border-secondary" rows={5} value={starterCode} onChange={e => setStarterCode(e.target.value)} style={{ backgroundColor: '#0d1117', color: '#79c0ff', fontFamily: 'monospace' }} />
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn text-white px-4" style={{ backgroundColor: '#238636', fontWeight: 'bold' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Problema'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProblem;