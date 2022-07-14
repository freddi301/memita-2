import { Language } from "./components/I18n";

export type Account = {
  author: string;
  secret: string;
  nickname: string;
  settings: Settings;
};

export type Settings = {
  language: Language;
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
  };
};

export type Contact = {
  account: string;
  author: string;
  nickname: string;
  label: string;
  version_timestamp: number;
};

export type DirectMessage = {
  author: string;
  recipient: string;
  quote: string;
  salt: string;
  content: string;
  version_timestamp: number;
};

export type PublicMessage = {
  author: string;
  quote: string;
  salt: string;
  content: string;
  version_timestamp: number;
};

export type Api = {
  generateAccount(): Promise<{ author: string; secret: string }>;
  addAccount(account: Account): Promise<void>;
  getAccount(params: { author: string }): Promise<Account | undefined>;
  getAccounts(params: {}): Promise<Array<Account>>;
  getDatabase(): Promise<Record<string, Array<unknown>>>;
  addContact(contact: Contact): Promise<void>;
  getContact(params: {
    account: string;
    author: string;
  }): Promise<Contact | undefined>;
  getContacts(params: {
    account: string;
    nickname?: string;
    label?: string;
  }): Promise<Array<Contact>>;
  addDirectMessage(message: DirectMessage): Promise<void>;
  getConversation(params: {
    account: string;
    other: string;
  }): Promise<Array<DirectMessage>>;
  getConversations(params: { account: string }): Promise<
    Array<{
      author: string;
      recipient: string;
      nickname: string;
      content: string;
      version_timestamp: number;
    }>
  >;
  getConnections(account: string): Promise<
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
      }
    | undefined
  >;
  stop(): Promise<void>;
};
