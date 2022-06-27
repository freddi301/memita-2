import { createApi } from "../src/api";
import { createSql } from "./sql";

test("compositions aggregation", async () => {
  const api = createApi(createSql());
  expect(await api.getCompositions({ account: "fred" })).toEqual([]);
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
  expect(await api.getCompositions({ account: "fred" })).toEqual([
    compositionA,
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
  expect(await api.getCompositions({ account: "fred" })).toEqual([
    compositionB,
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
  expect(await api.getCompositions({ account: "fred" })).toEqual([
    compositionC,
    compositionB,
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
  expect(await api.getCompositions({ account: "fred" })).toEqual([
    compositionC,
    compositionB,
  ]);
});

test("compositions aggregation filters", async () => {
  const api = createApi(createSql());
  expect(await api.getCompositions({ account: "fred" })).toEqual([]);
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
  expect(
    await api.getCompositions({ account: "fred", channel: undefined })
  ).toEqual([compositionA]);
  expect(
    await api.getCompositions({ account: "fred", channel: "news" })
  ).toEqual([compositionA]);
  expect(await api.getCompositions({ account: "fred", channel: "" })).toEqual(
    []
  );
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
  expect(await api.getCompositions({ account: "fred" })).toEqual([
    compositionB,
    compositionA,
  ]);
  expect(
    await api.getCompositions({ account: "fred", channel: "news" })
  ).toEqual([compositionA]);
  expect(
    await api.getCompositions({ account: "fred", channel: "articles" })
  ).toEqual([compositionB]);
});
