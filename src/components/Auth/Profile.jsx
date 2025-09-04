import React from "react";
import "./Auth.css";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="auth-container">
      <h2>User Profile</h2>
      {user ? (
        <p>Welcome, <strong>{user.email}</strong></p>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
};

export default Profile;
