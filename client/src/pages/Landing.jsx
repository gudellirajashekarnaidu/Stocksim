import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => (
  <div className="landing-hero">
    <div className="landing-bg" />
    <div className="hero-grid" />

    <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="hero-badge">
        <span /> LIVE MARKET SIMULATOR &nbsp;·&nbsp; RISK-FREE TRADING
      </div>

      <h1 className="hero-title">
        Master the Markets<br />
        <span className="gradient-text">Without the Risk</span>
      </h1>

      <p className="hero-sub">
        Trade real stocks with $100,000 in virtual cash. Build your portfolio,
        analyze charts, and develop your strategy — completely risk-free.
      </p>

      <div className="hero-actions">
        <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started">
          🚀 Start Trading Free
        </Link>
        <Link to="/market" className="btn btn-outline btn-lg" id="hero-explore-market">
          📈 Explore Market
        </Link>
      </div>

      <div className="hero-stats">
        <div className="hero-stat-item">
          <div className="hero-stat-value">$100K</div>
          <div className="hero-stat-label">Starting Balance</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-value">12+</div>
          <div className="hero-stat-label">Stocks Available</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-value">Real-time</div>
          <div className="hero-stat-label">Price Charts</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-value">0%</div>
          <div className="hero-stat-label">Financial Risk</div>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;
