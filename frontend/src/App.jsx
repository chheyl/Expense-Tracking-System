import { useState, useEffect } from "react";
import Login from "./component/login.jsx";
import Dashboard from "./component/dashboard.jsx";
import AddTransaction from "./component/addtransaction.jsx";
import TransactionList from "./component/transactionlist.jsx";
import Charts from "./component/charts";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) return <Login onLogin={handleLogin} />
  return <Dashboard token={token} onLogout={handleLogout} />
}
