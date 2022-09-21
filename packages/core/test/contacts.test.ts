import { createApi } from "../src/api";
import { createTables } from "../src/tables";
import { createSqlDatabase } from "./utils/sqlite/sql";

test("contacts aggregation", async () => {
  const api = await createApi({ tables: await createTables(await createSqlDatabase()), filesPath: "" });
  expect(await api.getContacts({ account: "fred" })).toEqual([]);
  const contactA = {
    account: "fred",
    author: "Frederik",
    nickname: "Fred",
    label: "",
    version_timestamp: 1,
  };
  await api.addContact(contactA);
  expect(await api.getContacts({ account: "fred" })).toEqual([contactA]);
  const contactB = {
    account: "fred",
    author: "Frederik",
    nickname: "Macco",
    label: "deleted",
    version_timestamp: 2,
  };
  await api.addContact(contactB);
  expect(await api.getContacts({ account: "fred" })).toEqual([]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Macco",
    })
  ).toEqual([contactB]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Fred",
    })
  ).toEqual([]);
  await api.stop();
});
