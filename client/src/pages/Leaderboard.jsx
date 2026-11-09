import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/market/leaderboard')
      .then(res => setLeaders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏆 <span>Leaderboard</span></h1>
          <p className="page-subtitle">Top traders ranked by total portfolio value</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading rankings..." />
        ) : leaders.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🏆</div>
            <p>No traders yet. Register and start trading!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Trader</th>
                  <th>Holdings Value</th>
                  <th>Cash Balance</th>
                  <th>Total Net Worth</th>
                  <th>Return vs Start</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map(u => {
                  const startBalance = 100000;
                  const returnPct = ((u.totalValue - startBalance) / startBalance * 100).toFixed(2);
                  const isPositive = u.totalValue >= startBalance;
                  return (
                    <tr key={u._id} style={u.rank <= 3 ? { background: 'rgba(245,158,11,0.04)' } : {}}>
                      <td>
                        <span style={{ fontSize: '1.3rem' }}>
                          {medals[u.rank - 1] || `#${u.rank}`}
                        </span>
                      </td>
                      <td className="td-primary">{u.name}</td>
                      <td>${u.holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-cyan">${u.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          ${u.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isPositive ? 'badge-gain' : 'badge-loss'}`}>
                          {isPositive ? '▲' : '▼'} {Math.abs(returnPct)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
