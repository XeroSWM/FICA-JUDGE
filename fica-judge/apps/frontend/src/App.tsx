import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import MainLayout from './pages/MainLayout';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail'; 
import CreateProblem from './components/CreateProblem';
import RankingsGlobales from './pages/Rankings';
import HistorialEnvios from './pages/HistorialEnvios';
import AssignmentsList from './pages/AssignmentsList'; // <-- IMPORTADO
import AssignmentDetail from './pages/AssignmentDetail'; // <-- IMPORTADO
import React from 'react';

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
          <Route path="/problems/:id" element={<ProblemDetail />} />
          
          {/* RUTAS DE DEBERES Y EXÁMENES */}
          <Route path="/assignments" element={<AssignmentsList />} /> {/* <-- RUTA AGREGADA */}
          <Route path="/assignments/:id" element={<AssignmentDetail />} /> {/* <-- RUTA AGREGADA */}
          
          {/* RUTAS DE ESTUDIANTE */}
          <Route path="/rankings" element={<RankingsGlobales />} />
          <Route path="/historial" element={<HistorialEnvios />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;