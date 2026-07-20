# Expense Tracker

A full-stack expense tracker built to practice CRUD, auth, and databases —
good as a portfolio/interview project.

**Stack:** Node.js + Express, a simple JSON-file database (`data.json`, no native modules to compile), JWT auth, vanilla HTML/CSS/JS frontend, Chart.js for the spending chart.

> **Why a JSON file instead of a real SQL database?** Libraries like SQLite/Postgres drivers often need a C++ compiler on your machine to install (Visual Studio on Windows). To keep setup painless for a first project, this version stores data in a plain JSON file using only Node's built-in `fs` module — no extra install headaches. Once you're comfortable, swapping this for real SQLite/Postgres is a great next step and a good interview talking point ("I started with a JSON file, then migrated to Postgres because...").

## Project structure

```
expense-tracker/
  backend/
    server.js          <- entry point
    db.js               <- SQLite setup
    middleware/auth.js  <- JWT verification
    routes/auth.js      <- signup / login
    routes/expenses.js  <- CRUD + category summary
    .env.example
    package.json
  frontend/
    index.html          <- dashboard (list/add/delete expenses + chart)
    login.html
    signup.html
    style.css
    auth.js              <- shared fetch/token helpers
    app.js               <- dashboard logic
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to any long random string (this signs your login tokens).

Run it:
```bash
npm start
```
You should see `Server running on http://localhost:4000`.

A file called `expenses.db` will appear in `backend/` — that's your SQLite database, created automatically on first run.

### 2. Frontend

No build step needed — just open the files in a browser. Easiest way:

```bash
cd frontend
npx serve .
```
(or use the VS Code "Live Server" extension, or just double-click `signup.html`)

Then visit the served address, sign up, log in, and start adding expenses.

## How to test the API directly (before touching the frontend)

Use `curl` or Postman to test each route as you build it:

```bash
# sign up
curl -X POST http://localhost:4000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'

# copy the token from the response, then:
curl http://localhost:4000/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# add an expense
curl -X POST http://localhost:4000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"amount": 42.50, "category": "Food", "description": "Groceries", "date": "2026-07-20"}'
```

## Next steps to extend it (good interview talking points)

- Add budgets per category with over-budget warnings
- Add recurring expenses
- Export expenses to CSV
- Add pagination/filtering (by date range, category)
- Move from JWT-in-localStorage to httpOnly cookies (more secure, more complex — good to discuss tradeoffs)
- Write tests (Jest + supertest for the backend)
- Deploy: backend to Render/Railway, frontend to Netlify/Vercel

## A note on this specific build

`npm install` only needs to download plain JavaScript packages this time (no
native/C++ compilation), so it should work on any machine with Node and
internet access, no extra build tools required.
