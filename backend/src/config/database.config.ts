import { Options } from 'sequelize';
import { config } from './env.config';

interface IDBConfig {
  development: Options;
  production: Options;
  test: Options;
}

const baseConfig: Options = {
  dialect: 'mysql',
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

export const dbConfig: IDBConfig = {
  development: {
    ...baseConfig,
    logging: console.log,
  },
  production: {
    ...baseConfig,
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    ...baseConfig,
    logging: false,
  },
};

export const getCurrentDBConfig = (): Options => {
  const env = config.nodeEnv as keyof IDBConfig;
  return dbConfig[env] || dbConfig.development;
};

export default dbConfig;
