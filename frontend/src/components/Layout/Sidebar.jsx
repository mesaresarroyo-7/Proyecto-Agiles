// =====================================================
// Componente Sidebar - Menú lateral de navegación
// =====================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiPackage, FiGrid, FiTruck, FiUsers,
  FiShoppingCart, FiDollarSign, FiBox, FiActivity,
  FiBarChart2, FiUserCheck, FiLogOut
} from 'react-icons/fi';
import './Sidebar.css';

const menuItems = [
  { section: 'Principal' },
  { path: '/dashboard', label: 'Dashboard', icon: FiHome, modulo: 'dashboard' },
  { section: 'Gestión' },
  { path: '/productos', label: 'Productos', icon: FiPackage, modulo: 'productos' },
  { path: '/categorias', label: 'Categorías', icon: FiGrid, modulo: 'categorias' },
  { path: '/proveedores', label: 'Proveedores', icon: FiTruck, modulo: 'proveedores' },
  { path: '/clientes', label: 'Clientes', icon: FiUsers, modulo: 'clientes' },
  { section: 'Operaciones' },
  { path: '/compras', label: 'Compras', icon: FiShoppingCart, modulo: 'compras' },
  { path: '/ventas', label: 'Ventas', icon: FiDollarSign, modulo: 'ventas' },
  { section: 'Almacén' },
  { path: '/inventario', label: 'Inventario', icon: FiBox, modulo: 'inventario' },
  { path: '/movimientos', label: 'Movimientos', icon: FiActivity, modulo: 'movimientos' },
  { section: 'Análisis' },
  { path: '/reportes', label: 'Reportes', icon: FiBarChart2, modulo: 'reportes' },
  { section: 'Sistema' },
  { path: '/usuarios', label: 'Usuarios', icon: FiUserCheck, modulo: 'usuarios' },
];

const Sidebar = () => {
  const { logout, tienePermiso } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">DC</div>
        <div className="sidebar-brand">
          <h2>DollarCity</h2>
          <span>Santa Anita</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          if (item.section) {
            return (
              <div className="sidebar-section" key={`section-${index}`}>
                <div className="sidebar-section-title">{item.section}</div>
              </div>
            );
          }

          // Verificar permisos de rol
          if (!tienePermiso(item.modulo)) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon"><Icon /></span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="icon"><FiLogOut /></span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
