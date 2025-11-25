import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAB.css';

interface FABAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  actions: FABAction[];
  mainIcon: React.ReactNode;
}

export const FAB: React.FC<FABProps> = ({ actions, mainIcon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fab-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fab-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                className="fab-action"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                style={{ backgroundColor: action.color || 'var(--accent-primary)' }}
              >
                {action.icon}
                <span className="fab-action-label">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className="fab-main"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {mainIcon}
      </motion.button>
    </div>
  );
};

