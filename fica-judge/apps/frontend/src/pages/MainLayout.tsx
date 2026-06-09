import { Outlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const MainLayout = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9' }}>
      
      {/* SIDEBAR FIJO (Menú) */}
      <aside style={{ width: '260px', backgroundColor: '#010409', borderRight: '1px solid #30363d' }} className="d-flex flex-column p-3">
        <div className="mb-4">FICA-JUDGE</div>
        <nav className="nav flex-column">
          <a href="/dashboard" className="nav-link text-white">Dashboard</a>
          <a href="/problems" className="nav-link text-white">Ver Problemas</a>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* BARRA SUPERIOR FIJA */}
        <header className="p-3 border-bottom border-secondary">
          <span>Plano Arquitectura</span>
        </header>

        {/* AQUÍ CAMBIA EL CONTENIDO */}
        <div className="p-4">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};
export default MainLayout;