// =====================================================
// Página de Gestión de Categorías
// =====================================================
import { useState, useEffect } from 'react';
import { categoriasService } from '../../services/api';
import { Button, Card, DataTable, Modal, Alert, Loading, Badge, ConfirmDialog } from '../../components/ui';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await categoriasService.getAll();
      setCategorias(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const abrirModal = (item = null) => {
    if (item) { setEditando(item); setForm({ nombre: item.nombre, descripcion: item.descripcion || '' }); }
    else { setEditando(null); setForm({ nombre: '', descripcion: '' }); }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre) { setAlert({ type: 'error', message: 'El nombre es obligatorio' }); return; }
    try {
      if (editando) { await categoriasService.update(editando.id, form); setAlert({ type: 'success', message: 'Categoría actualizada' }); }
      else { await categoriasService.create(form); setAlert({ type: 'success', message: 'Categoría creada' }); }
      setModal(false); cargar();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' }); }
  };

  const eliminar = async () => {
    try {
      await categoriasService.delete(confirmDelete.id);
      setAlert({ type: 'success', message: 'Categoría desactivada' });
      setConfirmDelete(null); cargar();
    } catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Nombre', render: (row) => <strong>{row.nombre}</strong> },
    { header: 'Descripción', accessor: 'descripcion' },
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
        <h2>Gestión de Categorías</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => abrirModal()}>Nueva Categoría</Button>
      </div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}
      <Card>
        <DataTable columns={columns} data={categorias} emptyMessage="No hay categorías" />
      </Card>
      {modal && (
        <Modal title={editando ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModal(false)}
          footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button variant="primary" onClick={guardar}>Guardar</Button></>}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre de la categoría" />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción de la categoría" />
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmDialog message={`¿Desactivar la categoría "${confirmDelete.nombre}"?`} onConfirm={eliminar} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

export default Categorias;
