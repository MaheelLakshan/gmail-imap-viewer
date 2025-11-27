import dotenv from 'dotenv';

dotenv.config();

interface IEnvConfig {
  nodeEnv: string;
  port: number;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  frontendUrl: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

const getEnvVarAsNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: IEnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVarAsNumber('PORT', 5000),
  db: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvVarAsNumber('DB_PORT', 3306),
    name: getEnvVar('DB_NAME', 'gmail_viewer'),
    user: getEnvVar('DB_USER', 'root'),
    password: getEnvVar('DB_PASSWORD', 'rootpassword123'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'default-secret-change-in-production'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID', ''),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', ''),
    redirectUri: getEnvVar('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/auth/google/callback'),
  },
  // Updated to Vite default port 5173
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  rateLimit: {
    windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
    maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';

export default config;
