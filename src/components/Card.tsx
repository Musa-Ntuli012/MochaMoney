import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'gradient';
  gradient?: 'income' | 'expense' | 'savings' | 'espresso';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  gradient,
}) => {
  const cardClass = `card card-${variant} ${gradient ? `card-gradient-${gradient}` : ''} ${className}`;

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        whileTap: { scale: 0.98 },
        onClick,
        style: { cursor: 'pointer' },
      }
    : {};

  return (
    <Component className={cardClass} {...motionProps}>
      {children}
    </Component>
  );
};

