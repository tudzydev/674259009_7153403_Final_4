import { app } from "./app";
import { connectDB, sequelize } from "./config/database";
import { seedEvents } from "./seeds/seedEvents";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

await connectDB();
await sequelize.sync();
const seeded = await seedEvents();
console.log(`Initial events seeded: ${seeded}`);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
