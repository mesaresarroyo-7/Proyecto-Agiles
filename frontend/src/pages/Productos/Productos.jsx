// =====================================================
// Página de Gestión de Productos
// =====================================================
import { useState, useEffect } from 'react';
import { productosService, categoriasService } from '../../services/api';
import { Button, Card, DataTable, Modal, SearchInput, SelectFilter, Alert, Loading, Badge, ConfirmDialog } from '../../components/ui';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({
    nombre: '', descripcion: '', id_categoria: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '5'
  });

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => cargarProductos(), 300);
    return () => clearTimeout(timer);
  }, [busqueda, filtroCategoria]);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll()
      ]);
      setProductos(prodRes.data);
      setCategorias(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await productosService.getAll({ busqueda, categoria: filtroCategoria });
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setEditando(producto);
      setForm({
        nombre: producto.nombre, descripcion: producto.descripcion || '',
        id_categoria: producto.id_categoria, precio_compra: producto.precio_compra,
        precio_venta: producto.precio_venta, stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo
      });
    } else {
      setEditando(null);
      setForm({ nombre: '', descripcion: '', id_categoria: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '5' });
    }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.id_categoria) {
      setAlert({ type: 'error', message: 'Nombre y categoría son obligatorios' });
      return;
    }
    try {
      const data = { ...form, precio_compra: parseFloat(form.precio_compra) || 0, precio_venta: parseFloat(form.precio_venta) || 0, stock_actual: parseInt(form.stock_actual) || 0, stock_minimo: parseInt(form.stock_minimo) || 5, id_categoria: parseInt(form.id_categoria) };
      if (editando) {
        await productosService.update(editando.id, data);
        setAlert({ type: 'success', message: 'Producto actualizado correctamente' });
      } else {
        await productosService.create(data);
        setAlert({ type: 'success', message: 'Producto registrado correctamente' });
      }
      setModal(false);
      cargarProductos();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' });
    }
  };

  const eliminar = async () => {
    try {
      await productosService.delete(confirmDelete.id);
      setAlert({ type: 'success', message: 'Producto desactivado correctamente' });
      setConfirmDelete(null);
      cargarProductos();
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al eliminar producto' });
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Producto', render: (row) => <><strong>{row.nombre}</strong><br/><small style={{color:'#64748b'}}>{row.descripcion?.substring(0,50)}</small></> },
    { header: 'Categoría', accessor: 'categoria_nombre' },
    { header: 'P. Compra', render: (row) => `S/ ${parseFloat(row.precio_compra).toFixed(2)}` },
    { header: 'P. Venta', render: (row) => `S/ ${parseFloat(row.precio_venta).toFixed(2)}` },
    { header: 'Stock', render: (row) => {
      const bajo = row.stock_actual <= row.stock_minimo;
      return <span style={{ color: bajo ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 700 }}>{row.stock_actual}</span>;
    }},
    { header: 'Min', accessor: 'stock_minimo' },
    { header: 'Estado', render: (row) => <Badge variant={row.estado ? 'success' : 'danger'}>{row.estado ? 'Activo' : 'Inactivo'}</Badge> },
    { header: 'Acciones', width: '100px', render: (row) => (
      <div className="actions">
        <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => abrirModal(row)}><FiEdit2 /></button>
        <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={() => setConfirmDelete(row)}><FiTrash2 /></button>
      </div>
    )}
  ];

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Gestión de Productos</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => abrirModal()}>Nuevo Producto</Button>
      </div>

      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}

      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar producto..." />
            <SelectFilter
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              options={categorias.filter(c => c.estado).map(c => ({ value: c.id, label: c.nombre }))}
              placeholder="Todas las categorías"
            />
          </div>
        </div>
        <DataTable columns={columns} data={productos} emptyMessage="No se encontraron productos" />
      </Card>

      {modal && (
        <Modal
          title={editando ? 'Editar Producto' : 'Nuevo Producto'}
          onClose={() => setModal(false)}
          footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button variant="primary" onClick={guardar}>Guardar</Button></>}
        >
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre del producto" />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select className="form-select" value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})}>
                <option value="">Seleccionar...</option>
                {categorias.filter(c => c.estado).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción del producto" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio Compra (S/)</label>
              <input className="form-input" type="number" step="0.01" value={form.precio_compra} onChange={e => setForm({...form, precio_compra: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio Venta (S/)</label>
              <input className="form-input" type="number" step="0.01" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input className="form-input" type="number" value={form.stock_actual} onChange={e => setForm({...form, stock_actual: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Mínimo</label>
              <input className="form-input" type="number" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: e.target.value})} />
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Está seguro de desactivar el producto "${confirmDelete.nombre}"?`}
          onConfirm={eliminar}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Productos;
