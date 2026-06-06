// =====================================================
// Rutas de ventas (con validación de stock y movimientos)
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/ventas - Listar ventas
router.get('/', verificarToken, verificarRol('ventas'), async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT v.*, cl.nombres || ' ' || cl.apellidos as cliente_nombre, u.nombres as usuario_nombre
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

    query += ' ORDER BY v.id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar ventas:', err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET /api/ventas/:id - Obtener venta con detalle
router.get('/:id', verificarToken, verificarRol('ventas'), async (req, res) => {
  try {
    const venta = await pool.query(
      `SELECT v.*, cl.nombres || ' ' || cl.apellidos as cliente_nombre, u.nombres as usuario_nombre
       FROM ventas v
       JOIN clientes cl ON v.id_cliente = cl.id
       JOIN usuarios u ON v.id_usuario = u.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (venta.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const detalles = await pool.query(
      `SELECT dv.*, pr.nombre as producto_nombre
       FROM detalle_ventas dv
       JOIN productos pr ON dv.id_producto = pr.id
       WHERE dv.id_venta = $1`,
      [req.params.id]
    );

    res.json({
      ...venta.rows[0],
      detalles: detalles.rows
    });
  } catch (err) {
    console.error('Error al obtener venta:', err);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

// POST /api/ventas - Registrar nueva venta
router.post('/', verificarToken, verificarRol('ventas'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id_cliente, detalles } = req.body;

    if (!id_cliente || !detalles || detalles.length === 0) {
      return res.status(400).json({ error: 'Cliente y detalles son obligatorios' });
    }

    // Validar stock y calcular totales
    let total = 0;
    for (const item of detalles) {
      if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cada detalle debe tener producto, cantidad y precio' });
      }

      // Verificar stock disponible
      const stockResult = await client.query(
        'SELECT stock_actual, nombre FROM productos WHERE id = $1',
        [item.id_producto]
      );

      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Producto con ID ${item.id_producto} no encontrado` });
      }

      const producto = stockResult.rows[0];
      if (producto.stock_actual < item.cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, Solicitado: ${item.cantidad}`
        });
      }

      item.subtotal = parseFloat((item.cantidad * item.precio_unitario).toFixed(2));
      total += item.subtotal;
    }

    // Crear venta
    const ventaResult = await client.query(
      `INSERT INTO ventas (id_cliente, id_usuario, total)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_cliente, req.usuario.id, parseFloat(total.toFixed(2))]
    );
    const venta = ventaResult.rows[0];

    // Insertar detalles, actualizar stock y crear movimientos
    for (const item of detalles) {
      // Insertar detalle
      await client.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta.id, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]
      );

      // Disminuir stock del producto
      await client.query(
        'UPDATE productos SET stock_actual = stock_actual - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.cantidad, item.id_producto]
      );

      // Registrar movimiento de inventario tipo Salida
      await client.query(
        `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, id_usuario, referencia_tipo, referencia_id)
         VALUES ($1, 'Salida', $2, 'Venta a cliente', $3, 'Venta', $4)`,
        [item.id_producto, item.cantidad, req.usuario.id, venta.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Venta registrada correctamente', venta });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al registrar venta:', err);
    res.status(500).json({ error: 'Error al registrar venta' });
  } finally {
    client.release();
  }
});

module.exports = router;
