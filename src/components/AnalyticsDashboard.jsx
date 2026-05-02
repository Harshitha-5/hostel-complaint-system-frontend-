import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import './AnalyticsDashboard.css';

const COLORS = ['#2D5A7B', '#5A8F7B', '#E07B39', '#B85450', '#7B68A6', '#D4A574', '#5B9EA6', '#8B9A6B'];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/dashboard?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <p>Failed to load analytics data</p>
        <button onClick={fetchAnalytics} className="retry-btn">Retry</button>
      </div>
    );
  }

  const { overview, categories, status, priority, trends, resolution, satisfaction, peakHours } = analytics;

  // Prepare chart data
  const categoryData = categories.map(c => ({
    name: c.category,
    value: c.count,
    percentage: formatPercentage(c.count, overview.totalComplaints),
  }));

  const statusData = status.map(s => ({
    name: s.status,
    value: s.count,
  }));

  const priorityData = priority.map(p => ({
    name: p.priority,
    value: p.count,
  }));

  const trendData = trends.map(t => ({
    date: t.date,
    total: t.total,
    resolved: t.resolved,
  }));

  const peakHoursData = peakHours.map(h => ({
    hour: h.label,
    count: h.count,
  }));

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div className="header-greeting">
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p className="header-subtitle">Here's what's happening in your hostel</p>
        </div>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 3 Months</option>
            <option value={180}>Last 6 Months</option>
            <option value={365}>Last Year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <motion.div className="stat-card primary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 17v-2H4.5A2.5 2.5 0 0 1 2 12.5v-9A2.5 2.5 0 0 1 4.5 1h9A2.5 2.5 0 0 1 16 3.5V9h-2V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H9z"/>
              <path d="M19.5 7H14v10.5a2.5 2.5 0 0 0 2.5 2.5h5a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 21.5 7z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{overview.totalComplaints}</h3>
            <p>Total Complaints</p>
          </div>
        </motion.div>

        <motion.div className="stat-card success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l2.5 2.5L16 9"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{overview.resolutionRate}%</h3>
            <p>Resolution Rate</p>
          </div>
        </motion.div>

        <motion.div className="stat-card warning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{overview.highPriorityComplaints}</h3>
            <p>High Priority</p>
          </div>
        </motion.div>

        <motion.div className="stat-card danger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{overview.overdueComplaints}</h3>
            <p>Overdue</p>
          </div>
        </motion.div>

        <motion.div className="stat-card info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{resolution.averageResolutionTime}d</h3>
            <p>Avg Resolution Time</p>
          </div>
        </motion.div>

        <motion.div className="stat-card purple" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{satisfaction.averageRating || 'N/A'}</h3>
            <p>Avg Rating</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        {['overview', 'trends', 'categories', 'satisfaction', 'peak-hours'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="charts-grid">
            {/* Status Distribution */}
            <div className="chart-card">
              <h3>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="chart-card">
              <h3>Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Bar Chart */}
            <div className="chart-card wide">
              <h3>Complaints by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="chart-card full-width">
            <h3>Complaint Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total" />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="chart-card full-width">
            <h3>Category Breakdown</h3>
            <div className="category-list">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="category-item">
                  <div className="category-bar-container">
                    <div className="category-label">{cat.name}</div>
                    <div className="category-bar-wrapper">
                      <div
                        className="category-bar"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <div className="category-value">{cat.value} ({cat.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'satisfaction' && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Rating Distribution</h3>
              {satisfaction.ratingDistribution && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={satisfaction.ratingDistribution.map((count, i) => ({
                      rating: `${i + 1} Star`,
                      count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <h3>Satisfaction Summary</h3>
              <div className="satisfaction-summary">
                <div className="satisfaction-metric">
                  <span className="metric-value">{satisfaction.averageRating || 'N/A'}</span>
                  <span className="metric-label">Average Rating</span>
                </div>
                <div className="satisfaction-metric">
                  <span className="metric-value">{satisfaction.totalRated || 0}</span>
                  <span className="metric-label">Total Rated</span>
                </div>
                <div className="rating-stars">
                  {'★'.repeat(Math.round(satisfaction.averageRating || 0))}
                  {'☆'.repeat(5 - Math.round(satisfaction.averageRating || 0))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'peak-hours' && (
          <div className="chart-card full-width">
            <h3>Peak Complaint Hours</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
