// =====================================================
// Rutas CRUD de usuarios
// =====================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roleCheck');

// GET /api/usuarios - Listar usuarios
router.get('/', verificarToken, verificarRol('usuarios'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombres, u.correo, u.estado, u.created_at, r.nombre as rol, r.id as id_rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id
       ORDER BY u.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/usuarios/roles - Listar roles
router.get('/roles', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

// GET /api/usuarios/:id
router.get('/:id', verificarToken, verificarRol('usuarios'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombres, u.correo, u.estado, r.nombre as rol, r.id as id_rol
       FROM usuarios u JOIN roles r ON u.id_rol = r.id WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST /api/usuarios
router.post('/', verificarToken, verificarRol('usuarios'), async (req, res) => {
  try {
    const { nombres, correo, password, id_rol } = req.body;
    if (!nombres || !correo || !password || !id_rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombres, correo, password_hash, id_rol)
       VALUES ($1, $2, $3, $4) RETURNING id, nombres, correo, id_rol, estado`,
      [nombres, correo, passwordHash, id_rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', verificarToken, verificarRol('usuarios'), async (req, res) => {
  try {
    const { nombres, correo, password, id_rol, estado } = req.body;
    
    let query, params;
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      query = `UPDATE usuarios SET nombres = COALESCE($1, nombres), correo = COALESCE($2, correo),
               password_hash = $3, id_rol = COALESCE($4, id_rol), estado = COALESCE($5, estado),
               updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, nombres, correo, id_rol, estado`;
      params = [nombres, correo, passwordHash, id_rol, estado, req.params.id];
    } else {
      query = `UPDATE usuarios SET nombres = COALESCE($1, nombres), correo = COALESCE($2, correo),
               id_rol = COALESCE($3, id_rol), estado = COALESCE($4, estado),
               updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, nombres, correo, id_rol, estado`;
      params = [nombres, correo, id_rol, estado, req.params.id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', verificarToken, verificarRol('usuarios'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE usuarios SET estado = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
