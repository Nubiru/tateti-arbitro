import React, { useEffect, useState } from 'react';
import styles from './PresentationScreen.module.css';
import { AnimatedButton } from '../components/ui';

/**
 * Presentation Screen Component
 * Animated intro screen with university branding
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const PresentationScreen = ({ onStart, onActivity }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    // En entorno de prueba, aplicar animaciones inmediatamente
    if (process.env.NODE_ENV === 'test') {
      setIsVisible(true);
      setShowSubtitle(true);
      return;
    }

    // Activar animaciones al montar en producción
    const timer1 = setTimeout(() => setIsVisible(true), 500);
    const timer2 = setTimeout(() => setShowSubtitle(true), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleStartClick = () => {
    onActivity();
    onStart();
  };

  return (
    <div
      className={styles.presentationScreen}
      data-testid="presentation-screen"
      onMouseMove={onActivity}
      onKeyDown={onActivity}
    >
      <div className={styles.presentationContainer}>
        {/* Main Logo/Title */}
        <div
          className={`${styles.mainTitle} mainTitle ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          <h1
            className={`${styles.universityTitle} ${
              isVisible ? 'animate-fade-in' : ''
            }`}
          >
            UPC
          </h1>
          <div className={styles.titleSubtitle}>
            <span className={styles.programTitle}>Programación Full Stack</span>
          </div>
        </div>

        {/* Animated Game Title */}
        <div
          className={`${styles.gameTitle} ${
            isVisible ? 'animate-slide-in' : ''
          }`}
        >
          <h2 className={styles.gameName}>Ta-Te-Ti Arbitro</h2>
          <p className={styles.gameDescription}>
            Sistema de arbitraje inteligente para partidas de Ta-Te-Ti
          </p>
        </div>

        {/* Animated Elements */}
        <div
          className={`${styles.animatedElements} ${
            showSubtitle ? 'animate-fade-in' : ''
          }`}
        >
          <div className={styles.floatingShapes}>
            <div className={`${styles.shape} ${styles.shape1}`}></div>
            <div className={`${styles.shape} ${styles.shape2}`}></div>
            <div className={`${styles.shape} ${styles.shape3}`}></div>
            <div className={`${styles.shape} ${styles.shape4}`}></div>
          </div>
        </div>

        {/* Start Button */}
        <div
          className={`${styles.startSection} ${
            showSubtitle ? 'animate-fade-in' : ''
          }`}
        >
          <AnimatedButton
            type="button"
            className={`btn btn-primary ${styles.startButton}`}
            onClick={handleStartClick}
          >
            Comenzar
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default PresentationScreen;
