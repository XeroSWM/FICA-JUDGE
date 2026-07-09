// src/pages/MainLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const MainLayout: React.FC = () => {
  return (
    <div className="d-flex w-100" style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ========================================================== */}
      {/* 1. BARRA LATERAL (SIDEBAR)                                 */}
      {/* ========================================================== */}
      <aside style={{ width: '260px', backgroundColor: '#010409', borderRight: '1px solid #30363d', minWidth: '260px' }} className="d-flex flex-column p-3">
        
        {/* Header del Sidebar */}
        <Link to="/inicio" className="d-flex align-items-center mb-4 mt-2 text-decoration-none" style={{ cursor: 'pointer' }}>
          <div style={{ backgroundColor: '#238636', color: '#fff', fontWeight: 'bold', padding: '5px 10px', borderRadius: '4px', marginRight: '10px', fontSize: '0.9rem' }}>FJ</div>
          <div>
            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
              FICA-JUDGE <span className="badge bg-danger ms-1" style={{ fontSize: '0.6rem' }}>LIVE</span>
            </h6>
            <small style={{ color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.5px' }}>DISTRIBUTED SANDBOX V2.4</small>
          </div>
        </Link>

        {/* Links de Navegación del Portal */}
        <nav className="nav flex-column mb-auto mt-2">
          <small className="mb-2 fw-bold d-block" style={{ color: '#8b949e', fontSize: '0.65rem', letterSpacing: '1px' }}>PORTAL ESTUDIANTES</small>
          
          <Link to="/dashboard" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">&gt;_</span> Dashboard Estudiante
          </Link>
          <Link to="/problems" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">📖</span> Ver Problemas
          </Link>
          
          <Link to="/historial" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">🕒</span> Historial Envíos
          </Link>
          
          <Link to="/rankings" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">📊</span> Rankings Globales
          </Link>

          {/* 👇 ENLACE A DEBERES Y EXÁMENES ACTIVADO 👇 */}
          <Link to="/assignments" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">📝</span> Deberes y Exámenes
          </Link>

          <a href="#" className="nav-link py-2 px-3 rounded mb-1" style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            <span className="me-2">👤</span> Mi Perfil de Usuario
          </a>
        </nav>

        {/* Estado de los Microservicios */}
        <div className="mt-auto">
          <small className="mb-2 d-block fw-bold" style={{ color: '#8b949e', fontSize: '0.65rem', letterSpacing: '1px' }}># MICROSERVICIOS STATUS</small>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>API Gateway</span> <span style={{ color: '#3fb950' }}>99.9%</span>
          </div>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>RabbitMQ Broker</span> <span style={{ color: '#3fb950' }}>● ONLINE</span>
          </div>
          <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>Sandbox Judge</span> <span style={{ color: '#3fb950' }}>● 4 Pods</span>
          </div>

          <div className="p-2 rounded mb-2" style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '0.7rem', color: '#8b949e' }}>
            Blueprints Manual <span className="float-end" style={{ cursor: 'pointer' }}>ⓘ</span>
          </div>
          <div style={{ fontSize: '0.6rem', color: '#8b949e' }}>
            <div>FICA-JUDGE © 2026</div>
            <div>EST: UTC-5, Cloud Native</div>
          </div>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 2. AREA DE CONTENIDO                                       */}
      {/* ========================================================== */}
      <main className="flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
        
        <header className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid #30363d', backgroundColor: '#0d1117' }}>
          <div className="d-flex align-items-center flex-grow-1 me-3">
            <input 
              type="text" 
              className="form-control form-control-sm text-light" 
              placeholder="Buscar problemas, algoritmos o IDs..." 
              style={{ backgroundColor: '#010409', borderColor: '#30363d', maxWidth: '400px' }}
            />
          </div>
          
          <div className="d-flex align-items-center">
            <span className="me-3" style={{ color: '#8b949e', fontSize: '0.8rem' }}>● Rol: Estudiante ▼</span>
            <div className="d-flex align-items-center" style={{ padding: '2px 10px', backgroundColor: '#161b22', borderRadius: '20px', border: '1px solid #30363d' }}>
              <div className="rounded-circle bg-secondary me-2" style={{ width: '24px', height: '24px' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }} className="text-white">JEFFERSON</span>
            </div>
          </div>
        </header>

        <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;