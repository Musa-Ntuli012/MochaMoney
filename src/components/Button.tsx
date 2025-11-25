import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || isLoading}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {isLoading ? (
        <span className="btn-loading">
          <span className="btn-spinner" />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

