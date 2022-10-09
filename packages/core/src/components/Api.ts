export type Brand<T, B extends symbol> = T & { __brand: B };

/** 32 byte buffer as lowercase hex string */
export type AccountId = Brand<string, typeof AccountIdBrandSymbol>;
const AccountIdBrandSymbol = Symbol("AccountId");
function isValidAccountId(string: string): string is AccountId {
  return /^[0-9A-Fa-f]{64}$/.test(string);
}
export const AccountId = {
  toReadbleString(accountId: AccountId): string {
    return accountId;
  },
  fromReadableString(string: string): AccountId {
    if (!isValidAccountId(string)) throw new Error(`Invalid AccountId ${string}`);
    return string;
  },
  toExchangeString(accountId: AccountId): string {
    return accountId;
  },
  fromExchangeString(string: string): AccountId {
    if (!isValidAccountId(string)) throw new Error(`Invalid AccountId ${string}`);
    return string;
  },
};

/** 32 byte buffer as lowercase hex string */
export type AccountSecret = Brand<string, typeof AccountSecretBrandSymbol>;
const AccountSecretBrandSymbol = Symbol("AccountSecret");
function isValidAccountSecret(string: string): string is AccountSecret {
  return /^[0-9A-Fa-f]{64}$/.test(string);
}
export const AccountSecret = {
  toReadbleString(accountId: AccountSecret): string {
    return accountId;
  },
  fromReadableString(string: string): AccountSecret {
    if (!isValidAccountSecret(string)) throw new Error(`Invalid AccountSecret ${string}`);
    return string;
  },
  toExchangeString(accountId: AccountSecret): string {
    return accountId;
  },
  fromExchangeString(string: string): AccountSecret {
    if (!isValidAccountSecret(string)) throw new Error(`Invalid AccountSecret ${string}`);
    return string;
  },
};

/** 32 byte buffer as lowercase hex string */
export type CryptoHash = Brand<string, typeof CryptoHashBrandSymbol>;
const CryptoHashBrandSymbol = Symbol("CryptoHash");
function isValidCryptoHash(string: string): string is CryptoHash {
  return /^[0-9A-Fa-f]{64}$/.test(string);
}
export const CryptoHash = {
  toReadableString(accountId: CryptoHash): string {
    return accountId;
  },
  fromReadableString(string: string): CryptoHash {
    if (!isValidCryptoHash(string)) throw new Error(`Invalid CryptoHash ${string}`);
    return string;
  },
  toExchangeString(accountId: CryptoHash): string {
    return accountId;
  },
  fromExchangeString(string: string): CryptoHash {
    if (!isValidCryptoHash(string)) throw new Error(`Invalid CryptoHash ${string}`);
    return string;
  },
};

export type SynchronizationCommands = {
  updateContact(params: ContactKey & ContactState): Promise<void>;
  deleteContact(params: ContactKey & { version_timestamp: number }): Promise<void>;
  updatePrivateMessage(params: PrivateMessageKey & PrivateMessageState): Promise<void>;
  deletePrivateMessage(params: PrivateMessageKey & { version_timestamp: number }): Promise<void>;
  updatePublicMessage(params: PublicMessageKey & PublicMessageState): Promise<void>;
  deletePublicMessage(params: PublicMessageKey & { version_timestamp: number }): Promise<void>;
};

export type SynchronizationCommand = {
  [K in keyof SynchronizationCommands]: { type: K } & SynchronizationCommands[K];
}[keyof SynchronizationCommands];

export type UiQueries = {
  getAccount(params: AccountKey): Promise<AccountState | undefined>;
  getAccounts(params: {}): Promise<Array<AccountKey & AccountState>>;
  getContact(params: ContactKey): Promise<ContactState | undefined>;
  getContacts(params: { account: AccountId }): Promise<Array<ContactKey & ContactState>>;
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
  getPublicMessages(params: { account: AccountId; author: AccountId }): Promise<Array<PublicMessageKey & PublicMessageState>>;
  getPublicMessagesFeed(params: { account: AccountId }): Promise<Array<PublicMessageKey & PublicMessageState>>;
  getAttachment(path: string): Promise<{ size: number; hash: CryptoHash }>;
  getAttachmentUri(hash: CryptoHash): Promise<string>;
};

export type NetworkUiQueries = {
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

export type UiCommands = {
  createAccount(params: AccountState): Promise<AccountKey>;
  updateAccount(params: AccountKey & AccountState): Promise<void>;
  deleteAccount(params: AccountKey): Promise<void>;
};

type ContactKey = {
  account: AccountId;
  contact: AccountId;
};

type ContactState = {
  nickname: string;
  version_timestamp: number;
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

type PublicMessageKey = {
  author: AccountId;
  creation_timestamp: number;
};

type PublicMessageState = {
  content: string;
  attachments: Array<Attachment>;
  version_timestamp: number;
};

type AccountKey = { account: AccountId };

type AccountState = { nickname: string; settings: AccountSettings };

export type AccountSettings = {
  language: string;
  theme: "dark" | "light";
  animations: "enabled" | "disabled";
  connectivity: ConnectivitySettings;
};

export type ConnectivitySettings = {
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

export type Attachment = {
  name: string;
  size: number;
  hash: CryptoHash;
};

export type UiApi = SynchronizationCommands & UiCommands & UiQueries & NetworkUiQueries;
