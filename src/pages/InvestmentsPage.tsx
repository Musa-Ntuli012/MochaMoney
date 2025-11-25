import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency } from '../utils/format';
import {
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
} from '../hooks/useInvestments';
import type { Investment } from '../types';
import './InvestmentsPage.css';

const platforms: Investment['platform'][] = ['EasyEquities', 'EasyProperties', 'Other'];
const types: Investment['type'][] = ['equity', 'property', 'other'];

export const InvestmentsPage: React.FC = () => {
  const { data, isLoading } = useInvestments();
  const investments = data ?? [];
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();
  const updateInvestment = useUpdateInvestment();
  const [form, setForm] = useState({
    name: '',
    platform: 'EasyEquities' as Investment['platform'],
    type: 'equity' as Investment['type'],
    invested: '',
    currentValue: '',
    units: '',
  });
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    return investments.reduce(
      (acc, inv) => {
        acc.invested += inv.invested;
        acc.current += inv.currentValue;
        return acc;
      },
      { invested: 0, current: 0 }
    );
  }, [investments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.invested || !form.currentValue) {
      setError('Name, invested amount, and current value are required');
      return;
    }
    try {
      await createInvestment.mutateAsync({
        name: form.name,
        platform: form.platform,
        type: form.type,
        invested: Number(form.invested),
        currentValue: Number(form.currentValue),
        units: Number(form.units) || undefined,
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      });
      setForm({
        name: '',
        platform: 'EasyEquities',
        type: 'equity',
        invested: '',
        currentValue: '',
        units: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create investment');
    }
  };

  return (
    <div className="investments-page">
      <div className="investments-header">
        <h1 className="page-title">Investments</h1>
        <div className="investment-summary">
          <div>
            <span className="summary-label">Invested</span>
            <div className="summary-value">{formatCurrency(totals.invested, 'ZAR')}</div>
          </div>
          <div>
            <span className="summary-label">Current</span>
            <div className="summary-value">{formatCurrency(totals.current, 'ZAR')}</div>
          </div>
          <div>
            <span className="summary-label">Gain/Loss</span>
            <div className={`summary-value ${totals.current - totals.invested >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totals.current - totals.invested, 'ZAR')}
            </div>
          </div>
        </div>
      </div>

      <Card className="investments-card">
        <h2 className="investments-card-title">Add Investment</h2>
        <form className="investment-form" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <div className="form-row">
            <label className="input-label" htmlFor="platform-select">
              Platform
            </label>
            <select
              id="platform-select"
              className="select"
              value={form.platform}
              onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value as Investment['platform'] }))}
            >
              {platforms.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="input-label" htmlFor="type-select">
              Type
            </label>
            <select
              id="type-select"
              className="select"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as Investment['type'] }))}
            >
              {types.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Invested"
            type="number"
            value={form.invested}
            onChange={(e) => setForm((prev) => ({ ...prev, invested: e.target.value }))}
            min="0"
            step="0.01"
            required
          />
          <Input
            label="Current Value"
            type="number"
            value={form.currentValue}
            onChange={(e) => setForm((prev) => ({ ...prev, currentValue: e.target.value }))}
            min="0"
            step="0.01"
            required
          />
          <Input
            label="Units"
            type="number"
            value={form.units}
            onChange={(e) => setForm((prev) => ({ ...prev, units: e.target.value }))}
            min="0"
            step="0.0001"
          />
          {error && <div className="investment-error">{error}</div>}
          <Button type="submit" variant="primary" size="md" isLoading={createInvestment.isPending}>
            Save Investment
          </Button>
        </form>
      </Card>

      <div className="investments-list">
        {isLoading ? (
          <Card>
            <p>Loading investments...</p>
          </Card>
        ) : investments.length === 0 ? (
          <Card>
            <p>No investments tracked yet.</p>
          </Card>
        ) : (
          investments.map((investment) => {
            const gain = investment.currentValue - investment.invested;
            return (
              <motion.div
                key={investment._id}
                className="investment-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="investment-info">
                  <div className="investment-name">{investment.name}</div>
                  <div className="investment-meta">
                    <span>{investment.platform}</span>
                    <span>•</span>
                    <span>{investment.type}</span>
                  </div>
                </div>
                <div className="investment-values">
                  <div>
                    <span className="value-label">Invested</span>
                    <div className="value">{formatCurrency(investment.invested, investment.currency)}</div>
                  </div>
                  <div>
                    <span className="value-label">Current</span>
                    <div className="value">{formatCurrency(investment.currentValue, investment.currency)}</div>
                  </div>
                  <div>
                    <span className="value-label">Gain</span>
                    <div className={`value ${gain >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(gain, investment.currency)}</div>
                  </div>
                </div>
                <div className="investment-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      updateInvestment.mutate({
                        id: investment._id,
                        data: { currentValue: investment.currentValue + 100 },
                      })
                    }
                    isLoading={updateInvestment.isPending}
                  >
                    Update +R100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteInvestment.mutate(investment._id)}
                    isLoading={deleteInvestment.isPending}
                  >
                    Delete
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

