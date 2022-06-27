type CryptoHashableDataSyncSessionRPC<Hash, Data> = {
  list(): Promise<Array<Hash>>;
  get(hash: Hash): Promise<Data>;
};

export function createCryptoHashableDataSyncSession<Hash, Data>(
  getDataset: () => Promise<Array<Data>>,
  hashFunction: (data: Data) => Hash
) {
  let owned = new Map<Hash, Data>();
  const server = (
    client: CryptoHashableDataSyncSessionRPC<Hash, Data>
  ): CryptoHashableDataSyncSessionRPC<Hash, Data> => ({
    async list() {
      owned = new Map(
        (await getDataset()).map((data) => [hashFunction(data), data])
      );
      return Array.from(owned.keys());
    },
    async get(hash) {
      const data = (await owned).get(hash);
      if (!data) throw "missing";
      return data;
    },
  });
  return {
    server,
    actions(client: CryptoHashableDataSyncSessionRPC<Hash, Data>) {
      return {
        async sync() {
          const available = await client.list();
          const hashes = await owned;
          const wanted = available.filter((hash) => !hashes.has(hash));
          return Promise.all(
            wanted.map(async (hash) => {
              const data = await client.get(hash);
              if (hashFunction(data) !== hash) throw "corrupted";
              return data;
            })
          );
        },
      };
    },
  };
}
