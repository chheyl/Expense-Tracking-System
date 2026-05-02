import { useState } from 'react'
import axios from 'axios'

const API = 'https://expense-tracker-backend-1j0m.onrender.com/api'
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Salary', 'Freelance', 'Other']

export default function AddTransaction({ token, onAdd }) {
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.title || !form.amount) return setMsg('Please fill all fields')
    setLoading(true)
    try {
      await axios.post(`${API}/transactions`, { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${token}` } })
      setMsg('Transaction added!')
      setForm({ title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] })
      setTimeout(() => { onAdd(); setMsg(''); }, 1500)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error adding transaction')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Add Transaction</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input placeholder="Title e.g. Lunch" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          style={{ ...inputStyle, gridColumn: '1 / -1' }} />
        <input placeholder="Amount" type="number" value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          style={inputStyle} />
        <input type="date" value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          style={inputStyle} />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={submit} disabled={loading} style={{
        marginTop: '1rem', width: '100%', padding: '12px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        border: 'none', borderRadius: '10px', color: 'white',
        fontWeight: 600, fontSize: '14px', cursor: 'pointer'
      }}>
        {loading ? 'Adding...' : '+ Add Transaction'}
      </button>
      {msg && <p style={{ marginTop: '10px', color: msg.includes('added') ? '#22c55e' : '#f87171', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
    </div>
  )
}

const inputStyle = {
  padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid #334155', background: '#0f172a',
  color: '#e2e8f0', fontSize: '14px', outline: 'none'
}
