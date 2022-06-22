import { createApi } from "../src";
import { createSql } from "./sqlite/sqlite3";

test("compositions aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getCompositions({})).toEqual([]);
  const compositionA = {
    author: "fred",
    channel: "",
    recipient: "",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  };
  await api.addComposition(compositionA);
  expect(await api.getCompositions({})).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  const compositionB = {
    author: "fred",
    channel: "",
    recipient: "",
    quote: "",
    salt: "1",
    content: "hello world",
    version_timestamp: 2,
  };
  await api.addComposition(compositionB);
  expect(await api.getCompositions({})).toEqual([
    { ...compositionB, versions: 2 },
  ]);
  const compositionC = {
    author: "alice",
    channel: "",
    recipient: "",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 4,
  };
  await api.addComposition(compositionC);
  expect(await api.getCompositions({})).toEqual([
    { ...compositionC, versions: 1 },
    { ...compositionB, versions: 2 },
  ]);
  const compositionD = {
    author: "alice",
    channel: "",
    recipient: "",
    quote: "",
    salt: "1",
    content: "hello world",
    version_timestamp: 3,
  };
  await api.addComposition(compositionD);
  expect(await api.getCompositions({})).toEqual([
    { ...compositionC, versions: 2 },
    { ...compositionB, versions: 2 },
  ]);
});

test("compositions aggregation filters", async () => {
  const api = createApi(createSql());
  expect(await api.getCompositions({})).toEqual([]);
  const compositionA = {
    author: "fred",
    channel: "news",
    recipient: "",
    quote: "",
    salt: "1",
    content: "foo",
    version_timestamp: 1,
  };
  await api.addComposition(compositionA);
  expect(await api.getCompositions({ channel: undefined })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getCompositions({ channel: "news" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getCompositions({ channel: "" })).toEqual([]);
  const compositionB = {
    author: "fred",
    channel: "articles",
    recipient: "",
    quote: "",
    salt: "2",
    content: "bar",
    version_timestamp: 2,
  };
  await api.addComposition(compositionB);
  expect(await api.getCompositions({})).toEqual([
    { ...compositionB, versions: 1 },
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getCompositions({ channel: "news" })).toEqual([
    { ...compositionA, versions: 1 },
  ]);
  expect(await api.getCompositions({ channel: "articles" })).toEqual([
    { ...compositionB, versions: 1 },
  ]);
});
