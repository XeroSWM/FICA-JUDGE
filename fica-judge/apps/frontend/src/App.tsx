import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import MainLayout from './pages/MainLayout';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail'; // <-- IMPORTAMOS LA NUEVA VISTA
import React from 'react';
import CreateProblem from './components/CreateProblem';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
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
          {/* NUEVA RUTA DINÁMICA PARA EL DETALLE DEL PROBLEMA */}
          <Route path="/problems/:id" element={<ProblemDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;