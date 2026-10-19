import { connectDB, sequelize } from "../src/config/database";
import { seedEvents } from "../src/seeds/seedEvents";

try {
  await connectDB();
  await sequelize.sync();
  console.log(`Initial events seeded: ${await seedEvents()}`);
} finally {
  await sequelize.close();
}
