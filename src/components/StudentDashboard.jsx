import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import socketService from '../utils/socketService';
import Button from './ui/Button';
import ComplaintForm from './ComplaintForm';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);
  const [duplicateFilterIds, setDuplicateFilterIds] = useState(null);

  useEffect(() => {
    // Initialize socket connection and load complaints for current filter
    if (user && token) {
      socketService.connect(user._id || user.id, user.role);
      fetchComplaints(filter);
    }
  }, [user, token]);

  useEffect(() => {
    // Refetch from backend whenever filter changes (server-side filtering)
    if (token) {
      fetchComplaints(filter);
    }
  }, [filter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawIds = params.get('duplicateIds');
    if (rawIds) {
      const ids = rawIds.split(',').map((id) => id.trim()).filter(Boolean);
      setDuplicateFilterIds(new Set(ids));
    } else {
      setDuplicateFilterIds(null);
    }
  }, [location.search]);

  useEffect(() => {
    // Set up Socket.io listener for real-time complaint updates
    if (socketService.isConnected()) {
      const handleUpdate = (payload) => {
        const updatedComplaint = payload._id
          ? payload
          : { ...payload, _id: payload.complaintId };

        setComplaints(prevComplaints =>
          prevComplaints.map(complaint =>
            complaint._id === updatedComplaint._id ? { ...complaint, ...updatedComplaint } : complaint
          )
        );
        if (updatedComplaint.status) {
          toast.success(`Complaint updated to "${updatedComplaint.status.replace('_', ' ').toUpperCase()}"`);
        }
      };

      const handleDeleted = (payload) => {
        const deletedId = payload.complaintId || payload._id;
        if (!deletedId) return;
        setComplaints(prevComplaints =>
          prevComplaints.filter(complaint => complaint._id !== deletedId)
        );
      };

      socketService.onComplaintUpdate(handleUpdate);
      socketService.onComplaintDeleted(handleDeleted);

      return () => {
        socketService.removeListener('complaintStatusChanged');
        socketService.removeListener('complaintDeleted');
      };
    }
  }, []);

  const fetchComplaints = async (status = 'all') => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const query =
        status && status !== 'all'
          ? `?status=${encodeURIComponent(status)}`
          : '';

      const response = await fetch(
        `http://localhost:5000/api/student/complaints${query}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        toast.error(data.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Error fetching complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmitSuccess = (newComplaint) => {
    // Reload complaints from server so stats and filters stay accurate
    fetchComplaints(filter);
    setShowForm(false);
    toast.success('Complaint submitted successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/student/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        toast.success('Complaint deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Error deleting complaint');
    }
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

  const getDaysRemaining = (complaint) => {
    if (!complaint.expectedCompletionDate) return null;
    const now = new Date();
    const due = new Date(complaint.expectedCompletionDate);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Complaints already filtered on the backend using the `status` query.
  // Additionally, if duplicateIds are present in the URL, show only those complaints.
  const filteredComplaints = duplicateFilterIds
    ? complaints.filter((c) => duplicateFilterIds.has(c._id))
    : complaints;

  const handleFeedbackChange = (complaintId, field, value) => {
    setFeedbackDrafts(prev => ({
      ...prev,
      [complaintId]: {
        rating: prev[complaintId]?.rating || 0,
        feedback: prev[complaintId]?.feedback || '',
        [field]: value,
      },
    }));
  };

  const handleSubmitFeedback = async (complaintId) => {
    const draft = feedbackDrafts[complaintId];
    if (!draft || !draft.rating) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    try {
      setSubmittingFeedbackId(complaintId);
      const response = await fetch(`http://localhost:5000/api/student/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: draft.rating,
          feedback: draft.feedback || '',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit feedback');
      }
      setComplaints(prev =>
        prev.map(c =>
          c._id === complaintId
            ? { ...c, resolutionRating: data.complaint.resolutionRating, resolutionFeedback: data.complaint.resolutionFeedback }
            : c
        )
      );
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1>Welcome, {user?.name}!</h1>
            <p>Hostel: {user?.hostel || 'Main'}, Room: {user?.roomNo || 'N/A'}</p>
            {user?.role !== 'student' && (
              <p style={{ color: '#ef4444', marginTop: '0.5rem', fontWeight: 'bold' }}>
                Your account is registered as <strong>{user?.role?.toUpperCase()}</strong>, not a student!
              </p>
            )}
          </motion.div>
        </div>
        <div className="header-right">
          <div className="live-status">
            <div className="pulse-dot"></div>
            <span>Real Time Updates</span>
          </div>
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {user?.role !== 'student' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '1rem',
          color: '#fff'
        }}>
          <h3 style={{ color: '#ef4444', marginTop: 0 }}>❌ Access Denied</h3>
          <p>Your account is registered as <strong>{user?.role?.toUpperCase()}</strong>, not as a <strong>STUDENT</strong>. This role cannot file complaints.</p>
          <p><strong>To fix this:</strong></p>
          <ol>
            <li>Click <strong>"Logout"</strong> button above</li>
            <li>Come back and click <strong>"Register"</strong></li>
            <li><strong>MAKE SURE TO CLICK "STUDENT" BUTTON FIRST</strong> (it should turn blue)</li>
            <li>Fill in the form with a new email address and register as Student</li>
            <li>You can then file complaints!</li>
          </ol>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Or if you need admin access, logout and login with your admin account.</p>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Dashboard Actions */}
        <div className="dashboard-actions">
          {user?.role === 'student' ? (
            <button
              className="new-complaint-btn"
              onClick={() => setShowForm(true)}
            >
              <span>+</span> New Complaint
            </button>
          ) : (
            <div style={{
              padding: '1rem',
              background: 'rgba(107, 114, 128, 0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center'
            }}>
              Create a Student account to file complaints →
            </div>
          )}
        </div>

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

        {/* Complaints Section */}
        <div className="complaints-section">
          <div className="section-header">
            <h2>Your Complaints</h2>
            <div className="filter-buttons">
              {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                <button
                  key={status}
                  className={`role-toggle-btn ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {duplicateFilterIds && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              fontSize: '0.8rem',
              color: 'rgba(226, 232, 240, 0.9)',
            }}>
              Showing complaints similar to the one you just tried to submit.
              <button
                type="button"
                onClick={() => navigate('/student')}
                style={{
                  marginLeft: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}

          {showForm ? (
            <motion.div
              className="form-container"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '2rem' }}
            >
              <div className="section-header">
                <h2>File a New Complaint</h2>
                <button
                  className="logout-btn"
                  style={{ padding: '4px 12px' }}
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <ComplaintForm onSubmitSuccess={handleComplaintSubmitSuccess} />
            </motion.div>
          ) : null}

          {loading ? (
            <div className="loading">Loading your complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3>No complaints {filter !== 'all' ? `with status "${filter.replace('_', ' ')}"` : 'yet'}</h3>
              <p>Start by filing your first complaint</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint._id}
                  className="complaint-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="card-header">
                    <h3>{complaint.title}</h3>
                    <span className={`status-badge status-${complaint.status}`}>
                      {getStatusLabel(complaint.status)}
                    </span>
                  </div>

                  <p className="complaint-desc">
                    {complaint.description.length > 120
                      ? `${complaint.description.substring(0, 120)}...`
                      : complaint.description}
                  </p>

                  <div className="timeline-info">
                    <span className="date">
                      Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <span className="date">
                      Est. completion: {formatDate(complaint.expectedCompletionDate)}
                    </span>
                    {(() => {
                      const remaining = getDaysRemaining(complaint);
                      if (remaining == null) return null;
                      return (
                        <span className="date">
                          Days remaining: {remaining < 0 ? 'Overdue' : remaining}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="card-footer">
                    <div className="priority-tag">
                      <div
                        className="dot"
                        style={{ backgroundColor: getStatusColor(complaint.priority === 'high' ? 'pending' : (complaint.priority === 'medium' ? 'in_progress' : 'resolved')) }}
                      ></div>
                      {complaint.priority.toUpperCase()}
                    </div>
                    <span className="date">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteComplaint(complaint._id)}
                      title="Delete complaint"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {complaint.status === 'resolved' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                      {typeof complaint.resolutionRating === 'number' ? (
                        <div>
                          <strong>Your rating:</strong>{' '}
                          {'★★★★★'.slice(0, complaint.resolutionRating)}
                          {'☆☆☆☆☆'.slice(complaint.resolutionRating)}
                          {complaint.resolutionFeedback && (
                            <div style={{ marginTop: '4px', opacity: 0.8 }}>
                              <strong>Feedback:</strong> {complaint.resolutionFeedback}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '4px' }}>Rate the resolution:</div>
                          <div>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const draft = feedbackDrafts[complaint._id] || {};
                              const active = draft.rating >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleFeedbackChange(complaint._id, 'rating', star)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    color: active ? '#fbbf24' : '#6b7280',
                                    padding: '0 2px',
                                  }}
                                >
                                  ★
                                </button>
                              );
                            })}
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Optional feedback about how it was resolved"
                            value={(feedbackDrafts[complaint._id] && feedbackDrafts[complaint._id].feedback) || ''}
                            onChange={(e) =>
                              handleFeedbackChange(complaint._id, 'feedback', e.target.value)
                            }
                            style={{
                              marginTop: '6px',
                              width: '100%',
                              borderRadius: '6px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: 'rgba(15,23,42,0.6)',
                              color: 'white',
                              padding: '6px 8px',
                              fontSize: '0.75rem',
                              resize: 'vertical',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitFeedback(complaint._id)}
                            disabled={submittingFeedbackId === complaint._id}
                            style={{
                              marginTop: '6px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              border: 'none',
                              background: '#10b981',
                              color: '#0f172a',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              opacity: submittingFeedbackId === complaint._id ? 0.7 : 1,
                            }}
                          >
                            {submittingFeedbackId === complaint._id ? 'Submitting...' : 'Submit feedback'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {complaint.proofImage && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <img
                        src={`http://localhost:5000${complaint.proofImage}`}
                        alt="Proof"
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                      />
                    </div>
                  )}

                  {complaint.adminNotes && (
                    <div className="admin-notes" style={{ marginTop: '1rem', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                      <strong>Admin remarks:</strong> {complaint.adminNotes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
