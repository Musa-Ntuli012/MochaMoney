import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { path: '/', label: 'Dashboard', icon: '☕' },
  { path: '/expenses', label: 'Expenses', icon: '💰' },
  { path: '/recurring', label: 'Recurring', icon: '🔄' },
  { path: '/budgets', label: 'Budgets', icon: '📊' },
  { path: '/stash', label: 'Stash', icon: '🎯' },
  { path: '/investments', label: 'Investments', icon: '📈' },
  { path: '/emergency', label: 'Emergency', icon: '🆘' },
  { path: '/reports', label: 'Reports', icon: '📄' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <div className="layout-logo">
            <img src="https://drive.google.com/uc?export=view&id=19GAT6JY-Uc0Thf4nIPiP79bnRGxScEp5" alt="MochaMoney" className="logo-img" />
            <h1 className="logo-text">MochaMoney</h1>
          </div>
          <nav className="layout-nav">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="layout-main">
        <div className="layout-content">{children}</div>
      </main>
    </div>
  );
};

