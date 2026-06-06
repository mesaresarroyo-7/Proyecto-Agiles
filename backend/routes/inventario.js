// =====================================================
// Rutas de inventario
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/inventario - Consultar inventario
router.get('/', verificarToken, verificarRol('inventario', 'productos'), async (req, res) => {
  try {
    const { categoria, busqueda, estado_stock } = req.query;
    let query = `
      SELECT p.id, p.nombre, p.descripcion, c.nombre as categoria_nombre,
             p.stock_actual, p.stock_minimo, p.precio_compra, p.precio_venta, p.estado,
             CASE
               WHEN p.stock_actual = 0 THEN 'Sin stock'
               WHEN p.stock_actual <= p.stock_minimo THEN 'Bajo stock'
               ELSE 'Normal'
             END as estado_stock
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      WHERE p.estado = true
    `;
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND p.id_categoria = $${params.length}`;
    }

    if (busqueda) {
      params.push(`%${busqueda}%`);
      query += ` AND p.nombre ILIKE $${params.length}`;
    }

    if (estado_stock === 'bajo') {
      query += ' AND p.stock_actual <= p.stock_minimo AND p.stock_actual > 0';
    } else if (estado_stock === 'sin_stock') {
      query += ' AND p.stock_actual = 0';
    } else if (estado_stock === 'normal') {
      query += ' AND p.stock_actual > p.stock_minimo';
    }

    query += ' ORDER BY p.stock_actual ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar inventario:', err);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

module.exports = router;
