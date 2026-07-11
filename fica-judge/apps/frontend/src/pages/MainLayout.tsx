// src/pages/MainLayout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const MainLayout: React.FC = () => {
  const location = useLocation();

  // Función para determinar si una ruta está activa
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Lista de opciones de navegación con iconos SVG limpios
  const navItems = [
    { path: '/dashboard', label: 'Dashboard Estudiante', icon: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem', marginRight: '2px' }}>&gt;_</span> },
    { path: '/problems', label: 'Ver Problemas', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
    { path: '/historial', label: 'Historial Envíos', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
    { path: '/rankings', label: 'Rankings Globales', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> },
    { path: '/assignments', label: 'Deberes y Exámenes', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg> },
    { path: '/calificaciones', label: 'Mis Calificaciones', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10M5 4v5a7 7 0 1 0 14 0V4M3 9a2 2 0 1 0 0-4h2M21 9a2 2 0 1 1 0-4h-2"></path></svg> },
    { path: '/perfil', label: 'Mi Perfil de Usuario', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
  ];

  return (
    <div className="d-flex w-100" style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ========================================================== */}
      {/* 1. BARRA LATERAL (SIDEBAR)                                 */}
      {/* ========================================================== */}
      <aside style={{ width: '270px', backgroundColor: '#010409', borderRight: '1px solid #30363d', minWidth: '270px' }} className="d-flex flex-column p-4"> {/* Ensanchado un poco y más padding (p-4) */}
        
        {/* Header del Sidebar */}
        <Link to="/inicio" className="d-flex align-items-center mb-5 mt-2 text-decoration-none" style={{ cursor: 'pointer' }}>
          {/* Logo actualizado al estilo de la captura */}
          <div style={{ backgroundColor: '#3fb950', color: '#010409', fontWeight: '900', padding: '6px 12px', borderRadius: '6px', marginRight: '14px', fontSize: '1rem', letterSpacing: '0.5px' }}>
            FJ
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              FICA-JUDGE <span style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#ff7b72', border: '1px solid rgba(248, 81, 73, 0.4)', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '12px', verticalAlign: 'middle', marginLeft: '4px' }}>LIVE</span>
            </h6>
            <small style={{ color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.5px', fontFamily: 'monospace' }}>DISTRIBUTED SANDBOX V2.4</small>
          </div>
        </Link>

        {/* Links de Navegación del Portal */}
        <nav className="nav flex-column mb-auto mt-2 position-relative">
          <small className="mb-4 fw-bold d-block text-uppercase" style={{ color: '#57606a', fontSize: '0.7rem', letterSpacing: '1.5px', paddingLeft: '12px' }}> {/* Margen inferior ampliado (mb-4) */}
            PORTAL ESTUDIANTES
          </small>
          
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className="d-flex align-items-center text-decoration-none position-relative"
                style={{ 
                  padding: '12px 16px', // Más relleno interno
                  marginBottom: '8px',  // Más separación entre botones
                  color: active ? '#3fb950' : '#8b949e',
                  fontWeight: active ? '600' : '500',
                  fontSize: '0.88rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: active ? 'rgba(63, 185, 80, 0.05)' : 'transparent' // Fondo sutil si está activo
                }}
              >
                {/* La famosa barra verde lateral para el item activo */}
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: '-24px', // Ajustado por el nuevo padding del aside
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '60%',
                    width: '4px',
                    backgroundColor: '#3fb950',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                
                <div className="d-flex align-items-center justify-content-center me-3" style={{ width: '22px' }}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Estado de los Microservicios */}
        <div className="mt-auto border-top pt-4" style={{ borderColor: '#30363d' }}>
          <small className="mb-3 d-block fw-bold text-uppercase" style={{ color: '#57606a', fontSize: '0.7rem', letterSpacing: '1.5px' }}>
            ⧉ MICROSERVICIOS STATUS
          </small>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>API Gateway</span> <span style={{ color: '#3fb950', fontWeight: 'bold' }}>99.9%</span>
          </div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>RabbitMQ Broker</span> <span style={{ color: '#3fb950', fontWeight: 'bold' }}>● ONLINE</span>
          </div>
          <div className="d-flex justify-content-between mb-4" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#8b949e' }}>Sandbox Judge</span> <span style={{ color: '#3fb950', fontWeight: 'bold' }}>● 4 Pods</span>
          </div>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 2. AREA DE CONTENIDO                                       */}
      {/* ========================================================== */}
      <main className="flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
        
        {/* Header Superior (Buscador y Usuario) */}
        <header className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid #30363d', backgroundColor: '#0d1117', minHeight: '72px' }}> {/* Padding horizontal aumentado (px-4) */}
          <div className="d-flex align-items-center flex-grow-1 me-4">
            {/* Buscador centralizado y estilizado */}
            <div className="position-relative w-100" style={{ maxWidth: '450px', margin: '0 auto' }}>
              <span className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text" 
                className="form-control text-light shadow-none" 
                placeholder="Buscar problemas, algoritmos o IDs..." 
                style={{ backgroundColor: '#010409', border: '1px solid #30363d', borderRadius: '6px', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="me-4" style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: '500' }}>
              ● Rol: Estudiante ▼
            </span>
            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
              <div className="rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#30363d', color: '#8b949e' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px' }} className="text-white">
                JEFFERSON
              </span>
            </div>
          </div>
        </header>

        {/* Contenedor Principal (Outlet) CON PADDING RESTAURADO */}
        <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}> {/* <-- Aquí está el p-4 vital que faltaba */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;