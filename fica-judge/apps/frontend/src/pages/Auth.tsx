import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Auth: React.FC = () => {
  const navigate = useNavigate(); // Hook de React Router para cambiar de página
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

    // Variable dinámica apuntando a tu backend
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    try {
      if (!isLogin) {
        // ==========================================
        // FLUJO DE REGISTRO
        // ==========================================
        const response = await axios.post(`${API_URL}/auth/register`, formData);
        
        setMessage({ text: response.data.message || 'Registro exitoso. Ahora puedes iniciar sesión.', type: 'success' });
        setIsLogin(true); // Cambiamos la vista automáticamente al Login
      } else {
        // ==========================================
        // FLUJO DE LOGIN
        // ==========================================
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        // 1. Guardamos el token 
        const tokenReal = response.data.token || response.data.access_token;
        localStorage.setItem('fj_token', tokenReal);

        // 👇 APLICAMOS EL PARCHE RÁPIDO: Rescate de identidad
        const userData = response.data.user || {};
        const userToSave = {
            ...userData,
            email: userData.email || formData.email, // Forzamos a guardar el email escrito
            firstName: userData.firstName || formData.firstName || 'Nuevo',
            lastName: userData.lastName || formData.lastName || 'Usuario'
        };
        
        // Guardamos el usuario "rescatado"
        localStorage.setItem('fj_user', JSON.stringify(userToSave));

        setMessage({ 
          // Usamos el nombre rescatado para el mensaje
          text: `¡Bienvenido de vuelta, ${userToSave.firstName}! Autenticación exitosa.`, 
          type: 'success' 
        });

        // 2. MAGIA: Redirigimos al usuario a la página principal (Dashboard)
        navigate('/inicio');
      }
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : 'Ocurrió un error al procesar la solicitud.';

      setMessage({ text: errorMessage, type: 'danger' });
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
          <span className="text-brand fw-bold" style={{ cursor: 'pointer', color: '#00d26a' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Registrarse aquí' : 'Iniciar sesión'}
          </span>
        </div>
      </form>
    </div>
  );
};

export default Auth;