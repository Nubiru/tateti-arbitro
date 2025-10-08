import React from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * Reusable input with different variants and states
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props
}) => {
  const inputClasses = [
    styles.input,
    error ? styles.error : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={inputClasses}
      {...props}
    />
  );
};

export default Input;
