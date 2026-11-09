import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import PortfolioChart from '../components/PortfolioChart';
import TradeModal from '../components/TradeModal';
import Toast from '../components/Toast';
import useLivePrices from '../hooks/useLivePrices';

const Portfolio = () => {
  const { user } = useContext(AuthContext);
  const { prices } = useLivePrices();

  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings');
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [toast, setToast] = useState(null);
  const [histFilter, setHistFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const [portRes, histRes] = await Promise.all([
        api.get('/trade/portfolio'),
        api.get('/trade/history')
      ]);
      setPortfolio(portRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner text="Loading portfolio..." />;

  const cashBalance = user?.virtualBalance || 0;

  // Apply live price updates to holdings
  const liveHoldings = portfolio?.holdings?.map(h => {
    const live = prices[h.stockId];
    if (live) {
      const cost = h.quantity * h.averageBuyPrice;
      const value = h.quantity * live.currentPrice;
      return {
        ...h,
        currentPrice: live.currentPrice,
        currentValue: value,
        profitLoss: value - cost,
        profitLossPercentage: cost > 0 ? (((value - cost) / cost) * 100).toFixed(2) : '0.00'
      };
    }
    return h;
  }) || [];

  // Recalculate totals with live data
  const investedAmount = liveHoldings.reduce((s, h) => s + h.quantity * h.averageBuyPrice, 0);
  const currentValue = liveHoldings.reduce((s, h) => s + (h.currentValue ?? h.quantity * h.currentPrice), 0);
  const totalProfitLoss = currentValue - investedAmount;
  const profitLossPercentage = investedAmount > 0 ? ((totalProfitLoss / investedAmount) * 100).toFixed(2) : '0.00';
  const totalValue = cashBalance + currentValue;

  const plClass = totalProfitLoss >= 0 ? 'text-gain' : 'text-loss';
  const plSign = totalProfitLoss >= 0 ? '+' : '';

  const filteredHistory = histFilter === 'ALL' ? history :
    history.filter(t => t.transactionType === histFilter);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My <span>Portfolio</span></h1>
          <p className="page-subtitle">Live P&L · Holdings update in real-time via WebSocket</p>
        </div>

        {/* Summary Cards */}
        <div className="portfolio-stats mb-6">
          {[
            { label: '💵 Cash', value: `$${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: 'var(--gradient-blue)', sub: 'Available to trade', cls: 'text-cyan' },
            { label: '📊 Invested', value: `$${investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: 'var(--gradient-purple)', sub: `${liveHoldings.length} positions` },
            { label: '💼 Holdings Value', value: `$${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: 'var(--gradient-blue)', sub: 'Live market value' },
            { label: '📈 Total P&L', value: `${plSign}$${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: totalProfitLoss >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)', sub: `${plSign}${profitLossPercentage}%`, cls: plClass },
            { label: '🏦 Net Worth', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: 'var(--gradient-green)', sub: 'Cash + Holdings' },
          ].map(c => (
            <div key={c.label} className="stat-card" style={{ '--accent-gradient': c.gradient }}>
              <div className="stat-label">{c.label}</div>
              <div className={`stat-value ${c.cls || ''}`} style={{ fontSize: '1.3rem' }}>{c.value}</div>
              {c.sub && <div className="stat-sub">{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* Chart + Holdings Split */}
        {liveHoldings.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="section-title mb-4">Portfolio Allocation</div>
              <div style={{ maxHeight: '280px', display: 'flex', justifyContent: 'center' }}>
                <PortfolioChart holdings={liveHoldings} />
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div className="section-title mb-4">Quick Stats</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Positions</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{liveHoldings.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transactions</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{history.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Winning Pos.</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                    {liveHoldings.filter(h => h.profitLoss >= 0).length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Losing Pos.</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-red)' }}>
                    {liveHoldings.filter(h => h.profitLoss < 0).length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Best performer</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                    {liveHoldings.length > 0
                      ? liveHoldings.reduce((best, h) =>
                        parseFloat(h.profitLossPercentage) > parseFloat(best.profitLossPercentage) ? h : best
                      ).symbol
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['holdings', 'history'].map(tab => (
            <button key={tab} id={`tab-${tab}`}
              className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'holdings' ? `📂 Holdings (${liveHoldings.length})` : `🕐 History (${history.length})`}
            </button>
          ))}

          {activeTab === 'history' && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              {['ALL', 'BUY', 'SELL'].map(f => (
                <button key={f} className={`btn btn-sm ${histFilter === f ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setHistFilter(f)}>{f}</button>
              ))}
            </div>
          )}
        </div>

        {/* Holdings */}
        {activeTab === 'holdings' && (
          liveHoldings.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No holdings yet.</p>
              <Link to="/market" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Market →</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th><th>Company</th><th>Qty</th>
                    <th>Avg Cost</th><th>Current Price</th><th>Value</th>
                    <th>P&L</th><th>P&L %</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {liveHoldings.map(h => {
                    const isGain = h.profitLoss >= 0;
                    return (
                      <tr key={h.stockId} style={{ borderLeft: `3px solid ${isGain ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
                        <td><span className="stock-symbol">{h.symbol}</span></td>
                        <td className="td-primary">{h.companyName}</td>
                        <td>{h.quantity}</td>
                        <td>${h.averageBuyPrice?.toFixed(2)}</td>
                        <td className="td-primary">${h.currentPrice?.toFixed(2)}</td>
                        <td>${(h.currentValue ?? 0).toFixed(2)}</td>
                        <td className={`${isGain ? 'text-gain' : 'text-loss'} font-semibold`}>
                          {isGain ? '+' : ''}${h.profitLoss?.toFixed(2)}
                        </td>
                        <td className={isGain ? 'text-gain' : 'text-loss'}>
                          {isGain ? '+' : ''}{h.profitLossPercentage}%
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" id={`trade-holding-${h.symbol}`}
                            onClick={() => setSelectedStock({ _id: h.stockId, symbol: h.symbol, companyName: h.companyName, currentPrice: h.currentPrice })}>
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* History */}
        {activeTab === 'history' && (
          filteredHistory.length === 0 ? (
            <div className="card empty-state"><div className="empty-state-icon">📋</div><p>No transactions.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Date & Time</th><th>Symbol</th><th>Company</th><th>Type</th><th>Qty</th><th>Price/Share</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {filteredHistory.map(t => (
                    <tr key={t._id}>
                      <td className="text-xs text-muted-custom">{new Date(t.createdAt).toLocaleString()}</td>
                      <td><span className="stock-symbol">{t.stockId?.symbol || '—'}</span></td>
                      <td className="td-primary">{t.stockId?.companyName || '—'}</td>
                      <td><span className={`badge ${t.transactionType === 'BUY' ? 'badge-gain' : 'badge-loss'}`}>{t.transactionType === 'BUY' ? '▲' : '▼'} {t.transactionType}</span></td>
                      <td>{t.quantity}</td>
                      <td>${t.pricePerShare?.toFixed(2)}</td>
                      <td className="td-primary font-semibold">${t.totalAmount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {selectedStock && (
        <TradeModal stock={selectedStock} onClose={() => { setSelectedStock(null); fetchData(); }}
          onSuccess={(data) => { setToast({ message: data.message, type: 'success' }); fetchData(); setSelectedStock(null); }} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Portfolio;
