import React from 'react';
import './Card.css';

const Card = ({ children, title, subtitle, footer, className = '', ...props }) => {
    return (
        <div className={`professional-card ${className}`} {...props}>
            {title && (
                <div className="card-header">
                    <div className="header-info">
                        <h3>{title}</h3>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
