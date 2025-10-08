import React from 'react';
import './AnimatedButton.css';

/**
 * AnimatedButton Component
 * Source: https://uiverse.io/Spacious74/helpless-tiger-55
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedButton = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`animated-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="animated-button-text">{children}</span>
    </button>
  );
};

export default AnimatedButton;
