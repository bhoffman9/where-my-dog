import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Where My Dog crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0b0d10',
          color: '#e8eaf0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 40,
            color: '#f47820',
            marginBottom: 16,
          }}>
            Something has gone wrong.
          </div>
          <div style={{ fontSize: 13, color: '#5a6370', letterSpacing: 1.2, maxWidth: 420, marginBottom: 24 }}>
            The dog slipped from our grasp. A reload usually gets it back.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              color: '#f47820',
              border: '2px solid #f47820',
              padding: '12px 28px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 4,
              cursor: 'pointer',
              borderRadius: 2,
            }}
          >[ RELOAD ]</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
