import React from 'react';
import './AnimatedInput.css';

/**
 * AnimatedInput Component
 * Source: https://uiverse.io/Lakshay-art/curvy-earwig-22
 *
 * @param {Object} props - Component props
 * @param {string|number} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.type - Input type (text, number, email, etc.)
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name
 * @param {number} props.min - Minimum value (for number inputs)
 * @param {number} props.max - Maximum value (for number inputs)
 */
const AnimatedInput = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  name,
  min,
  max,
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="animated-input-container">
      {label && (
        <label htmlFor={inputId} className="animated-input-label">
          {label}
        </label>
      )}
      <div className="animated-input-wrapper">
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className="animated-input"
        />
        <div className="animated-input-border"></div>
      </div>
    </div>
  );
};

export default AnimatedInput;
