import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    setTimeout(() => navigate("/"), 1500); // small delay for user feedback
  }, [navigate, onLogout]);

  return (
    <div className="auth-container">
      <h2>Logging out...</h2>
      <p>You are being redirected to the homepage.</p>
    </div>
  );
};

export default Logout;
