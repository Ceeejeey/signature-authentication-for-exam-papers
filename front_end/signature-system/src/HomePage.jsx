import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <header className="header">
        <h1 className="title">Welcome to the Digital Signature Tool</h1>
        <p className="subtitle">Securely sign and authenticate your documents with ease.</p>
      </header>
      
      <div className="button-container">
        <button className="auth-button signin-button" onClick={() => navigate('/signin')}>
          Sign In
        </button>
        <button className="auth-button signup-button" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default HomePage;
