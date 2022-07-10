import { Sql } from "./components/sql";

export async function createTables(sql: Sql) {
  await sql`CREATE TABLE IF NOT EXISTS accounts (
    author TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    settings TEXT NOT NULL
  )`.run();

  await sql`CREATE TABLE IF NOT EXISTS contacts (
    crypto_hash TEXT PRIMARY KEY,
    account TEXT NOT NULL,
    author TEXT NOT NULL,
    nickname TEXT NOT NULL,
    label TEXT NOT NULL,
    version_timestamp INT NOT NUll,
    UNIQUE (account, author, nickname, label, version_timestamp)
  )`.run();

  await sql`CREATE TABLE IF NOT EXISTS channels (
    crypto_hash TEXT PRIMARY KEY,
    account TEXT NOT NULL,
    channel TEXT NOT NULL,
    nickname TEXT NOT NULL,
    label TEXT NOT NULL,
    version_timestamp INT NOT NUll,
    UNIQUE (account, channel, nickname, label, version_timestamp)
  )`.run();

  await sql`CREATE TABLE IF NOT EXISTS compositions (
    crypto_hash TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    quote TEXT NOT NULL,
    salt TEXT NOT NULL,
    content TEXT NOT NULL,
    version_timestamp INTEGER NOT NULL,
    UNIQUE (author, channel, recipient, quote, salt, content, version_timestamp)
  )`.run();
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
