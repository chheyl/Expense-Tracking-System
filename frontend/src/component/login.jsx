import { useState } from 'react'
import axios from 'axios'
const API = 'https://expense-tracker-backend-1j0m.onrender.com/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (type) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/${type}`, { email, password })
      if (type === 'login') {
        onLogin(res.data.token)
      } else {
        setMsg(res.data.message)
      }
    } catch (err) {
      setMsg(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1e293b', padding: '2.5rem',
        borderRadius: '16px', width: '380px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>💰</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '8px' }}>
            Expense Tracker
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Track your money smartly
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => handle('login')} disabled={loading}
            style={{ ...btnStyle, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {loading ? 'Loading...' : 'Log In'}
          </button>
          <button onClick={() => handle('signup')} disabled={loading}
            style={{ ...btnStyle, background: 'transparent', border: '1.5px solid #6366f1', color: '#6366f1' }}>
            Sign Up
          </button>
          {msg && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '12px 16px', borderRadius: '10px',
  border: '1.5px solid #334155', background: '#0f172a',
  color: '#e2e8f0', fontSize: '14px', outline: 'none'
}

const btnStyle = {
  padding: '12px', borderRadius: '10px',
  border: 'none', color: 'white',
  fontSize: '14px', fontWeight: 600,
  cursor: 'pointer'
}
