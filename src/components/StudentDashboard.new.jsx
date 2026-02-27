import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import ComplaintForm from './ComplaintForm';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/student/complaints', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      resolved: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Complaints</h1>
          <p>Track and manage your hostel complaints</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Row */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div className="stat-label">Total</div>
            <div className="stat-value">{complaints.length}</div>
          </motion.div>
          
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-label">Pending</div>
            <div className="stat-value">{complaints.filter(c => c.status === 'pending').length}</div>
          </motion.div>
          
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{complaints.filter(c => c.status === 'in_progress').length}</div>
          </motion.div>
          
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{complaints.filter(c => c.status === 'resolved').length}</div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="filter-buttons">
            {['all', 'pending', 'in_progress', 'resolved'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            + New Complaint
          </Button>
        </div>

        {/* Complaints List */}
        {showForm ? (
          <motion.div
            className="form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-header">
              <h2>File a New Complaint</h2>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>
            <ComplaintForm onSubmitSuccess={() => {
              setShowForm(false);
              fetchComplaints();
            }} />
          </motion.div>
        ) : null}

        {loading ? (
          <div className="loading">Loading your complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No complaints {filter !== 'all' ? `with status "${filter.replace('_', ' ')}"` : 'yet'}</h3>
            <p>Start by filing your first complaint</p>
            {filter === 'all' && (
              <Button variant="primary" onClick={() => setShowForm(true)}>
                File Complaint
              </Button>
            )}
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map((complaint, index) => (
              <motion.div
                key={complaint._id}
                className="complaint-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="complaint-header">
                  <div>
                    <h3>{complaint.title}</h3>
                    <p className="complaint-id">ID: {complaint._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {getStatusLabel(complaint.status)}
                  </div>
                </div>

                <p className="complaint-description">{complaint.description}</p>

                <div className="complaint-meta">
                  <span className="meta-item">
                    <strong>Category:</strong> {complaint.category}
                  </span>
                  <span className="meta-item">
                    <strong>Priority:</strong>
                    <span className={`priority-${complaint.priority}`}>
                      {complaint.priority.toUpperCase()}
                    </span>
                  </span>
                  <span className="meta-item">
                    <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {complaint.adminNotes && (
                  <div className="admin-notes">
                    <strong>Admin Note:</strong> {complaint.adminNotes}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
