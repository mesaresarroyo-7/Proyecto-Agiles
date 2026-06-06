// =====================================================
// Rutas CRUD de categorías
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/categorias - Listar todas
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar categorías:', err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// GET /api/categorias/:id
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

// POST /api/categorias
router.post('/', verificarToken, verificarRol('categorias', 'productos'), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'La categoría ya existe' });
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', verificarToken, verificarRol('categorias', 'productos'), async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const result = await pool.query(
      `UPDATE categorias SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        estado = COALESCE($3, estado),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [nombre, descripcion, estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', verificarToken, verificarRol('categorias', 'productos'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE categorias SET estado = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría desactivada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;
