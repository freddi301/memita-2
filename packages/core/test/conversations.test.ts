import { createApi } from "../src";
import { createSql } from "./sqlite/sqlite3";

test("conversations aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getConversations({ author: "fred" })).toEqual([]);
  await api.addComposition({
    author: "fred",
    channel: "",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  });
  expect(await api.getConversations({ author: "fred" })).toEqual([
    {
      author: "fred",
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
  expect(await api.getConversations({ author: "fred" })).toEqual([
    {
      author: "alice",
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
  expect(await api.getConversations({ author: "fred" })).toEqual([
    {
      author: "fred",
      recipient: "chris",
      content: "test",
      version_timestamp: 3,
    },
    {
      author: "alice",
      recipient: "fred",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.addComposition({
    author: "alice",
    channel: "",
    recipient: "chris",
    quote: "",
    salt: "1",
    content: "test",
    version_timestamp: 4,
  });
  expect(await api.getConversations({ author: "fred" })).toEqual([
    {
      author: "fred",
      recipient: "chris",
      content: "test",
      version_timestamp: 3,
    },
    {
      author: "alice",
      recipient: "fred",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
});
