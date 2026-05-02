import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, scaleIn } from '../utils/animations';
import Button from './ui/Button';
import Input from './ui/Input';
import './ComplaintForm.css';

const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    compressedFile.preview = URL.createObjectURL(compressedFile);
                    resolve(compressedFile);
                }, 'image/jpeg', 0.8); // 80% quality
            };
        };
    });
};


const ComplaintForm = ({ onSubmitSuccess }) => {
    const { user, token } = useAuth(); // Current authenticated user + token
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        priority: 'medium',
        files: []
    });

    const categories = [
        { id: 'plumbing', label: 'Plumbing', icon: 'plumbing', desc: 'Leaks, taps, toilets' },
        { id: 'electrical', label: 'Electrical', icon: 'electrical', desc: 'Lights, fans, sockets' },
        { id: 'furniture', label: 'Furniture', icon: 'furniture', desc: 'Bed, chair, cupboard' },
        { id: 'cleaning', label: 'Cleaning', icon: 'cleaning', desc: 'Dusting, floor, waste' },
        { id: 'internet', label: 'Internet', icon: 'internet', desc: 'WiFi, connection issues' },
        { id: 'others', label: 'Others', icon: 'others', desc: 'Miscellaneous issues' }
    ];

    const priorities = [
        { id: 'low', label: 'Low', color: '#10B981', desc: 'Doesn\'t affect daily life' },
        { id: 'medium', label: 'Medium', color: '#F59E0B', desc: 'Needs attention soon' },
        { id: 'high', label: 'High', color: '#EF4444', desc: 'Emergency / Affects safety' }
    ];

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        onDrop: async (acceptedFiles) => {
            setLoading(true); // Show loading while compressing
            try {
                const compressedFiles = await Promise.all(
                    acceptedFiles.map(file => compressImage(file))
                );
                setFormData(prev => ({
                    ...prev,
                    files: [...prev.files, ...compressedFiles]
                }));
            } catch (error) {
                console.error('Compression error:', error);
            } finally {
                setLoading(false);
            }
        }
    });

    const removeFile = (name) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter(f => f.name !== name)
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('title', formData.title);
            formDataToSubmit.append('category', formData.category);
            formDataToSubmit.append('description', formData.description);
            formDataToSubmit.append('priority', formData.priority);

            // Add files - Note: backend expects 'images' not 'files'
            formData.files.forEach(file => {
                formDataToSubmit.append('images', file);
            });

            console.log('Current user role:', user?.role);
            console.log('Submitting complaint with token from context:', token ? 'Present' : 'Missing');

            if (!token) {
                throw new Error('Authentication failed. Please login again.');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/student/complaints`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSubmit
            });

            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }

            if (response.status === 403) {
                const errorData = await response.json();
                console.error('Forbidden error:', errorData);
                throw new Error('Access denied: Make sure you are registered as a student, not admin');
            }

            if (response.status === 409) {
                const errorData = await response.json();
                console.error('Duplicate complaint detected:', errorData);

                if (errorData.similarComplaints && errorData.similarComplaints.length > 0) {
                    const ids = errorData.similarComplaints.map((c) => c._id);
                    toast.error('We found similar complaints. Showing them in your dashboard.', {
                        duration: 5000,
                    });
                    // Navigate to student dashboard and show only these complaints
                    const params = new URLSearchParams();
                    params.set('duplicateIds', ids.join(','));
                    navigate(`/student?${params.toString()}`);
                } else {
                    toast.error(errorData.message || 'A similar complaint already exists.');
                }

                return;
            }

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                if (onSubmitSuccess) {
                    onSubmitSuccess(result.complaint);
                }
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({ title: '', category: '', description: '', priority: 'medium', files: [] });
                    setStep(1);
                }, 3000);
            } else {
                throw new Error(result.message || 'Failed to submit complaint');
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            toast.error(error.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="form-success-container">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="success-circle"
                >
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white">
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            d="M5 13l4 4L19 7"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>
                <motion.h2 variants={fadeInUp} initial="initial" animate="animate">Complaint Submitted!</motion.h2>
                <motion.p variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                    Your complaint has been registered with ID #HC-4029. We'll update you shortly.
                </motion.p>
                <Button variant="outline" onClick={() => window.location.reload()}>File Another</Button>
            </div>
        );
    }

    return (
        <div className="complaint-form-wrapper">
            {/* Progress Indicator */}
            <div className="custom-stepper">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`step-item ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`}>
                        <div className="step-circle">{step > i ? '✓' : i}</div>
                        <div className="step-bar"></div>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        className="form-step"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -50 }}
                    >
                        <h2 className="step-title">What's the issue?</h2>
                        <p className="step-desc">Pick a category that best describes your problem.</p>

                        <div className="category-grid">
                            {categories.map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    variants={scaleIn}
                                    className={`category-card ${formData.category === cat.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="cat-icon">
                                        {cat.icon === 'plumbing' && '🚰'}
                                        {cat.icon === 'electrical' && '⚡'}
                                        {cat.icon === 'furniture' && '🪑'}
                                        {cat.icon === 'cleaning' && '🧹'}
                                        {cat.icon === 'internet' && '📶'}
                                        {cat.icon === 'others' && '📦'}
                                    </span>
                                    <span className="cat-label">{cat.label}</span>
                                    <span className="cat-desc">{cat.desc}</span>
                                    {formData.category === cat.id && (
                                        <motion.div layoutId="cat-ring" className="cat-ring" />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="form-actions-right">
                            <button
                                className="hc-form-btn hc-form-btn-primary"
                                disabled={!formData.category}
                                onClick={nextStep}
                            >
                                Continue
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{marginLeft: '8px'}}><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        className="form-step"
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -50 }}
                    >
                        <h2 className="step-title">Tell us more</h2>
                        <p className="step-desc">Describe the problem in detail for faster resolution.</p>

                        <Input
                            label="Complaint Title"
                            placeholder="e.g. WiFi not working since morning"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <div className="textarea-group">
                            <textarea
                                className={`custom-textarea ${formData.description ? 'has-value' : ''}`}
                                placeholder="Detailed description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="char-counter">{formData.description.length} / 500</div>
                        </div>

                        <div className="priority-section">
                            <label className="section-label">Select Priority</label>
                            <div className="priority-grid">
                                {priorities.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`priority-card ${formData.priority === p.id ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, priority: p.id })}
                                        style={{ '--p-color': p.color }}
                                    >
                                        <div className="p-dot"></div>
                                        <div className="p-text">
                                            <span className="p-label">{p.label}</span>
                                            <span className="p-desc">{p.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions-between">
                            <button className="hc-form-btn hc-form-btn-secondary" onClick={prevStep}>Back</button>
                            <button className="hc-form-btn hc-form-btn-primary" disabled={!formData.title || !formData.description} onClick={nextStep}>Almost there</button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        className="form-step"
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <h2 className="step-title">Evidence & Proof</h2>
                        <p className="step-desc">Upload photos of the issue to help our team understand better.</p>

                        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                            <input {...getInputProps()} />
                            <div className="dropzone-content">
                                <div className="dropzone-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                </div>
                                <p>Drag & drop images here, or <span>click to browse</span></p>
                                <span className="dropzone-hint">Supports JPG, PNG up to 5MB</span>
                            </div>
                        </div>

                        <div className="file-preview-grid">
                            {formData.files.map((file) => (
                                <motion.div key={file.name} variants={scaleIn} className="file-preview-card">
                                    <img src={file.preview} alt="preview" />
                                    <button className="remove-file" onClick={() => removeFile(file.name)}>×</button>
                                </motion.div>
                            ))}
                        </div>

                        {formData.files.length > 0 && (
                            <div className="primary-proof-preview">
                                <img
                                    src={formData.files[0].preview}
                                    alt="Selected proof"
                                />
                            </div>
                        )}

                        <div className="form-actions-between">
                            <button className="hc-form-btn hc-form-btn-secondary" onClick={prevStep}>Back</button>
                            <button className="hc-form-btn hc-form-btn-primary" disabled={loading} onClick={handleSubmit}>
                                {loading ? 'Uploading...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComplaintForm;
