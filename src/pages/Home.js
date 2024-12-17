import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/machineHack.png" 
import './Home.css'

const Home = () => {
  return (
    <div className="home-container">

      <img src={logoImage} alt="Logo" className="home-image" />

      <h1 className="home-title">Welcome to MachineHack Social Media Platform 🐵🚀</h1>
      <p className="home-description">Your social space to connect, share, and explore!</p>

      <div className="auth-options">
        <Link to="/login">
          <button className="auth-button login-btn">Login</button>
        </Link>
        <Link to="/register">
          <button className="auth-button register-btn">Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
