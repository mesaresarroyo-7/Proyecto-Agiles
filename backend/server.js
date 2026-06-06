// =====================================================
// Servidor principal - DollarCity Santa Anita API
// =====================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({
    message: '🏪 API DollarCity Santa Anita - Sistema de Gestión',
    version: '1.0.0',
    endpoints: [
      '/api/auth', '/api/dashboard', '/api/productos', '/api/categorias',
      '/api/proveedores', '/api/clientes', '/api/compras', '/api/ventas',
      '/api/inventario', '/api/movimientos', '/api/reportes', '/api/usuarios'
    ]
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});
