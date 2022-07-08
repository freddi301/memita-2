export type CryptoHashableDataSyncRPC<Hash, Data> = {
  list(): Promise<Array<Hash>>;
  get(hash: Hash): Promise<Data>;
};

export type CryptoHashableDataRepository<Hash, Data> = {
  getHashes(): Promise<Array<Hash>>;
  hasHash(hash: Hash): Promise<boolean>;
  getData(hash: Hash): Promise<Data>;
  addData(data: Data): Promise<void>;
  hashFunction(data: Data): Promise<Hash>;
};

export function createCryptoHashableDataSyncRpcServer<Hash, Data>({
  getHashes,
  getData,
}: CryptoHashableDataRepository<Hash, Data>): CryptoHashableDataSyncRPC<
  Hash,
  Data
> {
  return {
    async list() {
      return await getHashes();
    },
    async get(hash) {
      return await getData(hash);
    },
  };
}

export async function syncCryptoHashableData<Hash, Data>(
  repository: CryptoHashableDataRepository<Hash, Data>,
  client: CryptoHashableDataSyncRPC<Hash, Data>
) {
  const available = await client.list();
  for (const hash of available) {
    if (!(await repository.hasHash(hash))) {
      const data = await client.get(hash);
      if ((await repository.hashFunction(data)) !== hash)
        throw new Error("corrupt");
      await repository.addData(data);
    }
  }
}
