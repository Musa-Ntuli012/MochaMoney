import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency, formatDate } from '../utils/format';
import { useRecurringRules, useCreateRecurringRule, useUpdateRecurringRule, useDeleteRecurringRule } from '../hooks/useRecurring';
import type { RecurringRule } from '../types';
import './RecurringPage.css';

const frequencies: RecurringRule['frequency'][] = ['daily', 'weekly', 'monthly', 'yearly'];

export const RecurringPage: React.FC = () => {
  const { data, isLoading } = useRecurringRules();
  const rules = data ?? [];
  const createRule = useCreateRecurringRule();
  const updateRule = useUpdateRecurringRule();
  const deleteRule = useDeleteRecurringRule();
  const [form, setForm] = useState({
    name: '',
    type: 'expense' as RecurringRule['type'],
    categoryId: '',
    amount: '',
    frequency: 'monthly' as RecurringRule['frequency'],
    nextRun: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.amount) {
      setError('Name and amount are required');
      return;
    }
    await createRule.mutateAsync({
      name: form.name,
      type: form.type,
      categoryId: form.categoryId || 'uncategorized',
      amount: Number(form.amount),
      currency: 'ZAR',
      frequency: form.frequency,
      nextRun: new Date(form.nextRun).toISOString(),
      active: true,
    });
    setForm({
      name: '',
      type: 'expense',
      categoryId: '',
      amount: '',
      frequency: 'monthly',
      nextRun: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="recurring-page">
      <h1 className="page-title">Recurring Expenses</h1>

      <Card className="recurring-card">
        <h2 className="recurring-card-title">Add Recurring Rule</h2>
        <form className="recurring-form" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            placeholder="e.g. rent"
          />
          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            required
            min="0"
            step="0.01"
          />
          <div className="form-row">
            <label className="input-label" htmlFor="type-select">
              Type
            </label>
            <select
              id="type-select"
              className="select"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as RecurringRule['type'] }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-row">
            <label className="input-label" htmlFor="frequency-select">
              Frequency
            </label>
            <select
              id="frequency-select"
              className="select"
              value={form.frequency}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, frequency: e.target.value as RecurringRule['frequency'] }))
              }
            >
              {frequencies.map((freq) => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Next Run"
            type="date"
            value={form.nextRun}
            onChange={(e) => setForm((prev) => ({ ...prev, nextRun: e.target.value }))}
          />
          {error && <div className="recurring-error">{error}</div>}
          <Button type="submit" variant="primary" size="md" isLoading={createRule.isPending}>
            Save Rule
          </Button>
        </form>
      </Card>

      <div className="recurring-list">
        {isLoading ? (
          <Card>
            <p>Loading recurring rules...</p>
          </Card>
        ) : rules.length === 0 ? (
          <Card>
            <p>No recurring rules yet.</p>
          </Card>
        ) : (
          rules.map((rule) => (
            <motion.div key={rule._id} className="recurring-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <div className="recurring-name">{rule.name}</div>
                <div className="recurring-meta">
                  {rule.type} • {rule.frequency} • Next run {formatDate(rule.nextRun)}
                </div>
              </div>
              <div className="recurring-actions">
                <div className="recurring-amount">{formatCurrency(rule.amount, rule.currency)}</div>
                <Button
                  variant={rule.active ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateRule.mutate({
                      id: rule._id,
                      data: { active: !rule.active },
                    })
                  }
                  isLoading={updateRule.isPending}
                >
                  {rule.active ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteRule.mutate(rule._id)}
                  isLoading={deleteRule.isPending}
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

