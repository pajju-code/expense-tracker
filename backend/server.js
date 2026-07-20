// server.js
// Entry point for the API. Wires together middleware and routes.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const requireAuth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // allows the frontend (different origin) to call this API
app.use(express.json()); // parses JSON request bodies into req.body

// Public routes - no login required
app.use('/', authRoutes); // /signup, /login

// Protected routes - requireAuth runs before every /expenses request
app.use('/expenses', requireAuth, expenseRoutes);

// Simple health check, useful once you deploy this
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
