import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logoImage from '../assets/machineHack.png';
import './Register.css';

const Register = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/v1/auth/register", user);
      navigate("/login");
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="register-container">
      <img src={logoImage} alt="Logo" className="auth-image" />
      <div className="register-card">
        <h1 className="register-title">Register</h1>
        {error && <p className="register-error">{error}</p>}
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="register-button" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );  
};

export default Register;
