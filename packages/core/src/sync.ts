import { Api, Channel, Composition, Contact } from "@memita-2/ui";
import { wireRpc } from "./components/wireRpc";
import { createCryptoHashableDataSyncSession } from "./components/cryptoHashableDataSyncSession";
import { Sql } from "./sql";
import { Swarm } from "./components/swarm/swarm";
import { cryptoHashFunction } from "./components/cryptoHashFunction";

type Tables = {
  contacts: Contact;
  channels: Channel;
  compositions: Composition;
};

type TablesAdd = { [T in keyof Tables]: (row: Tables[T]) => Promise<void> };

export type TablesAll = {
  [T in keyof Tables]: () => Promise<Array<Tables[T]>>;
};

type TableDTO = {
  [T in keyof Tables]: { table: T; row: Tables[T] };
}[keyof Tables];

export async function createSync({
  sql,
  api,
  swarm,
}: {
  sql: Sql;
  api: Api;
  swarm: Swarm<Buffer>;
}) {
  const tablesAdd: TablesAdd = {
    contacts: api.addContact,
    channels: api.addChannel,
    compositions: api.addComposition,
  };

  const tablesAll: TablesAll = {
    async contacts() {
      return (await sql`SELECT * FROM contacts`.all()) as any;
    },
    async channels() {
      return (await sql`SELECT * FROM channels`.all()) as any;
    },
    async compositions() {
      return (await sql`SELECT * FROM compositions`.all()) as any;
    },
  };

  async function makeDataset() {
    return (
      await Promise.all(
        Object.entries(tablesAll).map(async ([table, rows]) => {
          return (await rows()).map(
            (row) => ({ table, row } as any as TableDTO)
          );
        })
      )
    ).flat(1);
  }

  async function updateDataset(data: Array<TableDTO>) {
    await Promise.all(
      data.map(async ({ table, row }) => await tablesAdd[table](row as any))
    );
  }

  let sync: () => Promise<Array<TableDTO>> = null as any;

  await swarm.connect(({ send, close }) => {
    const { server, actions } = createCryptoHashableDataSyncSession(
      makeDataset,
      cryptoHashFunction
    );
    const { receive, client } = wireRpc({ server, send });
    ({ sync } = actions(client));
    return { receive, close };
  });

  return async () => {
    const synced = await sync();
    await updateDataset(synced);
    return synced;
  };
}
