import { AccountId, CryptoHash, SynchronizationCommands } from "./Api";
import { synchronizationCommandsCryptoHash } from "./SynchronizationCommandsCryptoHash";
import { TablesDataGatewayInstance } from "./Tables";

export function createSynchronizationCommands({ tables }: { tables: TablesDataGatewayInstance }): SynchronizationCommands {
  return {
    async updateContact(params) {
      const account = AccountId.toExchangeString(params.account);
      const contact = AccountId.toExchangeString(params.contact);
      const nickname = params.nickname;
      const version_timestamp = params.version_timestamp;
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.updateContact(params));
      await tables.table("contact_update").set({
        crypto_hash,
        account,
        contact,
        nickname,
        version_timestamp,
      });
      const current = await tables.table("contact").get({ account, contact });
      if (!current || version_timestamp > current.version_timestamp) {
        await tables.table("contact").set({
          account,
          contact,
          nickname,
          version_timestamp,
        });
      }
    },
    async deleteContact(params) {
      const account = AccountId.toExchangeString(params.account);
      const contact = AccountId.toExchangeString(params.contact);
      const version_timestamp = params.version_timestamp;
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.deleteContact(params));
      await tables.table("contact_delete").set({
        crypto_hash,
        account,
        contact,
        version_timestamp,
      });
      const current = await tables.table("contact").get({ account, contact });
      if (!current || version_timestamp > current.version_timestamp) {
        await tables.table("contact").del({
          account,
          contact,
        });
      }
    },
    async updatePrivateMessage(params) {
      const author = AccountId.toExchangeString(params.author);
      const recipient = AccountId.toExchangeString(params.recipient);
      const creation_timestamp = params.creation_timestamp;
      const content = params.content;
      const attachments = JSON.stringify(params.attachments);
      const version_timestamp = params.version_timestamp;
      const conversation_key = createPrivateConversationKey(params.author, params.recipient);
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.updatePrivateMessage(params));
      await tables.table("private_message_update").set({
        crypto_hash,
        author,
        recipient,
        creation_timestamp,
        content,
        attachments,
        version_timestamp,
      });
      const currentPrivateMessage = await tables.table("private_message").get({ author, recipient, creation_timestamp });
      if (!currentPrivateMessage || version_timestamp > currentPrivateMessage.version_timestamp) {
        await tables.table("private_message").set({
          conversation_key,
          author,
          recipient,
          creation_timestamp,
          version_timestamp,
          crypto_hash,
        });
      }
      const updatePrivateConversation = async (account: string, other: string) => {
        const currentPrivateConversation = await tables.table("private_conversation").get({ account, other });
        if (!currentPrivateConversation || version_timestamp > currentPrivateConversation.last_message_version_timestamp) {
          await tables.table("private_conversation").set({
            account,
            other,
            last_message_crypto_hash: crypto_hash,
            last_message_version_timestamp: version_timestamp,
          });
        }
      };
      await updatePrivateConversation(author, recipient);
      await updatePrivateConversation(recipient, author);
    },
    async deletePrivateMessage(params) {
      const author = AccountId.toExchangeString(params.author);
      const recipient = AccountId.toExchangeString(params.recipient);
      const creation_timestamp = params.creation_timestamp;
      const version_timestamp = params.version_timestamp;
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.deletePrivateMessage(params));
      await tables.table("private_message_delete").set({
        crypto_hash,
        author,
        recipient,
        creation_timestamp,
        version_timestamp,
      });
      const current = await tables.table("private_message").get({ author, recipient, creation_timestamp });
      if (!current || version_timestamp > current.version_timestamp) {
        await tables.table("private_message").del({
          author,
          recipient,
          creation_timestamp,
        });
      }
    },
    async updatePublicMessage(params) {
      const author = AccountId.toExchangeString(params.author);
      const creation_timestamp = params.creation_timestamp;
      const content = params.content;
      const attachments = JSON.stringify(params.attachments);
      const version_timestamp = params.version_timestamp;
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.updatePublicMessage(params));
      await tables.table("public_message_update").set({
        crypto_hash,
        author,
        creation_timestamp,
        content,
        attachments,
        version_timestamp,
      });
      const currentPublicMessage = await tables.table("public_message").get({ author, creation_timestamp });
      if (!currentPublicMessage || version_timestamp > currentPublicMessage.version_timestamp) {
        await tables.table("public_message").set({
          author,
          creation_timestamp,
          version_timestamp,
          crypto_hash,
        });
      }
    },
    async deletePublicMessage(params) {
      const author = AccountId.toExchangeString(params.author);
      const creation_timestamp = params.creation_timestamp;
      const version_timestamp = params.version_timestamp;
      const crypto_hash = CryptoHash.toExchangeString(await synchronizationCommandsCryptoHash.deletePublicMessage(params));
      await tables.table("public_message_delete").set({
        crypto_hash,
        author,
        creation_timestamp,
        version_timestamp,
      });
      const current = await tables.table("public_message").get({ author, creation_timestamp });
      if (!current || version_timestamp > current.version_timestamp) {
        await tables.table("public_message").del({
          author,
          creation_timestamp,
        });
      }
    },
  };
}

export function createPrivateConversationKey(a: AccountId, b: AccountId) {
  const [first, second] = [AccountId.toExchangeString(a), AccountId.toExchangeString(b)].sort();
  return `${first}${second}`;
}
