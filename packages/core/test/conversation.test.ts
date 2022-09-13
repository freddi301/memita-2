import { createApi } from "../src/api";
import { createSql } from "./utils/sqlite/sql";

test("conversation aggregation", async () => {
  const api = await createApi(createSql());
  expect(
    await api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([]);
  const directMessageA = {
    author: "fred",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    attachments: [],
    version_timestamp: 1,
  };
  await api.addDirectMessage(directMessageA);
  expect(
    await api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA]);
  expect(
    await api.getConversation({ account: "alice", other: "fred" })
  ).toEqual([directMessageA]);
  expect(
    await api.getConversation({ account: "fred", other: "nobody" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "alice", other: "nobody" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "nobody", other: "fred" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "nobody", other: "alice" })
  ).toEqual([]);

  const directMessageB = {
    author: "alice",
    recipient: "fred",
    quote: "",
    salt: "1",
    content: "bye",
    attachments: [],
    version_timestamp: 2,
  };
  await api.addDirectMessage(directMessageB);
  expect(
    await api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA, directMessageB]);
  expect(
    await api.getConversation({ account: "alice", other: "fred" })
  ).toEqual([directMessageA, directMessageB]);
  expect(
    await api.getConversation({ account: "nobody", other: "fred" })
  ).toEqual([]);
  expect(
    await api.getConversation({ account: "nobody", other: "alice" })
  ).toEqual([]);
  await api.stop();
});
