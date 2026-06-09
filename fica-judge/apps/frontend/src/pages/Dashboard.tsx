import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// 1. DATOS DE PRUEBA (Mocks) basados en tu diseño. 
// Luego los reemplazaremos por una llamada Axios a MongoDB.
const MOCK_PROBLEMS = [
  { id: '1', category: 'ESTRUCTURA DE DATOS', title: 'Suma de Dos Parámetros Async', difficulty: 'FÁCIL', desc: 'En una arquitectura de microservicios orientada a eventos, necesitas sumar dos enteros representando cargas de transacciones. Escribe una solución que optimice el paso por referencia de memoria.', accepted: '91% (320/350)', time: '1200ms', memory: '128MB' },
  { id: '2', category: 'ALGORITMOS DE BÚSQUEDA', title: 'Búsqueda Binaria en logs CQRS', difficulty: 'MEDIO', desc: 'Dado un arreglo ordenado de IDs de eventos procesados en orden cronológico por nuestro Command Handlers, determina en complejidad temporal O(log N) si un ID específico fue registrado.', accepted: '69% (145/210)', time: '800ms', memory: '256MB' },
  { id: '3', category: 'SISTEMAS DISTRIBUIDOS', title: 'Balanceador de Mensajes RabbitMQ', difficulty: 'DIFÍCIL', desc: 'Implementa un algoritmo de despacho que determine la carga óptima para un clúster distribuido de RabbitMQ. Debes retornar el menor costo energético con base en colas balanceadas.', accepted: '23% (22/94)', time: '2500ms', memory: '512MB' },
  { id: '4', category: 'TEORÍA DE GRAFOS', title: 'Detección de Ciclos de Permiso en JWT', difficulty: 'MEDIO', desc: 'Verifica si una cadena jerárquica de permisos basada en roles genera un bucle de dependencia infinita que bloquea el API Gateway del sistema.', accepted: '68% (88/130)', time: '1500ms', memory: '256MB' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('fj_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('fj_token');
    localStorage.removeItem('fj_user');
    navigate('/');
  };

  // Función auxiliar para colorear la dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'FÁCIL': return '#3fb950'; // Verde Github oscuro
      case 'MEDIO': return '#d29922'; // Naranja
      case 'DIFÍCIL': return '#f85149'; // Rojo
      default: return '#fff';
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside style={{ width: '260px', backgroundColor: '#010409', borderRight: '1px solid #30363d' }} className="d-flex flex-column p-3">
        <div className="d-flex align-items-center mb-4 mt-2">
          <div style={{ backgroundColor: '#238636', color: '#fff', fontWeight: 'bold', padding: '5px 10px', borderRadius: '4px', marginRight: '10px' }}>FJ</div>
          <div>
            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>FICA-JUDGE <span className="badge bg-danger ms-1" style={{ fontSize: '0.6rem' }}>LIVE</span></h6>
            <small className="text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>DISTRIBUTED SANDBOX V2.4</small>
          </div>
        </div>

        <nav className="nav flex-column mb-auto mt-2">
          <small className="text-muted mb-2 fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>PORTAL ESTUDIANTES</small>
          <a href="#" className="nav-link text-muted py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem' }}>&gt;_ Dashboard Estudiante</a>
          <a href="#" className="nav-link text-white py-2 px-3 rounded mb-1 d-flex align-items-center" style={{ backgroundColor: '#161b22', borderLeft: '3px solid #238636', fontSize: '0.85rem' }}>
            <span className="me-2">📖</span> Ver Problemas
          </a>
          <a href="#" className="nav-link text-muted py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem' }}>🕒 Historial Envíos</a>
          <a href="#" className="nav-link text-muted py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem' }}>📊 Rankings Globales</a>
          <a href="#" className="nav-link text-muted py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem' }}>🏆 Torneos Académicos</a>
          <a href="#" className="nav-link text-muted py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem' }}>👤 Mi Perfil de Usuario</a>
        </nav>

        <div className="mt-auto">
          <small className="text-muted mb-2 d-block fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}># MICROSERVICIOS STATUS</small>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span>API Gateway</span> <span style={{ color: '#3fb950' }}>99.9%</span>
          </div>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span>RabbitMQ Broker</span> <span style={{ color: '#3fb950' }}>● ONLINE</span>
          </div>
          <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem' }}>
            <span>Sandbox Judge</span> <span style={{ color: '#3fb950' }}>● 4 Pods</span>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 d-flex flex-column">
        
        {/* BARRA SUPERIOR (TOPBAR) */}
        <header className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid #30363d', backgroundColor: '#0d1117' }}>
          <div className="d-flex align-items-center w-50">
            <span className="text-muted me-4" style={{ fontSize: '0.85rem' }}>📄 Plano Arquitectura & Fases</span>
            {/* Buscador */}
            <input 
              type="text" 
              className="form-control form-control-sm bg-dark text-light border-secondary w-75" 
              placeholder="🔍 Buscar problemas, algoritmos o IDs..." 
              style={{ backgroundColor: '#010409 !important', color: '#c9d1d9' }}
            />
          </div>
          
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-success me-3 py-1" style={{ fontSize: '0.75rem' }}>((•)) SIMULAR WEBSOCKETS</button>
            <span className="text-muted me-3" style={{ fontSize: '0.8rem' }}>● Rol: Estudiante ▼</span>
            
            <div className="dropdown">
              <button className="btn btn-dark btn-sm dropdown-toggle rounded-pill px-3" type="button" data-bs-toggle="dropdown" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                {user.lastName ? user.lastName.toUpperCase() : 'ESTUDIANTE'}
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li><button className="dropdown-item text-danger" onClick={handleLogout}>Cerrar Sesión</button></li>
              </ul>
            </div>
          </div>
        </header>

        {/* ÁREA DEL BANCO DE PROBLEMAS */}
        <div className="p-4" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="d-flex justify-content-between align-items-end mb-1">
            <h3 className="fw-bold mb-0 text-white">Banco Universitario de Problemas</h3>
            {/* Buscador secundario (derecha) */}
            <input type="text" className="form-control form-control-sm w-25 bg-dark text-light border-secondary" placeholder="🔍 Filtrar problemas..." />
          </div>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Material de optimización calificado asíncronamente por nuestros evaluadores Docker.</p>
          
          {/* BARRA DE FILTROS */}
          <div className="d-flex align-items-center p-3 mb-4 rounded" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', fontSize: '0.85rem' }}>
            <span className="me-4 text-muted">▽ FILTROS RÁPIDOS</span>
            <span className="me-4" style={{ color: '#3fb950', cursor: 'pointer' }}>Completo</span>
            <span className="me-4 text-muted" style={{ cursor: 'pointer' }}>Fácil</span>
            <span className="me-4 text-muted" style={{ cursor: 'pointer' }}>Medio</span>
            <span className="me-4 text-muted" style={{ cursor: 'pointer' }}>Difícil</span>
            <span className="me-auto text-muted">Todas las Categorías ▽</span>
            <span className="text-muted">{MOCK_PROBLEMS.length} problemas indexados</span>
          </div>

          {/* GRID DE PROBLEMAS */}
          <div className="row g-4">
            {MOCK_PROBLEMS.map((prob) => (
              <div key={prob.id} className="col-md-6">
                <div className="card h-100 p-3 problem-card" style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', cursor: 'pointer' }}>
                  
                  {/* Etiqueta y Dificultad */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{prob.category}</small>
                    <small className="fw-bold" style={{ color: getDifficultyColor(prob.difficulty), fontSize: '0.75rem' }}>{prob.difficulty}</small>
                  </div>
                  
                  {/* Título y Descripción */}
                  <h6 className="text-white fw-bold mb-2">{prob.title}</h6>
                  <p className="text-muted mb-4" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{prob.desc}</p>
                  
                  {/* Footer de la tarjeta */}
                  <div className="mt-auto d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>Aceptados: {prob.accepted}</span>
                    <span>Límite: {prob.time} / {prob.memory}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      
      {/* Estilos CSS integrados para hover de las tarjetas */}
      <style>{`
        .problem-card:hover {
          border-color: #8b949e !important;
          transition: border-color 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;