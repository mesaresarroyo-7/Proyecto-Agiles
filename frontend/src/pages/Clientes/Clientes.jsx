// =====================================================
// Página de Gestión de Clientes
// =====================================================
import { useState, useEffect } from 'react';
import { clientesService } from '../../services/api';
import { Button, Card, DataTable, Modal, SearchInput, Alert, Loading, Badge, ConfirmDialog } from '../../components/ui';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({ nombres: '', apellidos: '', documento: '', telefono: '', correo: '', direccion: '' });

  useEffect(() => { cargar(); }, []);
  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [busqueda]);

  const cargar = async () => {
    try { const res = await clientesService.getAll({ busqueda }); setClientes(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const abrirModal = (item = null) => {
    if (item) { setEditando(item); setForm({ nombres: item.nombres, apellidos: item.apellidos, documento: item.documento, telefono: item.telefono || '', correo: item.correo || '', direccion: item.direccion || '' }); }
    else { setEditando(null); setForm({ nombres: '', apellidos: '', documento: '', telefono: '', correo: '', direccion: '' }); }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombres || !form.apellidos || !form.documento) { setAlert({ type: 'error', message: 'Nombres, apellidos y documento son obligatorios' }); return; }
    try {
      if (editando) { await clientesService.update(editando.id, form); setAlert({ type: 'success', message: 'Cliente actualizado' }); }
      else { await clientesService.create(form); setAlert({ type: 'success', message: 'Cliente registrado' }); }
      setModal(false); cargar();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' }); }
  };

  const eliminar = async () => {
    try { await clientesService.delete(confirmDelete.id); setAlert({ type: 'success', message: 'Cliente desactivado' }); setConfirmDelete(null); cargar(); }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Cliente', render: (row) => <strong>{row.nombres} {row.apellidos}</strong> },
    { header: 'Documento', accessor: 'documento' },
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
        <h2>Gestión de Clientes</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => abrirModal()}>Nuevo Cliente</Button>
      </div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}
      <Card>
        <div className="toolbar"><div className="toolbar-left"><SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar cliente..." /></div></div>
        <DataTable columns={columns} data={clientes} emptyMessage="No hay clientes" />
      </Card>
      {modal && (
        <Modal title={editando ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={() => setModal(false)}
          footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button variant="primary" onClick={guardar}>Guardar</Button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombres *</label><input className="form-input" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Apellidos *</label><input className="form-input" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Documento *</label><input className="form-input" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Correo</label><input className="form-input" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmDialog message={`¿Desactivar el cliente "${confirmDelete.nombres} ${confirmDelete.apellidos}"?`} onConfirm={eliminar} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

export default Clientes;
