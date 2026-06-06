// =====================================================
// Rutas de reportes
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

// GET /api/reportes/productos-mas-vendidos
router.get('/productos-mas-vendidos', verificarToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT p.id, p.nombre, c.nombre as categoria,
             SUM(dv.cantidad) as total_vendido,
             SUM(dv.subtotal) as total_ingresos
      FROM detalle_ventas dv
      JOIN productos p ON dv.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      JOIN ventas v ON dv.id_venta = v.id
      WHERE v.estado = 'Completada'
    `;
    const params = [];

    if (fecha_inicio) {
      params.push(fecha_inicio);
      query += ` AND v.fecha >= $${params.length}`;
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      query += ` AND v.fecha <= $${params.length}`;
    }

    query += ' GROUP BY p.id, p.nombre, c.nombre ORDER BY total_vendido DESC LIMIT 20';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// GET /api/reportes/stock-bajo
router.get('/stock-bajo', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, c.nombre as categoria, p.stock_actual, p.stock_minimo,
             CASE
               WHEN p.stock_actual = 0 THEN 'Sin stock'
               ELSE 'Bajo stock'
             END as estado_stock
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      WHERE p.estado = true AND p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// GET /api/reportes/ventas-por-fecha
router.get('/ventas-por-fecha', verificarToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT v.id, v.fecha, cl.nombres || ' ' || cl.apellidos as cliente,
             u.nombres as vendedor, v.total, v.estado
      FROM ventas v
      JOIN clientes cl ON v.id_cliente = cl.id
      JOIN usuarios u ON v.id_usuario = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_inicio) {
      params.push(fecha_inicio);
      query += ` AND v.fecha >= $${params.length}`;
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      query += ` AND v.fecha <= $${params.length}`;
    }

    query += ' ORDER BY v.fecha DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// GET /api/reportes/compras-por-fecha
router.get('/compras-por-fecha', verificarToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT c.id, c.fecha, p.razon_social as proveedor,
             u.nombres as encargado, c.total, c.estado
      FROM compras c
      JOIN proveedores p ON c.id_proveedor = p.id
      JOIN usuarios u ON c.id_usuario = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha_inicio) {
      params.push(fecha_inicio);
      query += ` AND c.fecha >= $${params.length}`;
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      query += ` AND c.fecha <= $${params.length}`;
    }

    query += ' ORDER BY c.fecha DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// GET /api/reportes/movimientos
router.get('/movimientos', verificarToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;
    let query = `
      SELECT m.id, m.fecha, p.nombre as producto, m.tipo, m.cantidad,
             m.motivo, u.nombres as usuario, m.referencia_tipo, m.referencia_id
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

    query += ' ORDER BY m.fecha DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

module.exports = router;
