import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState('role'); // 'role' or 'login'
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('login');
    setErrors({});
  };

  const handleBackToRole = () => {
    setStep('role');
    setSelectedRole(null);
    setFormData({ email: '', password: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, selectedRole);

      if (result.success) {
        // Redirect based on role
        if (selectedRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setErrors({ submit: result.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <motion.div
          className="login-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-icon">📋</div>
          <h1>HostelCare</h1>
          <p>Complaint Management System</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'role' ? (
            // Role Selection Step
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="login-step"
            >
              <div className="step-header">
                <h2>Select Your Role</h2>
                <p>Choose how you'd like to log in</p>
              </div>

              <div className="role-selector">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('student')}
                  className="role-option role-student"
                >
                  <div className="role-icon">👨‍🎓</div>
                  <div className="role-content">
                    <h3>Student</h3>
                    <p>File and track complaints</p>
                  </div>
                  <div className="role-arrow">→</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('admin')}
                  className="role-option role-admin"
                >
                  <div className="role-icon">👨‍💼</div>
                  <div className="role-content">
                    <h3>Administrator</h3>
                    <p>Manage and resolve complaints</p>
                  </div>
                  <div className="role-arrow">→</div>
                </motion.button>
              </div>

              <div className="login-footer">
                <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
              </div>
            </motion.div>
          ) : (
            // Login Form Step
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="login-step"
            >
              <div className="step-header">
                <button
                  className="back-button"
                  onClick={handleBackToRole}
                  type="button"
                >
                  ← Back
                </button>
                <div>
                  <h2>
                    {selectedRole === 'admin' ? 'Admin' : 'Student'} Login
                  </h2>
                  <p>Enter your credentials to continue</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your@email.com"
                  required
                />

                <div className="password-input-wrapper">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {errors.submit && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.submit}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="login-footer">
                <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative background */}
      <div className="login-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
      </div>
    </div>
  );
};

export default LoginPage;
