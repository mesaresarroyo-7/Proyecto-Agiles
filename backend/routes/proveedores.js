// =====================================================
// Rutas CRUD de proveedores
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/proveedores
router.get('/', verificarToken, async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = 'SELECT * FROM proveedores WHERE 1=1';
    const params = [];

    if (busqueda) {
      params.push(`%${busqueda}%`);
      query += ` AND (razon_social ILIKE $${params.length} OR ruc ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// GET /api/proveedores/:id
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

// POST /api/proveedores
router.post('/', verificarToken, verificarRol('proveedores', 'compras'), async (req, res) => {
  try {
    const { razon_social, ruc, telefono, correo, direccion } = req.body;
    if (!razon_social || !ruc) return res.status(400).json({ error: 'Razón social y RUC son obligatorios' });

    const result = await pool.query(
      `INSERT INTO proveedores (razon_social, ruc, telefono, correo, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [razon_social, ruc, telefono || '', correo || '', direccion || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El RUC ya está registrado' });
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

// PUT /api/proveedores/:id
router.put('/:id', verificarToken, verificarRol('proveedores', 'compras'), async (req, res) => {
  try {
    const { razon_social, ruc, telefono, correo, direccion, estado } = req.body;
    const result = await pool.query(
      `UPDATE proveedores SET
        razon_social = COALESCE($1, razon_social),
        ruc = COALESCE($2, ruc),
        telefono = COALESCE($3, telefono),
        correo = COALESCE($4, correo),
        direccion = COALESCE($5, direccion),
        estado = COALESCE($6, estado),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [razon_social, ruc, telefono, correo, direccion, estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

// DELETE /api/proveedores/:id
router.delete('/:id', verificarToken, verificarRol('proveedores', 'compras'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE proveedores SET estado = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ message: 'Proveedor desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

module.exports = router;
