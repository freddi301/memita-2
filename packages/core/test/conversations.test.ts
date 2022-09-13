import { createApi } from "../src/api";
import { createSql } from "./utils/sqlite/sql";

test("conversations aggregation", async () => {
  const api = await createApi(createSql());
  expect(await api.getConversations({ account: "fred" })).toEqual([]);
  await api.addDirectMessage({
    author: "fred",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    attachments: [],
    version_timestamp: 1,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([]);
  await api.addContact({
    account: "fred",
    author: "alice",
    nickname: "Alice",
    label: "",
    version_timestamp: 10,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      recipient: "alice",
      nickname: "Alice",
      content: "hello",
      version_timestamp: 1,
    },
  ]);
  await api.addDirectMessage({
    author: "alice",
    recipient: "fred",
    quote: "",
    salt: "1",
    content: "bye",
    attachments: [],
    version_timestamp: 2,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "alice",
      recipient: "fred",
      nickname: "Alice",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.addDirectMessage({
    author: "fred",
    recipient: "chris",
    quote: "",
    salt: "1",
    content: "test",
    attachments: [],
    version_timestamp: 3,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "alice",
      recipient: "fred",
      nickname: "Alice",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.addContact({
    account: "fred",
    author: "chris",
    nickname: "Chris",
    label: "",
    version_timestamp: 20,
  });
  expect(await api.getConversations({ account: "fred" })).toEqual([
    {
      author: "fred",
      recipient: "chris",
      nickname: "Chris",
      content: "test",
      version_timestamp: 3,
    },
    {
      author: "alice",
      recipient: "fred",
      nickname: "Alice",
      content: "bye",
      version_timestamp: 2,
    },
  ]);
  await api.stop();
});
