import { createApi } from "../src";
import { sql } from "./sql";

test("comunication aggregation", async () => {
  const api = createApi(sql);
  const comunicationA = {
    author: "fred",
    channel: null,
    recipient: null,
    thread: null,
    salt: "1",
    text: "hello",
    timestamp: 1,
  };
  await api.addComposition(comunicationA);
  expect(await api.getCompositions({})).toEqual([comunicationA]);
  const comunicationB = {
    author: "fred",
    channel: null,
    recipient: null,
    thread: null,
    salt: "1",
    text: "hello world",
    timestamp: 2,
  };
  await api.addComposition(comunicationB);
  expect(await api.getCompositions({})).toEqual([comunicationB]);
  const comunicationC = {
    author: "alice",
    channel: null,
    recipient: null,
    thread: null,
    salt: "1",
    text: "hello",
    timestamp: 4,
  };
  await api.addComposition(comunicationC);
  expect(await api.getCompositions({})).toEqual([comunicationC, comunicationB]);
  const comunicationD = {
    author: "alice",
    channel: null,
    recipient: null,
    thread: null,
    salt: "1",
    text: "hello world",
    timestamp: 3,
  };
  await api.addComposition(comunicationD);
  expect(await api.getCompositions({})).toEqual([comunicationC, comunicationB]);
});
