export type Api = {
  getBlocks(): Promise<Array<string>>;
  addBlock(block: string): Promise<void>;
};
