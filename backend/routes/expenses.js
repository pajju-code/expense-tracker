// routes/expenses.js
// Full CRUD for expenses. Every route here assumes requireAuth has already
// run (see server.js), so req.userId is available and trustworthy.

const express = require('express');
const { loadData, saveData } = require('../db');

const router = express.Router();

// GET /expenses - list all expenses for the logged-in user
router.get('/', (req, res) => {
  const data = loadData();
  const expenses = data.expenses
    .filter((e) => e.user_id === req.userId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  res.json(expenses);
});

// POST /expenses - create a new expense
router.post('/', (req, res) => {
  const { amount, category, description, date } = req.body;

  if (amount == null || !category || !date) {
    return res.status(400).json({ error: 'amount, category, and date are required' });
  }

  const data = loadData();
  const expense = {
    id: data.nextExpenseId,
    user_id: req.userId,
    amount,
    category,
    description: description || null,
    date,
  };
  data.expenses.push(expense);
  data.nextExpenseId += 1;
  saveData(data);

  res.status(201).json(expense);
});

// PUT /expenses/:id - update an expense (only if it belongs to this user)
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = loadData();
  const expense = data.expenses.find((e) => e.id === id && e.user_id === req.userId);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const { amount, category, description, date } = req.body;
  if (amount != null) expense.amount = amount;
  if (category != null) expense.category = category;
  if (description != null) expense.description = description;
  if (date != null) expense.date = date;

  saveData(data);
  res.json(expense);
});

// DELETE /expenses/:id - delete an expense (only if it belongs to this user)
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = loadData();
  const index = data.expenses.findIndex((e) => e.id === id && e.user_id === req.userId);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  data.expenses.splice(index, 1);
  saveData(data);
  res.status(204).send();
});

// GET /expenses/summary/by-category - totals grouped by category (for the chart)
router.get('/summary/by-category', (req, res) => {
  const data = loadData();
  const mine = data.expenses.filter((e) => e.user_id === req.userId);

  const totals = {};
  mine.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });

  const summary = Object.entries(totals).map(([category, total]) => ({ category, total }));
  res.json(summary);
});

module.exports = router;
