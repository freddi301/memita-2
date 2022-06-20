export type Api = {
  getBlocks(): Promise<Array<string>>;
  addBlock(block: string): Promise<void>;
  getProfiles(params: { searchText?: string }): Promise<Array<{ id: string }>>;
  addProfile(id: string): Promise<void>;
  deleteProfile(id: string): Promise<void>;
};
