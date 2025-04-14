import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">CrimeWatch</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/predict" className="nav-link">Predict Safety</Link>
          <Link to="/recommend" className="nav-link">Recommendations</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;