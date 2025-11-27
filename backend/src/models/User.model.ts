import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare name: CreationOptional<string | null>;
  declare picture: CreationOptional<string | null>;
  declare google_id: CreationOptional<string | null>;
  declare access_token: CreationOptional<string | null>;
  declare refresh_token: CreationOptional<string | null>;
  declare token_expiry: CreationOptional<Date | null>;
  declare last_sync: CreationOptional<Date | null>;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance methods
  isTokenExpired(): boolean {
    if (!this.token_expiry) return true;
    return new Date() >= new Date(this.token_expiry);
  }

  toSafeJSON(): Omit<User, 'access_token' | 'refresh_token'> {
    const values = this.toJSON();
    const { access_token, refresh_token, ...safeValues } = values as any;
    return safeValues;
  }
}

export const initUserModel = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      picture: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ['email'] }, { unique: true, fields: ['google_id'] }, { fields: ['is_active'] }],
    }
  );
};
