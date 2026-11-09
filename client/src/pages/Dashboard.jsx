import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, historyRes] = await Promise.all([
          api.get('/trade/portfolio'),
          api.get('/trade/history')
        ]);
        setPortfolio(portfolioRes.data);
        setHistory(historyRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const totalValue = (portfolio?.currentValue || 0) + (user?.virtualBalance || 0);
  const plClass = (portfolio?.totalProfitLoss || 0) >= 0 ? 'text-gain' : 'text-loss';
  const plSign = (portfolio?.totalProfitLoss || 0) >= 0 ? '+' : '';

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's your portfolio summary for today</p>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid mb-8">
          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-blue)' }}>
            <div className="stat-label">💵 Cash Balance</div>
            <div className="stat-value text-cyan">
              ${user?.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-sub">Available to trade</div>
          </div>

          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-purple)' }}>
            <div className="stat-label">📊 Holdings Value</div>
            <div className="stat-value">
              ${(portfolio?.currentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-sub">{portfolio?.holdings?.length || 0} positions open</div>
          </div>

          <div className="stat-card" style={{ '--accent-gradient': portfolio?.totalProfitLoss >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)' }}>
            <div className="stat-label">📈 Total P&L</div>
            <div className={`stat-value ${plClass}`}>
              {plSign}${Math.abs(portfolio?.totalProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-sub">
              {plSign}{portfolio?.profitLossPercentage || '0.00'}% overall return
            </div>
          </div>

          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-green)' }}>
            <div className="stat-label">🏦 Total Portfolio</div>
            <div className="stat-value">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-sub">Cash + Holdings</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap mb-8">
          <Link to="/market" className="btn btn-primary">📈 Browse Market</Link>
          <Link to="/portfolio" className="btn btn-outline">📂 View Portfolio</Link>
        </div>

        {/* Recent Transactions */}
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <Link to="/portfolio" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {history.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No transactions yet. <Link to="/market" style={{ color: 'var(--accent-blue)' }}>Start trading!</Link></p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map(t => (
                  <tr key={t._id}>
                    <td className="text-xs text-muted-custom">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="stock-symbol">{t.stockId?.symbol || '—'}</span>
                    </td>
                    <td className="td-primary">{t.stockId?.companyName || '—'}</td>
                    <td>
                      <span className={`badge ${t.transactionType === 'BUY' ? 'badge-gain' : 'badge-loss'}`}>
                        {t.transactionType === 'BUY' ? '▲' : '▼'} {t.transactionType}
                      </span>
                    </td>
                    <td>{t.quantity}</td>
                    <td>${t.pricePerShare?.toFixed(2)}</td>
                    <td className="td-primary">${t.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
