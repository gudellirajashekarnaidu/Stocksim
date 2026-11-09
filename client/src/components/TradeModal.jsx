import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';

const TradeModal = ({ stock, onClose, onSuccess }) => {
  const { user, updateBalanceLocally } = useContext(AuthContext);
  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState('BUY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [result, setResult] = useState(null);

  if (!stock) return null;

  const totalCost = (stock.currentPrice * qty).toFixed(2);
  const canAfford = user?.virtualBalance >= parseFloat(totalCost);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = orderType === 'BUY' ? '/trade/buy' : '/trade/sell';
      const { data } = await api.post(endpoint, { stockId: stock._id, quantity: qty });
      updateBalanceLocally(data.balance);
      setResult(data);
      setStep('success');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Trade execution failed. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
              {orderType === 'BUY' ? '🎉' : '💰'}
            </div>
            <h2 style={{ color: orderType === 'BUY' ? 'var(--accent-green)' : 'var(--accent-blue)', marginBottom: '8px' }}>
              {orderType === 'BUY' ? 'Bought!' : 'Sold!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{result?.message}</p>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Balance</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: 'var(--accent-cyan)' }}>
                ${result?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                {step === 'confirm' ? '⚡ Confirm Trade' : `Trade ${stock.symbol}`}
              </h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            {step === 'form' && (
              <>
                <div style={{ marginBottom: '16px', background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <span className="stock-symbol" style={{ fontSize: '0.8rem' }}>{stock.symbol}</span>
                      <span style={{ marginLeft: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{stock.companyName}</span>
                    </span>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: '700', fontSize: '1.1rem' }}>
                      ${stock.currentPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Buy / Sell toggle */}
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  {['BUY', 'SELL'].map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      style={{
                        flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s',
                        background: orderType === t
                          ? (t === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)')
                          : 'transparent',
                        color: orderType === t ? '#fff' : 'var(--text-muted)'
                      }}>
                      {t === 'BUY' ? '▲ BUY' : '▼ SELL'}
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <label className="form-label">Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                  <button className="qty-btn" style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59,130,246,0.12)', border: '1px solid var(--border)', color: 'var(--accent-blue)', fontWeight: '700', cursor: 'pointer', fontSize: '1.2rem' }}
                    onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <input
                    id="modal-qty"
                    type="number" min="1"
                    value={qty}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', fontFamily: 'Outfit,sans-serif', background: 'rgba(10,22,40,0.8)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button className="qty-btn" style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59,130,246,0.12)', border: '1px solid var(--border)', color: 'var(--accent-blue)', fontWeight: '700', cursor: 'pointer', fontSize: '1.2rem' }}
                    onClick={() => setQty(q => q + 1)}>+</button>
                </div>

                {/* Cost */}
                <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {orderType === 'BUY' ? 'Total Cost' : 'Total Gain'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Outfit,sans-serif', color: 'var(--accent-cyan)' }}>
                    ${totalCost}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {qty} × ${stock.currentPrice?.toFixed(2)}
                  </div>
                </div>

                {orderType === 'BUY' && !canAfford && (
                  <div className="alert alert-error" style={{ marginBottom: '12px' }}>
                    ⚠️ Insufficient balance. You have ${user?.virtualBalance?.toFixed(2)}
                  </div>
                )}

                {error && <div className="alert alert-error" style={{ marginBottom: '12px' }}>⚠️ {error}</div>}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                  <button
                    id="modal-confirm-btn"
                    className={`btn ${orderType === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                    style={{ flex: 2 }}
                    onClick={() => setStep('confirm')}
                    disabled={orderType === 'BUY' && !canAfford}
                  >
                    Review Order →
                  </button>
                </div>
              </>
            )}

            {step === 'confirm' && (
              <>
                <div style={{ background: 'rgba(10,22,40,0.6)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  {[
                    ['Order Type', <span className={`badge ${orderType === 'BUY' ? 'badge-gain' : 'badge-loss'}`}>{orderType === 'BUY' ? '▲ BUY' : '▼ SELL'}</span>],
                    ['Stock', `${stock.symbol} — ${stock.companyName}`],
                    ['Quantity', `${qty} shares`],
                    ['Price per Share', `$${stock.currentPrice?.toFixed(2)}`],
                    [orderType === 'BUY' ? 'Total Cost' : 'Total Gain', <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>${totalCost}</strong>],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {error && <div className="alert alert-error" style={{ marginBottom: '12px' }}>⚠️ {error}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep('form')}>← Back</button>
                  <button
                    id="modal-execute-btn"
                    className={`btn ${orderType === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                    style={{ flex: 2 }}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? '⏳ Executing...' : `⚡ Execute ${orderType}`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeModal;
