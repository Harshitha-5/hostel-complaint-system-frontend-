import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import socketService from '../utils/socketService';
import Button from './ui/Button';
import AnalyticsDashboard from './AnalyticsDashboard';
import Comments from './Comments';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeView, setActiveView] = useState('complaints'); // 'complaints', 'analytics', 'escalations'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    // Initialize socket connection for admin
    if (user && user.role === 'admin') {
      socketService.connect(user._id || user.id, user.role);
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    // Set up Socket.io listeners for real-time updates
    const setupListeners = () => {
      // Listen for new complaints from students
      socketService.onNewComplaint((newComplaint) => {
        toast.success(`New complaint from ${newComplaint.studentName || 'student'}: ${newComplaint.title}`);
        // Always refetch to keep table + analytics perfectly in sync
        fetchData();
      });
    };

    if (socketService.isConnected()) {
      setupListeners();
    }

    return () => {
      socketService.removeListener('complaintCreated');
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, analyticsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/complaints`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const complaintData = await complaintsRes.json();
      const analyticsData = await analyticsRes.json();

      if (complaintData.success) {
        setComplaints(complaintData.complaints || []);
      }
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus, estimatedDays) => {
    try {
      const body = { status: newStatus };
      if (estimatedDays != null && estimatedDays !== '') {
        const num = Number(estimatedDays);
        if (!isNaN(num) && num >= 0) body.estimatedDays = num;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      // Use full complaint returned from backend (includes latest fields)
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === complaintId ? data.complaint : complaint
        )
      );

      const labelMap = {
        pending: 'Pending',
        in_progress: 'Work in Progress',
        resolved: 'Resolved',
      };

      toast.success(`Status updated to "${labelMap[newStatus] || newStatus}"`);
      // Re-fetch complaints and analytics so dashboard cards stay in sync
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update complaint status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'in_progress',
      in_progress: 'resolved',
      resolved: 'pending'
    };
    return statusFlow[currentStatus] || 'pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      resolved: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getDaysRemaining = (complaint) => {
    if (complaint.expectedCompletionDate) {
      const now = new Date();
      const due = new Date(complaint.expectedCompletionDate);
      const diffMs = due - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Overdue';
      return diffDays;
    }
    if (complaint.estimatedDays != null && complaint.estimatedDays !== '') {
      const days = Number(complaint.estimatedDays);
      if (!isNaN(days) && days >= 0) {
        const start = complaint.updatedAt ? new Date(complaint.updatedAt) : new Date(complaint.createdAt);
        const due = new Date(start);
        due.setDate(due.getDate() + days);
        const now = new Date();
        const diffMs = due - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Overdue';
        return diffDays;
      }
    }
    return '-';
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this resolved complaint?')) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>Manage and resolve all complaints</p>
        </div>
        <div className="header-center">
          <nav className="dashboard-nav">
            <button
              className={`nav-btn ${activeView === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveView('complaints')}
            >
              Complaints
            </button>
            <button
              className={`nav-btn ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveView('analytics')}
            >
              Analytics
            </button>
            <button
              className={`nav-btn ${activeView === 'escalations' ? 'active' : ''}`}
              onClick={() => setActiveView('escalations')}
            >
              Escalations
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="live-status">
            <div className="pulse-dot"></div>
            <span>Real Time Updates</span>
          </div>
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeView === 'analytics' && <AnalyticsDashboard />}
        
        {activeView === 'complaints' && (
          <>
        {/* Analytics Cards */}
        {analytics && (
          <div className="analytics-grid">
            <motion.div
              className="analytics-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="card-label">Total Complaints</div>
              <div className="card-value">{analytics.totalComplaints}</div>
              <div className="card-subtext">{analytics.activeComplaints} active</div>
            </motion.div>

            <motion.div
              className="analytics-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-label">Resolved</div>
              <div className="card-value">{analytics.resolvedComplaints}</div>
              <div className="card-subtext">
                {analytics.totalComplaints > 0
                  ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100)
                  : 0}
                % complete
                {typeof analytics.averageResolutionRating === 'number' && (
                  <span style={{ display: 'block', marginTop: '4px' }}>
                    Avg rating: {analytics.averageResolutionRating.toFixed(1)} / 5
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              className="analytics-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-label">High Priority</div>
              <div className="card-value">{analytics.highPriorityComplaints}</div>
              <div className="card-subtext">Need attention</div>
            </motion.div>

            <motion.div
              className="analytics-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-label">Avg Resolution</div>
              <div className="card-value">{analytics.averageResolutionTime}</div>
              <div className="card-subtext">days</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <Button variant="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No complaints found</h3>
            <p>All complaints have been resolved</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Est. Days</th>
                  <th>Days Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint, index) => (
                  <motion.tr
                    key={complaint._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="id-cell">
                      {complaint._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="title-cell">
                      <div>
                        <div className="complaint-title">{complaint.title}</div>
                        <div className="complaint-desc">{complaint.description.substring(0, 50)}...</div>
                        {complaint.proofImage && (
                          <div style={{ marginTop: '6px' }}>
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${complaint.proofImage}`}
                              alt="Proof"
                              style={{ maxWidth: '80px', borderRadius: '4px' }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="student-info">
                        {complaint.studentId?.name || 'N/A'}
                        <div className="student-email">{complaint.studentId?.email || ''}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${complaint.status}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${complaint.priority}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={complaint.estimatedDays ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : Number(e.target.value);
                          setComplaints(prev =>
                            prev.map(c =>
                              c._id === complaint._id ? { ...c, estimatedDays: value } : c
                            )
                          );
                        }}
                        style={{ width: '70px' }}
                      />
                    </td>
                    <td>
                      {getDaysRemaining(complaint)}
                    </td>
                    <td className="action-cell">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn action-btn--pending"
                          disabled={complaint.status === 'pending'}
                          onClick={() => handleStatusUpdate(complaint._id, 'pending', complaint.estimatedDays)}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--resolving"
                          disabled={complaint.status === 'in_progress'}
                          onClick={() => handleStatusUpdate(complaint._id, 'in_progress', complaint.estimatedDays)}
                        >
                          Resolving
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--resolved"
                          disabled={complaint.status === 'resolved'}
                          onClick={() => handleStatusUpdate(complaint._id, 'resolved', complaint.estimatedDays)}
                        >
                          Resolved
                        </button>
                      </div>
                      {complaint.status === 'resolved' && (
                        <button
                          type="button"
                          className="action-btn action-btn--delete action-btn-delete-row"
                          onClick={() => handleDeleteComplaint(complaint._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}
        
        {activeView === 'escalations' && (
          <div className="escalations-view">
            <h2>Escalations Management</h2>
            <p className="escalations-info">
              View and manage escalated complaints. Escalations are automatically created for overdue complaints or can be manually requested by students.
            </p>
            {/* Escalations list will be implemented here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
