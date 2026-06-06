// =====================================================
// Middleware de verificación de roles
// =====================================================

// Roles permitidos por módulo
const PERMISOS_ROLES = {
  'Administrador': ['*'], // Acceso total
  'Encargado de almacén': ['productos', 'categorias', 'compras', 'inventario', 'movimientos', 'proveedores', 'dashboard'],
  'Vendedor': ['clientes', 'ventas', 'dashboard', 'productos']
};

const verificarRol = (...modulosPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const rolUsuario = req.usuario.rol;
    const permisosRol = PERMISOS_ROLES[rolUsuario];

    if (!permisosRol) {
      return res.status(403).json({ error: 'Rol no reconocido' });
    }

    // Administrador tiene acceso total
    if (permisosRol.includes('*')) {
      return next();
    }

    // Verificar si el rol tiene acceso a alguno de los módulos requeridos
    const tienePermiso = modulosPermitidos.some(modulo => permisosRol.includes(modulo));

    if (!tienePermiso) {
      return res.status(403).json({ error: 'No tiene permisos para acceder a este recurso' });
    }

    next();
  };
};

module.exports = { verificarRol };
