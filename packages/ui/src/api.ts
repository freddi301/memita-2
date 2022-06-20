export type Api = {
  getBlocks(): Promise<Array<string>>;
  addBlock(block: string): Promise<void>;
  getProfiles(params: { searchText?: string }): Promise<Array<{ id: string }>>;
  addProfile(id: string): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  getCompositions(parasm: {
    author?: string;
    channel?: string | null;
    recipient?: string | null;
    thread?: string | null;
    searchText?: string;
  }): Promise<Array<Composition & { versions: number }>>;
  addComposition(params: Composition): Promise<void>;
};

export type Composition = {
  author: string;
  channel: string | null;
  recipient: string | null;
  thread: string | null;
  salt: string;
  timestamp: number;
  text: string | null;
};
