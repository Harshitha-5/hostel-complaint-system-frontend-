import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './components/Auth.css';

// Modern premium landing page with Hostel Theme
const LandingPage = () => (
  <div className="login-container" style={{ 
    background: 'linear-gradient(135deg, #0F1419 0%, #1C2128 50%, #151B23 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  }}>
    <div className="glass-card" style={{ 
      maxWidth: '600px', 
      textAlign: 'center',
      padding: '3rem',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Hostel Building Icon */}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #2D5A7B 0%, #3D7A9B 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(45, 90, 123, 0.3)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-6a2 2 0 012-2h4a2 2 0 012 2v6"/>
            <path d="M9 11h6M9 15h6"/>
          </svg>
        </div>
        
        <h1 style={{ 
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2.5rem', 
          color: '#E6EDF3', 
          fontWeight: 600, 
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          HostelCare
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#7D8590', 
          marginBottom: '2.5rem', 
          maxWidth: '450px', 
          margin: '0 auto 2.5rem auto', 
          lineHeight: '1.7',
          fontWeight: 400
        }}>
          A modern complaint management system designed for student hostel living. 
          Streamlined communication, real-time tracking, and faster resolutions.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" style={{ 
            padding: '0.875rem 2rem', 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #E07B39 0%, #F09B59 100%)',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 500,
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(224, 123, 57, 0.3)',
            transition: 'all 0.2s ease'
          }}>
            Get Started
          </Link>
          <Link to="/register" style={{ 
            padding: '0.875rem 2rem', 
            textDecoration: 'none', 
            background: 'transparent',
            color: '#E6EDF3',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}>
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0F1419 0%, #1C2128 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(224, 123, 57, 0.2)',
            borderTopColor: '#E07B39',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '16px', color: '#7D8590', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace /> : <RegisterPage />} />
      <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
