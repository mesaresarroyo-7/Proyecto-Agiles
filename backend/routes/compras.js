// =====================================================
// Rutas de compras (con lógica de stock y movimientos)
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/compras - Listar compras
router.get('/', verificarToken, verificarRol('compras'), async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT c.*, p.razon_social as proveedor_nombre, u.nombres as usuario_nombre
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

    query += ' ORDER BY c.id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar compras:', err);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

// GET /api/compras/:id - Obtener compra con detalle
router.get('/:id', verificarToken, verificarRol('compras'), async (req, res) => {
  try {
    const compra = await pool.query(
      `SELECT c.*, p.razon_social as proveedor_nombre, u.nombres as usuario_nombre
       FROM compras c
       JOIN proveedores p ON c.id_proveedor = p.id
       JOIN usuarios u ON c.id_usuario = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (compra.rows.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const detalles = await pool.query(
      `SELECT dc.*, pr.nombre as producto_nombre
       FROM detalle_compras dc
       JOIN productos pr ON dc.id_producto = pr.id
       WHERE dc.id_compra = $1`,
      [req.params.id]
    );

    res.json({
      ...compra.rows[0],
      detalles: detalles.rows
    });
  } catch (err) {
    console.error('Error al obtener compra:', err);
    res.status(500).json({ error: 'Error al obtener compra' });
  }
});

// POST /api/compras - Registrar nueva compra
router.post('/', verificarToken, verificarRol('compras'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id_proveedor, detalles } = req.body;

    if (!id_proveedor || !detalles || detalles.length === 0) {
      return res.status(400).json({ error: 'Proveedor y detalles son obligatorios' });
    }

    // Calcular total
    let total = 0;
    for (const item of detalles) {
      if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cada detalle debe tener producto, cantidad y precio' });
      }
      item.subtotal = parseFloat((item.cantidad * item.precio_unitario).toFixed(2));
      total += item.subtotal;
    }

    // Crear compra
    const compraResult = await client.query(
      `INSERT INTO compras (id_proveedor, id_usuario, total)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_proveedor, req.usuario.id, parseFloat(total.toFixed(2))]
    );
    const compra = compraResult.rows[0];

    // Insertar detalles, actualizar stock y crear movimientos
    for (const item of detalles) {
      // Insertar detalle
      await client.query(
        `INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [compra.id, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]
      );

      // Aumentar stock del producto
      await client.query(
        'UPDATE productos SET stock_actual = stock_actual + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.cantidad, item.id_producto]
      );

      // Registrar movimiento de inventario tipo Entrada
      await client.query(
        `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, id_usuario, referencia_tipo, referencia_id)
         VALUES ($1, 'Entrada', $2, 'Compra a proveedor', $3, 'Compra', $4)`,
        [item.id_producto, item.cantidad, req.usuario.id, compra.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Compra registrada correctamente', compra });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al registrar compra:', err);
    res.status(500).json({ error: 'Error al registrar compra' });
  } finally {
    client.release();
  }
});

module.exports = router;
