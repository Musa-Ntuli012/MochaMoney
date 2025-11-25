import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useBudgets, useCreateBudget, useDeleteBudget } from '../hooks/useBudgets';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/format';
import type { Budget } from '../types';
import './BudgetsPage.css';

const periods: Budget['period'][] = ['weekly', 'monthly', 'yearly'];

export const BudgetsPage: React.FC = () => {
  const { data, isLoading } = useBudgets();
  const budgets = data ?? [];
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    categoryId: '',
    limit: '',
    period: 'monthly' as Budget['period'],
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId || !form.limit) {
      setError('Category and limit are required');
      return;
    }
    try {
      await createBudget.mutateAsync({
        categoryId: form.categoryId,
        limit: Number(form.limit),
        currency: user?.currency || 'ZAR',
        period: form.period,
        startDate: new Date().toISOString(),
      });
      setForm({ categoryId: '', limit: '', period: 'monthly' });
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    }
  };

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <h1 className="page-title">Budgets</h1>
        <span className="budgets-count">{budgets.length} active</span>
      </div>
      <Card className="budgets-card">
        <h2 className="budgets-card-title">Add Budget</h2>
        <form className="budget-form" onSubmit={handleSubmit}>
          <Input
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            placeholder="e.g. groceries"
            required
          />
          <Input
            label="Limit"
            type="number"
            value={form.limit}
            onChange={(e) => setForm((prev) => ({ ...prev, limit: e.target.value }))}
            required
            min="0"
            step="0.01"
          />
          <div className="form-row">
            <label className="input-label" htmlFor="period-select">
              Period
            </label>
            <select
              id="period-select"
              className="select"
              value={form.period}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, period: e.target.value as Budget['period'] }))
              }
            >
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="budget-error">{error}</div>}
          <Button type="submit" variant="primary" size="md" isLoading={createBudget.isPending}>
            Save Budget
          </Button>
        </form>
      </Card>

      <div className="budgets-list">
        {isLoading ? (
          <Card>
            <p>Loading budgets...</p>
          </Card>
        ) : budgets.length === 0 ? (
          <Card>
            <p>No budgets yet. Create your first one above.</p>
          </Card>
        ) : (
          budgets.map((budget) => (
            <motion.div
              key={budget._id}
              className="budget-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <div className="budget-category">{budget.categoryId}</div>
                <div className="budget-period">
                  {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                </div>
              </div>
              <div className="budget-meta">
                <div className="budget-limit number">{formatCurrency(budget.limit ?? 0, budget.currency)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteBudget.mutate(budget._id)}
                  isLoading={deleteBudget.isPending}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

