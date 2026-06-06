// =====================================================
// Página de Inventario
// =====================================================
import { useState, useEffect } from 'react';
import { inventarioService, categoriasService } from '../../services/api';
import { Card, DataTable, SearchInput, SelectFilter, Loading, Badge } from '../../components/ui';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => { cargarCategorias(); }, []);
  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [busqueda, filtroCategoria, filtroEstado]);

  const cargarCategorias = async () => {
    try { const res = await categoriasService.getAll(); setCategorias(res.data); } catch (err) { console.error(err); }
  };

  const cargar = async () => {
    try { const res = await inventarioService.getAll({ busqueda, categoria: filtroCategoria, estado_stock: filtroEstado }); setInventario(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getBadgeVariant = (estado) => {
    if (estado === 'Sin stock') return 'danger';
    if (estado === 'Bajo stock') return 'warning';
    return 'success';
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Producto', render: (row) => <strong>{row.nombre}</strong> },
    { header: 'Categoría', accessor: 'categoria_nombre' },
    { header: 'Stock Actual', render: (row) => (
      <span style={{ fontWeight: 700, color: row.stock_actual <= row.stock_minimo ? 'var(--color-danger)' : 'var(--color-text)' }}>
        {row.stock_actual}
      </span>
    )},
    { header: 'Stock Mínimo', accessor: 'stock_minimo' },
    { header: 'P. Compra', render: (row) => `S/ ${parseFloat(row.precio_compra).toFixed(2)}` },
    { header: 'P. Venta', render: (row) => `S/ ${parseFloat(row.precio_venta).toFixed(2)}` },
    { header: 'Estado Stock', render: (row) => <Badge variant={getBadgeVariant(row.estado_stock)}>{row.estado_stock}</Badge> },
  ];

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h2>Inventario</h2></div>
      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar producto..." />
            <SelectFilter value={filtroCategoria} onChange={setFiltroCategoria}
              options={categorias.filter(c => c.estado).map(c => ({ value: c.id, label: c.nombre }))} placeholder="Todas las categorías" />
            <SelectFilter value={filtroEstado} onChange={setFiltroEstado}
              options={[{ value: 'normal', label: 'Normal' }, { value: 'bajo', label: 'Bajo stock' }, { value: 'sin_stock', label: 'Sin stock' }]}
              placeholder="Todos los estados" />
          </div>
        </div>
        <DataTable columns={columns} data={inventario} emptyMessage="No se encontraron productos" />
      </Card>
    </div>
  );
};

export default Inventario;
