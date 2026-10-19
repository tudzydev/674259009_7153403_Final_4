import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database";

export class SeedRun extends Model<InferAttributes<SeedRun>, InferCreationAttributes<SeedRun>> {
  declare key: string;
}

SeedRun.init(
  { key: { type: DataTypes.STRING(100), primaryKey: true, allowNull: false } },
  { sequelize, tableName: "seed_runs", timestamps: false },
);
