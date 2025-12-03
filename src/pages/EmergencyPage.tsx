import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency } from '../utils/format';
import { useAddTransaction } from '../hooks/useTransactions';
import { useAuthStore } from '../store/authStore';
import {
  useEmergencyFund,
  useCreateEmergencyFund,
  useUpdateEmergencyFund,
  useDeleteEmergencyFund,
} from '../hooks/useEmergencyFund';
import './EmergencyPage.css';

export const EmergencyPage: React.FC = () => {
  const { data, isLoading } = useEmergencyFund();
  const createFund = useCreateEmergencyFund();
  const updateFund = useUpdateEmergencyFund();
  const deleteFund = useDeleteEmergencyFund();
  const fund = data;
  const addTransaction = useAddTransaction();
  const { user } = useAuthStore.getState();

  const [form, setForm] = useState({
    target: '',
    current: '',
  });
  const [alert, setAlert] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert('');
    if (!form.target) {
      setAlert('Target amount is required');
      return;
    }
    const currentAmount = Number(form.current) || 0;
    const created = await createFund.mutateAsync({
      target: Number(form.target),
      current: currentAmount,
      currency: 'ZAR',
      lastUpdated: new Date().toISOString(),
    });
    if (currentAmount > 0) {
      await addTransaction.mutateAsync({
        type: 'stash',
        categoryId: 'emergency',
        amount: currentAmount,
        currency: user?.currency || 'ZAR',
        date: new Date().toISOString(),
        description: 'Initial emergency fund contribution',
      });
    }
    setForm({ target: '', current: '' });
  };

  const handleTopUp = async (amount: number) => {
    if (!fund) return;
    await updateFund.mutateAsync({
      id: fund._id,
      data: { current: fund.current + amount },
    });
    await addTransaction.mutateAsync({
      type: 'stash',
      categoryId: 'emergency',
      amount,
      currency: user?.currency || fund.currency || 'ZAR',
      date: new Date().toISOString(),
      description: 'Emergency fund top-up',
    });
  };

  const handleReset = async () => {
    if (!fund) return;
    await deleteFund.mutate(fund._id);
  };

  const progress = fund ? Math.min(100, Math.round((fund.current / fund.target) * 100)) : 0;

  return (
    <div className="emergency-page">
      <div className="emergency-header">
        <h1 className="page-title">Emergency Fund</h1>
        {fund && (
          <div className="emergency-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 120 120">
                <circle className="progress-bg" cx="60" cy="60" r="54" />
                <motion.circle
                  className="progress-value"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray={Math.PI * 2 * 54}
                  strokeDashoffset={Math.PI * 2 * 54 * (1 - progress / 100)}
                  animate={{ strokeDashoffset: Math.PI * 2 * 54 * (1 - progress / 100) }}
                />
              </svg>
              <div className="progress-center">
                <div className="progress-percent">{progress}%</div>
                <div className="progress-label">funded</div>
              </div>
            </div>
            <div className="progress-details">
              <div>
                <span className="detail-label">Saved</span>
                <div className="detail-value">{formatCurrency(fund.current, fund.currency)}</div>
              </div>
              <div>
                <span className="detail-label">Target</span>
                <div className="detail-value">{formatCurrency(fund.target, fund.currency)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!fund ? (
        <Card className="emergency-card">
          <h2 className="emergency-card-title">Create Emergency Fund</h2>
          <form className="emergency-form" onSubmit={handleCreate}>
            <Input
              label="Target Amount"
              type="number"
              value={form.target}
              onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
              required
              min="0"
              step="0.01"
            />
            <Input
              label="Current Amount"
              type="number"
              value={form.current}
              onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))}
              min="0"
              step="0.01"
            />
            {alert && <div className="emergency-alert">{alert}</div>}
            <Button type="submit" variant="primary" size="md" isLoading={createFund.isPending}>
              Save
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="emergency-card">
          <h2 className="emergency-card-title">Quick Actions</h2>
          <div className="emergency-actions">
            {[100, 500, 1000].map((amount) => (
              <Button key={amount} variant="secondary" size="md" onClick={() => handleTopUp(amount)}>
                Add {formatCurrency(amount, fund.currency)}
              </Button>
            ))}
            <Button variant="outline" size="md" onClick={handleReset} isLoading={deleteFund.isPending}>
              Reset Fund
            </Button>
          </div>
          <form
            className="emergency-inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              await updateFund.mutateAsync({
                id: fund._id,
                data: {
                  target: Number(form.target) || fund.target,
                },
              });
            }}
          >
            <Input
              label="Update Target"
              type="number"
              value={form.target}
              onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
              placeholder={fund.target.toString()}
            />
            <Button type="submit" variant="primary" size="md" isLoading={updateFund.isPending}>
              Update Target
            </Button>
          </form>
        </Card>
      )}

      {isLoading && (
        <Card>
          <p>Loading emergency fund...</p>
        </Card>
      )}
    </div>
  );
};

