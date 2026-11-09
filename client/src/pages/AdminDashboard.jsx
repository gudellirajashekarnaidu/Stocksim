import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // New stock form state
  const [newStock, setNewStock] = useState({
    symbol: '', companyName: '', currentPrice: '', previousPrice: '',
    sector: '', description: '', dailyHigh: '', dailyLow: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, stocksRes, txRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/stocks?limit=50'),
          api.get('/admin/transactions')
        ]);
        setUsers(usersRes.data);
        setStocks(stocksRes.data.stocks || []);
        setTransactions(txRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock?')) return;
    try {
      await api.delete(`/admin/stocks/${id}`);
      setStocks(prev => prev.filter(s => s._id !== id));
      setToast({ message: 'Stock deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...newStock,
        currentPrice: parseFloat(newStock.currentPrice),
        previousPrice: parseFloat(newStock.previousPrice),
        dailyHigh: newStock.dailyHigh ? parseFloat(newStock.dailyHigh) : undefined,
        dailyLow: newStock.dailyLow ? parseFloat(newStock.dailyLow) : undefined,
        historicalPrices: Array.from({ length: 10 }, (_, i) => ({
          date: new Date(Date.now() - (10 - i) * 86400000),
          price: parseFloat(newStock.currentPrice) * (0.95 + Math.random() * 0.1)
        }))
      };
      const { data } = await api.post('/admin/stocks', payload);
      setStocks(prev => [data, ...prev]);
      setNewStock({ symbol: '', companyName: '', currentPrice: '', previousPrice: '', sector: '', description: '', dailyHigh: '', dailyLow: '' });
      setToast({ message: `${data.symbol} added to market`, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to add stock', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin panel..." />;

  const totalBalance = users.reduce((sum, u) => sum + (u.virtualBalance || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header flex items-center gap-3">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 className="page-title" style={{ marginBottom: 0 }}>Admin <span>Panel</span></h1>
              <span className="admin-badge">⚡ ADMIN</span>
            </div>
            <p className="page-subtitle">Manage stocks, users, and market data</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="admin-grid mb-8">
          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-blue)' }}>
            <div className="stat-label">👥 Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-purple)' }}>
            <div className="stat-label">📊 Total Stocks</div>
            <div className="stat-value">{stocks.length}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-green)' }}>
            <div className="stat-label">🔄 Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'var(--gradient-blue)' }}>
            <div className="stat-label">💰 Total Virtual Cash</div>
            <div className="stat-value text-cyan" style={{ fontSize: '1.2rem' }}>
              ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'stocks', 'add-stock', 'transactions'].map(tab => (
            <button
              key={tab}
              id={`admin-tab-${tab}`}
              className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '👥 Users'}
              {tab === 'stocks' && '📈 Stocks'}
              {tab === 'add-stock' && '➕ Add Stock'}
              {tab === 'transactions' && '🔄 Transactions'}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'overview' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Balance</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="td-primary">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? '' : 'badge-neutral'}`}
                        style={u.role === 'ADMIN' ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' } : {}}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-cyan">${u.virtualBalance?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="text-xs text-muted-custom">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th><th>Company</th><th>Sector</th><th>Price</th><th>Prev Price</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(s => {
                  const isGain = s.currentPrice >= s.previousPrice;
                  return (
                    <tr key={s._id}>
                      <td><span className="stock-symbol">{s.symbol}</span></td>
                      <td className="td-primary">{s.companyName}</td>
                      <td className="text-muted-custom text-sm">{s.sector || '—'}</td>
                      <td className={isGain ? 'text-gain font-semibold' : 'text-loss font-semibold'}>
                        ${s.currentPrice?.toFixed(2)}
                      </td>
                      <td>${s.previousPrice?.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          id={`delete-stock-${s.symbol}`}
                          onClick={() => handleDeleteStock(s._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Stock Tab */}
        {activeTab === 'add-stock' && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 className="section-title mb-6">Add New Stock</h2>
            <form id="add-stock-form" onSubmit={handleAddStock}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { id: 'ns-symbol', label: 'Symbol', key: 'symbol', placeholder: 'AAPL', required: true },
                  { id: 'ns-sector', label: 'Sector', key: 'sector', placeholder: 'Technology' },
                  { id: 'ns-price', label: 'Current Price', key: 'currentPrice', placeholder: '175.50', required: true, type: 'number' },
                  { id: 'ns-prev', label: 'Previous Price', key: 'previousPrice', placeholder: '172.00', required: true, type: 'number' },
                  { id: 'ns-high', label: 'Daily High', key: 'dailyHigh', placeholder: '178.00', type: 'number' },
                  { id: 'ns-low', label: 'Daily Low', key: 'dailyLow', placeholder: '173.00', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="form-group">
                    <label className="form-label" htmlFor={field.id}>{field.label}</label>
                    <input
                      id={field.id}
                      type={field.type || 'text'}
                      className="form-input"
                      placeholder={field.placeholder}
                      value={newStock[field.key]}
                      onChange={e => setNewStock(p => ({ ...p, [field.key]: e.target.value }))}
                      required={field.required}
                      step={field.type === 'number' ? '0.01' : undefined}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ns-name">Company Name</label>
                <input
                  id="ns-name"
                  type="text"
                  className="form-input"
                  placeholder="Apple Inc."
                  value={newStock.companyName}
                  onChange={e => setNewStock(p => ({ ...p, companyName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ns-desc">Description</label>
                <input
                  id="ns-desc"
                  type="text"
                  className="form-input"
                  placeholder="Brief company description..."
                  value={newStock.description}
                  onChange={e => setNewStock(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-success" id="add-stock-submit" disabled={formLoading}>
                {formLoading ? '⏳ Adding...' : '➕ Add Stock to Market'}
              </button>
            </form>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>User</th><th>Symbol</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td className="text-xs text-muted-custom">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="td-primary">{t.userId?.name || '—'}</td>
                    <td><span className="stock-symbol">{t.stockId?.symbol || '—'}</span></td>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminDashboard;
