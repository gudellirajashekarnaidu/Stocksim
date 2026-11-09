import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import TradeModal from '../components/TradeModal';
import Toast from '../components/Toast';
import useLivePrices from '../hooks/useLivePrices';

const Market = () => {
  const { user } = useContext(AuthContext);
  const { prices, newsEvents, connected } = useLivePrices();

  const [stocks, setStocks] = useState([]);
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);
  const [toast, setToast] = useState(null);
  const [flashMap, setFlashMap] = useState({});

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (sector) params.append('sector', sector);

      const [stocksRes, moversRes] = await Promise.all([
        api.get(`/stocks?${params}`),
        api.get('/market/movers')
      ]);
      setStocks(stocksRes.data.stocks || []);
      setTotal(stocksRes.data.total || 0);
      setMovers(moversRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, sector]);

  useEffect(() => {
    const t = setTimeout(fetchStocks, 300);
    return () => clearTimeout(t);
  }, [fetchStocks]);

  // Flash animation when live prices update
  useEffect(() => {
    const updates = Object.keys(prices);
    if (updates.length === 0) return;
    const newFlash = {};
    updates.forEach(id => {
      newFlash[id] = prices[id].priceChange >= 0 ? 'flash-green' : 'flash-red';
    });
    setFlashMap(prev => ({ ...prev, ...newFlash }));
    const t = setTimeout(() => {
      setFlashMap({});
    }, 900);
    return () => clearTimeout(t);
  }, [prices]);

  // Merge live prices into stock list
  const liveStocks = stocks.map(s => {
    const live = prices[s._id];
    return live ? { ...s, currentPrice: live.currentPrice, priceChange: live.priceChange, percentageChange: live.percentageChange } : s;
  });

  const calcChange = (stock) => {
    const change = stock.priceChange ?? (stock.currentPrice - stock.previousPrice);
    const pct = stock.percentageChange ?? (stock.previousPrice > 0 ? (change / stock.previousPrice * 100) : 0);
    return { change, pct };
  };

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* News Events Banner */}
        {newsEvents.length > 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '10px', padding: '10px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideUp 0.3s ease'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b', minWidth: '80px' }}>📰 BREAKING</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#f59e0b' }}>{newsEvents[0].symbol}</strong>: {newsEvents[0].headline}
              <span style={{ color: newsEvents[0].impact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginLeft: '8px', fontWeight: '700' }}>
                {newsEvents[0].impact >= 0 ? '▲' : '▼'} {Math.abs(newsEvents[0].impact * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Stock <span>Market</span></h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: connected ? 'var(--accent-green)' : 'var(--accent-red)', background: connected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: connected ? 'var(--accent-green)' : 'var(--accent-red)', animation: connected ? 'pulse-dot 2s infinite' : 'none' }} />
              {connected ? 'LIVE PRICES' : 'CONNECTING...'}
            </div>
          </div>
          <p className="page-subtitle">{total} stocks · Prices update every 10 seconds via WebSocket</p>
        </div>

        {/* Market Movers */}
        {(movers.gainers.length > 0 || movers.losers.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[['🚀 Top Gainers', movers.gainers, true], ['📉 Top Losers', movers.losers, false]].map(([title, list, isGain]) => (
              <div key={title} style={{ background: 'var(--gradient-card)', border: `1px solid ${isGain ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: isGain ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                {list.slice(0, 3).map(s => {
                  const live = prices[s._id];
                  const price = live?.currentPrice ?? s.currentPrice;
                  const pct = live?.percentageChange ?? s.pct;
                  return (
                    <Link to={`/stock/${s._id}`} key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(99,179,237,0.05)', textDecoration: 'none' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{s.symbol}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>{s.companyName?.split(' ')[0]}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>${price?.toFixed(2)}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isGain ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {isGain ? '▲' : '▼'}{Math.abs(pct).toFixed(2)}%
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="search-bar-row">
          <input id="market-search" type="text" className="form-input" placeholder="🔍 Search by company or symbol..." value={search} onChange={e => setSearch(e.target.value)} />
          <select id="market-sort" className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          <select id="market-sector" className="form-select" value={sector} onChange={e => setSector(e.target.value)}>
            <option value="">All Sectors</option>
            {['Technology','Automotive','Financial','Consumer Discretionary','Consumer Staples','Entertainment'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching market data..." />
        ) : liveStocks.length === 0 ? (
          <div className="card empty-state"><div className="empty-state-icon">🔍</div><p>No stocks found.</p></div>
        ) : (
          <div className="stock-grid">
            {liveStocks.map(stock => {
              const { change, pct } = calcChange(stock);
              const isGain = change >= 0;
              const flash = flashMap[stock._id] || '';

              return (
                <div key={stock._id} className={`stock-card ${flash}`} style={{ cursor: 'default' }}>
                  <div className="stock-card-header">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-sector">{stock.sector || 'General'}</span>
                  </div>

                  <div className="stock-name">{stock.companyName}</div>

                  <div className="stock-price-row">
                    <span className="stock-price">${stock.currentPrice?.toFixed(2)}</span>
                    <span className={`badge ${isGain ? 'badge-gain' : 'badge-loss'}`}>
                      {isGain ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className={isGain ? 'text-gain' : 'text-loss'}>
                      {isGain ? '+' : ''}${change.toFixed(2)}
                    </span>
                    {stock.volume && <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/stock/${stock._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }} id={`details-${stock.symbol}`}>
                      Details
                    </Link>
                    {user && (
                      <button
                        id={`trade-${stock.symbol}`}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedStock(stock)}
                      >
                        ⚡ Trade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline Trade Modal from Market page */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onSuccess={(data) => {
            setToast({ message: data.message, type: 'success' });
            setSelectedStock(null);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Market;
