import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import MainLayout from './pages/MainLayout';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail'; 
import CreateProblem from './components/CreateProblem';
import RankingsGlobales from './pages/Rankings';// <-- 1. IMPORTAMOS LA NUEVA VISTA
import React from 'react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Asegúrate de que el nombre del token aquí ('fj_token' o 'token') coincida con el que usas en el Login y en el componente RankingsGlobales
  const token = localStorage.getItem('fj_token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/new" element={<CreateProblem />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          
          {/* <-- 2. NUEVA RUTA PARA EL LEADERBOARD --> */}
          <Route path="/rankings" element={<RankingsGlobales />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;