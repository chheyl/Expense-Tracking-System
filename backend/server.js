const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ── Models ──────────────────────────────────────────
const User = mongoose.model('User', new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  amount:      { type: Number, required: true },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  category:    { type: String, required: true },
  date:        { type: Date, default: Date.now },
}, { timestamps: true }));

// ── Auth Middleware ──────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Auth Routes ──────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash });
    res.json({ message: 'Account created! Please log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Transaction Routes ───────────────────────────────
// Get all transactions
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add
app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    if (!title || !amount || !type || !category)
      return res.status(400).json({ error: 'All fields required' });
    const transaction = await Transaction.create({
      userId: req.user.id, title, amount, type, category, date
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get totals — income, expense, balance
app.get('/api/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    res.json({ income, expense, balance: income - expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get spending by category
app.get('/api/categories', auth, async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly spending
app.get('/api/monthly', auth, async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));