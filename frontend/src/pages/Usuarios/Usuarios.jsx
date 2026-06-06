// =====================================================
// Página de Gestión de Usuarios
// =====================================================
import { useState, useEffect } from 'react';
import { usuariosService } from '../../services/api';
import { Button, Card, DataTable, Modal, Alert, Loading, Badge, ConfirmDialog } from '../../components/ui';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({ nombres: '', correo: '', password: '', id_rol: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [usrRes, rolRes] = await Promise.all([usuariosService.getAll(), usuariosService.getRoles()]);
      setUsuarios(usrRes.data);
      setRoles(rolRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const abrirModal = (item = null) => {
    if (item) { setEditando(item); setForm({ nombres: item.nombres, correo: item.correo, password: '', id_rol: item.id_rol }); }
    else { setEditando(null); setForm({ nombres: '', correo: '', password: '', id_rol: '' }); }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombres || !form.correo || !form.id_rol) { setAlert({ type: 'error', message: 'Nombre, correo y rol son obligatorios' }); return; }
    if (!editando && !form.password) { setAlert({ type: 'error', message: 'La contraseña es obligatoria para nuevos usuarios' }); return; }
    try {
      const data = { ...form, id_rol: parseInt(form.id_rol) };
      if (!data.password) delete data.password;
      if (editando) { await usuariosService.update(editando.id, data); setAlert({ type: 'success', message: 'Usuario actualizado' }); }
      else { await usuariosService.create(data); setAlert({ type: 'success', message: 'Usuario creado' }); }
      setModal(false); cargar();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || 'Error al guardar' }); }
  };

  const eliminar = async () => {
    try { await usuariosService.delete(confirmDelete.id); setAlert({ type: 'success', message: 'Usuario desactivado' }); setConfirmDelete(null); cargar(); }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Nombre', render: (row) => <strong>{row.nombres}</strong> },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Rol', render: (row) => <Badge variant="info">{row.rol}</Badge> },
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
        <h2>Gestión de Usuarios</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => abrirModal()}>Nuevo Usuario</Button>
      </div>
      {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}
      <Card>
        <DataTable columns={columns} data={usuarios} emptyMessage="No hay usuarios" />
      </Card>
      {modal && (
        <Modal title={editando ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModal(false)}
          footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button variant="primary" onClick={guardar}>Guardar</Button></>}>
          <div className="form-group"><label className="form-label">Nombres *</label><input className="form-input" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Correo *</label><input className="form-input" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">{editando ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Rol *</label>
            <select className="form-select" value={form.id_rol} onChange={e => setForm({...form, id_rol: e.target.value})}>
              <option value="">Seleccionar rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmDialog message={`¿Desactivar el usuario "${confirmDelete.nombres}"?`} onConfirm={eliminar} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
};

export default Usuarios;
