import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, listItemVariants, accordionVariants } from '../utils/animations';
import Button from './ui/Button';
import './ComplaintList.css';

const ComplaintList = ({ complaints = [], onUpdateStatus }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'kanban'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const statuses = [
        { id: 'all', label: 'All', color: '#64748b' },
        { id: 'pending', label: 'Pending', color: '#F59E0B' },
        { id: 'in_progress', label: 'In Progress', color: '#0EA5E9' },
        { id: 'resolved', label: 'Resolved', color: '#10B981' }
    ];

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const ComplaintCard = ({ complaint, index }) => (
        <motion.div
            className={`complaint-card ${expandedId === complaint._id ? 'expanded' : ''}`}
            variants={listItemVariants}
            layout
        >
            <div className="card-top" onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}>
                <div className="card-main-info">
                    <div className="status-badge" style={{ '--status-color': statuses.find(s => s.id === complaint.status)?.color }}>
                        {complaint.status?.replace('_', ' ')}
                    </div>
                    <h3 className="complaint-title">{complaint.title}</h3>
                    <div className="card-meta">
                        <span className="meta-tag">#{complaint._id?.slice(-6)}</span>
                        <span className="meta-tag">•</span>
                        <span className="meta-tag">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="card-priority">
                    <div className={`priority-pill ${complaint.priority}`}>
                        {complaint.priority}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expandedId === complaint._id && (
                    <motion.div
                        className="card-expanded-content"
                        variants={accordionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                    >
                        <div className="expanded-divider"></div>
                        <p className="full-description">{complaint.description}</p>

                        <div className="complaint-timeline">
                            <h4 className="timeline-section-title">Timeline</h4>
                            <div className="mini-timeline">
                                <div className="mini-timeline-step active">
                                    <div className="step-point"></div>
                                    <div className="step-info">
                                        <span className="step-label">Filed</span>
                                        <span className="step-date">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`mini-timeline-step ${complaint.status !== 'pending' ? 'active' : ''}`}>
                                    <div className="step-point"></div>
                                    <div className="step-info">
                                        <span className="step-label">Under Review</span>
                                    </div>
                                </div>
                                <div className={`mini-timeline-step ${complaint.status === 'resolved' ? 'active' : ''}`}>
                                    <div className="step-point"></div>
                                    <div className="step-info">
                                        <span className="step-label">Resolved</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-actions">
                            <Button variant="outline" size="sm">View Documents</Button>
                            {onUpdateStatus && (
                                <Button variant="primary" size="sm">Update Status</Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <div className="complaint-list-wrapper">
            <div className="list-controls">
                <div className="search-bar-wrapper">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="view-toggle">
                    <button
                        className={viewMode === 'grid' ? 'active' : ''}
                        onClick={() => setViewMode('grid')}
                    >
                        Grid
                    </button>
                    <button
                        className={viewMode === 'kanban' ? 'active' : ''}
                        onClick={() => setViewMode('kanban')}
                    >
                        Kanban
                    </button>
                </div>
            </div>

            <div className="filter-tags">
                {statuses.map(s => (
                    <motion.button
                        key={s.id}
                        className={`tag-chip ${filterStatus === s.id ? 'active' : ''}`}
                        onClick={() => setFilterStatus(s.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ '--tag-color': s.color }}
                    >
                        {s.label}
                    </motion.button>
                ))}
            </div>

            {viewMode === 'grid' ? (
                <motion.div
                    className="complaints-grid"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((c, i) => (
                            <ComplaintCard key={c._id} complaint={c} index={i} />
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📁</div>
                            <h3>No complaints found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </motion.div>
            ) : (
                <div className="kanban-board">
                    {['pending', 'in_progress', 'resolved'].map(status => (
                        <div key={status} className="kanban-column">
                            <div className="column-header">
                                <h3 className="column-title">
                                    {status.replace('_', ' ')}
                                    <span className="count">
                                        {filteredComplaints.filter(c => c.status === status).length}
                                    </span>
                                </h3>
                            </div>
                            <div className="column-cards">
                                {filteredComplaints
                                    .filter(c => c.status === status)
                                    .map((c, i) => (
                                        <ComplaintCard key={c._id} complaint={c} index={i} />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintList;
