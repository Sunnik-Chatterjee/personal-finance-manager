# Aurora Finance

A full-stack **Personal Finance Manager** built with the MEAN stack. Track income, expenses, and savings with real-time analytics, interactive charts, and a modern dark/light UI.

---

## Features

- **Authentication** — JWT-based register/login with bcrypt password hashing
- **Transaction Management** — Create, read, update, and delete income and expense transactions
- **Dashboard Analytics** — Monthly cash flow, expense breakdown, savings trajectory, and income vs expense comparison using ApexCharts
- **Smart Insights** — Automated savings rate analysis and contextual financial feedback
- **Filtering & Pagination** — Filter transactions by type, category, date range, and keyword search
- **Dark / Light Theme** — System-aware theme with manual override, persisted to localStorage
- **Responsive UI** — Glassmorphism design with smooth micro-animations
- **Security** — Helmet headers, CORS, rate limiting (100 req / 15 min on auth routes), JWT expiry

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Angular 19, TypeScript, SCSS            |
| Backend    | Node.js, Express 5                      |
| Database   | MongoDB Atlas (Mongoose ODM)            |
| Auth       | JSON Web Tokens, bcryptjs               |
| Charts     | ApexCharts (ng-apexcharts)              |
| Animations | Rive                                    |
| Security   | Helmet, CORS, express-rate-limit        |
| Deployment | Render (backend), Vercel (frontend)     |

---

## Architecture

```
personal-finance-manager/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # DB connection, categories config
│   │   ├── controllers/      # Route handler functions
│   │   ├── middleware/       # Auth guard, error handler, response helpers
│   │   ├── models/           # Mongoose schemas (User, Transaction)
│   │   ├── routes/           # Express routers
│   │   └── services/         # Business logic layer
│   └── server.js             # Entry point
└── frontend/
    └── finance-ui/           # Angular application
        └── src/
            ├── app/
            │   ├── components/   # Standalone reusable components
            │   ├── core/         # Services, guards, interceptors, models
            │   ├── pages/        # Feature pages (dashboard, transactions, login, register)
            │   └── shared/       # Shared UI components (navbar, modal, toast, etc.)
            └── environments/     # Dev / production environment config
```

---

## Screenshots

> _(Add screenshots here)_

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
```

Copy `backend/.env.example` as a starting point.

### Frontend (`frontend/finance-ui/src/environments/`)

| File                   | Purpose                        |
|------------------------|--------------------------------|
| `environment.ts`       | Development — points to `localhost:5000` |
| `environment.prod.ts`  | Production — points to your deployed API URL |

---

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env      # Fill in your values
npm install
npm run dev               # Starts with nodemon on PORT 5000
```

### Frontend

```bash
cd frontend/finance-ui
npm install
ng serve                  # Starts dev server on http://localhost:4200
```

---

## API Overview

All endpoints return JSON in the shape `{ success, data, message }`.

| Method | Endpoint                    | Auth | Description               |
|--------|-----------------------------|------|---------------------------|
| GET    | `/api/health`               | No   | Health check              |
| POST   | `/api/auth/register`        | No   | Register new user         |
| POST   | `/api/auth/login`           | No   | Login and receive JWT     |
| GET    | `/api/transactions`         | Yes  | List transactions (filterable, paginated) |
| POST   | `/api/transactions`         | Yes  | Create transaction        |
| GET    | `/api/transactions/:id`     | Yes  | Get single transaction    |
| PUT    | `/api/transactions/:id`     | Yes  | Update transaction        |
| DELETE | `/api/transactions/:id`     | Yes  | Delete transaction        |
| GET    | `/api/transactions/categories` | No | List available categories |
| GET    | `/api/dashboard/summary`    | Yes  | Aggregated financial summary |

### Transaction Filters (query params)

`type`, `category`, `dateFrom`, `dateTo`, `page`, `limit`

---

## Production Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `node server.js`
4. Add all environment variables from `.env.example`
5. Set `CLIENT_URL` to your deployed frontend URL

### Frontend (Vercel)

1. Set `apiUrl` in `environment.prod.ts` to your Render backend URL
2. Deploy with `npm run build` — output is in `dist/finance-ui/browser`
3. Configure Vercel to serve `index.html` for all routes (SPA fallback)

---

## Future Improvements

- [ ] Budget planning and monthly spending goals
- [ ] Recurring transaction templates
- [ ] CSV / PDF export of transaction history
- [ ] Multi-currency support
- [ ] OAuth 2.0 login (Google)
- [ ] Push notifications for budget threshold alerts

---

## Author

**Sunnik Chatterjee**  
[GitHub](https://github.com/Sunnik-Chatterjee) · [LinkedIn](https://linkedin.com/in/sunnikchatterjee)
