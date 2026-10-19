import { sequelize } from "../config/database";
import { Event } from "../models/eventModel";
import { SeedRun } from "../models/seedRunModel";
import { initialEvents } from "./events";

const seedKey = "initial-events-v1";

export async function seedEvents(models = { events: Event, runs: SeedRun }): Promise<number> {
  return sequelize.transaction(async (transaction) => {
    // Serialize startup seeds, including multiple server processes.
    await sequelize.query("SELECT pg_advisory_xact_lock(674259009, 1)", { transaction });
    if (await models.runs.findByPk(seedKey, { transaction })) return 0;

    await models.events.bulkCreate(initialEvents, { transaction, validate: true });
    // The marker and events commit together; failures can safely retry.
    await models.runs.create({ key: seedKey }, { transaction });
    return initialEvents.length;
  });
}
