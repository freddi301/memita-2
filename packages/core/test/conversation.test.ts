import { createApi } from "../src";
import { createSql } from "./sqlite/better-sqlite3";

test("conversation aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getConversation({})).toEqual([]);
  const compositionA = {
    author: "fred",
    channel: "",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  };
  await api.addComposition(compositionA);
  expect(await api.getConversation({})).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "fred" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "alice" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getConversation({ recipient: "alice" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getConversation({ recipient: "fred" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "nobody" })).toEqual([]);
  expect(await api.getConversation({ recipient: "nobody" })).toEqual([]);
  const compositionB = {
    author: "alice",
    channel: "",
    recipient: "fred",
    quote: "",
    salt: "1",
    content: "bye",
    version_timestamp: 2,
  };
  await api.addComposition(compositionB);
  expect(await api.getConversation({})).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({})).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "fred" })).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "alice" })).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({ recipient: "alice" })).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({ recipient: "fred" })).toEqual([
    { ...compositionA, versions: 1 },
    { ...compositionB, versions: 1 },
  ]);
  expect(await api.getConversation({ author: "nobody" })).toEqual([]);
  expect(await api.getConversation({ recipient: "nobody" })).toEqual([]);
});
