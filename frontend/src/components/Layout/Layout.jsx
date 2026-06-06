// =====================================================
// Componente Layout - Estructura principal
// =====================================================
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ titulo }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Navbar titulo={titulo} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
