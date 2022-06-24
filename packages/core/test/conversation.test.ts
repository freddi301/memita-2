import { createApi } from "../src";
import { createSql } from "./sqlite/sqlite3";

test("conversation aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getConversation({ account: "fred" })).toEqual([]);
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
  expect(await api.getConversation({ account: "fred" })).toEqual([
    compositionA,
  ]);
  expect(
    await api.getConversation({ account: "fred", author: "fred" })
  ).toEqual([compositionA]);
  expect(
    await api.getConversation({ account: "fred", author: "alice" })
  ).toEqual([compositionA]);
  expect(
    await api.getConversation({ account: "fred", recipient: "alice" })
  ).toEqual([compositionA]);
  expect(
    await api.getConversation({ account: "fred", recipient: "fred" })
  ).toEqual([compositionA]);
  expect(
    await api.getConversation({ account: "fred", author: "nobody" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "fred", recipient: "nobody" })
  ).toEqual([]);
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
  expect(await api.getConversation({ account: "fred" })).toEqual([
    compositionA,
    compositionB,
  ]);
  expect(await api.getConversation({ account: "fred" })).toEqual([
    compositionA,
    compositionB,
  ]);
  expect(
    await api.getConversation({ account: "fred", author: "fred" })
  ).toEqual([compositionA, compositionB]);
  expect(
    await api.getConversation({ account: "fred", author: "alice" })
  ).toEqual([compositionA, compositionB]);
  expect(
    await api.getConversation({ account: "fred", recipient: "alice" })
  ).toEqual([compositionA, compositionB]);
  expect(
    await api.getConversation({ account: "fred", recipient: "fred" })
  ).toEqual([compositionA, compositionB]);
  expect(
    await api.getConversation({ account: "fred", author: "nobody" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "fred", recipient: "nobody" })
  ).toEqual([]);
});
