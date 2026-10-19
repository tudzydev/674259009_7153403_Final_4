import { Sequelize } from "sequelize";
import { getDatabaseSettings } from "./database-setting";
import { describeDatabaseError } from "./database-errors";

const { provider, url, options } = getDatabaseSettings();
export const sequelize = new Sequelize(url, options);

export async function connectDB() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    throw new Error(describeDatabaseError(error, provider));
  }
  console.log(`Database connected (${provider})`);
}
