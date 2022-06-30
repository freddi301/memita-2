import { createApi } from "../src/api";
import { createSql } from "./sql";
import { createSync } from "../src/sync";
import { createTestSwarm } from "../src/components/swarm/testSwarm";

test("sync one contact", async () => {
  const aSql = createSql();
  const aApi = createApi(aSql, createTestSwarm());
  const bSql = createSql();
  const bApi = createApi(bSql, createTestSwarm());
  const account = "fred";
  const contactA = {
    account,
    author: "ali",
    label: "",
    nickname: "Alice",
    version_timestamp: 1,
  };
  const contactB = {
    account,
    author: "cri",
    label: "",
    nickname: "Cris",
    version_timestamp: 1,
  };
  await aApi.addContact(contactA);
  await bApi.addContact(contactB);
  expect(await aApi.getContacts({ account })).toEqual([contactA]);
  expect(await bApi.getContacts({ account })).toEqual([contactB]);
  const swarm = createTestSwarm();
  const [aSync, bSync] = await Promise.all([
    createSync({ sql: aSql, api: aApi, swarm }),
    createSync({ sql: bSql, api: bApi, swarm }),
  ]);
  await Promise.all([aSync(), bSync()]);
  expect(await aApi.getContacts({ account })).toEqual([contactA, contactB]);
  expect(await bApi.getContacts({ account })).toEqual([contactA, contactB]);
});
