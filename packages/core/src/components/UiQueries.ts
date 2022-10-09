import fs from "fs";
import path from "path";
import { AccountId, CryptoHash, UiQueries } from "./Api";
import { TablesDataGatewayInstance } from "./Tables";
import { cryptoHashStream } from "./crypto";
import { createPrivateConversationKey } from "./SynchronizationCommands";

export function createUiQueries({ tables, filesPath }: { filesPath: string; tables: TablesDataGatewayInstance }): UiQueries {
  return {
    async getAccount({ account }) {
      const result = await tables.table("accounts").get({ account: AccountId.toExchangeString(account) });
      if (!result) return;
      const { nickname, settings } = result;
      return { account, nickname, settings: JSON.parse(settings) };
    },
    async getAccounts({}) {
      const result = await tables.table("accounts").query({ order: [["nickname", "ascending"]] });
      return result.map(({ account, nickname, settings }) => ({
        account: AccountId.fromExchangeString(account),
        nickname,
        settings: JSON.parse(settings),
      }));
    },
    async getContact(params) {
      const account = AccountId.toExchangeString(params.account);
      const contact = AccountId.toExchangeString(params.contact);
      const result = await tables.table("contact").get({ account, contact });
      if (!result) return;
      return {
        nickname: result.nickname,
        version_timestamp: result.version_timestamp,
      };
    },
    async getContacts(params) {
      const account = AccountId.toExchangeString(params.account);
      const contacts = await tables.table("contact").query({ filter: { account }, order: [["nickname", "ascending"]] });
      return contacts.map((params) => {
        const account = AccountId.fromExchangeString(params.account);
        const contact = AccountId.fromExchangeString(params.contact);
        const nickname = params.nickname;
        const version_timestamp = params.version_timestamp;
        return {
          account,
          contact,
          nickname,
          version_timestamp,
        };
      });
    },
    async getPrivateConversation(params) {
      const conversation_key = createPrivateConversationKey(params.account, params.other);
      const privateMessages = await tables
        .table("private_message")
        .query({ filter: { conversation_key }, order: [["creation_timestamp", "ascending"]] });
      // TODO do with join
      return Promise.all(
        privateMessages.map(async (params) => {
          const lastUpdate = await tables.table("private_message_update").get({ crypto_hash: params.crypto_hash });
          if (!lastUpdate) throw new Error();
          const author = AccountId.fromExchangeString(lastUpdate.author);
          const recipient = AccountId.fromExchangeString(lastUpdate.recipient);
          const creation_timestamp = lastUpdate.creation_timestamp;
          const content = lastUpdate.content;
          const attachments = JSON.parse(lastUpdate.attachments);
          const version_timestamp = lastUpdate.version_timestamp;
          return {
            author,
            recipient,
            creation_timestamp,
            content,
            attachments,
            version_timestamp,
          };
        })
      );
    },
    async getPrivateConversations(params) {
      const account = AccountId.toExchangeString(params.account);
      const conversations = await tables
        .table("private_conversation")
        .query({ filter: { account }, order: [["last_message_version_timestamp", "descending"]] });
      // TODO with join
      return Promise.all(
        conversations.map(async (params) => {
          const other = AccountId.fromExchangeString(params.other);
          const contact = await tables.table("contact").get({ account, contact: params.other });
          if (!contact) throw new Error();
          const lastMessage = await tables.table("private_message_update").get({ crypto_hash: params.last_message_crypto_hash });
          if (!lastMessage) throw new Error();
          return {
            contact: {
              account: other,
              nickname: contact.nickname,
            },
            lastMessage: {
              author: AccountId.fromExchangeString(lastMessage.author),
              content: lastMessage.content,
              version_timestamp: lastMessage.version_timestamp,
            },
          };
        })
      );
    },
    async getPublicMessages(params) {
      // TODO filter by contacts
      const author = AccountId.toExchangeString(params.author);
      const publicMessages = await tables
        .table("public_message")
        .query({ filter: { author }, order: [["creation_timestamp", "descending"]] });
      // TODO do with join
      return Promise.all(
        publicMessages.map(async (params) => {
          const lastUpdate = await tables.table("public_message_update").get({ crypto_hash: params.crypto_hash });
          if (!lastUpdate) throw new Error();
          const author = AccountId.fromExchangeString(lastUpdate.author);
          const creation_timestamp = lastUpdate.creation_timestamp;
          const content = lastUpdate.content;
          const attachments = JSON.parse(lastUpdate.attachments);
          const version_timestamp = lastUpdate.version_timestamp;
          return {
            author,
            creation_timestamp,
            content,
            attachments,
            version_timestamp,
          };
        })
      );
    },
    async getPublicMessagesFeed(params) {
      // TODO filter by contacts
      const publicMessages = await tables.table("public_message").query({ order: [["creation_timestamp", "descending"]] });
      // TODO do with join
      return Promise.all(
        publicMessages.map(async (params) => {
          const lastUpdate = await tables.table("public_message_update").get({ crypto_hash: params.crypto_hash });
          if (!lastUpdate) throw new Error();
          const author = AccountId.fromExchangeString(lastUpdate.author);
          const creation_timestamp = lastUpdate.creation_timestamp;
          const content = lastUpdate.content;
          const attachments = JSON.parse(lastUpdate.attachments);
          const version_timestamp = lastUpdate.version_timestamp;
          return {
            author,
            creation_timestamp,
            content,
            attachments,
            version_timestamp,
          };
        })
      );
    },
    async getAttachment(filePath: string) {
      const { size } = await fs.promises.stat(filePath);
      const fileStream = fs.createReadStream(filePath);
      const hash = await cryptoHashStream(fileStream);
      await fs.promises.mkdir(filesPath, { recursive: true });
      await fs.promises.copyFile(filePath, path.join(filesPath, CryptoHash.toReadableString(hash)));
      return { hash, size };
    },
    async getAttachmentUri(hash: CryptoHash) {
      return path.join(filesPath, CryptoHash.toReadableString(hash));
    },
  };
}
