import React from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground Component
 * Source: https://uiverse.io/marsella_3472/clever-puma-91
 *
 * @param {Object} props - Component props
 * @param {boolean} props.enabled - Whether background animation is enabled
 * @param {number} props.opacity - Background opacity (0-1)
 */
const AnimatedBackground = ({ enabled = true, opacity = 0.6 }) => {
  if (!enabled) return null;

  return (
    <div className="animated-background" style={{ opacity }}>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
      <div className="animated-background-particle"></div>
    </div>
  );
};

export default AnimatedBackground;
