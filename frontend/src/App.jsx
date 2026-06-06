// =====================================================
// App Principal - Enrutamiento
// =====================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Productos from './pages/Productos/Productos';
import Categorias from './pages/Categorias/Categorias';
import Proveedores from './pages/Proveedores/Proveedores';
import Clientes from './pages/Clientes/Clientes';
import Compras from './pages/Compras/Compras';
import Ventas from './pages/Ventas/Ventas';
import Inventario from './pages/Inventario/Inventario';
import Movimientos from './pages/Movimientos/Movimientos';
import Reportes from './pages/Reportes/Reportes';
import Usuarios from './pages/Usuarios/Usuarios';
import { Loading } from './components/ui';

// Ruta protegida - verifica autenticación
const RutaProtegida = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <Loading />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Ruta pública - redirige si ya está autenticado
const RutaPublica = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <Loading />;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

          {/* Rutas protegidas dentro del layout */}
          <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="compras" element={<Compras />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* Redirigir rutas desconocidas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
