// =====================================================
// Ruta de Dashboard - Estadísticas generales
// =====================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

// GET /api/dashboard - Obtener datos del dashboard
router.get('/', verificarToken, async (req, res) => {
  try {
    // Total de productos activos
    const totalProductos = await pool.query(
      'SELECT COUNT(*) as total FROM productos WHERE estado = true'
    );

    // Productos con stock bajo
    const stockBajo = await pool.query(
      'SELECT COUNT(*) as total FROM productos WHERE estado = true AND stock_actual <= stock_minimo'
    );

    // Total de ventas (monto)
    const totalVentas = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'Completada'"
    );

    // Total de compras (monto)
    const totalCompras = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total FROM compras WHERE estado = 'Completada'"
    );

    // Cantidad de ventas
    const cantidadVentas = await pool.query(
      "SELECT COUNT(*) as total FROM ventas WHERE estado = 'Completada'"
    );

    // Cantidad de compras
    const cantidadCompras = await pool.query(
      "SELECT COUNT(*) as total FROM compras WHERE estado = 'Completada'"
    );

    // Productos más vendidos (top 5)
    const productosMasVendidos = await pool.query(`
      SELECT p.nombre, SUM(dv.cantidad) as total_vendido
      FROM detalle_ventas dv
      JOIN productos p ON dv.id_producto = p.id
      JOIN ventas v ON dv.id_venta = v.id
      WHERE v.estado = 'Completada'
      GROUP BY p.id, p.nombre
      ORDER BY total_vendido DESC
      LIMIT 5
    `);

    // Ventas por mes (últimos 6 meses)
    const ventasPorMes = await pool.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM') as mes,
             TO_CHAR(fecha, 'Mon YYYY') as mes_nombre,
             COUNT(*) as cantidad,
             COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE estado = 'Completada' AND fecha >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(fecha, 'YYYY-MM'), TO_CHAR(fecha, 'Mon YYYY')
      ORDER BY mes
    `);

    // Productos con bajo stock (detalle para gráfico)
    const productosBajoStock = await pool.query(`
      SELECT p.nombre, p.stock_actual, p.stock_minimo
      FROM productos p
      WHERE p.estado = true AND p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC
      LIMIT 10
    `);

    // Últimos movimientos de inventario
    const ultimosMovimientos = await pool.query(`
      SELECT m.fecha, p.nombre as producto, m.tipo, m.cantidad, m.motivo
      FROM movimientos_inventario m
      JOIN productos p ON m.id_producto = p.id
      ORDER BY m.fecha DESC
      LIMIT 8
    `);

    // Entradas y salidas de inventario (últimos 6 meses)
    const entradasSalidas = await pool.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM') as mes,
             TO_CHAR(fecha, 'Mon YYYY') as mes_nombre,
             SUM(CASE WHEN tipo = 'Entrada' THEN cantidad ELSE 0 END) as entradas,
             SUM(CASE WHEN tipo = 'Salida' THEN cantidad ELSE 0 END) as salidas
      FROM movimientos_inventario
      WHERE fecha >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(fecha, 'YYYY-MM'), TO_CHAR(fecha, 'Mon YYYY')
      ORDER BY mes
    `);

    res.json({
      tarjetas: {
        total_productos: parseInt(totalProductos.rows[0].total),
        stock_bajo: parseInt(stockBajo.rows[0].total),
        total_ventas: parseFloat(totalVentas.rows[0].total),
        total_compras: parseFloat(totalCompras.rows[0].total),
        cantidad_ventas: parseInt(cantidadVentas.rows[0].total),
        cantidad_compras: parseInt(cantidadCompras.rows[0].total)
      },
      productos_mas_vendidos: productosMasVendidos.rows,
      ventas_por_mes: ventasPorMes.rows,
      productos_bajo_stock: productosBajoStock.rows,
      ultimos_movimientos: ultimosMovimientos.rows,
      entradas_salidas: entradasSalidas.rows
    });
  } catch (err) {
    console.error('Error en dashboard:', err);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
});

module.exports = router;
