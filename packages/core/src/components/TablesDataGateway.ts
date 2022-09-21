export type SqlDatabase = {
  run(query: string, values: Array<string | number>): Promise<void>;
  all(query: string, values: Array<string | number>): Promise<Array<Record<string, string | number>>>;
  close(): Promise<void>;
};

export type TablesDataGateway<
  Tables extends {
    [T in keyof Tables]: {
      columns: Record<string, "string" | "number">;
      primaryKey: Array<keyof Tables[T]["columns"]>;
    };
  }
> = {
  table<T extends keyof Tables>(
    tableName: T
  ): {
    set(row: TypeOfRow<Tables[T]["columns"]>): Promise<void>;
    has(key: Pick<TypeOfRow<Tables[T]["columns"]>, Tables[T]["primaryKey"][number]>): Promise<boolean>;
    get(key: Pick<TypeOfRow<Tables[T]["columns"]>, Tables[T]["primaryKey"][number]>): Promise<TypeOfRow<Tables[T]["columns"]> | undefined>;
    all(): Promise<Array<TypeOfRow<Tables[T]["columns"]>>>;
    del(key: Pick<TypeOfRow<Tables[T]["columns"]>, Tables[T]["primaryKey"][number]>): Promise<void>;
    query(params: {
      where?: Partial<TypeOfRow<Tables[T]["columns"]>>;
      order?: Array<[keyof TypeOfRow<Tables[T]["columns"]>, "ascending" | "descending"]>;
    }): Promise<Array<TypeOfRow<Tables[T]["columns"]>>>;
  };
  close(): Promise<void>;
};

type TypeOfRow<R extends Record<string, "string" | "number">> = { [K in keyof R]: { string: string; number: number }[R[K]] };

export async function createSqlTablesDataGateway<
  Tables extends {
    [T in keyof Tables]: {
      columns: Record<string, "string" | "number">;
      primaryKey: Array<keyof Tables[T]["columns"]>;
    };
  }
>({ db, tables }: { db: SqlDatabase; tables: Tables }): Promise<TablesDataGateway<Tables>> {
  async function optimizeDb() {
    // https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
    // https://blog.devart.com/increasing-sqlite-performance.html
    await db.run(`PRAGMA journal_mode = WAL`, []);
    await db.run(`PRAGMA synchronous = normal`, []);
    await db.run(`PRAGMA temp_store = memory`, []);
    await db.run(`PRAGMA mmap_size = 30000000000`, []);
    await db.run(`PRAGMA optimize`, []);
    await db.run(`PRAGMA locking_mode = exclusive`, []);
  }
  await optimizeDb();
  function createTableDefinition(tableName: keyof Tables) {
    const columns = Object.entries(tables[tableName].columns)
      .map(([columnName, columnType]) => {
        const type = { string: "TEXT", number: "INTEGER" }[columnType];
        return `${columnName} ${type} NOT NULL`;
      })
      .join(", ");
    return `CREATE TABLE ${tableName as string} (${columns}, PRIMARY KEY (${tables[tableName].primaryKey.join(", ")}))`;
  }
  async function checkSchema() {
    function uniformSpaces(sqlText: string) {
      return sqlText.replace(/\s+/g, " ");
    }
    const existingTables = Object.fromEntries(
      (await db.all("select * from sqlite_master", []))
        .filter(({ type, name }: any) => type === "table" && name in tables)
        .map(({ name, sql }: any) => [name, sql])
    );
    for (const tableName of Object.keys(tables)) {
      const tableDefinition = createTableDefinition(tableName as keyof Tables);
      if (!(tableName in existingTables)) {
        await db.run(tableDefinition, []);
      } else {
        if (uniformSpaces(tableDefinition) !== uniformSpaces(existingTables[tableName])) {
          throw new Error("database migration not supported");
        }
      }
    }
  }
  await checkSchema();
  return {
    table(tableName) {
      if (tables[tableName].primaryKey.length === 0) throw new Error(`table ${tableName as string} must have a primary key`);
      const columnNames = Object.keys(tables[tableName].columns);
      return {
        async set(row) {
          const columns = columnNames.join(", ");
          const values = columnNames.map(() => "?").join(", ");
          const query = `INSERT OR REPLACE INTO ${tableName as string} (${columns}) VALUES (${values})`;
          await db.run(
            query,
            columnNames.map((columnName) => row[columnName])
          );
        },
        async has(key) {
          const columns = tables[tableName].primaryKey.join(", ");
          const clauses = tables[tableName].primaryKey.map((columnName) => `${columnName as string} = ?`).join(" AND ");
          const query = `SELECT ${columns} FROM ${tableName as string} WHERE ${clauses}`;
          const result = await db.all(
            query,
            tables[tableName].primaryKey.map((columnName) => key[columnName])
          );
          return result.length > 0;
        },
        async get(key) {
          const columns = columnNames.join(", ");
          const clauses = tables[tableName].primaryKey.map((columnName) => `${columnName as string} = ?`).join(" AND ");
          const query = `SELECT ${columns} FROM ${tableName as string} WHERE ${clauses}`;
          const result = await db.all(
            query,
            tables[tableName].primaryKey.map((columnName) => key[columnName])
          );
          return result[0] as any;
        },
        async all() {
          const columns = columnNames.join(", ");
          const query = `SELECT ${columns} FROM ${tableName as string}`;
          const result = await db.all(query, []);
          return result as any;
        },
        async del(key) {
          const clauses = tables[tableName].primaryKey.map((columnName) => `${columnName as string} = ?`).join(" AND ");
          const query = `DELETE FROM ${tableName as string} WHERE ${clauses}`;
          await db.run(
            query,
            tables[tableName].primaryKey.map((columnName) => key[columnName])
          );
        },
        async query({ order, where }) {
          const columns = columnNames.join(", ");
          const clauses =
            where &&
            Object.keys(where)
              .map((columnName) => `${columnName as string} = ?`)
              .join(" AND ");
          const orderingToSql = {
            ascending: "ASC",
            descending: "DESC",
          };
          const ordering = order && order.map(([columnName, verse]) => `${columnName as string} ${orderingToSql[verse]}`);
          const query = `
            SELECT ${columns}
            FROM ${tableName as string}
            ${clauses ? `WHERE ${clauses}` : ""}
            ${ordering ? `ORDER BY ${ordering}` : ""}
          `;
          const result = await db.all(query, where ? Object.values(where) : []);
          return result as any;
        },
      };
    },
    async close() {
      await db.close();
    },
  };
}
