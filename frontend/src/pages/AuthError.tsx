import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const AuthError: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || 'An authentication error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Error</h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{decodeURIComponent(message)}</p>

          <div className="space-y-3">
            <button onClick={() => navigate('/login')} className="w-full btn-primary">
              Try Again
            </button>

            <button onClick={() => navigate('/')} className="w-full btn-secondary flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">If this problem persists, please contact support</p>
      </div>
    </div>
  );
};

export default AuthError;
