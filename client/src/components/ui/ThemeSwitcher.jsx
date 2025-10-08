import React from 'react';
import './ThemeSwitcher.css';

/**
 * ThemeSwitcher Component
 * Source: https://uiverse.io/Galahhad/strong-squid-82
 * Animated sun/moon toggle switch with clouds and stars
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isDark - Whether dark mode is enabled
 * @param {Function} props.onToggleDark - Dark mode toggle handler
 */
const ThemeSwitcher = ({ isDark = true, onToggleDark }) => {
  const handleChange = () => {
    if (onToggleDark) {
      onToggleDark();
    }
  };

  return (
    <label className="theme-switch" htmlFor="theme-switch-checkbox">
      <input
        type="checkbox"
        id="theme-switch-checkbox"
        className="theme-switch__checkbox"
        checked={!isDark} // Checked = light mode
        onChange={handleChange}
        aria-label={`Current: ${isDark ? 'Dark' : 'Light'} - Click to switch`}
      />
      <div className="theme-switch__container">
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
            </div>
          </div>
          <div className="theme-switch__clouds"></div>
          <svg className="theme-switch__stars-container" viewBox="0 0 50 50">
            <polygon
              points="25,5 27,15 37,15 29,22 32,32 25,25 18,32 21,22 13,15 23,15"
              fill="currentColor"
            />
            <polygon
              points="10,10 11,13 14,13 12,15 13,17 10,15 7,17 8,15 6,13 9,13"
              fill="currentColor"
            />
            <polygon
              points="40,8 41,11 44,11 42,13 43,15 40,13 37,15 38,13 36,11 39,11"
              fill="currentColor"
            />
            <polygon
              points="15,25 16,28 19,28 17,30 18,32 15,30 12,32 13,30 11,28 14,28"
              fill="currentColor"
            />
            <polygon
              points="35,30 36,33 39,33 37,35 38,37 35,35 32,37 33,35 31,33 34,33"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </label>
  );
};

export default ThemeSwitcher;
