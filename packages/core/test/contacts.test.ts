import { createApi } from "../src";
import { createSql } from "./sqlite/sql.js";

test("contacts aggregation", async () => {
  const api = createApi(createSql());
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
    label: "delted",
    version_timestamp: 2,
  };
  await api.addContact(contactB);
  expect(await api.getContacts({ account: "fred", label: "" })).toEqual([]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Macco",
      label: "delted",
    })
  ).toEqual([contactB]);
  expect(
    await api.getContacts({
      account: "fred",
      nickname: "Fred",
      label: "delted",
    })
  ).toEqual([]);
});
