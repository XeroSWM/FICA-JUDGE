// src/pages/Inicio.tsx
import React from 'react';

const Inicio: React.FC = () => {
  return (
    <div>
      {/* Tags Superiores */}
      <div className="mb-2">
        <span style={{ color: '#58a6ff', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>PLANO TÉCNICO</span>
        <span className="ms-2 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(56, 139, 253, 0.15)', color: '#58a6ff', fontSize: '0.65rem' }}>COMPLETO</span>
      </div>

      <h2 className="fw-bold text-white mb-2">FICA-JUDGE: Arquitectura Frontend y Wireframes</h2>
      
      <p className="mb-4 col-xl-9" style={{ color: '#c9d1d9', fontSize: '0.9rem', lineHeight: '1.6' }}>
        Documento técnico interactivo que describe los patrones arquitectónicos, estructuración modular React + Bootstrap, 
        seguridad de enrutamiento por roles, plano de WebSockets síncronos y plan de escalado por fases para la plataforma distribuida de evaluación.
      </p>

      {/* Grid de Tarjetas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100 p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
            <div className="mb-2" style={{ fontSize: '1.2rem', color: '#3fb950' }}>📋</div>
            <h6 className="text-white fw-bold mb-2">Arquitectura Desacoplada</h6>
            <p className="mb-0" style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: '1.5' }}>
              Consumo asíncrono optimizado mediante <span style={{ color: '#c9d1d9', fontWeight: '500' }}>Axios interceptors</span> orientando los flujos a un API Gateway centralizado, 
              implementando patrones de caché local de veredictos y paginado diferido.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
            <div className="mb-2" style={{ fontSize: '1.2rem', color: '#58a6ff' }}>((•))</div>
            <h6 className="text-white fw-bold mb-2">Event-Driven WebSockets</h6>
            <p className="mb-0" style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: '1.5' }}>
              Sincronización síncrona mediante subscripción a colas virtuales RabbitMQ mapeadas directamente a sockets, 
              permitiendo actualización viva de la cola de envíos ("Pending" &rarr; "Accepted" o "T.L.E.").
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
            <div className="mb-2" style={{ fontSize: '1.2rem', color: '#f85149' }}>🛡️</div>
            <h6 className="text-white fw-bold mb-2">Rutas Protegidas (RBAC)</h6>
            <p className="mb-0" style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: '1.5' }}>
              Middleware Router jerárquico. El token <span style={{ color: '#c9d1d9', fontWeight: '500' }}>JWT</span> descriptivo inyecta las claims de rol, 
              ocultando links en la barra lateral y bloqueando accesos por CLI/Iframe.
            </p>
          </div>
        </div>
      </div>

      {/* Estructura de Carpetas */}
      <div className="card p-3" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
        <div className="d-flex align-items-center mb-2">
          <span className="me-2" style={{ fontSize: '1.1rem', color: '#3fb950' }}>📁</span>
          <h6 className="text-white fw-bold mb-0">Estructura de Carpetas FICA-JUDGE (Frontend React)</h6>
        </div>
        <p className="mb-3" style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: '1.5' }}>
          Diseño jerárquico bajo estándares corporativos SaaS, agrupado por módulos auto-contenidos, distinguiendo capas físicas de lógica global, 
          componentes modulares y páginas de profesores/administradores.
        </p>
        <pre className="p-3 m-0 rounded" style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#79c0ff', fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace', fontSize: '0.85rem', overflowX: 'auto', lineHeight: '1.5' }}>
{`fica-judge-frontend/
├── .env.example          # Variables de entorno modelo (API_URL, WS_ENDPOINT)
├── package.json          # Dependencias (React, Bootstrap 5, Lucide, Recharts)
├── tsconfig.json         # Reglas de compilación y paths alternativos (@/*)
├── vite.config.ts        # Configuración del bundler y proxies del API Gateway
├── index.html            # Plantilla entry-point del DOM
└── src/
    ├── main.tsx          # Bootstrap de React 19 y stylesheets globales
    ├── App.tsx           # Router maestro y Guardianes de Ruta Privada
    ├── assets/           # Media estática, logos oficiales e imágenes corporativas
    ├── components/       # Átomos reutilizables globales (Cards, Spinners, Badges)
    └── pages/            # Controladores de interfaces de pantalla completa
        ├── Auth.tsx      # Terminal de login unificado y registro
        ├── MainLayout.tsx# Capa Maestra de Layout (Sidebar + Top Navigation)
        ├── Dashboard.tsx # Plano de Arquitectura e Inducción de bienvenida
        └── ProblemList.tsx# Micro-interfaz conectada a Catálogo Mongo`}
        </pre>
      </div>
    </div>
  );
};

export default Inicio;