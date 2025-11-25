import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import './OnboardingPage.css';

const slides = [
  {
    title: 'Welcome to MochaMoney',
    description: 'Your coffee-themed companion for managing finances with style and ease.',
    icon: '☕',
  },
  {
    title: 'Track Expenses',
    description: 'Easily record and categorize your spending to stay on top of your budget.',
    icon: '💰',
  },
  {
    title: 'Set Savings Goals',
    description: 'Create stash goals and watch your savings grow towards your dreams.',
    icon: '🎯',
  },
  {
    title: 'Monitor Investments',
    description: 'Track your EasyEquities and EasyProperties positions in one place.',
    icon: '📈',
  },
];

export const OnboardingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <button onClick={handleSkip} className="onboarding-skip">
          Skip
        </button>
      </div>

      <div className="onboarding-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="onboarding-slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="onboarding-icon">{slides[currentSlide].icon}</div>
            <h1 className="onboarding-title">{slides[currentSlide].title}</h1>
            <p className="onboarding-description">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`onboarding-indicator ${
                index === currentSlide ? 'active' : ''
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="onboarding-footer">
        <Button variant="primary" size="lg" onClick={handleNext}>
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
    </div>
  );
};

