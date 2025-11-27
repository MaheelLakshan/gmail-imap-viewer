import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Dashboard from './pages/Dashboard';
import StarredPage from './pages/StarredPage';
import SentPage from './pages/SentPage';
import DraftsPage from './pages/DraftsPage';
import TrashPage from './pages/TrashPage';
import EmailView from './pages/EmailView';
import Settings from './pages/Settings';

import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/inbox" replace />} />
        <Route path="inbox" element={<Dashboard />} />
        <Route path="starred" element={<StarredPage />} />
        <Route path="sent" element={<SentPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="email/:id" element={<EmailView />} />
        <Route path="settings" element={<Settings />} />
        <Route path="folder/:folderName" element={<Dashboard />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
