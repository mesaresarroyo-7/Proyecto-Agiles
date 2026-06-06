// =====================================================
// Rutas de movimientos de inventario
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/movimientos - Listar movimientos
router.get('/', verificarToken, verificarRol('movimientos', 'inventario'), async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo, producto } = req.query;
    let query = `
      SELECT m.*, p.nombre as producto_nombre, u.nombres as usuario_nombre
      FROM movimientos_inventario m
      JOIN productos p ON m.id_producto = p.id
      JOIN usuarios u ON m.id_usuario = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_inicio) {
      params.push(fecha_inicio);
      query += ` AND m.fecha >= $${params.length}`;
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      query += ` AND m.fecha <= $${params.length}`;
    }
    if (tipo) {
      params.push(tipo);
      query += ` AND m.tipo = $${params.length}`;
    }
    if (producto) {
      params.push(`%${producto}%`);
      query += ` AND p.nombre ILIKE $${params.length}`;
    }

    query += ' ORDER BY m.fecha DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar movimientos:', err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

module.exports = router;
