import axios from 'axios'

const API = 'http://localhost:5000/api'

const CATEGORY_COLORS = {
  Food: '#f97316', Transport: '#3b82f6', Shopping: '#ec4899',
  Bills: '#f59e0b', Health: '#22c55e', Entertainment: '#a855f7',
  Salary: '#6366f1', Freelance: '#14b8a6', Other: '#94a3b8'
}

export default function TransactionList({ transactions, token, onDelete }) {
  const deleteTransaction = async (id) => {
    await axios.delete(`${API}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    onDelete()
  }

  if (transactions.length === 0)
    return <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No transactions yet. Add one!</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {transactions.map(t => (
        <div key={t._id} style={{
          background: '#1e293b', borderRadius: '12px',
          padding: '14px 16px', display: 'flex',
          alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: CATEGORY_COLORS[t.category] + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0
          }}>
            {getCategoryEmoji(t.category)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: '14px' }}>{t.title}</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
              {t.category} • {new Date(t.date).toLocaleDateString()}
            </p>
          </div>
          <p style={{ fontWeight: 700, color: t.type === 'income' ? '#22c55e' : '#f87171', fontSize: '15px' }}>
            {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
          </p>
          <button onClick={() => deleteTransaction(t._id)} style={{
            background: 'none', border: 'none', color: '#475569',
            cursor: 'pointer', fontSize: '18px', padding: '4px'
          }}>×</button>
        </div>
      ))}
    </div>
  )
}

function getCategoryEmoji(category) {
  const emojis = { Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '📄', Health: '💊', Entertainment: '🎮', Salary: '💼', Freelance: '💻', Other: '📦' }
  return emojis[category] || '📦'
}