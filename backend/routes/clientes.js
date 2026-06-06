// =====================================================
// Rutas CRUD de clientes
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/clientes
router.get('/', verificarToken, async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (busqueda) {
      params.push(`%${busqueda}%`);
      query += ` AND (nombres ILIKE $${params.length} OR apellidos ILIKE $${params.length} OR documento ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/:id
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /api/clientes
router.post('/', verificarToken, verificarRol('clientes', 'ventas'), async (req, res) => {
  try {
    const { nombres, apellidos, documento, telefono, correo, direccion } = req.body;
    if (!nombres || !apellidos || !documento) {
      return res.status(400).json({ error: 'Nombres, apellidos y documento son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO clientes (nombres, apellidos, documento, telefono, correo, direccion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombres, apellidos, documento, telefono || '', correo || '', direccion || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El documento ya está registrado' });
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', verificarToken, verificarRol('clientes', 'ventas'), async (req, res) => {
  try {
    const { nombres, apellidos, documento, telefono, correo, direccion, estado } = req.body;
    const result = await pool.query(
      `UPDATE clientes SET
        nombres = COALESCE($1, nombres),
        apellidos = COALESCE($2, apellidos),
        documento = COALESCE($3, documento),
        telefono = COALESCE($4, telefono),
        correo = COALESCE($5, correo),
        direccion = COALESCE($6, direccion),
        estado = COALESCE($7, estado),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [nombres, apellidos, documento, telefono, correo, direccion, estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', verificarToken, verificarRol('clientes', 'ventas'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE clientes SET estado = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
