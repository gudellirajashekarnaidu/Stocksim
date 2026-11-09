import React, { useState, useEffect, useRef } from 'react';
import useLivePrices from '../hooks/useLivePrices';
import api from '../api/axiosClient';

const LiveTicker = () => {
  const [stocks, setStocks] = useState([]);
  const { prices, connected } = useLivePrices();
  const tickerRef = useRef(null);

  useEffect(() => {
    api.get('/stocks?limit=20').then(res => setStocks(res.data.stocks || [])).catch(() => {});
  }, []);

  // Merge live prices into stock list
  const liveStocks = stocks.map(s => {
    const live = prices[s._id];
    if (live) {
      return { ...s, currentPrice: live.currentPrice, priceChange: live.priceChange, percentageChange: live.percentageChange };
    }
    return s;
  });

  const items = [...liveStocks, ...liveStocks]; // duplicate for seamless loop

  return (
    <div className="live-ticker-bar">
      <div className="ticker-label">
        <span className={`ticker-dot ${connected ? 'live' : 'offline'}`} />
        {connected ? 'LIVE' : 'OFFLINE'}
      </div>
      <div className="ticker-scroll-wrapper">
        <div className="ticker-scroll" ref={tickerRef}>
          {items.map((s, i) => {
            const change = s.priceChange ?? (s.currentPrice - s.previousPrice);
            const pct = s.percentageChange ?? (s.previousPrice > 0 ? ((s.currentPrice - s.previousPrice) / s.previousPrice * 100) : 0);
            const isGain = change >= 0;
            return (
              <span key={`${s._id}-${i}`} className="ticker-item">
                <span className="ticker-symbol">{s.symbol}</span>
                <span className="ticker-price">${s.currentPrice?.toFixed(2)}</span>
                <span className={`ticker-change ${isGain ? 'gain' : 'loss'}`}>
                  {isGain ? '▲' : '▼'}{Math.abs(pct).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
