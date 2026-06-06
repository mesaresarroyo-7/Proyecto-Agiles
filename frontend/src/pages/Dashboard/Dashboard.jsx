// =====================================================
// Página Dashboard - Panel principal con estadísticas
// =====================================================
import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { SummaryCard, Card, Loading, Badge } from '../../components/ui';
import { FiPackage, FiAlertTriangle, FiDollarSign, FiShoppingCart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await dashboardService.getData();
      setData(res.data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!data) return <p>Error al cargar datos</p>;

  const { tarjetas, productos_mas_vendidos, ventas_por_mes, productos_bajo_stock, ultimos_movimientos, entradas_salidas } = data;

  // Gráfico: Ventas por mes
  const ventasMesData = {
    labels: ventas_por_mes.map(v => v.mes_nombre),
    datasets: [{
      label: 'Ventas (S/)',
      data: ventas_por_mes.map(v => parseFloat(v.total)),
      backgroundColor: 'rgba(27, 94, 32, 0.15)',
      borderColor: '#1b5e20',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1b5e20',
      pointRadius: 4,
    }]
  };

  // Gráfico: Productos más vendidos
  const topProductosData = {
    labels: productos_mas_vendidos.map(p => p.nombre.substring(0, 20)),
    datasets: [{
      label: 'Unidades vendidas',
      data: productos_mas_vendidos.map(p => parseInt(p.total_vendido)),
      backgroundColor: ['#1b5e20', '#2e7d32', '#43a047', '#66bb6a', '#81c784'],
      borderWidth: 0,
      borderRadius: 6,
    }]
  };

  // Gráfico: Entradas y Salidas
  const entradasSalidasData = {
    labels: entradas_salidas.map(e => e.mes_nombre),
    datasets: [
      {
        label: 'Entradas',
        data: entradas_salidas.map(e => parseInt(e.entradas)),
        backgroundColor: 'rgba(67, 160, 71, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Salidas',
        data: entradas_salidas.map(e => parseInt(e.salidas)),
        backgroundColor: 'rgba(229, 57, 53, 0.7)',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332',
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 } } }
    }
  };

  const barOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 12 } } } } };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Panel de Control</h2>
      </div>

      {/* Tarjetas resumen */}
      <div className="dashboard-cards">
        <SummaryCard title="Total Productos" value={tarjetas.total_productos} icon={<FiPackage />} color="blue" />
        <SummaryCard title="Stock Bajo" value={tarjetas.stock_bajo} icon={<FiAlertTriangle />} color="red" />
        <SummaryCard title="Total Ventas" value={`S/ ${tarjetas.total_ventas.toFixed(2)}`} icon={<FiTrendingUp />} color="green" />
        <SummaryCard title="Total Compras" value={`S/ ${tarjetas.total_compras.toFixed(2)}`} icon={<FiShoppingCart />} color="orange" />
        <SummaryCard title="Nro. Ventas" value={tarjetas.cantidad_ventas} icon={<FiDollarSign />} color="green" />
        <SummaryCard title="Nro. Compras" value={tarjetas.cantidad_compras} icon={<FiTrendingDown />} color="blue" />
      </div>

      {/* Gráficos */}
      <div className="dashboard-charts">
        <Card title="Ventas por Mes">
          <div className="chart-container">
            <Line data={ventasMesData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Productos Más Vendidos">
          <div className="chart-container">
            <Bar data={topProductosData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Entradas y Salidas de Inventario">
          <div className="chart-container">
            <Bar data={entradasSalidasData} options={barOptions} />
          </div>
        </Card>

        <Card title="Productos con Bajo Stock">
          <div className="data-table-container" style={{ maxHeight: 280, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos_bajo_stock.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre}</td>
                    <td><strong>{p.stock_actual}</strong></td>
                    <td>{p.stock_minimo}</td>
                    <td>
                      <Badge variant={p.stock_actual === 0 ? 'danger' : 'warning'}>
                        {p.stock_actual === 0 ? 'Sin stock' : 'Bajo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {productos_bajo_stock.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Sin alertas de stock</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <Card title="Últimos Movimientos de Inventario">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {ultimos_movimientos.map((m, i) => (
                <tr key={i}>
                  <td>{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                  <td>{m.producto}</td>
                  <td>
                    <Badge variant={m.tipo === 'Entrada' ? 'success' : 'danger'}>
                      {m.tipo}
                    </Badge>
                  </td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
