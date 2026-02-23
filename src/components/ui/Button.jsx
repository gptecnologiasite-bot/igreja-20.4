import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    icon: Icon,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {Icon && <Icon size={size === 'sm' ? 16 : 20} />}
            {children}
        </button>
    );
};

export default Button;
