// =====================================================
// Página de Login
// =====================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Button, Alert } from '../../components/ui';
import { FiLogIn } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ correo, password });
      login(res.data.token, res.data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">DC</div>
          <h1>DollarCity Santa Anita</h1>
          <p>Sistema de Gestión de Compras, Ventas e Inventario</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="ejemplo@dollarcity.com"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="login-btn"
            disabled={loading}
            icon={<FiLogIn />}
          >
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </Button>
        </form>

        <div className="login-credentials">
          <h4>Credenciales de prueba</h4>
          <p>
            <strong>Admin:</strong> <code>admin@dollarcity.com</code><br />
            <strong>Almacén:</strong> <code>almacen@dollarcity.com</code><br />
            <strong>Vendedor:</strong> <code>vendedor@dollarcity.com</code><br />
            <strong>Contraseña:</strong> <code>123456</code>
          </p>
        </div>

        <div className="login-footer">
          <p>Proyecto Académico — Metodología Ágil Scrum<br />© 2025 DollarCity Santa Anita</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
