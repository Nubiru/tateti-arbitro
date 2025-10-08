import React from 'react';
import './AnimatedCard.css';

/**
 * AnimatedCard Component
 * Source: https://uiverse.io/adamgiebl/new-lionfish-4
 * Gradient border card with theme-aware styling and flexible sizing
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.width - Custom width (CSS value or CSS variable)
 * @param {string} props.height - Custom height (CSS value or CSS variable)
 */
const AnimatedCard = ({ children, title, className = '', width, height }) => {
  const customStyles = {};
  if (width) customStyles['--card-width'] = width;
  if (height) customStyles['--card-height'] = height;

  return (
    <div className={`animated-card ${className}`} style={customStyles}>
      {title && <h3 className="animated-card-title">{title}</h3>}
      <div className="animated-card-content">{children}</div>
    </div>
  );
};

export default AnimatedCard;
