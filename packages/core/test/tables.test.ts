import { createSqlDatabase } from "./utils/sqlite/sql";
import { createTables } from "../src/tables";

test("create tables on empty database", async () => {
  const sql = createSqlDatabase();
  await createTables(sql);
});

test("does not create tables if they exists", async () => {
  const sql = createSqlDatabase();
  await createTables(sql);
  await createTables(sql);
});

test("errors on wrong schema", async () => {
  const sql = createSqlDatabase();
  await sql.run(`CREATE TABLE accounts (id INT PRIMARY KEY)`, []);
  await expect(createTables(sql)).rejects.toThrowError("database migration not supported");
});
