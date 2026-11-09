import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Stock<span>Sim</span>
        </Link>

        <ul className="navbar-links">
          <li><NavLink to="/market" className={navLink}>Market</NavLink></li>
          <li><NavLink to="/leaderboard" className={navLink}>🏆 Leaders</NavLink></li>

          {user ? (
            <>
              <li><NavLink to="/dashboard" className={navLink}>Dashboard</NavLink></li>
              <li><NavLink to="/portfolio" className={navLink}>Portfolio</NavLink></li>
              {user.role === 'ADMIN' && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    style={{ color: '#f59e0b' }}>Admin</NavLink>
                </li>
              )}
              <li>
                <span className="nav-balance">
                  💰 ${user.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </li>
              <li>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-outline btn-sm">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
