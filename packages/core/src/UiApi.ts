export class AccountId {
  constructor(private buffer: Buffer) {}
  static toReadableString(accountId: AccountId) {
    return accountId.buffer.toString("hex");
  }
  static fromReadableString(string: string) {
    return new AccountId(Buffer.from(string, "hex"));
  }
}

export class CryptoHash {
  constructor(private buffer: Buffer) {}
}

export type UiApi = AccountUiApi &
  ContactUiApi &
  PrivateMessageUiApi &
  PublicMessageUiApi &
  AttachmentsUiApi &
  NetworkUiApi & { stop(): Promise<void> };

type AccountKey = { account: AccountId };

type AccountState = { nickname: string; settings: Settings };

type AccountUiApi = {
  createAccount(params: AccountState): Promise<AccountKey>;
  getAccount(params: AccountKey): Promise<AccountState | undefined>;
  getAccounts(params: {}): Promise<Array<AccountKey & AccountState>>;
  updateAccount(params: AccountKey & AccountState): Promise<void>;
  deleteAccount(params: AccountKey): Promise<void>;
};

export type Settings = {
  language: string;
  theme: "dark" | "light";
  animations: "enabled" | "disabled";
  connectivity: {
    hyperswarm: { enabled: boolean };
    bridge: {
      server: { enabled: boolean };
      clients: Array<{
        port: number;
        host: string;
        enabled: boolean;
      }>;
    };
    lan: { enabled: boolean };
  };
};

type ContactKey = {
  account: AccountId;
  contact: AccountId;
};

type ContactState = {
  nickname: string;
  version_timestamp: number;
};

type ContactUiApi = {
  getContact(params: ContactKey): Promise<ContactState | undefined>;
  getContacts(params: { account: AccountId }): Promise<Array<ContactKey & ContactState>>;
  updateContact(params: ContactKey & ContactState): Promise<void>;
  deleteContact(params: ContactKey & { version_timestamp: number }): Promise<void>;
};

export type Attachment = {
  name: string;
  size: number;
  hash: CryptoHash;
};

type PrivateMessageKey = {
  author: AccountId;
  recipient: AccountId;
  creation_timestamp: number;
};

type PrivateMessageState = {
  content: string;
  attachments: Array<Attachment>;
  version_timestamp: number;
};

type PrivateMessageUiApi = {
  createPrivateMessage(params: PrivateMessageKey & Omit<PrivateMessageState, "version_timestamp">): Promise<void>;
  getPrivateConversation(params: { account: AccountId; other: AccountId }): Promise<Array<PrivateMessageKey & PrivateMessageState>>;
  getPrivateConversations(params: { account: AccountId }): Promise<
    Array<{
      contact: {
        account: AccountId;
        nickname: string;
      };
      lastMessage: {
        author: AccountId;
        content: string;
        version_timestamp: number;
      };
    }>
  >;
  updatePrivateMessage(params: PrivateMessageKey & PrivateMessageState): Promise<void>;
  deletePrivateMessage(params: ContactKey & { version_timestamp: number }): Promise<void>;
};

type PublicMessageKey = {
  author: AccountId;
  creation_timestamp: number;
};

type PublicMessageState = {
  content: string;
  attachments: Array<Attachment>;
  version_timestamp: number;
};

type PublicMessageUiApi = {
  createPublicMessage(params: PublicMessageKey & Omit<PublicMessageState, "version_timestamp">): Promise<void>;
  getPublicMessages(params: { account: AccountId; author: AccountId }): Promise<Array<PublicMessageKey & PublicMessageState>>;
  getPublicMessagesFeed(params: { account: AccountId }): Promise<Array<PublicMessageKey & PublicMessageState>>;
  updatePublicMessage(params: PublicMessageKey & PublicMessageState): Promise<void>;
  deletePublicMessage(params: ContactKey & { version_timestamp: number }): Promise<void>;
};

type AttachmentsUiApi = {
  getAttachment(path: string): Promise<{ size: number; hash: CryptoHash }>;
  getAttachmentUri(hash: CryptoHash): Promise<string>;
};

type NetworkUiApi = {
  getConnectionsState(account: AccountId): Promise<
    | {
        hyperswarm: {
          connections: number;
        };
        bridge: {
          server?: {
            port: number;
            adresses: Array<string>;
            connections: number;
          };
          clients: Array<{
            online: boolean;
            connections: number;
          }>;
        };
        lan: {
          connections: number;
        };
      }
    | undefined
  >;
};
