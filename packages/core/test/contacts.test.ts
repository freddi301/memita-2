import { createApi } from "../src/api";
import { createTestSwarm } from "../src/components/swarm/testSwarm";
import { createSql } from "./sql";

test("contacts aggregation", async () => {
  const api = createApi(createSql(), createTestSwarm());
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
  expect(await api.getContacts({ account: "fred", label: "" })).toEqual([]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Macco",
      label: "deleted",
    })
  ).toEqual([contactB]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Fred",
      label: "deleted",
    })
  ).toEqual([]);
});
