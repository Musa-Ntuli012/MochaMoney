import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { FAB } from '../components/FAB';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useSavingsGoals } from '../hooks/useSavings';
import { useInvestments } from '../hooks/useInvestments';
import { useEmergencyFund } from '../hooks/useEmergencyFund';
import { formatCurrency } from '../utils/format';
import type { Transaction } from '../types';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading: transactionsLoading } = useTransactions();
  const transactions: Transaction[] = data ?? [];
  const { data: budgets = [] } = useBudgets();
  const { data: savingsGoals = [] } = useSavingsGoals();
  const { data: investments = [] } = useInvestments();
  const { data: emergencyFund } = useEmergencyFund();

  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.balance += t.amount;
          acc.monthlyIncome += t.amount;
        } else if (t.type === 'expense') {
          acc.balance -= t.amount;
          acc.monthlyExpenses += t.amount;
        }
        return acc;
      },
      { balance: 0, monthlyIncome: 0, monthlyExpenses: 0 }
    );
  }, [transactions]);

  const totalBudgeted = budgets.reduce((acc, budget) => acc + (budget.limit || 0), 0);
  const totalSavings = savingsGoals.reduce((acc, goal) => acc + (goal.current || 0), 0);
  const totalInvested = investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);
  const emergencyProgress = emergencyFund
    ? Math.min(100, Math.round((emergencyFund.current / emergencyFund.target) * 100))
    : 0;
  const fabActions = [
    {
      label: 'Add Expense',
      icon: '💰',
      onClick: () => navigate('/expenses'),
      color: 'var(--error)',
    },
    {
      label: 'Add Savings',
      icon: '🎯',
      onClick: () => navigate('/stash'),
      color: 'var(--caramel)',
    },
    {
      label: 'Add Investment',
      icon: '📈',
      onClick: () => navigate('/investments'),
      color: 'var(--success)',
    },
  ];

  if (transactionsLoading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-grid">
          <Card variant="gradient" gradient="espresso" className="dashboard-balance">
            <div className="balance-label">Total Balance</div>
            <div className="balance-amount number">
              {formatCurrency(balance, 'ZAR')}
            </div>
          </Card>

          <Card variant="gradient" gradient="income" className="dashboard-stat">
            <div className="stat-label">Monthly Income</div>
            <div className="stat-amount number">
              {formatCurrency(monthlyIncome, 'ZAR')}
            </div>
          </Card>

          <Card variant="gradient" gradient="expense" className="dashboard-stat">
            <div className="stat-label">Monthly Expenses</div>
            <div className="stat-amount number">
              {formatCurrency(monthlyExpenses, 'ZAR')}
            </div>
          </Card>

          <Card variant="gradient" gradient="savings" className="dashboard-stat">
            <div className="stat-label">Savings Goals</div>
            <div className="stat-amount number">
              {formatCurrency(totalSavings, 'ZAR')}
            </div>
          </Card>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-subcard">
            <div className="subcard-header">
              <div>Budgets Allocated</div>
              <strong>{formatCurrency(totalBudgeted, 'ZAR')}</strong>
            </div>
            <p className="subcard-meta">{budgets.length} active budgets</p>
          </Card>
          <Card className="dashboard-subcard">
            <div className="subcard-header">
              <div>Investments Value</div>
              <strong>{formatCurrency(totalInvested, 'ZAR')}</strong>
            </div>
            <p className="subcard-meta">{investments.length} positions</p>
          </Card>
          <Card className="dashboard-subcard">
            <div className="subcard-header">
              <div>Emergency Fund</div>
              <strong>
                {emergencyFund
                  ? formatCurrency(emergencyFund.current, emergencyFund.currency)
                  : 'Not set'}
              </strong>
            </div>
            <p className="subcard-meta">
              {emergencyFund
                ? `${emergencyProgress}% of ${formatCurrency(emergencyFund.target, emergencyFund.currency)}`
                : 'Create a fund to track progress'}
            </p>
          </Card>
        </div>

        <Card className="dashboard-recent">
          <h2 className="recent-title">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="recent-empty">
              No transactions yet. Add your first transaction to get started!
            </div>
          ) : (
            <div className="recent-list">
              {transactions.slice(0, 5).map((transaction: Transaction) => (
                <div key={transaction._id} className="recent-item">
                  <div className="recent-item-info">
                    <div className="recent-item-type">{transaction.type}</div>
                    <div className="recent-item-desc">
                      {transaction.description || 'No description'}
                    </div>
                  </div>
                  <div
                    className={`recent-item-amount number ${
                      transaction.type === 'income' ? 'positive' : 'negative'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <FAB actions={fabActions} mainIcon={<span>+</span>} />
    </div>
  );
};

