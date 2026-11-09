import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LiveTicker from './components/LiveTicker';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import StockDetails from './pages/StockDetails';
import Portfolio from './pages/Portfolio';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <LiveTicker />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/market" element={<Market />} />
          <Route path="/stock/:id" element={<StockDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute adminRequired={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
