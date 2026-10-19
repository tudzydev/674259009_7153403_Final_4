import { expect, test } from "bun:test";

// Opt in against real PostgreSQL; all test records live in a disposable schema.
test.skipIf(process.env.RUN_DB_TESTS !== "1")("seed persists once, handles concurrent starts, and preserves CRUD changes", async () => {
  const { sequelize } = await import("../src/config/database");
  const { Event } = await import("../src/models/eventModel");
  const { SeedRun } = await import("../src/models/seedRunModel");
  const { seedEvents } = await import("../src/seeds/seedEvents");
  const { initialEvents } = await import("../src/seeds/events");
  const schema = `seed_test_${crypto.randomUUID().replaceAll("-", "")}`;
  const models = { events: Event.schema(schema), runs: SeedRun.schema(schema) };
  try {
    await sequelize.createSchema(schema, {});
    await models.events.sync();
    await models.runs.sync();
    const existing = await models.events.create({ ...initialEvents[0]!, title: "กิจกรรมที่มีอยู่ก่อน Seed" });

    const results = await Promise.all([seedEvents(models), seedEvents(models)]);
    expect(results.sort((a, b) => a - b)).toEqual([0, 12]);
    expect(await models.events.count()).toBe(13);
    expect(await models.runs.count()).toBe(1);
    expect(await models.events.findByPk(existing.id)).not.toBeNull();

    const event = await models.events.findOne({ where: { title: initialEvents[0]!.title } });
    expect(event).not.toBeNull();
    await event!.update({ title: "กิจกรรมที่แก้ไขแล้ว", status: false });
    await models.events.destroy({ where: { title: initialEvents[1]!.title } });

    expect(await seedEvents(models)).toBe(0);
    expect(await models.events.count()).toBe(12);
    await event!.reload();
    expect(event!.title).toBe("กิจกรรมที่แก้ไขแล้ว");
    expect(event!.status).toBe(false);
    expect(await models.events.count({ where: { title: initialEvents[1]!.title } })).toBe(0);
  } finally {
    await models.events.drop();
    await models.runs.drop();
    await sequelize.dropSchema(schema, {});
    await sequelize.close();
  }
});
