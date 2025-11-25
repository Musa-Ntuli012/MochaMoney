import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useSavingsGoals } from '../hooks/useSavings';
import { useInvestments } from '../hooks/useInvestments';
import { useEmergencyFund } from '../hooks/useEmergencyFund';
import { useAuthStore } from '../store/authStore';
import { downloadTransactionsCSV } from '../services/reports';
import './ReportsPage.css';

export const ReportsPage: React.FC = () => {
  const { token } = useAuthStore();
  const { data: transactions = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { data: savingsGoals = [] } = useSavingsGoals();
  const { data: investments = [] } = useInvestments();
  const { data: emergencyFund } = useEmergencyFund();
  const [status, setStatus] = useState('');

  const handleDownload = async () => {
    if (!token) return;
    setStatus('');
    try {
      await downloadTransactionsCSV(token);
      setStatus('Transactions exported successfully.');
    } catch (error: any) {
      setStatus(error.message || 'Failed to export transactions.');
    }
  };

  return (
    <div className="reports-page">
      <h1 className="page-title">Reports & Export</h1>

      <Card className="reports-card">
        <h2 className="reports-card-title">Snapshot</h2>
        <div className="reports-metrics">
          <div>
            <span className="reports-label">Transactions</span>
            <strong>{transactions.length}</strong>
          </div>
          <div>
            <span className="reports-label">Budgets</span>
            <strong>{budgets.length}</strong>
          </div>
          <div>
            <span className="reports-label">Savings Goals</span>
            <strong>{savingsGoals.length}</strong>
          </div>
          <div>
            <span className="reports-label">Investments</span>
            <strong>{investments.length}</strong>
          </div>
          <div>
            <span className="reports-label">Emergency Fund</span>
            <strong>{emergencyFund ? 'Active' : 'Not set'}</strong>
          </div>
        </div>
      </Card>

      <Card className="reports-card">
        <h2 className="reports-card-title">Exports</h2>
        <div className="export-row">
          <div>
            <div className="export-title">Transactions CSV</div>
            <p className="export-description">
              Download all transactions with amounts, categories, and notes.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleDownload} disabled={!token}>
            Download CSV
          </Button>
        </div>
        {status && <div className="reports-status">{status}</div>}
      </Card>
    </div>
  );
};

