import { Link } from 'react-router-dom';
import React from 'react';

export default function PageNotFound() {
  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#e8f5e9',
    padding: '50px 0',
  };

  const headerTextStyle: React.CSSProperties = {
    fontSize: '3em',
    color: '#388e3c',
  };

  const ctaStyle: React.CSSProperties = {
    marginTop: '50px',
  };

  const ctaHeadingStyle: React.CSSProperties = {
    fontSize: '2em',
    color: '#388e3c',
  };

  const ctaButtonContainerStyle: React.CSSProperties = {
    marginTop: '20px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '15px 30px',
    margin: '0 10px',
    backgroundColor: '#388e3c',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '1.1em',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '50px',
    backgroundColor: '#e8f5e9',
    padding: '20px 0',
    fontSize: '0.9em',
    color: '#888',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={headerTextStyle}>Page Not Found</h1>
        <p>Oops! The page you were looking for does not exist.</p>
      </header>

      <section style={ctaStyle}>
        <h2 style={ctaHeadingStyle}>Start exploring now</h2>
        <p>Sign up or log in to access exclusive content</p>
        <div style={ctaButtonContainerStyle}>
          <Link to="/signup" style={buttonStyle}>
            Sign Up
          </Link>
          <Link to="/login" style={buttonStyle}>
            Log In
          </Link>
        </div>
      </section>

      <footer style={footerStyle}>
        <p>PagePot © 2025 | All rights reserved.</p>
      </footer>
    </div>
  );
}
