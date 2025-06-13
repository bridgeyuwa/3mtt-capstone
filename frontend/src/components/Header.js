import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ token, onLogout }) {
  return (
    <nav className="header-nav">
      <Link to="/" className="logo">🎬 MovieApp</Link>
      <div className="header-links">
        <Link to="/">Home</Link>
        <Link to="/recommendations">Recommendations</Link>
        {token && <Link to="/profile">Profile</Link>}
        {token && <Link to="/watchlists">My Watchlists</Link>}
        {token && <Link to="/users">Users</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        {token && <button onClick={onLogout} className="logout-btn">Logout</button>}
      </div>
    </nav>
  );
}
export default Header;