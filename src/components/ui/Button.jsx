import { motion } from 'framer-motion';
import { buttonTap } from '../../utils/animations';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const buttonClasses = `
    custom-btn 
    custom-btn-${variant} 
    custom-btn-${size}
    ${fullWidth ? 'custom-btn-full' : ''}
    ${loading ? 'custom-btn-loading' : ''}
    ${disabled ? 'custom-btn-disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <motion.button
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            {...props}
        >
            {loading && (
                <span className="custom-btn-loader">
                    <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                    </svg>
                </span>
            )}

            {!loading && icon && iconPosition === 'left' && (
                <span className="custom-btn-icon custom-btn-icon-left">{icon}</span>
            )}

            <span className="custom-btn-text">{children}</span>

            {!loading && icon && iconPosition === 'right' && (
                <span className="custom-btn-icon custom-btn-icon-right">{icon}</span>
            )}

            <span className="custom-btn-ripple"></span>
        </motion.button>
    );
};

export default Button;
