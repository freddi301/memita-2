import { createApi } from "../src/api";
import { createTestSwarm } from "../src/components/swarm/testSwarm";
import { createSql } from "./sql";

test("conversations aggregation", async () => {
  const api = createApi(createSql(), createTestSwarm());
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
});

test("conversations aggregation group/private", async () => {
  const api = createApi(createSql(), createTestSwarm());
  expect(await api.getAccounts({})).toEqual([]);
  const accountA = { author: "fred", nickname: "Fred", version_timestamp: 1 };
  await api.addAccount(accountA);
  expect(await api.getAccounts({})).toEqual([accountA]);
  const accountB = { author: "ali", nickname: "Ali", version_timestamp: 2 };
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
});
