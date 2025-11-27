import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, Op } from 'sequelize';

export class Email extends Model<InferAttributes<Email>, InferCreationAttributes<Email>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare message_id: string;
  declare uid: CreationOptional<number | null>;
  declare thread_id: CreationOptional<string | null>;
  declare subject: CreationOptional<string | null>;
  declare sender_email: CreationOptional<string | null>;
  declare sender_name: CreationOptional<string | null>;
  declare recipient_email: CreationOptional<string | null>;
  declare snippet: CreationOptional<string | null>;
  declare body_text: CreationOptional<string | null>;
  declare body_html: CreationOptional<string | null>;
  declare received_at: CreationOptional<Date | null>;
  declare is_read: CreationOptional<boolean>;
  declare is_starred: CreationOptional<boolean>;
  declare labels: CreationOptional<string[]>;
  declare has_attachments: CreationOptional<boolean>;
  declare folder: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Static methods
  static async findByUserId(userId: number, options: { page?: number; limit?: number; folder?: string } = {}): Promise<{ rows: Email[]; count: number }> {
    const { page = 1, limit = 20, folder = 'INBOX' } = options;
    const offset = (page - 1) * limit;

    return this.findAndCountAll({
      where: { user_id: userId, folder },
      order: [['received_at', 'DESC']],
      limit,
      offset,
    });
  }

  static async searchEmails(userId: number, query: string, options: { page?: number; limit?: number } = {}): Promise<{ rows: Email[]; count: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    return this.findAndCountAll({
      where: {
        user_id: userId,
        [Op.or]: [{ subject: { [Op.like]: searchPattern } }, { snippet: { [Op.like]: searchPattern } }, { sender_email: { [Op.like]: searchPattern } }, { sender_name: { [Op.like]: searchPattern } }],
      },
      order: [['received_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export const initEmailModel = (sequelize: Sequelize): void => {
  Email.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      message_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      uid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      thread_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sender_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sender_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      recipient_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      snippet: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      body_text: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      body_html: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      received_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_starred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      labels: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      has_attachments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      folder: {
        type: DataTypes.STRING(100),
        defaultValue: 'INBOX',
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
      tableName: 'emails',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['user_id'] }, { fields: ['message_id'] }, { fields: ['received_at'] }, { fields: ['sender_email'] }, { fields: ['is_read'] }, { fields: ['folder'] }],
    }
  );
};
