import { createApi } from "../src/api";
import { createTables } from "../src/tables";
import { createSqlDatabase } from "./utils/sqlite/sql";

test("conversation aggregation", async () => {
  const api = await createApi({ tables: await createTables(await createSqlDatabase()), filesPath: "" });
  expect(await api.getConversation({ account: "fred", other: "alice" })).toEqual([]);
  const privateMessageA = {
    author: "fred",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    attachments: [],
    version_timestamp: 1,
  };
  await api.addPrivateMessage(privateMessageA);
  expect(await api.getConversation({ account: "fred", other: "alice" })).toEqual([privateMessageA]);
  expect(await api.getConversation({ account: "alice", other: "fred" })).toEqual([privateMessageA]);
  expect(await api.getConversation({ account: "fred", other: "nobody" })).toEqual([]);
  expect(await api.getConversation({ account: "alice", other: "nobody" })).toEqual([]);
  expect(await api.getConversation({ account: "nobody", other: "fred" })).toEqual([]);
  expect(await api.getConversation({ account: "nobody", other: "alice" })).toEqual([]);

  const privateMessageB = {
    author: "alice",
    recipient: "fred",
    quote: "",
    salt: "1",
    content: "bye",
    attachments: [],
    version_timestamp: 2,
  };
  await api.addPrivateMessage(privateMessageB);
  expect(await api.getConversation({ account: "fred", other: "alice" })).toEqual([privateMessageA, privateMessageB]);
  expect(await api.getConversation({ account: "alice", other: "fred" })).toEqual([privateMessageA, privateMessageB]);
  expect(await api.getConversation({ account: "nobody", other: "fred" })).toEqual([]);
  expect(await api.getConversation({ account: "nobody", other: "alice" })).toEqual([]);
  await api.stop();
});
