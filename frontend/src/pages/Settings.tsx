import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Palette, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { IUserPreference, IUserStats } from '../types';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<IUserPreference>({
    id: 0,
    user_id: 0,
    emails_per_page: 20,
    default_folder: 'INBOX',
    theme: 'system',
    notifications_enabled: true,
    auto_sync_interval: 5,
  });
  const [stats, setStats] = useState<IUserStats | null>(null);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [prefsRes, statsRes] = await Promise.all([userAPI.getPreferences(), userAPI.getStats()]);
        if (prefsRes.data.preferences) {
          setPreferences(prefsRes.data.preferences);
        }
        setStats(statsRes.data.stats);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await userAPI.updatePreferences(preferences);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
          </div>

          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt={user.name || 'User'} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {stats && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmails}</p>
                <p className="text-sm text-gray-500">Total Emails</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{stats.unreadEmails}</p>
                <p className="text-sm text-gray-500">Unread</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">{stats.starredEmails}</p>
                <p className="text-sm text-gray-500">Starred</p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Emails per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emails per page</label>
              <select
                value={preferences.emails_per_page}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    emails_per_page: parseInt(e.target.value, 10),
                  }))
                }
                className="input"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    theme: e.target.value as 'light' | 'dark' | 'system',
                  }))
                }
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Auto sync interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auto-sync interval (minutes)</label>
              <select
                value={preferences.auto_sync_interval}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    auto_sync_interval: parseInt(e.target.value, 10),
                  }))
                }
                className="input"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="mt-6 btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Notifications Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications_enabled}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  notifications_enabled: e.target.checked,
                }))
              }
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Enable email notifications</span>
          </label>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-red-200 dark:border-red-900">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="font-medium text-red-600 mb-3">Are you sure? This will permanently delete your account.</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} className="btn-danger">
                  Yes, Delete My Account
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
