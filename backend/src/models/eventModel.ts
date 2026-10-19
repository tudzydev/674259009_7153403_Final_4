import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database";

export class Event extends Model<
  InferAttributes<Event>,
  InferCreationAttributes<Event>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare organizer: string;
  declare category: string;
  declare eventDate: string;
  declare description: string;
  declare status: CreationOptional<boolean>;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 150] },
    },
    organizer: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [["อบรม", "สัมมนา", "จิตอาสา"]] },
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      set(value: string) {
        // Check the input before DATEONLY normalizes alternative date formats.
        if (
          value != null &&
          (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        ) {
          throw new Error(
            "eventDate must be a valid date in YYYY-MM-DD format",
          );
        }
        this.setDataValue("eventDate", value);
      },
      validate: {
        isValidDate(value: unknown) {
          if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new Error(
              "eventDate must be a valid date in YYYY-MM-DD format",
            );
          }
          const date = new Date(`${value}T00:00:00.000Z`);
          if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== value
          ) {
            throw new Error(
              "eventDate must be a valid date in YYYY-MM-DD format",
            );
          }
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true, len: [1, 2000] },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    timestamps: true,
  },
);
