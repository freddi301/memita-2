import { createSqlTablesDataGateway, SqlDatabase } from "./TablesDataGateway";

export type TablesDataGatewayInstance = Awaited<ReturnType<typeof createTables>>;

export function createTables(sqlDatabase: SqlDatabase) {
  return createSqlTablesDataGateway({
    db: sqlDatabase,
    tables: {
      accounts: {
        columns: { account: "string", secret: "string", nickname: "string", settings: "string" },
        primaryKey: ["account"],
      },
      contact: {
        columns: {
          account: "string",
          contact: "string",
          nickname: "string",
          version_timestamp: "number",
        },
        primaryKey: ["account", "contact"],
      },
      contact_update: {
        columns: {
          crypto_hash: "string",
          account: "string",
          contact: "string",
          nickname: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      contact_delete: {
        columns: {
          crypto_hash: "string",
          account: "string",
          contact: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      private_message: {
        columns: {
          conversation_key: "string",
          author: "string",
          recipient: "string",
          creation_timestamp: "number",
          version_timestamp: "number",
          crypto_hash: "string",
        },
        primaryKey: ["author", "recipient", "creation_timestamp"],
      },
      private_message_update: {
        columns: {
          crypto_hash: "string",
          author: "string",
          recipient: "string",
          creation_timestamp: "number",
          content: "string",
          attachments: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      private_message_delete: {
        columns: {
          crypto_hash: "string",
          author: "string",
          recipient: "string",
          creation_timestamp: "number",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      private_conversation: {
        columns: {
          account: "string",
          other: "string",
          last_message_version_timestamp: "number",
          last_message_crypto_hash: "string",
        },
        primaryKey: ["account", "other"],
      },
      public_message: {
        columns: {
          author: "string",
          creation_timestamp: "number",
          version_timestamp: "number",
          crypto_hash: "string",
        },
        primaryKey: ["author", "creation_timestamp"],
      },
      public_message_update: {
        columns: {
          crypto_hash: "string",
          author: "string",
          creation_timestamp: "number",
          content: "string",
          attachments: "string",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
      public_message_delete: {
        columns: {
          crypto_hash: "string",
          author: "string",
          creation_timestamp: "number",
          version_timestamp: "number",
        },
        primaryKey: ["crypto_hash"],
      },
    },
  });
}
