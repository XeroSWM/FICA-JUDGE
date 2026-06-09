import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// Pequeño componente de protección: Si no hay token, te devuelve al login
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('fj_token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública: El Login */}
        <Route path="/" element={<Auth />} />
        
        {/* Ruta Privada: El Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;