export type Api = {
  getDatabase(): Promise<Array<unknown>>;
  addAuthor(params: Author): Promise<void>;
  getAuthors(params: {
    nickname?: string;
    label?: string;
  }): Promise<Array<Author>>;
  addComposition(params: Composition): Promise<void>;
  getCompositions(params: {
    author?: string;
    channel?: string;
    recipient?: string;
    quote?: string;
    content?: string;
  }): Promise<Array<Composition & { versions: number }>>;
  getConversation(params: {
    author?: string;
    channel?: string;
    recipient?: string;
    quote?: string;
    content?: string;
  }): Promise<Array<Composition & { versions: number }>>;
  getConversations(params: { author: string; content?: string }): Promise<
    Array<{
      author: string;
      recipient: string;
      content: string;
      version_timestamp: number;
    }>
  >;
};

export type Author = {
  author: string;
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
