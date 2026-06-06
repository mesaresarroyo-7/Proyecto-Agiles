// =====================================================
// Servicio API - Configuración de Axios
// =====================================================
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// Servicios por módulo
// =====================================================

// Auth
export const authService = {
  login: (data) => api.post('/auth/login', data),
};

// Dashboard
export const dashboardService = {
  getData: () => api.get('/dashboard'),
};

// Productos
export const productosService = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
};

// Categorías
export const categoriasService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// Proveedores
export const proveedoresService = {
  getAll: (params) => api.get('/proveedores', { params }),
  getById: (id) => api.get(`/proveedores/${id}`),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  delete: (id) => api.delete(`/proveedores/${id}`),
};

// Clientes
export const clientesService = {
  getAll: (params) => api.get('/clientes', { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Compras
export const comprasService = {
  getAll: (params) => api.get('/compras', { params }),
  getById: (id) => api.get(`/compras/${id}`),
  create: (data) => api.post('/compras', data),
};

// Ventas
export const ventasService = {
  getAll: (params) => api.get('/ventas', { params }),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (data) => api.post('/ventas', data),
};

// Inventario
export const inventarioService = {
  getAll: (params) => api.get('/inventario', { params }),
};

// Movimientos
export const movimientosService = {
  getAll: (params) => api.get('/movimientos', { params }),
};

// Reportes
export const reportesService = {
  productosMasVendidos: (params) => api.get('/reportes/productos-mas-vendidos', { params }),
  stockBajo: () => api.get('/reportes/stock-bajo'),
  ventasPorFecha: (params) => api.get('/reportes/ventas-por-fecha', { params }),
  comprasPorFecha: (params) => api.get('/reportes/compras-por-fecha', { params }),
  movimientos: (params) => api.get('/reportes/movimientos', { params }),
};

// Usuarios
export const usuariosService = {
  getAll: () => api.get('/usuarios'),
  getRoles: () => api.get('/usuarios/roles'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export default api;
