
import { Sequelize } from 'sequelize';
import { getCurrentDBConfig } from '../config/database.config';
import { initUserModel, User } from './User.model';
import { initEmailModel, Email } from './Email.model';
import { initUserPreferenceModel, UserPreference } from './UserPreference.model';

const dbConfig = getCurrentDBConfig();

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password, dbConfig);

// Initialize models
initUserModel(sequelize);
initEmailModel(sequelize);
initUserPreferenceModel(sequelize);

// Define associations
User.hasMany(Email, { foreignKey: 'user_id', as: 'emails' });
Email.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { sequelize, User, Email, UserPreference };
