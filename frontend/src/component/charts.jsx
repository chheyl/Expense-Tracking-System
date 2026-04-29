import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#f59e0b', '#22c55e', '#a855f7', '#6366f1', '#14b8a6', '#94a3b8']

export default function Charts({ categories, monthly }) {
  const pieData = {
    labels: categories.map(c => c._id),
    datasets: [{ data: categories.map(c => c.total), backgroundColor: COLORS, borderWidth: 0 }]
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const incomeByMonth = Array(12).fill(0)
  const expenseByMonth = Array(12).fill(0)
  monthly.forEach(m => {
    if (m._id.type === 'income') incomeByMonth[m._id.month - 1] = m.total
    if (m._id.type === 'expense') expenseByMonth[m._id.month - 1] = m.total
  })

  const barData = {
    labels: months,
    datasets: [
      { label: 'Income', data: incomeByMonth, backgroundColor: '#6366f1', borderRadius: 6 },
      { label: 'Expenses', data: expenseByMonth, backgroundColor: '#f87171', borderRadius: 6 }
    ]
  }

  const chartOptions = { plugins: { legend: { labels: { color: '#94a3b8' } } } }
  const barOptions = { ...chartOptions, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } } } }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '14px', color: '#94a3b8' }}>SPENDING BY CATEGORY</h3>
        {categories.length > 0
          ? <Pie data={pieData} options={chartOptions} />
          : <p style={{ color: '#475569', textAlign: 'center', padding: '2rem' }}>No expense data yet</p>}
      </div>
      <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '14px', color: '#94a3b8' }}>MONTHLY OVERVIEW</h3>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  )
}