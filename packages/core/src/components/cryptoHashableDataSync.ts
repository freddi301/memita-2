export type CryptoHashableDataSyncRPC<
  Hash,
  Datas extends Record<string, any>
> = {
  list<K extends keyof Datas>(scope: K): Promise<Array<Hash>>;
  get<K extends keyof Datas>(scope: K, hash: Hash): Promise<Datas[K]>;
};

export type CryptoHashableDataRepository<Hash, Data> = {
  getHashes(): Promise<Array<Hash>>;
  hasHash(hash: Hash): Promise<boolean>;
  getData(hash: Hash): Promise<Data>;
  addData(data: Data): Promise<void>;
  hashFunction(data: Data): Promise<Hash>;
};

export function createCryptoHashableDataSyncRpcServer<
  Hash,
  Datas extends Record<string, any>
>(repositories: {
  [K in keyof Datas]: CryptoHashableDataRepository<Hash, Datas[K]>;
}): CryptoHashableDataSyncRPC<Hash, Datas> {
  return {
    async list(scope) {
      return await repositories[scope].getHashes();
    },
    async get(scope, hash) {
      return await repositories[scope].getData(hash);
    },
  };
}

export async function syncCryptoHashableData<
  Hash,
  Datas extends Record<string, any>
>(
  repositories: {
    [K in keyof Datas]: CryptoHashableDataRepository<Hash, Datas[K]>;
  },
  client: CryptoHashableDataSyncRPC<Hash, Datas>
) {
  for (const scope of Object.keys(repositories)) {
    const available = await client.list(scope);
    for (const hash of available) {
      if (!(await repositories[scope].hasHash(hash))) {
        const data = await client.get(scope, hash);
        if ((await repositories[scope].hashFunction(data)) !== hash)
          throw new Error("corrupt");
        await repositories[scope].addData(data);
      }
    }
  }
}
