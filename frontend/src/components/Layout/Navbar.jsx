// =====================================================
// Componente Navbar - Barra superior
// =====================================================
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ titulo }) => {
  const { usuario } = useAuth();

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{titulo || 'Dashboard'}</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">
            {getInitials(usuario?.nombres)}
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{usuario?.nombres || 'Usuario'}</span>
            <span className="navbar-user-role">{usuario?.rol || 'Sin rol'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
