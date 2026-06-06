// =====================================================
// Página de Movimientos de Inventario
// =====================================================
import { useState, useEffect } from 'react';
import { movimientosService } from '../../services/api';
import { Card, DataTable, SearchInput, SelectFilter, Loading, Badge } from '../../components/ui';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => { cargar(); }, []);
  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [filtroTipo, busqueda, fechaInicio, fechaFin]);

  const cargar = async () => {
    try {
      const res = await movimientosService.getAll({
        tipo: filtroTipo, producto: busqueda,
        fecha_inicio: fechaInicio || undefined, fecha_fin: fechaFin || undefined
      });
      setMovimientos(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-PE') },
    { header: 'Producto', accessor: 'producto_nombre' },
    { header: 'Tipo', render: (row) => <Badge variant={row.tipo === 'Entrada' ? 'success' : 'danger'}>{row.tipo}</Badge> },
    { header: 'Cantidad', render: (row) => <strong>{row.cantidad}</strong> },
    { header: 'Motivo', accessor: 'motivo' },
    { header: 'Usuario', accessor: 'usuario_nombre' },
    { header: 'Referencia', render: (row) => row.referencia_tipo ? `${row.referencia_tipo} #${row.referencia_id}` : '—' },
  ];

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h2>Movimientos de Inventario</h2></div>
      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar producto..." />
            <SelectFilter value={filtroTipo} onChange={setFiltroTipo}
              options={[{ value: 'Entrada', label: 'Entradas' }, { value: 'Salida', label: 'Salidas' }]}
              placeholder="Todos los tipos" />
            <input type="date" className="form-input" style={{ maxWidth: 160 }} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            <input type="date" className="form-input" style={{ maxWidth: 160 }} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
        </div>
        <DataTable columns={columns} data={movimientos} emptyMessage="No hay movimientos" />
      </Card>
    </div>
  );
};

export default Movimientos;
