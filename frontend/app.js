// app.js
// Powers the dashboard: loads expenses, handles the add form,
// wires up delete buttons, and draws the category chart.

requireLoginOrRedirect();

const rowsEl = document.getElementById('expense-rows');
const errorEl = document.getElementById('error');
const form = document.getElementById('add-form');
let chartInstance = null;

async function loadExpenses() {
  const res = await apiFetch('/expenses');
  if (!res) return; // apiFetch already redirected if unauthorized
  const expenses = await res.json();
  renderRows(expenses);
}

function renderRows(expenses) {
  rowsEl.innerHTML = '';
  expenses.forEach((exp) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.category}</td>
      <td>${exp.description || ''}</td>
      <td>$${exp.amount.toFixed(2)}</td>
      <td><button class="danger" style="width:auto;" data-id="${exp.id}">Delete</button></td>
    `;
    rowsEl.appendChild(tr);
  });

  // wire up delete buttons
  rowsEl.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
  });
}

async function deleteExpense(id) {
  const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
  if (!res || !res.ok) {
    errorEl.textContent = 'Could not delete that expense';
    return;
  }
  await loadExpenses();
  await loadChart();
}

async function loadChart() {
  const res = await apiFetch('/expenses/summary/by-category');
  if (!res) return;
  const summary = await res.json();

  const ctx = document.getElementById('category-chart');
  const labels = summary.map((row) => row.category);
  const totals = summary.map((row) => row.total);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data: totals }],
    },
    options: {
      plugins: {
        title: { display: true, text: 'Spending by Category' },
      },
    },
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  const res = await apiFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify({ amount, category, description, date }),
  });

  if (!res || !res.ok) {
    const data = res ? await res.json() : {};
    errorEl.textContent = data.error || 'Could not add expense';
    return;
  }

  form.reset();
  await loadExpenses();
  await loadChart();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = 'login.html';
});

loadExpenses();
loadChart();
