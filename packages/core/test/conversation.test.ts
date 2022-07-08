import { createApi } from "../src/api";
import { createSql } from "./sqlite/sql";

test("conversation aggregation", async () => {
  const api = await createApi(createSql(), {});
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
  expect(await api.getConversation({ account: "fred" })).toEqual([
    compositionA,
  ]);
  expect(await api.getConversation({ account: "alice" })).toEqual([
    compositionA,
  ]);
  expect(
    await api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([compositionA]);
  expect(await api.getConversation({ account: "nobody" })).toEqual([]);
  expect(
    await api.getConversation({ account: "fred", other: "nobody" })
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
  expect(await api.getConversation({ account: "fred" })).toEqual([
    compositionA,
    compositionB,
  ]);
  expect(await api.getConversation({ account: "alice" })).toEqual([
    compositionA,
    compositionB,
  ]);
  expect(
    await api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([compositionA, compositionB]);
  expect(await api.getConversation({ account: "nobody" })).toEqual([]);
  expect(
    await api.getConversation({ account: "fred", other: "nobody" })
  ).toEqual([]);
});
