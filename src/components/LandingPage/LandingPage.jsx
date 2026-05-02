import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    fadeInUp,
    fadeInDown,
    staggerContainer,
    scaleIn
} from '../../utils/animations';
import Button from '../ui/Button';
import hostelBuilding from '../../assets/hostel-building.jpg';
import hostelBedroom from '../../assets/hostel-bedroom.jpg';
import hostelMess from '../../assets/hostel-mess.jpg';
import hostelRoomGirls from '../../assets/hostel-room-girls.jpg';
import './LandingPage.css';

const LandingPage = () => {
    const [stats, setStats] = useState({
        totalComplaints: 0,
        resolvedIssues: 0,
        avgResolutionTime: 0,
        activeUsers: 0
    });

    const { scrollY } = useScroll();
    const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Real-time stats fetching
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/public-stats`);
                const data = await response.json();
                if (data.success) {
                    setStats({
                        totalComplaints: data.totalComplaints,
                        resolvedIssues: data.resolvedComplaints,
                        avgResolutionTime: data.avgResolutionTime,
                        activeUsers: data.totalUsers
                    });
                }
            } catch (error) {
                console.error("Failed to fetch statistics:", error);
            }
        };

        fetchStats();
        // Refresh stats every 30 seconds for "real-time" feel
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            title: 'Quick Complaint Filing',
            description: 'Submit complaints instantly with our streamlined form and real-time tracking system',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            color: '#F59E0B'
        },
        {
            title: 'Real-Time Updates',
            description: 'Get instant notifications about your complaint status and resolution progress',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            color: '#14B8A6'
        },
        {
            title: 'Priority Management',
            description: 'Intelligent priority system ensures urgent issues get immediate attention',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: '#EF4444'
        },
        {
            title: 'Detailed Analytics',
            description: 'Comprehensive dashboard with insights and resolution metrics',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: '#8B5CF6'
        }
    ];

    return (
        <div className="landing-page">
            {/* Hero Section with Real Hostel Background */}
            <section className="hero-section">
                <motion.div
                    className="hero-background"
                    style={{ y: parallaxY }}
                >
                    <img 
                        src={hostelBuilding} 
                        alt="Hostel Building" 
                        className="hero-bg-image"
                    />
                    <div className="hero-gradient-overlay"></div>
                </motion.div>

                <motion.div
                    className="hero-content container"
                    style={{ opacity }}
                >
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="hero-text"
                    >
                        <motion.h1
                            variants={fadeInDown}
                            className="hero-title"
                            style={{ color: 'white' }}
                        >
                            Hostel Complaint
                            <span className="text-gradient"> Management</span>
                            <br />Made Simple
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="hero-subtitle"
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                            Streamline your hostel complaint resolution process with our intelligent,
                            real-time tracking system designed for modern campus living.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="hero-cta"
                        >
                            <Link to="/register">
                                <Button variant="primary" size="lg">
                                    Get Started
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg">
                                    Sign In
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={scaleIn}
                        initial="initial"
                        animate="animate"
                        className="hero-illustration"
                    >
                        <div className="floating-card card-1">
                            <div className="card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <div className="card-text">Quick Filing</div>
                        </div>
                        <div className="floating-card card-2">
                            <div className="card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                            </div>
                            <div className="card-text">Fast Resolution</div>
                        </div>
                        <div className="floating-card card-3">
                            <div className="card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </div>
                            <div className="card-text">Real-time Tracking</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="scroll-indicator"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <motion.div
                        className="stats-grid"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="stat-card">
                            <div className="stat-icon stat-icon-primary">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="stat-number">{stats.totalComplaints.toLocaleString()}</div>
                            <div className="stat-label">Total Complaints</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="stat-card">
                            <div className="stat-icon stat-icon-success">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="stat-number">{stats.resolvedIssues.toLocaleString()}</div>
                            <div className="stat-label">Resolved Issues</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="stat-card">
                            <div className="stat-icon stat-icon-warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="stat-number">{stats.avgResolutionTime}h</div>
                            <div className="stat-label">Avg Resolution Time</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="stat-card">
                            <div className="stat-icon stat-icon-info">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="stat-number">{stats.activeUsers.toLocaleString()}</div>
                            <div className="stat-label">Active Users</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="features-header"
                    >
                        <motion.h2 variants={fadeInDown} className="section-title">
                            Powerful Features for
                            <span className="text-gradient"> Efficient Management</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="section-subtitle">
                            Everything you need to manage hostel complaints effectively
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="features-grid"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="feature-card"
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            >
                                <div className="feature-icon" style={{ color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-glow" style={{ background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)` }}></div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            {/* Gallery Section */}
            <section className="gallery-section">
                <div className="container">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="gallery-header"
                    >
                        <motion.h2 variants={fadeInDown}>Our Hostel</motion.h2>
                        <motion.p variants={fadeInUp}>Experience comfort and community living</motion.p>
                    </motion.div>
                    
                    <motion.div
                        className="gallery-grid"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={scaleIn} className="gallery-item">
                            <img src={hostelBuilding} alt="Hostel Building" />
                            <div className="gallery-overlay">
                                <h3>Main Building</h3>
                            </div>
                        </motion.div>
                        
                        <motion.div variants={scaleIn} className="gallery-item">
                            <img src={hostelBedroom} alt="Hostel Bedroom" />
                            <div className="gallery-overlay">
                                <h3>Comfortable Rooms</h3>
                            </div>
                        </motion.div>
                        
                        <motion.div variants={scaleIn} className="gallery-item">
                            <img src={hostelMess} alt="Hostel Mess" />
                            <div className="gallery-overlay">
                                <h3>Dining Hall</h3>
                            </div>
                        </motion.div>
                        
                        <motion.div variants={scaleIn} className="gallery-item">
                            <img src={hostelRoomGirls} alt="Hostel Common Area" />
                            <div className="gallery-overlay">
                                <h3>Common Area</h3>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="cta-content"
                    >
                        <motion.h2 variants={fadeInDown} className="cta-title">
                            Ready to Transform Your Hostel Management?
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="cta-subtitle">
                            Join our community and experience a better way to live.
                        </motion.p>
                        <motion.div variants={fadeInUp}>
                            <Link to="/register">
                                <Button variant="primary" size="lg">
                                    Join Now
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Premium Institutional Footer */}
            <footer className="main-footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">HC</div>
                        <h3>HostelCare</h3>
                        <p>Providing excellence in student accommodation management and digital transparency.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <Link to="/login">Student Portal</Link>
                        <Link to="/admin-login">Admin Access</Link>
                        <Link to="/register">Register</Link>
                    </div>
                    <div className="footer-links">
                        <h4>Institution</h4>
                        <Link to="#">About Hostel</Link>
                        <Link to="#">Guidelines</Link>
                        <Link to="#">Contact Warden</Link>
                    </div>
                    <div className="footer-contact">
                        <h4>Support</h4>
                        <p>Email: support@hostelcare.edu</p>
                        <p>Tel: +91 98765 43210</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <p>&copy; {new Date().getFullYear()} Hostel Complaint Management System. Real-time Resolution Platform.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
