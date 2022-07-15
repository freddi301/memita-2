import { createSql } from "./utils/sqlite/sqlite3";
import { createTables } from "../src/tables";

test("create tables on empty database", async () => {
  const sql = createSql();
  await createTables(sql);
});

test("does not create tables if they exists", async () => {
  const sql = createSql();
  await createTables(sql);
  await createTables(sql);
});

test("errors on wrong schema", async () => {
  const sql = createSql();
  await sql`CREATE TABLE accounts (id INT PRIMARY KEY)`.run();
  await expect(createTables(sql)).rejects.toThrowError(
    "database migration not supported"
  );
});
