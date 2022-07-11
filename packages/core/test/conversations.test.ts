import { Settings } from "@memita-2/ui";
import { createApi } from "../src/api";
import { createSql } from "./sqlite/sql";

test("conversations aggregation", async () => {
  const api = await createApi(createSql());
  expect(await api.getConversations({ account: "fred" })).toEqual([]);
  await api.addComposition({
    author: "fred",
    channel: "",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      channel: "",
      recipient: "alice",
      content: "hello",
      version_timestamp: 1,
    },
  ]);
  await api.addComposition({
    author: "alice",
    channel: "",
    recipient: "fred",
    quote: "",
    salt: "1",
    content: "bye",
    version_timestamp: 2,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "alice",
      channel: "",
      recipient: "fred",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.addComposition({
    author: "fred",
    channel: "",
    recipient: "chris",
    quote: "",
    salt: "1",
    content: "test",
    version_timestamp: 3,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      channel: "",
      recipient: "chris",
      content: "test",
      version_timestamp: 3,
    },
    {
      author: "alice",
      channel: "",
      recipient: "fred",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.stop();
});

test("conversations aggregation group/private", async () => {
  const settings: Settings = {
    language: "en",
    theme: "dark",
    animations: "disabled",
    connectivity: {
      hyperswarm: { enabled: false },
      bridge: { server: { enabled: false }, clients: [] },
    },
  };
  const api = await createApi(createSql());
  expect(await api.getAccounts({})).toEqual([]);
  const accountA = { author: "fred", nickname: "Fred", settings };
  await api.addAccount(accountA);
  expect(await api.getAccounts({})).toEqual([accountA]);
  const accountB = { author: "ali", nickname: "Ali", settings };
  await api.addAccount(accountB);
  expect(await api.getAccounts({})).toEqual([accountB, accountA]);
  await api.addComposition({
    author: "fred",
    channel: "home",
    recipient: "",
    quote: "",
    content: "buy",
    salt: "1",
    version_timestamp: 1,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      channel: "home",
      recipient: "",
      content: "buy",
      version_timestamp: 1,
    },
  ]);
  await api.addComposition({
    author: "fred",
    channel: "",
    recipient: "ali",
    quote: "",
    content: "hi",
    salt: "2",
    version_timestamp: 2,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      channel: "",
      recipient: "ali",
      content: "hi",
      version_timestamp: 2,
    },
    {
      author: "fred",
      channel: "home",
      recipient: "",
      content: "buy",
      version_timestamp: 1,
    },
  ]);
  await api.stop();
});
