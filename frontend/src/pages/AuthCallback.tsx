
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

type AuthStatus = 'processing' | 'success' | 'error';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<AuthStatus>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      const token = searchParams.get('token');
      const errorMsg = searchParams.get('error');

      if (errorMsg) {
        setStatus('error');
        setError(decodeURIComponent(errorMsg));
        return;
      }

      if (!token) {
        setStatus('error');
        setError('No authentication token received');
        return;
      }

      try {
        const success = await login(token);
        if (success) {
          setStatus('success');
          setTimeout(() => navigate('/inbox'), 1500);
        } else {
          throw new Error('Failed to authenticate');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <LoadingSpinner size="lg" className="mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Completing Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we set up your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to your inbox...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'An error occurred during authentication'}</p>
            <button onClick={() => navigate('/login')} className="btn-primary">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
