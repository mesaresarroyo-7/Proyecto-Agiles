// =====================================================
// Página de Registro de Ventas
// =====================================================
import { useState, useEffect } from 'react';
import { ventasService, clientesService, productosService } from '../../services/api';
import { Button, Card, DataTable, Modal, Alert, Loading, Badge } from '../../components/ui';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [idCliente, setIdCliente] = useState('');
  const [detalles, setDetalles] = useState([]);
  const [productoSel, setProductoSel] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnit, setPrecioUnit] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [ventasRes, cliRes, prodRes] = await Promise.all([
        ventasService.getAll(), clientesService.getAll(), productosService.getAll()
      ]);
      setVentas(ventasRes.data);
      setClientes(cliRes.data.filter(c => c.estado));
      setProductos(prodRes.data.filter(p => p.estado));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const agregarDetalle = () => {
    if (!productoSel || !cantidad || !precioUnit) { setAlert({ type: 'error', message: 'Complete producto, cantidad y precio' }); return; }
    const prod = productos.find(p => p.id === parseInt(productoSel));
    if (!prod) return;
    const cant = parseInt(cantidad);
    if (cant > prod.stock_actual) {
      setAlert({ type: 'error', message: `Stock insuficiente. Disponible: ${prod.stock_actual}` });
      return;
    }
    const precio = parseFloat(precioUnit);
    setDetalles([...detalles, {
      id_producto: prod.id, nombre: prod.nombre, cantidad: cant, stock: prod.stock_actual,
      precio_unitario: precio, subtotal: parseFloat((cant * precio).toFixed(2))
    }]);
    setProductoSel(''); setCantidad(''); setPrecioUnit('');
  };

  const quitarDetalle = (idx) => setDetalles(detalles.filter((_, i) => i !== idx));

  const totalVenta = detalles.reduce((sum, d) => sum + d.subtotal, 0);

  const guardarVenta = async () => {
    if (!idCliente) { setAlert({ type: 'error', message: 'Seleccione un cliente' }); return; }
    if (detalles.length === 0) { setAlert({ type: 'error', message: 'Agregue al menos un producto' }); return; }
    try {
      await ventasService.create({
        id_cliente: parseInt(idCliente),
        detalles: detalles.map(d => ({ id_producto: d.id_producto, cantidad: d.cantidad, precio_unitario: d.precio_unitario }))
      });
      setAlert({ type: 'success', message: 'Venta registrada correctamente. Stock actualizado.' });
      setModalNueva(false); setDetalles([]); setIdCliente('');
      cargar();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || 'Error al registrar venta' }); }
  };

  const verDetalle = async (id) => {
    try { const res = await ventasService.getById(id); setModalDetalle(res.data); }
    catch (err) { console.error(err); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-PE') },
    { header: 'Cliente', accessor: 'cliente_nombre' },
    { header: 'Total', render: (row) => <strong>S/ {parseFloat(row.total).toFixed(2)}</strong> },
    { header: 'Estado', render: (row) => <Badge variant="success">{row.estado}</Badge> },
    { header: 'Vendedor', accessor: 'usuario_nombre' },
    { header: 'Acciones', width: '80px', render: (row) => (
      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => verDetalle(row.id)}><FiEye /></button>
    )}
  ];

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Registro de Ventas</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setModalNueva(true)}>Nueva Venta</Button>
      </div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}
      <Card>
        <DataTable columns={columns} data={ventas} emptyMessage="No hay ventas registradas" />
      </Card>

      {modalNueva && (
        <Modal title="Nueva Venta" size="lg" onClose={() => { setModalNueva(false); setDetalles([]); }}
          footer={<><Button variant="secondary" onClick={() => { setModalNueva(false); setDetalles([]); }}>Cancelar</Button><Button variant="primary" onClick={guardarVenta}>Registrar Venta</Button></>}>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select className="form-select" value={idCliente} onChange={e => setIdCliente(e.target.value)}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} — DNI: {c.documento}</option>)}
            </select>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 10 }}>Agregar Producto</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="form-select" style={{ flex: 2 }} value={productoSel} onChange={e => { setProductoSel(e.target.value); const p = productos.find(x => x.id === parseInt(e.target.value)); if (p) setPrecioUnit(p.precio_venta); }}>
                <option value="">Seleccionar producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}
              </select>
              <input className="form-input" style={{ flex: 1 }} type="number" placeholder="Cant." value={cantidad} onChange={e => setCantidad(e.target.value)} min="1" />
              <input className="form-input" style={{ flex: 1 }} type="number" step="0.01" placeholder="Precio" value={precioUnit} onChange={e => setPrecioUnit(e.target.value)} />
              <Button variant="primary" onClick={agregarDetalle}>Agregar</Button>
            </div>
          </div>

          {detalles.length > 0 && (
            <table className="data-table">
              <thead><tr><th>Producto</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.nombre}</td><td>{d.cantidad}</td>
                    <td>S/ {d.precio_unitario.toFixed(2)}</td>
                    <td><strong>S/ {d.subtotal.toFixed(2)}</strong></td>
                    <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => quitarDetalle(i)}><FiTrash2 /></button></td>
                  </tr>
                ))}
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL:</td><td colSpan={2}><strong style={{ fontSize: '1.1em', color: 'var(--color-primary)' }}>S/ {totalVenta.toFixed(2)}</strong></td></tr>
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {modalDetalle && (
        <Modal title={`Venta #${modalDetalle.id}`} size="lg" onClose={() => setModalDetalle(null)}
          footer={<Button variant="secondary" onClick={() => setModalDetalle(null)}>Cerrar</Button>}>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div><strong>Cliente:</strong> {modalDetalle.cliente_nombre}</div>
            <div><strong>Fecha:</strong> {new Date(modalDetalle.fecha).toLocaleDateString('es-PE')}</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
            <tbody>
              {modalDetalle.detalles?.map((d, i) => (
                <tr key={i}><td>{d.producto_nombre}</td><td>{d.cantidad}</td><td>S/ {parseFloat(d.precio_unitario).toFixed(2)}</td><td><strong>S/ {parseFloat(d.subtotal).toFixed(2)}</strong></td></tr>
              ))}
              <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL:</td><td><strong style={{ color: 'var(--color-primary)' }}>S/ {parseFloat(modalDetalle.total).toFixed(2)}</strong></td></tr>
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
};

export default Ventas;
