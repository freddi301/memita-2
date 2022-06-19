export type Api = {
  getBlocks(): Promise<Array<string>>;
  addBlock(block: string): Promise<void>;
  getProfiles(): Promise<Array<{ id: string }>>;
  addProfile(id: string): Promise<void>;
};
