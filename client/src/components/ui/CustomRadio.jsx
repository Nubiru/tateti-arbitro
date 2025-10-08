import React from 'react';
import './CustomRadio.css';

/**
 * CustomRadio Component
 * Source: https://uiverse.io/Shoh2008/bad-starfish-74
 * Animated radial gradient radio button with scale effects
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier
 * @param {string} props.name - Name for radio group
 * @param {string} props.value - Value of radio button
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - Size variant: 'small', 'default', 'large'
 */
const CustomRadio = ({
  id,
  name,
  value,
  checked = false,
  onChange,
  label,
  className = '',
  disabled = false,
  size = 'default',
  ...props
}) => {
  const handleChange = event => {
    if (onChange && !disabled) {
      onChange(event);
    }
  };

  const sizeClass = size !== 'default' ? `size-${size}` : '';

  return (
    <div className={`custom-radio ${sizeClass} ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="custom-radio-input"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="custom-radio-label">
          {label}
        </label>
      )}
    </div>
  );
};

export default CustomRadio;
