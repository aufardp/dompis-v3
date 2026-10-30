import { afterAll, beforeAll, expect, test } from "bun:test";
import { createPool, type Pool, type RowDataPacket } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { localServices } from "./services";

let pool: Pool;

beforeAll(async () => {
  const services = await localServices();
  pool = createPool(services.mysql);
  await pool.execute("SET SESSION time_zone = '+07:00'");
});

afterAll(async () => {
  if (pool) await pool.end();
});

test("mysql2 and Drizzle connect to the approved local database with a query hint", async () => {
  const db = drizzle(pool);
  const [rows, fields] = await db.execute(
    sql`SELECT /*+ MAX_EXECUTION_TIME(1000) */ DATABASE() AS db, ${1} AS value`,
  );
  expect(fields[1]?.columnType).toBe(8);
  expect<unknown>(rows).toEqual([{ db: "dompis_db", value: "1" }]);
  const [warnings] = await pool.query("SHOW WARNINGS");
  expect(warnings).toEqual([]);
});

test("Drizzle commits and rolls back read-only transactions", async () => {
  const db = drizzle(pool);
  const value = await db.transaction(
    async (tx) => {
      const [rows] = await tx.execute(sql`SELECT ${7} AS value`);
      expect<unknown>(rows).toEqual([{ value: "7" }]);
      return "committed";
    },
    { accessMode: "read only", isolationLevel: "repeatable read" },
  );
  expect(value).toBe("committed");
  await expect(
    db.transaction(
      async (tx) => {
        await tx.execute(sql`SELECT ${8} AS value`);
        throw new Error("synthetic rollback");
      },
      { accessMode: "read only", isolationLevel: "repeatable read" },
    ),
  ).rejects.toThrow("synthetic rollback");
  expect<unknown>((await pool.query("SELECT 9 AS value"))[0]).toEqual([
    { value: "9" },
  ]);
});

test("mysql2 preserves synthetic BigInt, Decimal, date/time and JSON projections", async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT
    CAST('18446744073709551615' AS UNSIGNED) AS big,
    CAST('12345678901234567890.12345678' AS DECIMAL(28,8)) AS money,
    CAST('2026-10-30 00:01:00' AS DATETIME) AS moment,
    CAST('2026-10-30' AS DATE) AS day,
    JSON_OBJECT('count', 1, 'missing', NULL) AS payload,
    @@session.time_zone AS zone`);
  expect<unknown>(rows[0]).toEqual({
    big: "18446744073709551615",
    money: "12345678901234567890.12345678",
    moment: "2026-10-30 00:01:00",
    day: "2026-10-30",
    payload: { count: 1, missing: null },
    zone: "+07:00",
  });
});

test("generated column metadata is readable without reading customer rows", async () => {
  const [columns] = await pool.execute<RowDataPacket[]>(
    `SELECT TABLE_NAME, COLUMN_NAME, EXTRA
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND GENERATION_EXPRESSION <> ''`,
    ["dompis_db"],
  );
  expect(columns.length).toBeGreaterThan(0);
  const db = drizzle(pool);
  for (const column of columns) {
    const [rows] = await db.execute(
      sql`SELECT ${sql.identifier(column.COLUMN_NAME)} FROM ${sql.identifier(column.TABLE_NAME)} LIMIT 0`,
    );
    expect<unknown>(rows).toEqual([]);
    expect(column.EXTRA).toContain("GENERATED");
  }
});
