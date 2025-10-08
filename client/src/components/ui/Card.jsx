import React from 'react';
import styles from './Card.module.css';

/**
 * Card Component
 * Reusable card container with different variants
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
