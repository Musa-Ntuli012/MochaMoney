import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency } from '../utils/format';
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal } from '../hooks/useSavings';
import { useAddTransaction } from '../hooks/useTransactions';
import { useAuthStore } from '../store/authStore';
import './StashPage.css';

export const StashPage: React.FC = () => {
  const { data, isLoading } = useSavingsGoals();
  const goals = data ?? [];
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();
  const addTransaction = useAddTransaction();
  const { user } = useAuthStore.getState();
  const [form, setForm] = useState({
    name: '',
    target: '',
    current: '',
    color: '#C9A961',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.target) {
      setError('Name and target amount are required');
      return;
    }
    try {
      const created = await createGoal.mutateAsync({
        name: form.name,
        target: Number(form.target),
        current: Number(form.current) || 0,
        currency: 'ZAR',
        color: form.color,
      });

      const initialAmount = Number(form.current) || 0;
      if (initialAmount > 0) {
        await addTransaction.mutateAsync({
          type: 'stash',
          categoryId: 'savings',
          amount: initialAmount,
          currency: user?.currency || 'ZAR',
          date: new Date().toISOString(),
          description: `Initial contribution to ${created.name}`,
        });
      }
      setForm({ name: '', target: '', current: '', color: '#C9A961' });
    } catch (err: any) {
      setError(err.message || 'Failed to create savings goal');
    }
  };

  return (
    <div className="stash-page">
      <h1 className="page-title">Savings Goals</h1>

      <Card className="stash-card">
        <h2 className="stash-card-title">Create Goal</h2>
        <form className="stash-form" onSubmit={handleSubmit}>
          <Input
            label="Goal Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Target Amount"
            type="number"
            value={form.target}
            onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
            min="0"
            step="0.01"
            required
          />
          <Input
            label="Current Amount"
            type="number"
            value={form.current}
            onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))}
            min="0"
            step="0.01"
          />
          <div className="form-row">
            <label className="input-label" htmlFor="goal-color">Color</label>
            <input
              id="goal-color"
              type="color"
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
              className="color-picker"
            />
          </div>
          {error && <div className="stash-error">{error}</div>}
          <Button type="submit" variant="primary" size="md" isLoading={createGoal.isPending}>
            Save Goal
          </Button>
        </form>
      </Card>

      <div className="stash-goals">
        {isLoading ? (
          <Card>
            <p>Loading goals...</p>
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <p>No savings goals yet. Create one above.</p>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <motion.div
                key={goal._id}
                className="goal-card"
                style={{ borderLeftColor: goal.color || '#C9A961' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="goal-header">
                  <div>
                    <div className="goal-name">{goal.name}</div>
                    <div className="goal-target">{formatCurrency(goal.target, goal.currency)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteGoal.mutate(goal._id)}
                    isLoading={deleteGoal.isPending}
                  >
                    Delete
                  </Button>
                </div>
                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${progress}%`, background: goal.color || '#C9A961' }}
                    />
                  </div>
                  <div className="goal-progress-details">
                    <span>Saved {formatCurrency(goal.current, goal.currency)}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
                <div className="goal-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const amount = 100;
                        await updateGoal.mutateAsync({
                          id: goal._id,
                          data: { current: Number(goal.current) + amount },
                        });
                        await addTransaction.mutateAsync({
                          type: 'stash',
                          categoryId: 'savings',
                          amount,
                          currency: user?.currency || goal.currency || 'ZAR',
                          date: new Date().toISOString(),
                          description: `Contribution to ${goal.name}`,
                        });
                      } catch (err: any) {
                        setError(err.message || 'Failed to add contribution');
                      }
                    }}
                    isLoading={updateGoal.isPending || addTransaction.isPending}
                  >
                    + Add R100
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

