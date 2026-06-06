// =====================================================
// Componentes UI reutilizables
// =====================================================
import { FiSearch, FiX, FiAlertCircle, FiCheckCircle, FiPackage } from 'react-icons/fi';
import './ui.css';

// ---- Button ----
export const Button = ({ children, variant = 'primary', size, icon, className = '', ...props }) => {
  const classes = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`;
  return (
    <button className={classes} {...props}>
      {icon && <span className="btn-icon-el">{icon}</span>}
      {children}
    </button>
  );
};

// ---- Card ----
export const Card = ({ title, children, action, className = '' }) => (
  <div className={`card ${className}`}>
    {title && (
      <div className="card-header">
        <h3>{title}</h3>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="card-body">{children}</div>
  </div>
);

// ---- Summary Card (Dashboard) ----
export const SummaryCard = ({ title, value, icon, color = 'green' }) => (
  <div className="summary-card animate-slide-up">
    <div className={`summary-card-icon ${color}`}>{icon}</div>
    <div className="summary-card-info">
      <h4>{title}</h4>
      <div className="value">{value}</div>
    </div>
  </div>
);

// ---- Badge ----
export const Badge = ({ children, variant = 'success' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// ---- Data Table ----
export const DataTable = ({ columns, data, emptyMessage = 'No hay registros' }) => (
  <div className="data-table-container">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i} style={col.width ? { width: col.width } : {}}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>
              <div className="table-empty">
                <div className="table-empty-icon"><FiPackage /></div>
                <p>{emptyMessage}</p>
              </div>
            </td>
          </tr>
        ) : (
          data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ---- Modal ----
export const Modal = ({ title, children, onClose, footer, size }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}><FiX /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ---- SearchInput ----
export const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="search-input-wrapper">
    <FiSearch className="search-icon" />
    <input
      type="text"
      className="search-input"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// ---- SelectFilter ----
export const SelectFilter = ({ value, onChange, options, placeholder = 'Todos' }) => (
  <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// ---- Alert ----
export const Alert = ({ type = 'success', message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      {type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ marginLeft: 'auto' }}><FiX /></button>}
    </div>
  );
};

// ---- Loading Spinner ----
export const Loading = () => (
  <div className="loading-container">
    <div className="spinner" />
  </div>
);

// ---- Confirm Dialog ----
export const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <Modal
    title="Confirmar acción"
    onClose={onCancel}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
      </>
    }
  >
    <p className="confirm-message">{message}</p>
  </Modal>
);
