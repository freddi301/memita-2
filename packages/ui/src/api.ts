export type Account = {
  author: string;
  nickname: string;
  version_timestamp: number;
};

export type Contact = {
  account: string;
  author: string;
  nickname: string;
  label: string;
  version_timestamp: number;
};

export type Channel = {
  account: string;
  channel: string;
  nickname: string;
  label: string;
  version_timestamp: number;
};

export type Composition = {
  author: string;
  channel: string;
  recipient: string;
  quote: string;
  salt: string;
  content: string;
  version_timestamp: number;
};

export type Api = {
  getDatabase(): Promise<Array<unknown>>;
  addAccount(account: Account): Promise<void>;
  getAccount(params: { author: string }): Promise<Account | undefined>;
  getAccounts(params: { nickname?: string }): Promise<Array<Account>>;
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
  addChannel(contact: Channel): Promise<void>;
  getChannel(params: {
    account: string;
    channel: string;
  }): Promise<Channel | undefined>;
  getChannels(params: {
    account: string;
    nickname?: string;
    label?: string;
  }): Promise<Array<Channel>>;
  addComposition(composition: Composition): Promise<void>;
  getComposition(params: {
    account: string;
    author: string;
    channel: string;
    recipient: string;
    quote: string;
    salt: string;
  }): Promise<Composition | undefined>;
  getCompositions(params: {
    account: string;
    author?: string;
    channel?: string;
    recipient?: string;
    quote?: string;
    content?: string;
  }): Promise<Array<Composition>>;
  getConversation(params: {
    account: string;
    channel?: string;
    other?: string;
    quote?: string;
    content?: string;
  }): Promise<Array<Composition>>;
  getConversations(params: {
    account: string;
    channel?: string;
    content?: string;
  }): Promise<
    Array<{
      author: string;
      channel: string;
      recipient: string;
      content: string;
      version_timestamp: number;
    }>
  >;
};
