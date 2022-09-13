import { Sql } from "./components/sql";

export async function createTables(sql: Sql) {
  const tables = {
    accounts: sql`CREATE TABLE accounts (
      author TEXT PRIMARY KEY,
      secret TEXT NOT NULL,
      nickname TEXT NOT NULL,
      settings TEXT NOT NULL
    )`,
    contacts: sql`CREATE TABLE contacts (
      crypto_hash TEXT PRIMARY KEY,
      account TEXT NOT NULL,
      author TEXT NOT NULL,
      nickname TEXT NOT NULL,
      label TEXT NOT NULL,
      version_timestamp INT NOT NUll
    )`,
    direct_messages: sql`CREATE TABLE direct_messages (
      crypto_hash TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      recipient TEXT NOT NULL,
      quote TEXT NOT NULL,
      salt TEXT NOT NULL,
      content TEXT NOT NULL,
      attachments TEXT NOT NULL,
      version_timestamp INTEGER NOT NULL
    )`,
    public_messages: sql`CREATE TABLE public_messages (
      crypto_hash TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      quote TEXT NOT NULL,
      salt TEXT NOT NULL,
      content TEXT NOT NULL,
      attachments TEXT NOT NULL,
      version_timestamp INTEGER NOT NULL
    )`,
  };

  const existingTables = Object.fromEntries(
    (await sql`select * from sqlite_master`.all())
      .filter(({ type, name }: any) => type === "table" && name in tables)
      .map(({ name, sql }: any) => [name, sql])
  );

  for (const [table, sql] of Object.entries(tables)) {
    if (!(table in existingTables)) {
      await sql.run();
    } else {
      if (uniformSpaces(sql.text()) !== uniformSpaces(existingTables[table])) {
        throw new Error("database migration not supported");
      }
    }
  }
}

function uniformSpaces(sqlText: string) {
  return sqlText.replace(/\s+/g, " ");
}

export async function optimizeDb(sql: Sql) {
  // https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
  // https://blog.devart.com/increasing-sqlite-performance.html
  await sql`PRAGMA journal_mode = WAL`.run();
  await sql`PRAGMA synchronous = normal`.run();
  await sql`PRAGMA temp_store = memory`.run();
  await sql`PRAGMA mmap_size = 30000000000`.run();
  await sql`PRAGMA optimize`.run();
  await sql`PRAGMA locking_mode = exclusive`.run();
}
