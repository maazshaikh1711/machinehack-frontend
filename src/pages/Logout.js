import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem('token');
    
    // Redirect to the login page
    navigate('/home');
  };

  return (
    <button
        style={{
            color: "red",                
            border: "2px solid red",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "transparent",
            // margin: "10px", // Spacing around the button
            transition: "all 0.3s ease",  // Smooth transition for all properties
        }}
        onClick={handleLogout}
        onMouseEnter={(e) => {
            e.target.style.color = "white"; 
            e.target.style.backgroundColor = "red";
            e.target.style.borderColor = "red";
        }}
        onMouseLeave={(e) => {
            e.target.style.color = "red";
            e.target.style.backgroundColor = "transparent";
            e.target.style.borderColor = "red";
        }}
    >
        Logout
    </button>


  );
};

export default Logout;
