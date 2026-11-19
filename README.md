# Batloung Farm Distribution System

An inventory and sales application for a fruit distribution business. The frontend is a plain HTML/CSS/JavaScript app served by Vite; the backend is a Node.js/Express API backed by MySQL.

## Project layout

- `database/` — MySQL schema, sample data, reports, and transaction example.
- `backend/` — Express API, organized into routes, controllers, models, and database configuration.
- `frontend/` — Vite-powered web app (`index.html`, `styles.css`, and `app.js`).

## Requirements

- Node.js and npm
- MySQL 8

## First-time setup

1. Create the database tables and sample data in MySQL by running `database/schema.sql`, then `database/seed.sql` (for example, in MySQL Workbench).
2. In `backend/`, copy `.env.example` to `.env` and set `DB_PASSWORD` to your MySQL password. Check the other `DB_*` values match your local MySQL setup.
3. Install dependencies once in each app folder:

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

## Run the application

Start the backend and frontend in **separate terminals**, from the project root:

**Terminal 1 — backend API**

```powershell
cd backend
npm run dev
```

The API starts at `http://localhost:3000`. The terminal should report `MySQL connected`.

**Terminal 2 — frontend**

```powershell
cd frontend
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend sends requests to `/api`; Vite proxies them to the backend at `http://localhost:3000`, so the frontend and API work together without hard-coded browser API URLs.

## Check the connection

Open `http://localhost:5173/api/health` in a browser or run:

```powershell
curl.exe http://localhost:5173/api/health
```

When both services and MySQL are running, the response is:

```json
{"api":"ok","database":"ok"}
```

The API base URL when accessed directly is `http://localhost:3000/api`.

## Main API routes

- Suppliers: `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id`
- Fruits: `GET/POST /fruits`, `PUT /fruits/:id`
- Stock: `GET /stock`, `GET /stock/low`, `PUT /stock/:fruitId/:size`
- Vendors: `GET/POST /vendors`, `GET/PUT /vendors/:id`, `GET /vendors/balances`
- Purchases: `GET/POST /purchases`
- Sales: `GET/POST /sales`, `POST /sales/:id/payments`
- Reports: `GET /reports/top-fruits`, `GET /reports/revenue?from=&to=`, `GET /reports/top-vendor`, `GET /reports/stock-levels`
