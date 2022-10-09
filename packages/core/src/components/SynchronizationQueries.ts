import { AccountId, CryptoHash, SynchronizationCommands } from "./Api";
import { TablesDataGatewayInstance } from "./Tables";

export function createListHashes({ tables }: { tables: TablesDataGatewayInstance }): {
  [K in keyof SynchronizationCommands]: (requirer: AccountId, provider: AccountId) => Promise<Array<CryptoHash>>;
} {
  return {
    async updateContact(requirer, provider) {
      if (requirer !== provider) return [];
      const udpates = await tables.table("contact_update").query({ filter: { account: requirer } });
      return udpates.map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
    async deleteContact(requirer, provider) {
      if (requirer !== provider) return [];
      const deletes = await tables.table("contact_delete").query({ filter: { account: requirer } });
      return deletes.map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
    async updatePrivateMessage(requirer, provider) {
      const sentUdpates = await tables.table("private_message_update").query({ filter: { author: provider, recipient: requirer } });
      const receivedUdpates = await tables.table("private_message_update").query({ filter: { author: requirer, recipient: provider } });
      return [...sentUdpates, ...receivedUdpates].map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
    async deletePrivateMessage(requirer, provider) {
      const sentDeletes = await tables.table("private_message_delete").query({ filter: { author: provider, recipient: requirer } });
      const receivedDeletes = await tables.table("private_message_delete").query({ filter: { author: requirer, recipient: provider } });
      return [...sentDeletes, ...receivedDeletes].map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
    async updatePublicMessage(requirer, provider) {
      const updates = await tables.table("public_message_update").query({ filter: { author: provider } });
      return updates.map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
    async deletePublicMessage(requirer, provider) {
      const deletes = await tables.table("public_message_delete").query({ filter: { author: provider } });
      return deletes.map((update) => CryptoHash.fromExchangeString(update.crypto_hash));
    },
  };
}

export function createHashHash({ tables }: { tables: TablesDataGatewayInstance }): {
  [K in keyof SynchronizationCommands]: (hash: CryptoHash) => Promise<boolean>;
} {
  return {
    async updateContact(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("contact_update").has({ crypto_hash });
    },
    async deleteContact(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("contact_delete").has({ crypto_hash });
    },
    async updatePrivateMessage(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("private_message_update").has({ crypto_hash });
    },
    async deletePrivateMessage(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("private_message_delete").has({ crypto_hash });
    },
    async updatePublicMessage(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("public_message_update").has({ crypto_hash });
    },
    async deletePublicMessage(hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      return await tables.table("public_message_delete").has({ crypto_hash });
    },
  };
}

export function createGetData({ tables }: { tables: TablesDataGatewayInstance }): {
  [K in keyof SynchronizationCommands]: (
    requirer: AccountId,
    provider: AccountId,
    hash: CryptoHash
  ) => Promise<Parameters<SynchronizationCommands[K]>[0] | undefined>;
} {
  return {
    async updateContact(requirer, provider, hash) {
      if (requirer !== provider) return;
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const update = await tables.table("contact_update").get({ crypto_hash });
      if (!update) return;
      const account = AccountId.fromExchangeString(update.account);
      const contact = AccountId.fromExchangeString(update.contact);
      const nickname = update.nickname;
      const version_timestamp = update.version_timestamp;
      return {
        account,
        contact,
        nickname,
        version_timestamp,
      };
    },
    async deleteContact(requirer, provider, hash) {
      if (requirer !== provider) return;
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const delete_ = await tables.table("contact_delete").get({ crypto_hash });
      if (!delete_) return;
      const account = AccountId.fromExchangeString(delete_.account);
      const contact = AccountId.fromExchangeString(delete_.contact);
      const version_timestamp = delete_.version_timestamp;
      return {
        account,
        contact,
        version_timestamp,
      };
    },
    async updatePrivateMessage(requirer, provider, hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const update = await tables.table("private_message_update").get({ crypto_hash });
      if (!update) return;
      if (!((update.author === requirer && update.recipient === provider) || (update.author === provider && update.recipient === requirer)))
        return;
      const author = AccountId.fromExchangeString(update.author);
      const recipient = AccountId.fromExchangeString(update.recipient);
      const creation_timestamp = update.creation_timestamp;
      const content = update.content;
      const attachments = JSON.parse(update.attachments);
      const version_timestamp = update.version_timestamp;
      return {
        author,
        recipient,
        creation_timestamp,
        content,
        attachments,
        version_timestamp,
      };
    },
    async deletePrivateMessage(requirer, provider, hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const delete_ = await tables.table("private_message_delete").get({ crypto_hash });
      if (!delete_) return;
      if (
        !(
          (delete_.author === requirer && delete_.recipient === provider) ||
          (delete_.author === provider && delete_.recipient === requirer)
        )
      )
        return;
      const author = AccountId.fromExchangeString(delete_.author);
      const recipient = AccountId.fromExchangeString(delete_.recipient);
      const creation_timestamp = delete_.creation_timestamp;
      const version_timestamp = delete_.version_timestamp;
      return {
        author,
        recipient,
        creation_timestamp,
        version_timestamp,
      };
    },
    async updatePublicMessage(requirer, provider, hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const update = await tables.table("public_message_update").get({ crypto_hash });
      if (!update) return;
      if (update.author !== provider) return;
      const author = AccountId.fromExchangeString(update.author);
      const creation_timestamp = update.creation_timestamp;
      const content = update.content;
      const attachments = JSON.parse(update.attachments);
      const version_timestamp = update.version_timestamp;
      return {
        author,
        creation_timestamp,
        content,
        attachments,
        version_timestamp,
      };
    },
    async deletePublicMessage(requirer, provider, hash) {
      const crypto_hash = CryptoHash.toExchangeString(hash);
      const delete_ = await tables.table("public_message_delete").get({ crypto_hash });
      if (!delete_) return;
      if (delete_.author !== provider) return;
      const author = AccountId.fromExchangeString(delete_.author);
      const creation_timestamp = delete_.creation_timestamp;
      const version_timestamp = delete_.version_timestamp;
      return {
        author,
        creation_timestamp,
        version_timestamp,
      };
    },
  };
}
