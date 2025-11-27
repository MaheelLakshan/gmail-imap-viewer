import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Inbox, Star, Send, File, Trash2, Settings, LogOut, Menu, X, Mail, ChevronDown, User } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { to: '/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/starred', icon: Star, label: 'Starred' },
    { to: '/sent', icon: Send, label: 'Sent' },
    { to: '/drafts', icon: File, label: 'Drafts' },
    { to: '/trash', icon: Trash2, label: 'Trash' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary-600" />
            <span className="font-semibold">Gmail Viewer</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Mail className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Gmail Viewer</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
              `}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {user?.picture ? (
                <img src={user.picture} alt={user.name || 'User'} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
