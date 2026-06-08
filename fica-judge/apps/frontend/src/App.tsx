import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Leer la variable de entorno configurada en Vite
    // Si no la encuentra, usará localhost por defecto para desarrollo local
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      if (!isLogin) {
        // 2. Usar la variable dinámica en lugar de la dirección quemada
        const response = await axios.post(`${API_URL}/auth/register`, formData);
        
        setMessage({ text: response.data.message || 'Registro exitoso. Ahora puedes iniciar sesión.', type: 'success' });
        setIsLogin(true); // Volver al login tras registrar
      } else {
        // Aquí irá el flujo de LOGIN (lo programaremos en el backend a continuación)
        setMessage({ text: 'El endpoint de Login aún no está construido en el backend.', type: 'danger' });
      }
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : 'Ocurrió un error al procesar la solicitud.';

      setMessage({
        text: errorMessage,
        type: 'danger'
      });
    }
  };

  return (
    <div className="auth-card">
      <div className="fj-logo">FJ</div>
      <h3 className="text-center mb-1">
        {isLogin ? 'Conectarse a FICA-JUDGE' : 'Registro FICA-JUDGE'}
      </h3>
      <p className="text-center text-muted mb-4" style={{ fontSize: '0.85rem' }}>
        Microservicios de compilación del sandbox académico
      </p>

      {message && (
        <div className={`alert alert-${message.type} py-2`} style={{ fontSize: '0.9rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="row mb-3">
            <div className="col">
              <label className="form-label text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>NOMBRES</label>
              <input type="text" name="firstName" className="form-control custom-input" required={!isLogin} onChange={handleInputChange} />
            </div>
            <div className="col">
              <label className="form-label text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>APELLIDOS</label>
              <input type="text" name="lastName" className="form-control custom-input" required={!isLogin} onChange={handleInputChange} />
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Correo Institucional
          </label>
          <input 
            type="email" 
            name="email"
            className="form-control custom-input" 
            placeholder="usuario@fica.edu.ec"
            required 
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label text-muted text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
              Contraseña
            </label>
            {isLogin && <span className="text-brand" style={{ fontSize: '0.75rem' }}>¿Olvidó Contraseña?</span>}
          </div>
          <input 
            type="password" 
            name="password"
            className="form-control custom-input mt-2" 
            placeholder="••••••••••••"
            required 
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="btn btn-brand w-100 mb-3">
          {isLogin ? 'AUTENTICAR CREDENCIALES' : 'CREAR CUENTA'}
        </button>

        <div className="text-center mt-4">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          </span>
          <span className="text-brand fw-bold" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Registrarse aquí' : 'Iniciar sesión'}
          </span>
        </div>
      </form>
    </div>
  );
}

export default App;