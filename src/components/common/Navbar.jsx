import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const theme = newMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-theme", savedTheme);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="navbar-brand">
          <NavLink to="/" className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">CrimeWatch</span>
          </NavLink>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/predict" className="nav-link">
            Predict Safety
          </NavLink>
          <NavLink to="/recommend" className="nav-link">
            Recommendations
          </NavLink>
          <NavLink to="/report" className="nav-link">
            Report Crime
          </NavLink>

          {/* Dark mode toggle */}
          <button className="dark-toggle" onClick={toggleDarkMode}>
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Auth section */}
          <div className="dropdown">
            <button className="dropdown-btn">Account ⬇️</button>
            <div className="dropdown-content">
              {!user ? (
                <NavLink to="/login">Login</NavLink>
              ) : (
                <>
                  <NavLink to="/profile">Profile</NavLink>
                  <NavLink to="/logout">Logout</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
