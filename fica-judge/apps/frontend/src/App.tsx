import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';

// Componente para proteger las rutas privadas: 
// Si no hay token en localStorage, redirige al Login (/)
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('fj_token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública: Login */}
        <Route path="/" element={<Auth />} />

        {/* Ruta Protegida: Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Ruta Protegida: Lista de Problemas */}
        <Route 
          path="/problems" 
          element={
            <PrivateRoute>
              <ProblemList />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;