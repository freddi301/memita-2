import libsodium from "libsodium-wrappers";
import Hyperswarm from "hyperswarm";
import { Api, Channel, Composition, Contact } from "@memita-2/ui";
import { wireRpc } from "./components/wireRpc";
import { createCryptoHashableDataSyncSession } from "./components/createCryptoHashableDataSyncSession";
import { Sql } from "./sql";

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

function hashFunction(value: unknown) {
  const state = libsodium.crypto_generichash_init(
    "",
    libsodium.crypto_generichash_KEYBYTES
  );
  libsodium.crypto_generichash_update(state, JSON.stringify(value));
  return libsodium.crypto_generichash_final(
    state,
    libsodium.crypto_generichash_KEYBYTES,
    "hex"
  );
}

export function sync(sql: Sql, api: Api) {
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

  const topic = Buffer.alloc(32).fill("memita-2");
  const swarm = new Hyperswarm();
  swarm.join(topic, { server: true, client: true });
  swarm.on("connection", (connection, info) => {
    async function runSyncSession() {
      const { server, sync } = createCryptoHashableDataSyncSession(
        await makeDataset(),
        hashFunction
      );
      const { receive, client } = wireRpc({
        server,
        send(data) {
          connection.write(data);
        },
      });
      const onData = (data: Buffer) => {
        console.log(String(data));
        receive(data);
      };
      connection.on("data", onData);
      await updateDataset(await sync(client));
      connection.off("data", onData);
    }
    let everytinhgOk = true;
    (async () => {
      while (everytinhgOk) {
        await runSyncSession();
        await new Promise((resolve) => setTimeout(resolve, 100000000));
      }
    })();
    connection.on("close", () => {
      everytinhgOk = false;
    });
    connection.on("error", () => {
      everytinhgOk = false;
    });
  });
}
