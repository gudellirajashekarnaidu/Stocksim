import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import StockChart from '../components/StockChart';
import LoadingSpinner from '../components/LoadingSpinner';
import TradeModal from '../components/TradeModal';
import Toast from '../components/Toast';
import useLivePrices from '../hooks/useLivePrices';

const StockDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { prices } = useLivePrices();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [watched, setWatched] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [priceFlash, setPriceFlash] = useState('');

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stocks/${id}`);
        setStock(data);
      } catch (err) {
        console.error('Failed to fetch stock:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [id]);

  // Fetch watchlist status
  useEffect(() => {
    if (!user || !id) return;
    api.get(`/market/watchlist/${id}/status`)
      .then(res => setWatched(res.data.watched))
      .catch(() => {});
  }, [user, id]);

  // Merge live price updates
  const liveData = prices[id];
  const displayPrice = liveData ? liveData.currentPrice : stock?.currentPrice;
  const displayChange = liveData ? liveData.priceChange : (stock?.currentPrice - stock?.previousPrice);
  const displayPct = liveData ? liveData.percentageChange : (stock?.previousPrice > 0 ? ((stock?.currentPrice - stock?.previousPrice) / stock?.previousPrice * 100) : 0);

  // Flash animation when price updates
  useEffect(() => {
    if (!liveData) return;
    setPriceFlash(liveData.priceChange >= 0 ? 'flash-green' : 'flash-red');
    const t = setTimeout(() => setPriceFlash(''), 1000);
    return () => clearTimeout(t);
  }, [liveData?.currentPrice]);

  const handleToggleWatch = async () => {
    if (!user) return;
    setWatchLoading(true);
    try {
      const { data } = await api.post(`/market/watchlist/${id}`);
      setWatched(data.watched);
      setToast({ message: data.message, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update watchlist', type: 'error' });
    } finally {
      setWatchLoading(false);
    }
  };

  const handleTradeSuccess = (data) => {
    setToast({ message: data.message, type: 'success' });
  };

  if (loading) return <LoadingSpinner text="Loading stock data..." />;

  if (!stock) return (
    <div className="page-wrapper">
      <div className="container">
        <div className="card empty-state">
          <div className="empty-state-icon">❌</div>
          <p>Stock not found.</p>
          <Link to="/market" className="btn btn-primary" style={{ marginTop: '16px' }}>← Back to Market</Link>
        </div>
      </div>
    </div>
  );

  const isGain = displayChange >= 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/market" className="btn btn-outline btn-sm mb-6" style={{ display: 'inline-flex' }}>
          ← Back to Market
        </Link>

        {/* === HEADER === */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-start' }}>

          {/* Left: Info */}
          <div style={{ flex: '1', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="stock-symbol" style={{ fontSize: '0.9rem', padding: '5px 14px' }}>{stock.symbol}</span>
              {stock.sector && <span className="stock-sector">{stock.sector}</span>}
              {user && (
                <button
                  onClick={handleToggleWatch}
                  disabled={watchLoading}
                  style={{
                    background: watched ? 'rgba(245,158,11,0.12)' : 'transparent',
                    border: `1px solid ${watched ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                    color: watched ? '#f59e0b' : 'var(--text-muted)',
                    borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s'
                  }}>
                  {watched ? '★ Watching' : '☆ Watch'}
                </button>
              )}
            </div>

            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: '700', marginBottom: '6px' }}>
              {stock.companyName}
            </h1>

            <div className={`stock-live-price ${priceFlash}`} style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.8rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '8px' }}>
              ${displayPrice?.toFixed(2)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className={`badge ${isGain ? 'badge-gain' : 'badge-loss'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                {isGain ? '▲' : '▼'} ${Math.abs(displayChange ?? 0).toFixed(2)} ({Math.abs(displayPct ?? 0).toFixed(2)}%)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Prev close: ${stock.previousPrice?.toFixed(2)}
              </span>
            </div>

            {/* Fundamentals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Market Cap', stock.marketCap || 'N/A'],
                ['P/E Ratio', stock.peRatio?.toFixed(1) || 'N/A'],
                ['Div. Yield', stock.dividendYield ? `${stock.dividendYield}%` : '—'],
                ['Day High', stock.dailyHigh ? `$${stock.dailyHigh.toFixed(2)}` : 'N/A'],
                ['Day Low', stock.dailyLow ? `$${stock.dailyLow.toFixed(2)}` : 'N/A'],
                ['52W High', stock.weekHigh52 ? `$${stock.weekHigh52.toFixed(2)}` : 'N/A'],
                ['52W Low', stock.weekLow52 ? `$${stock.weekLow52.toFixed(2)}` : 'N/A'],
                ['Volume', stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'],
                ['Avg Vol', stock.avgVolume ? `${(stock.avgVolume / 1000000).toFixed(1)}M` : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            {stock.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.65', maxWidth: '620px' }}>
                {stock.description}
              </p>
            )}
          </div>

          {/* Right: Trade Panel */}
          <div style={{ flex: '0 0 280px', minWidth: '260px', background: 'var(--gradient-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              ⚡ Trade Desk
            </h3>

            {user ? (
              <>
                <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Available Cash</div>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    ${user.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Current Price</div>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ${displayPrice?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isGain ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '2px' }}>
                    {isGain ? '▲' : '▼'} {Math.abs(displayPct ?? 0).toFixed(2)}% today
                  </div>
                </div>

                <button
                  id="open-trade-modal"
                  className="btn btn-primary btn-full"
                  style={{ padding: '14px', fontSize: '1rem', letterSpacing: '0.3px' }}
                  onClick={() => setShowModal(true)}
                >
                  ⚡ Open Trade Desk
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Prices update every 10 seconds
                </div>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '14px' }}>
                  Sign in to start trading this stock.
                </p>
                <Link to="/login" className="btn btn-primary btn-full">Login to Trade</Link>
              </>
            )}
          </div>
        </div>

        {/* === CHART === */}
        <div className="chart-container">
          <div className="chart-header">
            <span className="chart-title">📈 30-Day Price History</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live updates every 10s</span>
            </div>
          </div>
          <StockChart
            historyData={stock.historicalPrices}
            symbol={stock.symbol}
          />
        </div>
      </div>

      {/* Trade Modal */}
      {showModal && (
        <TradeModal
          stock={{ ...stock, currentPrice: displayPrice }}
          onClose={() => setShowModal(false)}
          onSuccess={handleTradeSuccess}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default StockDetails;
