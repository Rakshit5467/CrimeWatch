import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">CrimeWatch</span>
          </div>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} CrimeWatch. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;