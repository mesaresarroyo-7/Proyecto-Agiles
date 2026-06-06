// =====================================================
// Página de Reportes
// =====================================================
import { useState } from 'react';
import { reportesService } from '../../services/api';
import { Button, Card, DataTable, Badge, Alert } from '../../components/ui';
import { FiFileText, FiSearch } from 'react-icons/fi';

const reportes = [
  { key: 'productos-mas-vendidos', label: 'Productos Más Vendidos', filtroFecha: true },
  { key: 'stock-bajo', label: 'Stock Bajo', filtroFecha: false },
  { key: 'ventas-por-fecha', label: 'Ventas por Fecha', filtroFecha: true },
  { key: 'compras-por-fecha', label: 'Compras por Fecha', filtroFecha: true },
  { key: 'movimientos', label: 'Movimientos de Inventario', filtroFecha: true },
];

const Reportes = () => {
  const [reporteActivo, setReporteActivo] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });

  const generarReporte = async (key) => {
    setReporteActivo(key);
    setLoading(true);
    setDatos([]);
    try {
      let res;
      const params = { fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined };
      switch (key) {
        case 'productos-mas-vendidos': res = await reportesService.productosMasVendidos(params); break;
        case 'stock-bajo': res = await reportesService.stockBajo(); break;
        case 'ventas-por-fecha': res = await reportesService.ventasPorFecha(params); break;
        case 'compras-por-fecha': res = await reportesService.comprasPorFecha(params); break;
        case 'movimientos': res = await reportesService.movimientos(params); break;
        default: return;
      }
      setDatos(res.data);
      if (res.data.length === 0) setAlert({ type: 'warning', message: 'No se encontraron resultados para los filtros seleccionados' });
    } catch (err) { setAlert({ type: 'error', message: 'Error al generar reporte' }); }
    finally { setLoading(false); }
  };

  const getColumns = () => {
    switch (reporteActivo) {
      case 'productos-mas-vendidos': return [
        { header: '#', render: (_, i) => i + 1, width: '50px' },
        { header: 'Producto', render: (row) => <strong>{row.nombre}</strong> },
        { header: 'Categoría', accessor: 'categoria' },
        { header: 'Total Vendido', render: (row) => <strong>{row.total_vendido} uds.</strong> },
        { header: 'Ingresos', render: (row) => `S/ ${parseFloat(row.total_ingresos).toFixed(2)}` },
      ];
      case 'stock-bajo': return [
        { header: 'Producto', render: (row) => <strong>{row.nombre}</strong> },
        { header: 'Categoría', accessor: 'categoria' },
        { header: 'Stock Actual', render: (row) => <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{row.stock_actual}</span> },
        { header: 'Stock Mínimo', accessor: 'stock_minimo' },
        { header: 'Estado', render: (row) => <Badge variant={row.stock_actual === 0 ? 'danger' : 'warning'}>{row.estado_stock}</Badge> },
      ];
      case 'ventas-por-fecha': return [
        { header: 'ID', accessor: 'id', width: '60px' },
        { header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-PE') },
        { header: 'Cliente', accessor: 'cliente' },
        { header: 'Vendedor', accessor: 'vendedor' },
        { header: 'Total', render: (row) => <strong>S/ {parseFloat(row.total).toFixed(2)}</strong> },
        { header: 'Estado', render: (row) => <Badge variant="success">{row.estado}</Badge> },
      ];
      case 'compras-por-fecha': return [
        { header: 'ID', accessor: 'id', width: '60px' },
        { header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-PE') },
        { header: 'Proveedor', accessor: 'proveedor' },
        { header: 'Encargado', accessor: 'encargado' },
        { header: 'Total', render: (row) => <strong>S/ {parseFloat(row.total).toFixed(2)}</strong> },
        { header: 'Estado', render: (row) => <Badge variant="success">{row.estado}</Badge> },
      ];
      case 'movimientos': return [
        { header: 'ID', accessor: 'id', width: '60px' },
        { header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-PE') },
        { header: 'Producto', accessor: 'producto' },
        { header: 'Tipo', render: (row) => <Badge variant={row.tipo === 'Entrada' ? 'success' : 'danger'}>{row.tipo}</Badge> },
        { header: 'Cantidad', render: (row) => <strong>{row.cantidad}</strong> },
        { header: 'Motivo', accessor: 'motivo' },
        { header: 'Usuario', accessor: 'usuario' },
      ];
      default: return [];
    }
  };

  const reporteInfo = reportes.find(r => r.key === reporteActivo);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h2>Reportes</h2></div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}

      {/* Selector de reportes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {reportes.map(r => (
          <button key={r.key}
            className={`summary-card ${reporteActivo === r.key ? '' : ''}`}
            style={{ cursor: 'pointer', border: reporteActivo === r.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', textAlign: 'left' }}
            onClick={() => generarReporte(r.key)}>
            <div className="summary-card-icon green"><FiFileText /></div>
            <div className="summary-card-info">
              <h4 style={{ textTransform: 'none', letterSpacing: 0 }}>{r.label}</h4>
            </div>
          </button>
        ))}
      </div>

      {/* Filtros de fecha */}
      {reporteInfo?.filtroFecha && (
        <Card className="animate-slide-up" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Desde:</label>
            <input type="date" className="form-input" style={{ maxWidth: 180 }} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            <label className="form-label" style={{ marginBottom: 0 }}>Hasta:</label>
            <input type="date" className="form-input" style={{ maxWidth: 180 }} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            <Button variant="primary" icon={<FiSearch />} onClick={() => generarReporte(reporteActivo)}>Filtrar</Button>
          </div>
        </Card>
      )}

      {/* Resultados */}
      {reporteActivo && (
        <Card title={`Reporte: ${reporteInfo?.label || ''}`}>
          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <DataTable columns={getColumns()} data={datos} emptyMessage="Sin resultados" />
          )}
        </Card>
      )}
    </div>
  );
};

export default Reportes;
