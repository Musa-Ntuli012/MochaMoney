import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { logout, user, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(user?.currency || 'ZAR');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setCurrency(user?.currency || 'ZAR');
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setIsSaving(true);
    try {
      await updateProfile({ displayName, currency });
      setStatus('Profile updated successfully.');
    } catch (error: any) {
      setStatus(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <Card className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-item">
          <div className="settings-item-label">Email</div>
          <div className="settings-item-value">{user?.email}</div>
        </div>
        <form className="settings-form" onSubmit={handleSave}>
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Sipho M"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            helperText="Use ISO currency code (e.g. ZAR)"
          />
          {status && <div className="settings-status">{status}</div>}
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} className="settings-save">
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="settings-section">
        <h2 className="settings-section-title">Data</h2>
        <div className="settings-actions">
          <Button variant="outline" size="md">
            Export Data
          </Button>
          <Button variant="outline" size="md">
            Import Data
          </Button>
        </div>
      </Card>

      <Card className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <Button variant="secondary" size="md" onClick={handleLogout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
};

