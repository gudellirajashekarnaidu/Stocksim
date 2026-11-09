# 📈 StockSim — MERN Virtual Stock Trading Platform

A full-stack MERN application that lets users practice stock trading with $100,000 in virtual cash. No real money, real strategies.

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, React Router v6, Chart.js, Axios |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Custom CSS (dark theme, glassmorphism) |

## 📁 Project Structure

```
stocksim/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── api/          # Axios client
│       ├── components/   # Navbar, Chart, Spinner, Toast
│       ├── context/      # AuthContext (JWT)
│       └── pages/        # Landing, Login, Register, Dashboard, Market, StockDetails, Portfolio, Admin
└── server/               # Express backend
    ├── config/           # MongoDB connection
    ├── controllers/      # Auth, Stock, Trade, Admin
    ├── middleware/        # JWT auth middleware
    ├── models/           # User, Stock, Portfolio, Transaction
    ├── routes/           # API routes
    └── utils/            # Seed data
```

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Start MongoDB
```bash
mongod
```

### 2. Install & run the backend
```bash
cd server
npm install
npm run dev
```
Server starts on **http://localhost:5000**  
The database is auto-seeded with 12 stocks on first run.

### 3. Install & run the frontend
```bash
cd client
npm install
npm run dev
```
App opens on **http://localhost:5173**

## 🔑 Environment Variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stocksim
JWT_SECRET=your_secret_key_here
STARTING_BALANCE=100000
NODE_ENV=development
```

## 👤 Default Admin Account

To create an admin user, register normally then update the `role` field in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } })
```

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/profile` | ✅ | Get profile |
| GET | `/api/stocks` | ❌ | List stocks (search/sort/filter) |
| GET | `/api/stocks/:id` | ❌ | Stock details |
| POST | `/api/trade/buy` | ✅ | Buy shares |
| POST | `/api/trade/sell` | ✅ | Sell shares |
| GET | `/api/trade/portfolio` | ✅ | Portfolio summary |
| GET | `/api/trade/history` | ✅ | Transaction history |
| GET | `/api/admin/users` | 🔒 Admin | All users |
| POST | `/api/admin/stocks` | 🔒 Admin | Add stock |
| DELETE | `/api/admin/stocks/:id` | 🔒 Admin | Delete stock |
