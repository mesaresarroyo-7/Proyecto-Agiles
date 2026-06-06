// =====================================================
// Contexto de autenticación
// =====================================================
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar sesión del localStorage
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUsuario));
    }
    setLoading(false);
  }, []);

  const login = (tokenData, usuarioData) => {
    setToken(tokenData);
    setUsuario(usuarioData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  // Verificar permisos de rol
  const tienePermiso = (modulo) => {
    if (!usuario) return false;
    const permisos = {
      'Administrador': ['*'],
      'Encargado de almacén': ['dashboard', 'productos', 'categorias', 'compras', 'inventario', 'movimientos', 'proveedores'],
      'Vendedor': ['dashboard', 'clientes', 'ventas', 'productos']
    };
    const rolesPermitidos = permisos[usuario.rol];
    if (!rolesPermitidos) return false;
    return rolesPermitidos.includes('*') || rolesPermitidos.includes(modulo);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
};
