export type Api = {
  getBlocks(): Promise<Array<string>>;
  addBlock(block: string): Promise<void>;
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
