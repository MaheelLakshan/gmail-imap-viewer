import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class UserPreference extends Model<InferAttributes<UserPreference>, InferCreationAttributes<UserPreference>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare emails_per_page: CreationOptional<number>;
  declare default_folder: CreationOptional<string>;
  declare theme: CreationOptional<'light' | 'dark' | 'system'>;
  declare notifications_enabled: CreationOptional<boolean>;
  declare auto_sync_interval: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

export const initUserPreferenceModel = (sequelize: Sequelize): void => {
  UserPreference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      emails_per_page: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
        validate: {
          min: 10,
          max: 100,
        },
      },
      default_folder: {
        type: DataTypes.STRING(100),
        defaultValue: 'INBOX',
      },
      theme: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        defaultValue: 'system',
      },
      notifications_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      auto_sync_interval: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'user_preferences',
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ['user_id'] }],
    }
  );
};
