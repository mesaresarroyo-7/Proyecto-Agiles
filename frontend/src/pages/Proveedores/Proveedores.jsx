// =====================================================
// Página de Gestión de Proveedores
// =====================================================
import { useState, useEffect } from 'react';
import { proveedoresService } from '../../services/api';
import { Button, Card, DataTable, Modal, SearchInput, Alert, Loading, Badge, ConfirmDialog } from '../../components/ui';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({ razon_social: '', ruc: '', telefono: '', correo: '', direccion: '' });

  useEffect(() => { cargar(); }, []);
  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [busqueda]);

  const cargar = async () => {
    try { const res = await proveedoresService.getAll({ busqueda }); setProveedores(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const abrirModal = (item = null) => {
    if (item) { setEditando(item); setForm({ razon_social: item.razon_social, ruc: item.ruc, telefono: item.telefono || '', correo: item.correo || '', direccion: item.direccion || '' }); }
    else { setEditando(null); setForm({ razon_social: '', ruc: '', telefono: '', correo: '', direccion: '' }); }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.razon_social || !form.ruc) { setAlert({ type: 'error', message: 'Razón social y RUC son obligatorios' }); return; }
    try {
      if (editando) { await proveedoresService.update(editando.id, form); setAlert({ type: 'success', message: 'Proveedor actualizado' }); }
      else { await proveedoresService.create(form); setAlert({ type: 'success', message: 'Proveedor registrado' }); }
      setModal(false); cargar();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' }); }
  };

  const eliminar = async () => {
    try { await proveedoresService.delete(confirmDelete.id); setAlert({ type: 'success', message: 'Proveedor desactivado' }); setConfirmDelete(null); cargar(); }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Razón Social', render: (row) => <strong>{row.razon_social}</strong> },
    { header: 'RUC', accessor: 'ruc' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Estado', render: (row) => <Badge variant={row.estado ? 'success' : 'danger'}>{row.estado ? 'Activo' : 'Inactivo'}</Badge> },
    { header: 'Acciones', width: '100px', render: (row) => (
      <div className="actions">
        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => abrirModal(row)}><FiEdit2 /></button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmDelete(row)}><FiTrash2 /></button>
      </div>
    )}
  ];

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Gestión de Proveedores</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => abrirModal()}>Nuevo Proveedor</Button>
      </div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}
      <Card>
        <div className="toolbar"><div className="toolbar-left"><SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar proveedor..." /></div></div>
        <DataTable columns={columns} data={proveedores} emptyMessage="No hay proveedores" />
      </Card>
      {modal && (
        <Modal title={editando ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={() => setModal(false)}
          footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button variant="primary" onClick={guardar}>Guardar</Button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Razón Social *</label><input className="form-input" value={form.razon_social} onChange={e => setForm({...form, razon_social: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">RUC *</label><input className="form-input" value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} maxLength={11} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Correo</label><input className="form-input" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
        </Modal>
      )}
      {confirmDelete && <ConfirmDialog message={`¿Desactivar el proveedor "${confirmDelete.razon_social}"?`} onConfirm={eliminar} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

export default Proveedores;
