import { useState, useEffect } from 'react'
import axios from 'axios'
import AddTransaction from './addTransaction'
import TransactionList from './transactionList'
import Charts from './charts'

const API = 'https://your-expense-backend.onrender.com/api'

export default function Dashboard({ token, onLogout }) {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [categories, setCategories] = useState([])
  const [monthly, setMonthly] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    const [t, s, c, m] = await Promise.all([
      axios.get(`${API}/transactions`, { headers }),
      axios.get(`${API}/summary`, { headers }),
      axios.get(`${API}/categories`, { headers }),
      axios.get(`${API}/monthly`, { headers }),
    ])
    setTransactions(t.data)
    setSummary(s.data)
    setCategories(c.data)
    setMonthly(m.data)
  }

  const getAISummary = async () => {
    setAiLoading(true)
    setAiSummary('')
    try {
      const res = await axios.get(`${API}/ai-summary`, { headers })
      setAiSummary(res.data.summary)
    } catch (err) {
      setAiSummary('Could not load AI summary. Please try again.')
    }
    setAiLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const cardStyle = (color) => ({
    background: '#1e293b', borderRadius: '14px',
    padding: '1.5rem', borderLeft: `4px solid ${color}`
  })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>💰 Expense Tracker</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your financial dashboard</p>
        </div>
        <button onClick={onLogout} style={{
          background: 'none', border: '1.5px solid #334155',
          color: '#94a3b8', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
        }}>Log out</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle('#22c55e')}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>BALANCE</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: summary.balance >= 0 ? '#22c55e' : '#f87171' }}>
            Rs. {summary.balance.toLocaleString()}
          </p>
        </div>
        <div style={cardStyle('#6366f1')}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>INCOME</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
            Rs. {summary.income.toLocaleString()}
          </p>
        </div>
        <div style={cardStyle('#f87171')}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>EXPENSES</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171' }}>
            Rs. {summary.expense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #1e293b)',
        borderRadius: '14px', padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #312e81'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a5b4fc' }}>🤖 AI Financial Advisor</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Powered by Gemini AI</p>
          </div>
          <button onClick={getAISummary} disabled={aiLoading} style={{
            background: aiLoading ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '8px', color: 'white',
            padding: '8px 16px', fontSize: '13px',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600, transition: 'all 0.2s'
          }}>
            {aiLoading ? '✨ Analyzing...' : '✨ Analyze My Spending'}
          </button>
        </div>
        {aiSummary
          ? <p style={{
              color: '#e2e8f0', fontSize: '14px',
              lineHeight: '1.8', whiteSpace: 'pre-line',
              background: '#0f172a', borderRadius: '10px',
              padding: '1rem'
            }}>{aiSummary}</p>
          : <p style={{ color: '#475569', fontSize: '13px' }}>
              Add some transactions first, then click the button to get personalized AI insights 💡
            </p>
        }
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {['dashboard', 'add', 'transactions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none',
            background: activeTab === tab ? '#6366f1' : '#1e293b',
            color: activeTab === tab ? 'white' : '#94a3b8',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500,
            textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <Charts categories={categories} monthly={monthly} />}
      {activeTab === 'add' && <AddTransaction token={token} onAdd={() => { fetchAll(); setActiveTab('transactions') }} />}
      {activeTab === 'transactions' && <TransactionList transactions={transactions} token={token} onDelete={fetchAll} />}
    </div>
  )
}
