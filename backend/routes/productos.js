// =====================================================
// Rutas CRUD de productos
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/productos - Listar todos los productos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { categoria, busqueda, estado } = req.query;
    let query = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND p.id_categoria = $${params.length}`;
    }

    if (busqueda) {
      params.push(`%${busqueda}%`);
      query += ` AND (p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`;
    }

    if (estado !== undefined && estado !== '') {
      params.push(estado === 'true');
      query += ` AND p.estado = $${params.length}`;
    }

    query += ' ORDER BY p.id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/productos - Crear producto
router.post('/', verificarToken, verificarRol('productos'), async (req, res) => {
  try {
    const { nombre, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo } = req.body;

    if (!nombre || !id_categoria) {
      return res.status(400).json({ error: 'Nombre y categoría son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, descripcion || '', id_categoria, precio_compra || 0, precio_venta || 0, stock_actual || 0, stock_minimo || 5]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', verificarToken, verificarRol('productos'), async (req, res) => {
  try {
    const { nombre, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo, estado } = req.body;

    const result = await pool.query(
      `UPDATE productos SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        id_categoria = COALESCE($3, id_categoria),
        precio_compra = COALESCE($4, precio_compra),
        precio_venta = COALESCE($5, precio_venta),
        stock_actual = COALESCE($6, stock_actual),
        stock_minimo = COALESCE($7, stock_minimo),
        estado = COALESCE($8, estado),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [nombre, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo, estado, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id - Eliminar producto (cambiar estado)
router.delete('/:id', verificarToken, verificarRol('productos'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE productos SET estado = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto desactivado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
