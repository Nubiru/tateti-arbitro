import React from 'react';
import './AnimatedCheckbox.css';

/**
 * AnimatedCheckbox Component
 * Source: https://uiverse.io/PriyanshuGupta28/spicy-starfish-71
 *
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Checkbox label
 * @param {string} props.id - Checkbox ID
 * @param {string} props.name - Checkbox name
 */
const AnimatedCheckbox = ({ checked = false, onChange, label, id, name }) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="animated-checkbox-container">
      <div className="animated-checkbox-wrapper">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="animated-checkbox-input"
        />
        <label htmlFor={checkboxId} className="animated-checkbox-label">
          <div className="animated-checkbox-custom">
            <div className="animated-checkbox-checkmark">
              <svg
                className="animated-checkbox-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>
          {label && <span className="animated-checkbox-text">{label}</span>}
        </label>
      </div>
    </div>
  );
};

export default AnimatedCheckbox;
