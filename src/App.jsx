import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './components/Auth.css';

// Modern premium landing page
const LandingPage = () => (
  <div className="login-container">
    <div className="login-glass-card" style={{ maxWidth: '800px', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏫</div>
        <h1 style={{ fontSize: '3rem', color: 'white', fontWeight: '900', marginBottom: '1.5rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>HostelCare</h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          The next-generation complaint management system for hostels.
          Experience seamless communication, real-time tracking, and faster resolutions.
        </p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <Link to="/login" className="login-btn-modern" style={{ padding: '16px 40px', textDecoration: 'none' }}>
            Get Started
          </Link>
          <Link to="/register" className="login-btn-modern" style={{ padding: '16px 40px', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)' }}>
            Join Hostelite
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
        </div>
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
