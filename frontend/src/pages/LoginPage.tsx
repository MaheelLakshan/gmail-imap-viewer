import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const LoginPage: React.FC = () => {
  const { getGoogleAuthUrl } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initialize login. Please try again.');
      setLoading(false);
    }
  };

  const features: Feature[] = [
    { icon: Shield, title: 'Secure OAuth2', description: 'Your credentials never touch our servers.' },
    { icon: Zap, title: 'Fast IMAP Sync', description: 'Quick and efficient email synchronization.' },
    { icon: Lock, title: 'Privacy First', description: 'Your emails stay private and secure.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center">
      <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary-600 text-white shadow-lg mb-6 mx-auto">
          <Mail className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">Gmail IMAP Viewer</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Securely access and manage your Gmail emails with a modern, privacy-focused interface.</p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6 pb-12">
        <div className="flex flex-col justify-center space-y-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mt-1">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-4">Get Started</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Sign in with your Google account to access your emails</p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 
                         bg-white border-2 border-gray-200 rounded-xl
                         hover:bg-gray-50 hover:border-gray-300 
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{loading ? 'Redirecting...' : 'Continue with Google'}</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">By signing in, you agree to allow this app to access your Gmail account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
