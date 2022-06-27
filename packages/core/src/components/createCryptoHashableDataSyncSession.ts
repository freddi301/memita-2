type CryptoHashableDataSyncSessionRPC<Hash, Data> = {
  list(): Promise<Array<Hash>>;
  get(hash: Hash): Promise<Data>;
};

export function createCryptoHashableDataSyncSession<Hash, Data>(
  dataset: Array<Data>,
  hashFunction: (data: Data) => Hash
) {
  const owned = new Map(dataset.map((data) => [hashFunction(data), data]));
  const server = (
    client: CryptoHashableDataSyncSessionRPC<Hash, Data>
  ): CryptoHashableDataSyncSessionRPC<Hash, Data> => ({
    async list() {
      return Array.from(owned.keys());
    },
    async get(hash) {
      const data = owned.get(hash);
      if (!data) throw "missing";
      return data;
    },
  });
  const sync = async (client: CryptoHashableDataSyncSessionRPC<Hash, Data>) => {
    const available = await client.list();
    const wanted = available.filter((hash) => !owned.has(hash));
    return Promise.all(wanted.map((hash) => client.get(hash)));
  };
  return {
    server,
    sync,
  };
}
