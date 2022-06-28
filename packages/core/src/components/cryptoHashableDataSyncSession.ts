type CryptoHashableDataSyncSessionRPC<Hash, Data> = {
  list(sessionId: number): Promise<Array<Hash>>;
  get(sessionId: number, hash: Hash): Promise<Data>;
};

export function createCryptoHashableDataSyncSession<Hash, Data>(
  getDataset: () => Promise<Array<Data>>,
  hashFunction: (data: Data) => Hash
) {
  const sessions = new Map<number, Promise<Map<Hash, Data>>>();
  async function getOwned(sessionId: number) {
    const owned = sessions.get(sessionId);
    if (owned) return await owned;
    async function turnIntoMap() {
      return new Map(
        (await getDataset()).map((data) => [hashFunction(data), data])
      );
    }
    const map = turnIntoMap();
    sessions.set(sessionId, map);
    return await map;
  }
  const server = (
    client: CryptoHashableDataSyncSessionRPC<Hash, Data>
  ): CryptoHashableDataSyncSessionRPC<Hash, Data> => ({
    async list(sessionId) {
      return Array.from((await getOwned(sessionId)).keys());
    },
    async get(sessionId, hash) {
      const data = (await getOwned(sessionId)).get(hash);
      if (!data) throw "missing";
      return data;
    },
  });
  return {
    server,
    actions(client: CryptoHashableDataSyncSessionRPC<Hash, Data>) {
      let nextSessionId = 0;
      return {
        async sync() {
          const sessionId = nextSessionId++;
          const available = await client.list(nextSessionId);
          const owned = await getOwned(sessionId);
          const wanted = available.filter((hash) => !owned.has(hash));
          return Promise.all(
            wanted.map(async (hash) => {
              const data = await client.get(sessionId, hash);
              if (hashFunction(data) !== hash) throw "corrupted";
              return data;
            })
          );
        },
      };
    },
  };
}
