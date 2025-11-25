import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTransactions, useAddTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { formatCurrency, formatDate } from '../utils/format';
import type { Transaction } from '../types';
import './ExpensesPage.css';

export const ExpensesPage: React.FC = () => {
  const { data, isLoading } = useTransactions();
  const transactions: Transaction[] = data ?? [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    categoryId: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();

  const expenses = transactions.filter((t: Transaction) => t.type === 'expense');
  const filteredTransactions =
    filter === 'all' ? transactions : transactions.filter((t: Transaction) => t.type === filter);

  const totalExpenses = expenses.reduce((acc: number, t: Transaction) => acc + t.amount, 0);

  return (
    <div className="expenses-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="expenses-header">
          <h1 className="expenses-title">Expenses</h1>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            Add Expense
          </Button>
        </div>

        <Card variant="gradient" gradient="expense" className="expenses-summary">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-amount number">
            {formatCurrency(totalExpenses, 'ZAR')}
          </div>
        </Card>

        <div className="expenses-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
            onClick={() => setFilter('expense')}
          >
            Expenses
          </button>
          <button
            className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
            onClick={() => setFilter('income')}
          >
            Income
          </button>
        </div>

        <Card className="expenses-list">
          {isLoading ? (
            <div className="expenses-loading">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="expenses-empty">No transactions found.</div>
          ) : (
            <div className="expenses-items">
              {filteredTransactions.map((transaction: Transaction) => (
                <motion.div
                  key={transaction._id}
                  className="expense-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="expense-item-info">
                    <div className="expense-item-type">{transaction.type}</div>
                    <div className="expense-item-desc">
                      {transaction.description || 'No description'}
                    </div>
                    <div className="expense-item-date">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className="expense-item-right">
                    <div
                      className={`expense-item-amount number ${
                        transaction.type === 'income' ? 'positive' : 'negative'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <button
                      type="button"
                      className="expense-delete"
                      onClick={() => deleteTransaction.mutate(transaction._id)}
                      disabled={deleteTransaction.isPending}
                      aria-label="Delete transaction"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Transaction"
        size="sm"
      >
        <form
          className="add-expense-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (!form.amount) {
              setError('Amount is required');
              return;
            }
            try {
              await addTransaction.mutateAsync({
                type: form.type as Transaction['type'],
                amount: Number(form.amount),
                categoryId: form.categoryId || 'uncategorized',
                currency: 'ZAR',
                date: new Date(form.date).toISOString(),
                description: form.description,
              });
              setForm({
                amount: '',
                type: 'expense',
                categoryId: '',
                description: '',
                date: new Date().toISOString().slice(0, 10),
              });
              setIsAddModalOpen(false);
            } catch (err: any) {
              setError(err.message || 'Failed to add transaction');
            }
          }}
        >
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
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <Input
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            placeholder="e.g. groceries"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
          {error && <div className="form-error">{error}</div>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={addTransaction.isPending}
            className="add-expense-submit"
          >
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
};

