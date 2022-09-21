import { createSqlTablesDataGateway, SqlDatabase } from "./components/TablesDataGateway";

export type TablesDataGatewayInstance = Awaited<ReturnType<typeof createTables>>;

export function createTables(sqlDatabase: SqlDatabase) {
  return createSqlTablesDataGateway({
    db: sqlDatabase,
    tables: {
      accounts: {
        columns: { author: "string", secret: "string", nickname: "string", settings: "string" },
        primaryKey: ["author"],
      },
      contacts: {
        columns: {
          crypto_hash: "string",
          account: "string",
          author: "string",
          nickname: "string",
          label: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      private_messages: {
        columns: {
          crypto_hash: "string",
          author: "string",
          recipient: "string",
          quote: "string",
          salt: "string",
          content: "string",
          attachments: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      public_messages: {
        columns: {
          crypto_hash: "string",
          author: "string",
          quote: "string",
          salt: "string",
          content: "string",
          attachments: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
    },
  });
}
